const express = require('express');
const router = express.Router({ mergeParams: true });  
const commentController = require('../controllers/commentController');
const authenticateToken = require('../middleware/authenticateToken');

// כל הנתיבים של תגובות מחייבים התחברות
router.use(authenticateToken);

// קבלת כל התגובות לפוסט
router.get('/', commentController.getPostComments);

// יצירת תגובה חדשה לפוסט
router.post('/', commentController.createComment);

// עדכון תגובה קיימת (רק הבעלים)
router.put('/:commentId', commentController.updateComment);

// מחיקת תגובה (בעל התגובה או coach)
router.delete('/:commentId', commentController.deleteComment);

module.exports = router;
