const Task = require('../models/Task');

// @desc    Get all tasks for logged in user with optional filters & search
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = { user: req.user._id };

    // Filter by status if valid
    if (status && ['Pending', 'In Progress', 'Completed'].includes(status)) {
      query.status = status;
    }

    // Filter by priority if valid
    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
      query.priority = priority;
    }

    // Search query in title or description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Sort options
    const sortField = ['createdAt', 'dueDate', 'title', 'priority'].includes(sortBy)
      ? sortBy
      : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const tasks = await Task.find(query).sort({ [sortField]: sortOrder });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for user tasks
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const stats = await Task.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format stats with default zero values
    const formattedStats = {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      completionRate: 0
    };

    stats.forEach((item) => {
      if (item._id === 'Pending') formattedStats.pending = item.count;
      if (item._id === 'In Progress') formattedStats.inProgress = item.count;
      if (item._id === 'Completed') formattedStats.completed = item.count;
    });

    formattedStats.total =
      formattedStats.pending + formattedStats.inProgress + formattedStats.completed;

    formattedStats.completionRate =
      formattedStats.total > 0
        ? Math.round((formattedStats.completed / formattedStats.total) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a task title'
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'Pending',
      priority: priority || 'Medium',
      dueDate: dueDate || null,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    let task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (title !== undefined) {
      if (title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Task title cannot be empty'
        });
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description.trim();
    }

    if (status !== undefined) {
      if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be Pending, In Progress, or Completed'
        });
      }
      task.status = status;
    }

    if (priority !== undefined) {
      if (!['Low', 'Medium', 'High'].includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Priority must be Low, Medium, or High'
        });
      }
      task.priority = priority;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate ? new Date(dueDate) : null;
    }

    await task.save();

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};

