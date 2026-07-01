const express = require('express');
const router = express.Router();
const {
  getAllTellers,
  getOnlineTellers,
  getTeller,
  toggleAvailability,
  updateTeller,
  deleteTeller,
  getTodayStats,
} = require('../controllers/tellerController');
const { protect, restrict } = require('../middleware/auth');

router.get('/online', getOnlineTellers); // Public — display boards use this
router.get('/stats/today', protect, restrict('manager', 'admin'), getTodayStats);

router.use(protect); // All below require auth

router.get('/', restrict('manager', 'admin'), getAllTellers);
router.get('/:id', getTeller);
router.patch('/availability', toggleAvailability);
router.patch('/:id', restrict('manager', 'admin'), updateTeller);
router.delete('/:id', restrict('admin'), deleteTeller);

module.exports = router;
