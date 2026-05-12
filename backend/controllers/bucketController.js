const Bucket = require('../models/Bucket');

/* GET /api/buckets */
const getBuckets = async (req, res) => {
  try {
    const buckets = await Bucket.find({ user: req.user._id }).sort('order createdAt');
    res.json(buckets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* POST /api/buckets */
const createBucket = async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name) return res.status(400).json({ message: 'Bucket name is required.' });

    const bucket = await Bucket.create({
      name,
      type: type || 'todo',
      user: req.user._id
    });
    res.status(201).json(bucket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* PUT /api/buckets/:id */
const updateBucket = async (req, res) => {
  try {
    const bucket = await Bucket.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { name: req.body.name, type: req.body.type, order: req.body.order } },
      { new: true, runValidators: true }
    );
    if (!bucket) return res.status(404).json({ message: 'Bucket not found.' });
    res.json(bucket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE /api/buckets/:id */
const deleteBucket = async (req, res) => {
  try {
    const bucket = await Bucket.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!bucket) return res.status(404).json({ message: 'Bucket not found.' });
    res.json({ message: 'Bucket deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getBuckets, createBucket, updateBucket, deleteBucket };
