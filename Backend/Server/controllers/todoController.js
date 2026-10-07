const mongoose = require('mongoose');
const Todo = require('../models/todos');


const createTodo = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const todo = await Todo.create({
      user: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      tags: Array.isArray(tags) ? tags : [],
    });

    return res.status(201).json(todo);
  } catch (error) {
    console.error('Create todo error:', error);
    return res.status(500).json({ message: error.message || 'Server error creating todo' });
  }
};


const getTodos = async (req, res) => {
  try {
    const { status, priority, search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;

    const queryObj = { user: req.user._id };

    if (status) {
      queryObj.status = status;
    }

    if (priority) {
      queryObj.priority = priority;
    }

    if (search) {
      queryObj.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const total = await Todo.countDocuments(queryObj);
    const pages = Math.ceil(total / limitNum) || 1;

    const todos = await Todo.find(queryObj)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      todos,
      total,
      page: pageNum,
      pages,
    });
  } catch (error) {
    console.error('Get todos error:', error);
    return res.status(500).json({ message: error.message || 'Server error fetching todos' });
  }
};


const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Invalid todo ID format' });
    }

    const todo = await Todo.findOne({ _id: id, user: req.user._id });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    return res.status(200).json(todo);
  } catch (error) {
    console.error('Get todo by ID error:', error);
    return res.status(500).json({ message: error.message || 'Server error fetching todo' });
  }
};


const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Invalid todo ID format' });
    }

    const todo = await Todo.findOne({ _id: id, user: req.user._id });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const { title, description, status, priority, dueDate, tags } = req.body;

    if (title !== undefined) todo.title = title.trim();
    if (description !== undefined) todo.description = description.trim();
    if (status !== undefined) todo.status = status;
    if (priority !== undefined) todo.priority = priority;
    if (dueDate !== undefined) todo.dueDate = dueDate;
    if (tags !== undefined) todo.tags = Array.isArray(tags) ? tags : [];

    const updatedTodo = await todo.save();

    return res.status(200).json(updatedTodo);
  } catch (error) {
    console.error('Update todo error:', error);
    return res.status(500).json({ message: error.message || 'Server error updating todo' });
  }
};


const toggleTodo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Invalid todo ID format' });
    }

    const todo = await Todo.findOne({ _id: id, user: req.user._id });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Toggle between completed and pending
    todo.status = todo.status === 'completed' ? 'pending' : 'completed';

    const updatedTodo = await todo.save();

    return res.status(200).json(updatedTodo);
  } catch (error) {
    console.error('Toggle todo error:', error);
    return res.status(500).json({ message: error.message || 'Server error toggling todo' });
  }
};


const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Invalid todo ID format' });
    }

    const todo = await Todo.findOneAndDelete({ _id: id, user: req.user._id, status:"completed" });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not yet completed' });
    }

    return res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    return res.status(500).json({ message: error.message || 'Server error deleting todo' });
  }
};


module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  toggleTodo,
  deleteTodo
};
