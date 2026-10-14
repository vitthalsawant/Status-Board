const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const findOwnedTask = async (id, userId) => {
  const task = await Task.findOne({ _id: id, user: userId });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  return task;
};

const getTasks = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: tasks.length, data: tasks });
});

const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({
    title: req.body.title,
    description: req.body.description || '',
    status: req.body.status || 'To-Do',
    user: req.user._id,
  });

  res.status(201).json({ success: true, data: task });
});

const getTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: task });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.user._id);
  ['title', 'description', 'status'].forEach((field) => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  });
  await task.save();
  res.status(200).json({ success: true, data: task });
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.user._id);
  task.status = req.body.status;
  await task.save();
  res.status(200).json({ success: true, data: task });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req.params.id, req.user._id);
  await task.deleteOne();
  res.status(200).json({ success: true, message: 'Task deleted' });
});

module.exports = {
  getTasks,
  createTask,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
