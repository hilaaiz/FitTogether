const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ---- ייבוא ראוטים ----
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const todoRoutes = require('./routes/todos');
const postRoutes = require('./routes/posts');
const challengeRoutes = require('./routes/challenges');

// ---- מידלוורים ----
app.use(cors());
app.use(express.json());

// ---- ראוטים ----
app.use('/auth', authRoutes);             // login, register
app.use('/users', userRoutes);            // פרופיל משתמש
app.use('/todos', todoRoutes);            // משימות אישיות ואתגריות
app.use('/posts', postRoutes);            // פוסטים + תגובות
app.use('/challenges', challengeRoutes);  // אתגרים

// ---- ברירת מחדל ----
app.get('/', (req, res) => {
  res.send('API is running');
});

// ---- הפעלת השרת ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
