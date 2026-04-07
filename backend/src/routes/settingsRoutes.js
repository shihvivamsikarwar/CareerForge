const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getSettings,
  updateSettings,
  updateProfile,
  changePassword,
  deleteAccount,
  logoutAllDevices,
  resetSettings
} = require('../controllers/settingsController');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Main settings endpoints
router.get('/', getSettings);
router.put('/', updateSettings);

// Profile management
router.put('/profile', updateProfile);

// Security settings
router.put('/password', changePassword);
router.post('/logout-all', logoutAllDevices);
router.delete('/account', deleteAccount);

// Utility endpoints
router.post('/reset', resetSettings);

module.exports = router;
