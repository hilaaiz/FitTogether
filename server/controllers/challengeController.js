// הצגת כל האתגרים (עם אפשרות לסינון: all / mine)
exports.getChallenges = async (req, res) => {
  const userId = req.user.id;
  const { filter } = req.query; // אפשרי: "all" או "mine"

  try {
    if (filter === 'mine') {
      // להחזיר את כל האתגרים שהמשתמש חלק מהם
      const [rows] = await db.query(
        `SELECT c.* 
         FROM challenges c
         JOIN todos t ON c.id = t.challengeId
         WHERE t.userId = ?`,
        [userId]
      );
      return res.json(rows);
    }

    // ברירת מחדל: להחזיר את כל האתגרים הקיימים
    const [rows] = await db.query('SELECT * FROM challenges');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching challenges:', err);
    res.status(500).json({ error: 'Failed to fetch challenges' });
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
    // לבדוק שהמאמן הוא זה שיצר את האתגר
    const [challenge] = await db.query(
      'SELECT * FROM challenges WHERE id = ? AND createdBy = ?',
      [challengeId, userId]
    );

    if (challenge.length === 0) {
      return res.status(404).json({ error: 'Challenge not found or not owned by you' });
    }

    // מחיקת todos שקשורים לאתגר
    await db.query('DELETE FROM todos WHERE challengeId = ?', [challengeId]);

    // מחיקת האתגר עצמו
    await db.query('DELETE FROM challenges WHERE id = ?', [challengeId]);

    res.json({ message: 'Challenge and related todos deleted successfully' });
  } catch (err) {
    console.error('Error deleting challenge:', err);
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
};
