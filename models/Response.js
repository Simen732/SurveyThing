const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    answer: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  }
  // Note: No user identification for anonymity
});

// Index for better query performance
responseSchema.index({ surveyId: 1, submittedAt: -1 });

module.exports = mongoose.model('Response', responseSchema);