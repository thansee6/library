const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getSettings, updateSettings } = require('../controllers/systemSettingController');

router.route('/')
  .get(protect, authorize('admin'), getSettings)
  .put(protect, authorize('admin'), updateSettings);

module.exports = router;
