const Bucket = require('../models/Bucket');

/* GET /api/tasks — all tasks flat across all buckets */
const getAllTasks = async (req, res) => {
  try {
    const buckets = await Bucket.find({ user: req.user._id });
    const tasks   = [];

    buckets.forEach(b => {
      b.tasks.forEach(t => {
        tasks.push({ ...t.toObject(), bucketId: b._id, bucketName: b.name });
      });
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* POST /api/buckets/:bucketId/tasks */
const addTask = async (req, res) => {
  try {
    const bucket = await Bucket.findOne({ _id: req.params.bucketId, user: req.user._id });
    if (!bucket) return res.status(404).json({ message: 'Bucket not found.' });

    const { title, note, priority, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required.' });

    bucket.tasks.push({ title, note, priority, dueDate });
    await bucket.save();

    const task = bucket.tasks[bucket.tasks.length - 1];
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* PUT /api/buckets/:bucketId/tasks/:taskId */
const updateTask = async (req, res) => {
  try {
    const bucket = await Bucket.findOne({ _id: req.params.bucketId, user: req.user._id });
    if (!bucket) return res.status(404).json({ message: 'Bucket not found.' });

    const task = bucket.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const { title, note, priority, dueDate, completed } = req.body;
    if (title     !== undefined) task.title     = title;
    if (note      !== undefined) task.note      = note;
    if (priority  !== undefined) task.priority  = priority;
    if (dueDate   !== undefined) task.dueDate   = dueDate;
    if (completed !== undefined) task.completed = completed;

    await bucket.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE /api/buckets/:bucketId/tasks/:taskId */
const deleteTask = async (req, res) => {
  try {
    const bucket = await Bucket.findOne({ _id: req.params.bucketId, user: req.user._id });
    if (!bucket) return res.status(404).json({ message: 'Bucket not found.' });

    const task = bucket.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    task.deleteOne();
    await bucket.save();
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* PATCH /api/buckets/:bucketId/tasks/:taskId/toggle */
const toggleTask = async (req, res) => {
  try {
    const bucket = await Bucket.findOne({ _id: req.params.bucketId, user: req.user._id });
    if (!bucket) return res.status(404).json({ message: 'Bucket not found.' });

    const task = bucket.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    task.completed = !task.completed;
    await bucket.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllTasks, addTask, updateTask, deleteTask, toggleTask };
