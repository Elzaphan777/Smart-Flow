const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect, restrict } = require('../middleware/auth');

router.post('/register', protect, restrict('admin', 'manager'), register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
