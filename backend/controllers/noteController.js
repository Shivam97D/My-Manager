const Note = require('../models/Note');

/* GET /api/notes */
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort('-createdAt');
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* POST /api/notes */
const createNote = async (req, res) => {
  try {
    const { title, content, color } = req.body;
    if (!title) return res.status(400).json({ message: 'Note title is required.' });

    const note = await Note.create({ title, content, color, user: req.user._id });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* PUT /api/notes/:id */
const updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE /api/notes/:id */
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    res.json({ message: 'Note deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
