const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticateToken = require('../middleware/authenticateToken');

// כל הראוטים של פוסטים דורשים התחברות
router.use(authenticateToken);

// קבלת כל הפוסטים
router.get('/', postController.getAllPosts);

// קבלת פוסט בודד לפי ID
router.get('/:postId', postController.getPostById);

// יצירת פוסט חדש
router.post('/', postController.createPost);

// עדכון פוסט (רק הבעלים של הפוסט יכול לעדכן)
router.put('/:postId', postController.updatePost);

// מחיקת פוסט (בעל הפוסט או מאמן יכול למחוק)
router.delete('/:postId', postController.deletePost);

module.exports = router;
