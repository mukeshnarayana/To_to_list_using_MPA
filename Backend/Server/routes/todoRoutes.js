const express = require('express');
const router = express.Router();
const {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  toggleTodo,
  deleteTodo
} = require('../controllers/todoController');
const { protect } = require('../middleware/authMiddleware');

// All todo routes require authentication
router.use(protect);

router
  .route('/')
  .post(createTodo)
  .get(getTodos);

router
  .route('/:id')
  .get(getTodoById)
  .put(updateTodo)
  .delete(deleteTodo);

router
  .route('/:id/toggle')
  .patch(toggleTodo);

module.exports = router;
