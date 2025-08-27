const db = require('../models/db');
const crypto = require('crypto');

// קבלת כל הפוסטים (של כולם)
exports.getAllPosts = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT posts.*, users.username, users.role 
       FROM posts 
       JOIN users ON posts.userId = users.id
       ORDER BY posts.id`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error in getAllPosts:', err);
    res.status(500).json({ error: err.message });
  }
};

// קבלת הפוסטים של המשתמש המחובר בלבד
exports.getMyPosts = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT * FROM posts WHERE userId = ? ORDER BY id`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error in getMyPosts:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.createPost = async (req, res) => {
  const userId = req.user.id;
  const { title, body, image_url } = req.body;
  const postId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

  try {
    await db.query(
      'INSERT INTO posts (id, title, body, image_url, userId) VALUES (?, ?, ?, ?, ?)',
      [postId, title, body, image_url || null, userId]
    );
    
    res.status(201).json({ 
      id: postId, 
      title, 
      body, 
      image_url, 
      userId 
    });
  } catch (err) {
    console.error('Error in createPost:', err);
    res.status(500).json({ error: err.message });
  }
};


// עדכון פוסט (רק בעל הפוסט)
exports.updatePost = async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.params;
  const { title, body, image_url } = req.body; // ✅ שינוי לשם DB

  try {
    const [posts] = await db.query('SELECT * FROM posts WHERE id=?', [postId]);
    if (posts.length === 0) return res.status(404).json({ error: 'Post not found' });

    const post = posts[0];
    if (post.userId !== userId) {
      return res.status(403).json({ error: 'You can update only your own posts' });
    }

    await db.query(
      'UPDATE posts SET title=?, body=?, image_url=? WHERE id=?',
      [title || post.title, body || post.body, image_url || post.image_url, postId] // ✅ שימוש ב־image_url
    );

    res.json({ message: 'Post updated', postId });
  } catch (err) {
    console.error('Error in updatePost:', err);
    res.status(500).json({ error: err.message });
  }
};

// מחיקת פוסט (בעל הפוסט או coach)
exports.deletePost = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  const { postId } = req.params;

  try {
    const [posts] = await db.query('SELECT * FROM posts WHERE id=?', [postId]);
    if (posts.length === 0) return res.status(404).json({ error: 'Post not found' });

    const post = posts[0];
    if (post.userId !== userId && role !== 'coach') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.query('DELETE FROM posts WHERE id=?', [postId]);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('Error in deletePost:', err);
    res.status(500).json({ error: err.message });
  }
};
