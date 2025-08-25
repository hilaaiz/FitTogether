// controllers/todoController.js
const db = require('../models/db');
const crypto = require('crypto');
const { updateChallengeProgress } = require('./challengeController');

// שליפת כל המשימות של המשתמש
exports.getUserTodos = async (req, res) => {
  const userId = req.user.id;
  const { completed, challengeId } = req.query;

  try {
    let query = 'SELECT * FROM todos WHERE userId = ?';
    let params = [userId];

    if (completed !== undefined) {
      query += ' AND completed = ?';
      params.push(completed === 'true');
    }
    if (challengeId) {
      query += ' AND challengeId = ?';
      params.push(challengeId);
    }

    query += ' ORDER BY id';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
};

// יצירת משימה אישית (ברירת מחדל challengeId = NULL)
exports.createTodo = async (req, res) => {
  const userId = req.user.id;
  const id = crypto.randomUUID();
  const { title, completed = false } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    await db.query(
      'INSERT INTO todos (id, title, completed, userId, challengeId) VALUES (?, ?, ?, ?, NULL)',
      [id, title, completed, userId]
    );
    res.status(201).json({ id, title, completed, userId, challengeId: null });
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(500).json({ error: 'Failed to create todo' });
  }
};

// עדכון משימה
exports.updateTodo = async (req, res) => {
  const userId = req.user.id;
  const { todoId } = req.params;
  const { title, completed } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM todos WHERE id = ? AND userId = ?',
      [todoId, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    const todo = rows[0];

    //  משימה אישית – אפשר לעדכן title וגם completed
    if (!todo.challengeId) {
      await db.query(
        'UPDATE todos SET title = ?, completed = ? WHERE id = ? AND userId = ?',
        [title ?? todo.title, completed ?? todo.completed, todoId, userId]
      );
      return res.json({ message: 'Personal todo updated' });
    }

    //  משימה מאתגר – אפשר לעדכן רק completed
    if (completed === undefined) {
      return res.status(400).json({ error: 'Only completed can be updated for challenge todos' });
    }

    await db.query(
      'UPDATE todos SET completed = ? WHERE id = ? AND userId = ?',
      [completed, todoId, userId]
    );

    if (completed) {
      await updateChallengeProgress(todo.challengeId);
    }

    res.json({ message: 'Challenge todo updated' });
  } catch (err) {
    console.error('Error updating todo:', err);
    res.status(500).json({ error: 'Failed to update todo' });
  }
};

// מחיקת משימה (רק אישית מותר למחוק)
exports.deleteTodo = async (req, res) => {
  const userId = req.user.id;
  const { todoId } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM todos WHERE id = ? AND userId = ?',
      [todoId, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    const todo = rows[0];

    if (todo.challengeId) {
      return res.status(400).json({ error: 'Cannot delete challenge todos' });
    }

    await db.query('DELETE FROM todos WHERE id = ? AND userId = ?', [todoId, userId]);
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
};
