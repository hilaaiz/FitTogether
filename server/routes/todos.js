const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const authenticateToken = require('../middleware/authenticateToken');

router.use(authenticateToken);

// משימות של המשתמש המחובר
router.get('/', todoController.getUserTodos);
router.post('/', todoController.createTodo);

// פעולות על משימה
router.put('/:todoId', todoController.updateTodo);
router.delete('/:todoId', todoController.deleteTodo);

module.exports = router;