const Teller = require('../models/Teller');
const Ticket = require('../models/Ticket');

/**
 * SmartFlow Routing Engine
 *
 * Finds the best available teller for a given service type using:
 *  1. Specialization match (teller must support the service)
 *  2. Availability (online + not currently serving)
 *  3. Shortest queue (fewest assigned/waiting tickets)
 *  4. Tie-break: lowest average service time (fastest teller)
 *
 * Priority tickets jump ahead of normal tickets in the queue.
 */
const findBestTeller = async (serviceType, isPriority = false) => {
  // Step 1: Find tellers who are online and can handle this service
  const eligibleTellers = await Teller.find({
    isOnline: true,
    isAvailable: true,
    specializations: { $in: [serviceType, 'general'] },
  }).lean();

  if (eligibleTellers.length === 0) {
    return null; // No one available — ticket stays in waiting queue
  }

  // Step 2: For each eligible teller, count their active queue
  const tellersWithLoad = await Promise.all(
    eligibleTellers.map(async (teller) => {
      const queueLength = await Ticket.countDocuments({
        assignedTeller: teller._id,
        status: { $in: ['waiting', 'assigned', 'serving'] },
      });
      return { ...teller, queueLength };
    })
  );

  // Step 3: Sort by queue length, then by average service time (ascending)
  tellersWithLoad.sort((a, b) => {
    if (a.queueLength !== b.queueLength) return a.queueLength - b.queueLength;
    return (a.stats?.avgServiceTime || 0) - (b.stats?.avgServiceTime || 0);
  });

  // Step 4: Prefer exact specialization over generic 'general' tellers
  const specialist = tellersWithLoad.find(
    (t) => t.specializations.includes(serviceType) && t.queueLength === tellersWithLoad[0].queueLength
  );

  return specialist || tellersWithLoad[0];
};

/**
 * After a ticket is completed, update the teller's running stats.
 */
const updateTellerStats = async (tellerId, serviceTimeMs) => {
  const teller = await Teller.findById(tellerId);
  if (!teller) return;

  const newCount = teller.stats.ticketsServedToday + 1;
  const newTotal = teller.stats.totalServiceTimeToday + serviceTimeMs;
  const newAvg = Math.round(newTotal / newCount);

  teller.stats.ticketsServedToday = newCount;
  teller.stats.totalServiceTimeToday = newTotal;
  teller.stats.avgServiceTime = newAvg;
  teller.currentTicket = null;
  teller.isAvailable = true;

  await teller.save();
};

/**
 * Get a branch-wide snapshot for the manager dashboard.
 */
const getBranchSnapshot = async () => {
  const [tellers, ticketStats] = await Promise.all([
    Teller.find({ isOnline: true })
      .populate('currentTicket', 'ticketNumber serviceType timing.serviceStartedAt')
      .lean(),
    Ticket.aggregate([
      {
        $match: {
          'timing.issuedAt': { $gte: startOfDay() },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgWaitTime: { $avg: '$timing.waitTimeMs' },
          avgServiceTime: { $avg: '$timing.serviceTimeMs' },
        },
      },
    ]),
  ]);

  // Queue lengths per teller
  const queueCounts = await Ticket.aggregate([
    { $match: { status: { $in: ['waiting', 'assigned'] } } },
    { $group: { _id: '$assignedTeller', count: { $sum: 1 } } },
  ]);

  const queueMap = {};
  queueCounts.forEach((q) => {
    if (q._id) queueMap[q._id.toString()] = q.count;
  });

  const enrichedTellers = tellers.map((t) => ({
    ...t,
    queueLength: queueMap[t._id.toString()] || 0,
  }));

  // Service type breakdown of waiting tickets
  const serviceBreakdown = await Ticket.aggregate([
    { $match: { status: 'waiting' } },
    { $group: { _id: '$serviceType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return {
    tellers: enrichedTellers,
    ticketStats,
    serviceBreakdown,
    generatedAt: new Date(),
  };
};

function startOfDay() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

module.exports = { findBestTeller, updateTellerStats, getBranchSnapshot };
