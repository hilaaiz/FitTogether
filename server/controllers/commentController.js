const db = require('../models/db');
const crypto = require('crypto');

// קבלת כל התגובות לפוסט
exports.getPostComments = async (req, res) => {
  const { postId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT comments.*, users.username, users.role 
       FROM comments 
       JOIN users ON comments.userId = users.id
       WHERE postId=? 
       ORDER BY comments.id`,
      [postId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error in getPostComments:', err);
    res.status(500).json({ error: err.message });
  }
};

// יצירת תגובה
exports.createComment = async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;
  const { body } = req.body;
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

  try {
    await db.query(
      'INSERT INTO comments (id, postId, userId, body) VALUES (?, ?, ?, ?)',
      [id, postId, userId, body]
    );
    res.status(201).json({ id, postId, userId, body });
  } catch (err) {
    console.error('Error in createComment:', err);
    res.status(500).json({ error: err.message });
  }
};

// עדכון תגובה (רק הבעלים)
exports.updateComment = async (req, res) => {
  const userId = req.user.id;
  const { commentId } = req.params;
  const { body } = req.body;

  try {
    const [comments] = await db.query('SELECT * FROM comments WHERE id=?', [commentId]);
    if (comments.length === 0) return res.status(404).json({ error: 'Comment not found' });

    const comment = comments[0];
    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'You can update only your own comments' });
    }

    await db.query('UPDATE comments SET body=? WHERE id=?', [body, commentId]);
    res.json({ message: 'Comment updated', commentId });
  } catch (err) {
    console.error('Error in updateComment:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  const { commentId } = req.params;

  try {
    const [comments] = await db.query('SELECT * FROM comments WHERE id=?', [commentId]);
    if (comments.length === 0) return res.status(404).json({ error: 'Comment not found' });

    const comment = comments[0];
    if (comment.userId !== userId && role !== 'coach') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.query('DELETE FROM comments WHERE id=?', [commentId]);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('Error in deleteComment:', err);
    res.status(500).json({ error: err.message });
  }
};
