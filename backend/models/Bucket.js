const mongoose = require('mongoose');

/* Embedded task sub-document */
const taskSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true, trim: true },
    note:      { type: String, default: '' },
    completed: { type: Boolean, default: false },
    priority:  { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    dueDate:   { type: Date, default: null }
  },
  { timestamps: true }
);

const bucketSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    type:  { type: String, enum: ['todo', 'goals', 'notes', 'custom'], default: 'todo' },
    user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tasks: [taskSchema],
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bucket', bucketSchema);
