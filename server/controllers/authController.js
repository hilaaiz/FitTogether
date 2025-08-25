const db = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// שלב 1 – בדיקה אם username/email תפוסים
exports.checkUser = async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required' });
  }

  try {
    const [existing] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username or email already taken' });
    }

    return res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error('Error in checkUser:', err);
    return res.status(500).json({ error: err.message });
  }
};

// שלב 2 – הרשמה מלאה (כולל פרופיל)
exports.registerUser = async (req, res) => {
  const { 
    username, password, verifyPassword, email, 
    name, street, suite, city, zipcode,
    height, weight, role 
  } = req.body;

  try {
    if (!username || !password || !verifyPassword || !email) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }
    if (password !== verifyPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // בדיקה כפולה לפני הכנסת המשתמש
    const [existing] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username or email already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

    // הכנסת המשתמש לטבלת users
    await db.query(
      `INSERT INTO users 
        (id, username, name, email, street, suite, city, zipcode, height, weight, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newUserId, username, name || null, email,
        street || null, suite || null, city || null, zipcode || null,
        height || null, weight || null, role || 'user'
      ]
    );

    // הכנסת הסיסמה לטבלת passwords
    await db.query('INSERT INTO passwords (user_id, password) VALUES (?, ?)', [newUserId, hashedPassword]);

    // יצירת JWT מיידי אחרי הרשמה
    const token = jwt.sign(
      { id: newUserId, role: role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUserId, username, email, role: role || 'user' }
    });

  } catch (err) {
    console.error('Error in registerUser:', err);
    return res.status(500).json({ error: err.message });
  }
};

// התחברות
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = users[0];
    const [passwords] = await db.query('SELECT * FROM passwords WHERE user_id = ?', [user.id]);
    if (passwords.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const valid = await bcrypt.compare(password, passwords[0].password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });

  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ error: err.message });
  }
};

// יציאה
exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logout successful. Please delete the token on client side.' });
};
