const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const authenticateToken = require('../middleware/authenticateToken');
const requireRole = require('../middleware/requireRole');

router.use(authenticateToken);

// יצירת אתגר (coach בלבד)
router.post('/', requireRole('coach'), challengeController.createChallenge);

// הצגת כל האתגרים (או רק של המשתמש – עם filter=mine)
router.get('/', challengeController.getChallenges);

// הצטרפות לאתגר
router.post('/:challengeId/join', challengeController.joinChallenge);

// מחיקת אתגר (coach בלבד, כולל todos שלו)
router.delete('/:challengeId', requireRole('coach'), challengeController.deleteChallenge);

module.exports = router;
