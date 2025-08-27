const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ייבוא ראוטים
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const todoRoutes = require('./routes/todos');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const challengeRoutes = require('./routes/challenges');
const weatherRoutes = require("./routes/weather");

// מידלוורים
app.use(cors());
app.use(express.json());

// ראוטים
app.use('/auth', authRoutes);                   
app.use('/users', userRoutes);                  
app.use('/todos', todoRoutes);                  
app.use('/posts', postRoutes);                  
app.use('/posts/:postId/comments', commentRoutes); 
app.use('/challenges', challengeRoutes);  
app.use("/weather", weatherRoutes);      

// ברירת מחדל
app.get('/', (req, res) => {
  res.send('API is running');
});

// הפעלת השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
