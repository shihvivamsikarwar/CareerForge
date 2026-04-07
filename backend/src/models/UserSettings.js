const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Profile Settings
  profile: {
    name: {
      type: String,
      trim: true,
      maxlength: 100
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500
    },
    profilePhoto: {
      type: String,
      default: null
    }
  },

  // Security Settings
  security: {
    lastPasswordChange: {
      type: Date,
      default: null
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    loginNotifications: {
      type: Boolean,
      default: true
    }
  },

  // Interview Preferences
  preferences: {
    defaultInterviewType: {
      type: String,
      enum: ['technical', 'hr', 'behavioral', 'mixed'],
      default: 'technical'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    sessionDuration: {
      type: Number,
      min: 15,
      max: 120,
      default: 30
    },
    autoSaveProgress: {
      type: Boolean,
      default: true
    }
  },

  // AI Settings
  aiSettings: {
    feedbackLevel: {
      type: String,
      enum: ['basic', 'advanced', 'expert'],
      default: 'advanced'
    },
    interviewStyle: {
      type: String,
      enum: ['friendly', 'professional', 'strict'],
      default: 'professional'
    },
    responseSpeed: {
      type: String,
      enum: ['slow', 'normal', 'fast'],
      default: 'normal'
    },
    enableHints: {
      type: Boolean,
      default: true
    }
  },

  // Appearance Settings
  appearance: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light'
    },
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de', 'zh'],
      default: 'en'
    },
    compactMode: {
      type: Boolean,
      default: false
    },
    animationsEnabled: {
      type: Boolean,
      default: true
    }
  },

  // Notification Settings
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    interviewReminders: {
      type: Boolean,
      default: true
    },
    progressUpdates: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for faster lookups
userSettingsSchema.index({ userId: 1 });

// Method to get default settings
userSettingsSchema.statics.getDefaultSettings = function(userId) {
  return {
    userId,
    profile: {
      name: '',
      bio: '',
      profilePhoto: null
    },
    security: {
      lastPasswordChange: null,
      twoFactorEnabled: false,
      loginNotifications: true
    },
    preferences: {
      defaultInterviewType: 'technical',
      difficulty: 'medium',
      sessionDuration: 30,
      autoSaveProgress: true
    },
    aiSettings: {
      feedbackLevel: 'advanced',
      interviewStyle: 'professional',
      responseSpeed: 'normal',
      enableHints: true
    },
    appearance: {
      theme: 'light',
      language: 'en',
      compactMode: false,
      animationsEnabled: true
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      interviewReminders: true,
      progressUpdates: true
    }
  };
};

module.exports = mongoose.model('UserSettings', userSettingsSchema);
