const Goal = require('../models/Goal');

/* GET /api/goals */
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort('-createdAt');
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* POST /api/goals */
const createGoal = async (req, res) => {
  try {
    const { title, description, category, progress, targetDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Goal title is required.' });

    const goal = await Goal.create({
      title, description, category, progress, targetDate,
      user: req.user._id
    });
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* PUT /api/goals/:id */
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE /api/goals/:id */
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });
    res.json({ message: 'Goal deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
