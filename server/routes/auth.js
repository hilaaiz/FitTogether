const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// שלב 1 – בדיקת זמינות username/email
router.post('/check', authController.checkUser);

// שלב 2 – הרשמה מלאה (כולל פרופיל מלא)
router.post('/register', authController.registerUser);

// התחברות
router.post('/login', authController.login);

// יציאה
router.post('/logout', authController.logout);

module.exports = router;
