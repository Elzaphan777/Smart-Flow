const Ticket = require('../models/Ticket');
const Teller = require('../models/Teller');
const { getBranchSnapshot } = require('../utils/routingEngine');

// GET /api/dashboard/snapshot  — live branch overview
exports.getBranchSnapshot = async (req, res, next) => {
  try {
    const snapshot = await getBranchSnapshot();
    res.status(200).json({ success: true, data: snapshot });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/analytics?date=2026-06-12
exports.getAnalytics = async (req, res, next) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const [
      totalTickets,
      byService,
      byHour,
      avgTimes,
      tellerPerformance,
    ] = await Promise.all([
      // Total tickets for the day
      Ticket.countDocuments({ 'timing.issuedAt': { $gte: start, $lte: end } }),

      // Breakdown by service type
      Ticket.aggregate([
        { $match: { 'timing.issuedAt': { $gte: start, $lte: end } } },
        {
          $group: {
            _id: '$serviceType',
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            avgWaitMs: { $avg: '$timing.waitTimeMs' },
            avgServiceMs: { $avg: '$timing.serviceTimeMs' },
          },
        },
        { $sort: { total: -1 } },
      ]),

      // Ticket volume by hour
      Ticket.aggregate([
        { $match: { 'timing.issuedAt': { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { $hour: '$timing.issuedAt' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Overall avg wait and service time
      Ticket.aggregate([
        {
          $match: {
            'timing.issuedAt': { $gte: start, $lte: end },
            status: 'completed',
          },
        },
        {
          $group: {
            _id: null,
            avgWaitMs: { $avg: '$timing.waitTimeMs' },
            avgServiceMs: { $avg: '$timing.serviceTimeMs' },
            totalCompleted: { $sum: 1 },
            totalCancelled: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
            },
          },
        },
      ]),

      // Per-teller performance
      Teller.find().select('name windowNumber stats specializations').lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        date: date.toISOString().split('T')[0],
        totalTickets,
        byService,
        byHour,
        summary: avgTimes[0] || {},
        tellerPerformance,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/service-types  — list all valid service types (for kiosk dropdown)
exports.getServiceTypes = async (req, res) => {
  const { SERVICE_TYPES } = require('../models/Teller');
  res.status(200).json({ success: true, data: SERVICE_TYPES });
};

// POST /api/dashboard/reset  (manager only — clear all tickets and reset teller stats)
exports.resetBranch = async (req, res, next) => {
  try {
    // Delete all tickets
    await Ticket.deleteMany({});

    // Reset all tellers
    await Teller.updateMany({}, {
      isOnline: false,
      isAvailable: false,
      currentTicket: null,
      stats: {
        ticketsServedToday: 0,
        totalServiceTimeToday: 0,
        avgServiceTime: 0,
      },
    });

    // Automatically make the requesting manager online & available so they aren't booted
    if (req.teller) {
      await Teller.findByIdAndUpdate(req.teller._id, {
        isOnline: true,
        isAvailable: true,
      });
    }

    // Emit live updates to sockets
    const io = req.app.get('io');
    if (io) {
      io.emit('queue_update', { type: 'system_reset' });
    }

    res.status(200).json({ success: true, message: 'Database reset successfully. Queues are cleared.' });
  } catch (err) {
    next(err);
  }
};
