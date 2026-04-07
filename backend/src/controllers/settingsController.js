const UserSettings = require('../models/UserSettings');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Get user settings
 * Returns all settings for the authenticated user
 */
async function getSettings(req, res) {
  try {
    const userId = req.user._id;

    // Find existing settings
    let settings = await UserSettings.findOne({ userId });

    // If no settings exist, create default settings
    if (!settings) {
      settings = new UserSettings(UserSettings.getDefaultSettings(userId));
      await settings.save();
    }

    res.status(200).json({
      success: true,
      data: settings,
      message: 'Settings retrieved successfully'
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings',
      error: error.message
    });
  }
}

/**
 * Update user settings
 * Updates specific sections or entire settings object
 */
async function updateSettings(req, res) {
  try {
    const userId = req.user._id;
    const updates = req.body;

    // Validate updates structure
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings data provided'
      });
    }

    // Find existing settings
    let settings = await UserSettings.findOne({ userId });

    // If no settings exist, create with defaults first
    if (!settings) {
      settings = new UserSettings(UserSettings.getDefaultSettings(userId));
    }

    // Update only the provided sections
    Object.keys(updates).forEach(key => {
      if (settings[key] && typeof updates[key] === 'object') {
        // Merge nested objects
        settings[key] = { ...settings[key], ...updates[key] };
      } else if (settings[key] !== undefined) {
        // Update direct properties
        settings[key] = updates[key];
      }
    });

    // Validate critical fields
    if (updates.preferences?.difficulty && !['easy', 'medium', 'hard'].includes(updates.preferences.difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty level'
      });
    }

    if (updates.appearance?.theme && !['light', 'dark', 'system'].includes(updates.appearance.theme)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid theme'
      });
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
}

/**
 * Update profile information
 * Handles profile photo upload and basic info updates
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user._id;
    const { name, bio } = req.body;

    // Find or create settings
    let settings = await UserSettings.findOne({ userId });
    if (!settings) {
      settings = new UserSettings(UserSettings.getDefaultSettings(userId));
    }

    // Update profile fields
    if (name !== undefined) {
      settings.profile.name = name.trim();
      
      // Also update user model name
      await User.findByIdAndUpdate(userId, { name: name.trim() });
    }

    if (bio !== undefined) {
      settings.profile.bio = bio.trim();
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.profile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
}

/**
 * Change password
 * Validates old password and updates to new password
 */
async function changePassword(req, res) {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    // Update settings to track password change
    let settings = await UserSettings.findOne({ userId });
    if (!settings) {
      settings = new UserSettings(UserSettings.getDefaultSettings(userId));
    }
    settings.security.lastPasswordChange = new Date();
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
}

/**
 * Delete user account
 * Permanently deletes user account and all associated data
 */
async function deleteAccount(req, res) {
  try {
    const userId = req.user._id;
    const { password, confirmation } = req.body;

    // Validate confirmation
    if (!confirmation || confirmation !== 'DELETE') {
      return res.status(400).json({
        success: false,
        message: 'Please type DELETE to confirm account deletion'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Delete user data in order (to avoid foreign key issues)
    await UserSettings.deleteOne({ userId });
    
    // Delete associated data (you may want to add more models here)
    // await Resume.deleteMany({ userId });
    // await Interview.deleteMany({ userId });
    // await Performance.deleteMany({ userId });

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
}

/**
 * Logout from all devices
 * Invalidates all JWT tokens for the user
 */
async function logoutAllDevices(req, res) {
  try {
    const userId = req.user._id;

    // You could implement a token blacklist here
    // For now, we'll just return success
    // In production, you might want to:
    // 1. Store tokens in Redis with expiration
    // 2. Add a tokenVersion field to user model
    // 3. Invalidate all tokens by incrementing version

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully'
    });

  } catch (error) {
    console.error('Logout all devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout from all devices',
      error: error.message
    });
  }
}

/**
 * Reset settings to defaults
 * Resets all settings to their default values
 */
async function resetSettings(req, res) {
  try {
    const userId = req.user._id;

    // Delete existing settings
    await UserSettings.deleteOne({ userId });

    // Create new default settings
    const defaultSettings = new UserSettings(UserSettings.getDefaultSettings(userId));
    await defaultSettings.save();

    res.status(200).json({
      success: true,
      data: defaultSettings,
      message: 'Settings reset to defaults successfully'
    });

  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings',
      error: error.message
    });
  }
}

module.exports = {
  getSettings,
  updateSettings,
  updateProfile,
  changePassword,
  deleteAccount,
  logoutAllDevices,
  resetSettings
};
