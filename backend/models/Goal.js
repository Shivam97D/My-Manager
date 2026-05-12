const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category:    {
      type: String,
      enum: ['career', 'health', 'learning', 'finance', 'personal', 'other'],
      default: 'personal'
    },
    progress:    { type: Number, min: 0, max: 100, default: 0 },
    targetDate:  { type: Date,   default: null },
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);
