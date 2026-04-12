const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  strengths: [{
    type: String
  }],
  weaknesses: [{
    type: String
  }],
  weakSkills: [{
    type: String
  }],
  aiInsights: {
    strengths: [{
      type: String
    }],
    weaknesses: [{
      type: String
    }],
    recommendations: [{
      type: String
    }],
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  interviewScores: [{
    topic: {
      type: String
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  skillProgress: [{
    skill: {
      type: String
    },
    currentLevel: {
      type: Number,
      min: 0,
      max: 100
    },
    targetLevel: {
      type: Number,
      min: 0,
      max: 100
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
performanceSchema.index({ user: 1 });

module.exports = mongoose.model('Performance', performanceSchema);
