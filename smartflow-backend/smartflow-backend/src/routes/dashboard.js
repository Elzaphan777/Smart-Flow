const express = require('express');
const router = express.Router();
const {
  getBranchSnapshot,
  getAnalytics,
  getServiceTypes,
  resetBranch,
} = require('../controllers/dashboardController');
const { protect, restrict } = require('../middleware/auth');

router.get('/service-types', getServiceTypes); // Public — kiosk needs this
router.get('/snapshot', protect, restrict('manager', 'admin'), getBranchSnapshot);
router.get('/analytics', protect, restrict('manager', 'admin'), getAnalytics);
router.post('/reset', protect, restrict('manager', 'admin'), resetBranch);

module.exports = router;
