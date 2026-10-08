const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['verify', 'diff', 'health'], required: true, index: true },
    title: { type: String, required: true },
    score: { type: Number, default: null },
    result: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analysis', analysisSchema);
