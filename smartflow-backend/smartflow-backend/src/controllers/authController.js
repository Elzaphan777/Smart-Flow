const jwt = require('jsonwebtoken');
const Teller = require('../models/Teller');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

// POST /api/auth/register  (admin only in production)
exports.register = async (req, res, next) => {
  try {
    const { name, staffId, email, password, role, windowNumber, specializations } = req.body;

    const teller = await Teller.create({
      name,
      staffId,
      email,
      password,
      role,
      windowNumber,
      specializations,
    });

    const token = signToken(teller._id);

    res.status(201).json({
      success: true,
      message: 'Teller account created.',
      token,
      data: {
        id: teller._id,
        name: teller.name,
        staffId: teller.staffId,
        role: teller.role,
        windowNumber: teller.windowNumber,
        specializations: teller.specializations,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { staffId, password } = req.body;

    if (!staffId || !password) {
      return res.status(400).json({ success: false, message: 'Staff ID and password are required.' });
    }

    const teller = await Teller.findOne({ staffId }).select('+password');

    if (!teller || !(await teller.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid staff ID or password.' });
    }

    // Mark as online
    teller.isOnline = true;
    teller.isAvailable = true;
    await teller.save();

    const token = signToken(teller._id);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${teller.name}!`,
      token,
      data: {
        id: teller._id,
        name: teller.name,
        staffId: teller.staffId,
        role: teller.role,
        windowNumber: teller.windowNumber,
        specializations: teller.specializations,
        isAvailable: teller.isAvailable,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    req.teller.isOnline = false;
    req.teller.isAvailable = false;
    await req.teller.save();

    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.teller });
};
