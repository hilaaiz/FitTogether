const express = require('express');
const router = express.Router();

// ייבוא middleware ו-controller
const authenticateToken = require('../middleware/authenticateToken');
const userController = require('../controllers/userController');

// כל הנתיבים כאן דורשים authentication
router.use(authenticateToken);

/**
 * GET /users/me - קבלת פרופיל המשתמש הנוכחי
 */
router.get('/me', userController.getProfile);

/**
 * PUT /users/me - עדכון פרופיל המשתמש הנוכחי
 */
router.put('/me', userController.updateProfile);

/**
 * GET /users/:userId - צפייה בפרופיל של משתמש אחר (ציבורי)
 * בלי middleware נוסף - כל מי שמחובר יכול לראות פרופילים
 */
router.get('/:userId', userController.getUserById);

/**
 * DELETE /users/me - מחיקת החשבון שלי (לצמיתות)
 */
router.delete('/me', userController.deleteAccount);


module.exports = router;