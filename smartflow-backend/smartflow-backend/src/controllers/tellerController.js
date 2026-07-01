const Teller = require('../models/Teller');

// GET /api/tellers  (manager only)
exports.getAllTellers = async (req, res, next) => {
  try {
    const tellers = await Teller.find().populate('currentTicket', 'ticketNumber serviceType');
    res.status(200).json({ success: true, count: tellers.length, data: tellers });
  } catch (err) {
    next(err);
  }
};

// GET /api/tellers/online  — who is currently online (for routing display)
exports.getOnlineTellers = async (req, res, next) => {
  try {
    const tellers = await Teller.find({ isOnline: true })
      .select('name windowNumber specializations isAvailable currentTicket stats')
      .populate('currentTicket', 'ticketNumber serviceType');

    res.status(200).json({ success: true, count: tellers.length, data: tellers });
  } catch (err) {
    next(err);
  }
};

// GET /api/tellers/:id
exports.getTeller = async (req, res, next) => {
  try {
    const teller = await Teller.findById(req.params.id).populate('currentTicket');
    if (!teller) return res.status(404).json({ success: false, message: 'Teller not found.' });
    res.status(200).json({ success: true, data: teller });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tellers/availability  — teller toggles their availability
exports.toggleAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    req.teller.isAvailable = isAvailable;
    await req.teller.save();

    const io = req.app.get('io');
    if (io) {
      io.to('managers').emit('teller_status_change', {
        tellerId: req.teller._id,
        windowNumber: req.teller.windowNumber,
        isAvailable,
      });
    }

    res.status(200).json({
      success: true,
      message: `You are now ${isAvailable ? 'available' : 'unavailable'}.`,
      data: { isAvailable: req.teller.isAvailable },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tellers/:id  (manager/admin — update specializations, window, etc.)
exports.updateTeller = async (req, res, next) => {
  try {
    const allowedFields = ['specializations', 'windowNumber', 'role', 'name'];
    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const teller = await Teller.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!teller) return res.status(404).json({ success: false, message: 'Teller not found.' });
    res.status(200).json({ success: true, data: teller });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tellers/:id  (admin only)
exports.deleteTeller = async (req, res, next) => {
  try {
    const teller = await Teller.findByIdAndDelete(req.params.id);
    if (!teller) return res.status(404).json({ success: false, message: 'Teller not found.' });
    res.status(200).json({ success: true, message: 'Teller account deleted.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/tellers/stats/today  (manager dashboard)
exports.getTodayStats = async (req, res, next) => {
  try {
    const tellers = await Teller.find({ isOnline: true }).select('name windowNumber stats');
    res.status(200).json({ success: true, data: tellers });
  } catch (err) {
    next(err);
  }
};
