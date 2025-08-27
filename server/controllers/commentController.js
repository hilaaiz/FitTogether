const db = require('../models/db');       // חיבור למסד הנתונים
const crypto = require('crypto');         // ליצירת UUID ייחודיים

// =======================
// קבלת כל התגובות לפוסט
// =======================
exports.getPostComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT comments.*, users.username, users.role 
       FROM comments 
       JOIN users ON comments.userId = users.id
       WHERE postId = ?
       ORDER BY comments.id ASC`,   // ✅ שיניתי ל־id במקום createdAt
      [postId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error in getPostComments:', err);
    res.status(500).json({ error: err.message });
  }
};

// =======================
// יצירת תגובה חדשה לפוסט
// =======================
exports.createComment = async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;
  const { body } = req.body;

  if (!body) {
    return res.status(400).json({ error: 'Comment body is required' });
  }

  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

  try {
    await db.query(
      'INSERT INTO comments (id, postId, userId, body) VALUES (?, ?, ?, ?)',
      [id, postId, userId, body]
    );

    res.status(201).json({
      message: 'Comment created successfully',
      id,
      postId,
      userId,
      body
    });
  } catch (err) {
    console.error('Error in createComment:', err);
    res.status(500).json({ error: err.message });
  }
};

// =======================
// עדכון תגובה קיימת
// =======================
exports.updateComment = async (req, res) => {
  const userId = req.user.id;
  const { postId, commentId } = req.params;
  const { body } = req.body;

  try {
    const [comments] = await db.query(
      'SELECT * FROM comments WHERE id = ? AND postId = ?',
      [commentId, postId]
    );

    if (comments.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = comments[0];
    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'You can update only your own comments' });
    }

    await db.query('UPDATE comments SET body = ? WHERE id = ?', [body, commentId]);

    res.json({ message: 'Comment updated', commentId });
  } catch (err) {
    console.error('Error in updateComment:', err);
    res.status(500).json({ error: err.message });
  }
};

// =======================
// מחיקת תגובה
// =======================
exports.deleteComment = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  const { postId, commentId } = req.params;

  try {
    const [comments] = await db.query(
      'SELECT * FROM comments WHERE id = ? AND postId = ?',
      [commentId, postId]
    );

    if (comments.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = comments[0];
    if (comment.userId !== userId && role !== 'coach') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.query('DELETE FROM comments WHERE id = ?', [commentId]);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('Error in deleteComment:', err);
    res.status(500).json({ error: err.message });
  }
};
