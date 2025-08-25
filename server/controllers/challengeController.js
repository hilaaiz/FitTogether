const db = require('../models/db');
const crypto = require('crypto');

// יצירת אתגר חדש (coach בלבד)
exports.createChallenge = async (req, res) => {
  const userId = req.user.id;
  const { role } = req.user;

  if (role !== 'coach') {
    return res.status(403).json({ error: 'Only coaches can create challenges' });
  }

  const { title, description, deadline, media_url } = req.body;
  if (!title || !deadline) {
    return res.status(400).json({ error: 'Title and deadline are required' });
  }

  try {
    const id = crypto.randomUUID();

    // יצירת רשומת אתגר
    await db.query(
      'INSERT INTO challenges (id, title, description, goal, progress, deadline, media_url, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, description || null, 0, 1, deadline, media_url || null, userId]
    );

    // יצירת משימה למאמן כברירת מחדל
    const todoId = crypto.randomUUID();
    await db.query(
      'INSERT INTO todos (id, userId, title, completed, challengeId) VALUES (?, ?, ?, false, ?)',
      [todoId, userId, title, id]
    );

    res.status(201).json({
      id,
      title,
      goal: 0,
      progress: 1,
      createdBy: userId,
      deadline
    });
  } catch (err) {
    console.error('Error creating challenge:', err);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
};

// הצגת כל האתגרים (עם אפשרות לסינון: all / mine)
exports.getChallenges = async (req, res) => {
  const userId = req.user.id;
  const { filter } = req.query; // אפשרי: "all" או "mine"

  try {
    if (filter === 'mine') {
      const [rows] = await db.query(
        `SELECT c.* 
         FROM challenges c
         JOIN todos t ON c.id = t.challengeId
         WHERE t.userId = ?`,
        [userId]
      );
      return res.json(rows);
    }

    const [rows] = await db.query('SELECT * FROM challenges');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching challenges:', err);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
};

// הצטרפות לאתגר
exports.joinChallenge = async (req, res) => {
  const userId = req.user.id;
  const { challengeId } = req.params;

  try {
    // לבדוק אם המשתמש כבר חלק מהאתגר
    const [exists] = await db.query(
      'SELECT * FROM todos WHERE userId = ? AND challengeId = ?',
      [userId, challengeId]
    );
    if (exists.length > 0) {
      return res.status(400).json({ error: 'Already joined challenge' });
    }

    // להביא את פרטי האתגר
    const [challenge] = await db.query(
      'SELECT title FROM challenges WHERE id = ?',
      [challengeId]
    );
    if (challenge.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // ליצור למשתמש משימה חדשה שקשורה לאתגר
    const todoId = crypto.randomUUID();
    await db.query(
      'INSERT INTO todos (id, userId, title, completed, challengeId) VALUES (?, ?, ?, false, ?)',
      [todoId, userId, challenge[0].title, challengeId]
    );

    // להגדיל את ה־goal (עוד משתתף הצטרף)
    await db.query(
      'UPDATE challenges SET goal = goal + 1 WHERE id = ?',
      [challengeId]
    );

    res.json({ message: 'Joined challenge successfully', todoId });
  } catch (err) {
    console.error('Error joining challenge:', err);
    res.status(500).json({ error: 'Failed to join challenge' });
  }
};

// מחיקת אתגר (coach בלבד)
exports.deleteChallenge = async (req, res) => {
  const userId = req.user.id;
  const { role } = req.user;
  const { challengeId } = req.params;

  if (role !== 'coach') {
    return res.status(403).json({ error: 'Only coaches can delete challenges' });
  }

  try {
    const [challenge] = await db.query(
      'SELECT * FROM challenges WHERE id = ? AND createdBy = ?',
      [challengeId, userId]
    );

    if (challenge.length === 0) {
      return res.status(404).json({ error: 'Challenge not found or not owned by you' });
    }

    await db.query('DELETE FROM todos WHERE challengeId = ?', [challengeId]);
    await db.query('DELETE FROM challenges WHERE id = ?', [challengeId]);

    res.json({ message: 'Challenge and related todos deleted successfully' });
  } catch (err) {
    console.error('Error deleting challenge:', err);
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
};

// עדכון התקדמות אתגר (נקרא מתוך todoController כאשר todo מושלם)
exports.updateChallengeProgress = async (challengeId) => {
  try {
    const [[{ finished }]] = await db.query(
      'SELECT COUNT(*) AS finished FROM todos WHERE challengeId = ? AND completed = true',
      [challengeId]
    );

    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM todos WHERE challengeId = ?',
      [challengeId]
    );

    await db.query(
      'UPDATE challenges SET progress = ? WHERE id = ?',
      [finished, challengeId]
    );

    if (finished >= total) {
      console.log(`Challenge ${challengeId} is completed!`);
    }
  } catch (err) {
    console.error('Error updating challenge progress:', err);
    throw err;
  }
};
