const Ticket = require('../models/Ticket');
const Teller = require('../models/Teller');
const { TICKET_STATUS } = require('../models/Ticket');
const { findBestTeller, updateTellerStats } = require('../utils/routingEngine');

// ─── KIOSK ──────────────────────────────────────────────────────────────────

// POST /api/tickets/issue
// Called by the kiosk when a client arrives
exports.issueTicket = async (req, res, next) => {
  try {
    const { serviceType, clientInfo, priority } = req.body;

    if (!serviceType) {
      return res.status(400).json({ success: false, message: 'Service type is required.' });
    }

    // Create ticket first
    const ticket = await Ticket.create({ serviceType, clientInfo, priority });

    // Immediately try to route
    const bestTeller = await findBestTeller(serviceType, priority === 'priority');

    if (bestTeller) {
      ticket.assignedTeller = bestTeller._id;
      ticket.status = TICKET_STATUS.ASSIGNED;
      ticket.timing.assignedAt = new Date();
      await ticket.save();

      // Emit via socket (attached to req by socket middleware)
      const io = req.app.get('io');
      if (io) {
        // Notify the specific teller
        io.to(`teller_${bestTeller._id}`).emit('new_ticket', {
          ticket: await ticket.populate('assignedTeller', 'name windowNumber'),
        });
        // Broadcast to display boards
        io.to('displays').emit('ticket_assigned', {
          ticketNumber: ticket.ticketNumber,
          windowNumber: bestTeller.windowNumber,
          tellerName: bestTeller.name,
        });
        // Update manager dashboard
        io.to('managers').emit('queue_update', { type: 'ticket_issued' });
      }

      return res.status(201).json({
        success: true,
        message: `Proceed to Window ${bestTeller.windowNumber} — ${bestTeller.name}`,
        data: {
          ticketNumber: ticket.ticketNumber,
          serviceType: ticket.serviceType,
          status: ticket.status,
          assignedWindow: bestTeller.windowNumber,
          assignedTeller: bestTeller.name,
        },
      });
    }

    // No teller available — add to waiting pool
    await ticket.save();

    const io = req.app.get('io');
    if (io) {
      io.to('managers').emit('queue_update', { type: 'ticket_waiting' });
      io.to('displays').emit('ticket_waiting', { ticketNumber: ticket.ticketNumber, serviceType });
    }

    res.status(201).json({
      success: true,
      message: 'All tellers are currently busy. Please wait — you will be called shortly.',
      data: {
        ticketNumber: ticket.ticketNumber,
        serviceType: ticket.serviceType,
        status: ticket.status,
        assignedWindow: null,
        position: await getQueuePosition(ticket._id, serviceType),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets/status/:ticketNumber
exports.getTicketStatus = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ ticketNumber: req.params.ticketNumber })
      .populate('assignedTeller', 'name windowNumber isAvailable');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

// ─── TELLER ACTIONS ─────────────────────────────────────────────────────────

// POST /api/tickets/:id/call
// Teller calls the next ticket (marks serving)
exports.callTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

    if (ticket.assignedTeller?.toString() !== req.teller._id.toString()) {
      return res.status(403).json({ success: false, message: 'This ticket is not assigned to you.' });
    }

    ticket.status = TICKET_STATUS.SERVING;
    ticket.timing.serviceStartedAt = new Date();
    ticket.timing.waitTimeMs = ticket.timing.serviceStartedAt - ticket.timing.issuedAt;
    await ticket.save();

    // Mark teller as busy
    req.teller.isAvailable = false;
    req.teller.currentTicket = ticket._id;
    await req.teller.save();

    const io = req.app.get('io');
    if (io) {
      io.to('displays').emit('now_serving', {
        ticketNumber: ticket.ticketNumber,
        windowNumber: req.teller.windowNumber,
      });
      io.to('managers').emit('queue_update', { type: 'serving_started' });
    }

    res.status(200).json({ success: true, message: 'Now serving.', data: ticket });
  } catch (err) {
    next(err);
  }
};

// POST /api/tickets/:id/complete
// Teller marks service as done
exports.completeTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

    ticket.status = TICKET_STATUS.COMPLETED;
    ticket.timing.completedAt = new Date();
    ticket.timing.serviceTimeMs = ticket.timing.completedAt - ticket.timing.serviceStartedAt;
    if (ticket.notes !== req.body.notes) ticket.notes = req.body.notes;
    await ticket.save();

    // Update teller stats and free them up
    await updateTellerStats(req.teller._id, ticket.timing.serviceTimeMs);

    const io = req.app.get('io');

    // Check if there's a waiting ticket for this teller's services
    const nextTicket = await Ticket.findOne({
      status: TICKET_STATUS.WAITING,
      serviceType: { $in: req.teller.specializations },
    }).sort({ priority: -1, 'timing.issuedAt': 1 }); // priority first, then FIFO

    if (nextTicket) {
      nextTicket.assignedTeller = req.teller._id;
      nextTicket.status = TICKET_STATUS.ASSIGNED;
      nextTicket.timing.assignedAt = new Date();
      await nextTicket.save();

      req.teller.isAvailable = false;
      req.teller.currentTicket = nextTicket._id;
      await req.teller.save();

      if (io) {
        io.to(`teller_${req.teller._id}`).emit('new_ticket', { ticket: nextTicket });
        io.to('displays').emit('ticket_assigned', {
          ticketNumber: nextTicket.ticketNumber,
          windowNumber: req.teller.windowNumber,
          tellerName: req.teller.name,
        });
      }
    } else {
      // No waiting ticket — teller is free
      req.teller.isAvailable = true;
      req.teller.currentTicket = null;
      await req.teller.save();
    }

    if (io) {
      io.to('managers').emit('queue_update', { type: 'ticket_completed' });
    }

    res.status(200).json({ success: true, message: 'Ticket completed.', data: ticket });
  } catch (err) {
    next(err);
  }
};

// POST /api/tickets/:id/cancel
exports.cancelTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

    ticket.status = TICKET_STATUS.CANCELLED;
    ticket.timing.completedAt = new Date();
    await ticket.save();

    // Free the teller if they were assigned
    if (ticket.assignedTeller) {
      await Teller.findByIdAndUpdate(ticket.assignedTeller, {
        isAvailable: true,
        currentTicket: null,
      });
    }

    const io = req.app.get('io');
    if (io) io.to('managers').emit('queue_update', { type: 'ticket_cancelled' });

    res.status(200).json({ success: true, message: 'Ticket cancelled.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/tickets/:id/transfer
exports.transferTicket = async (req, res, next) => {
  try {
    const { toTellerId, reason } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

    const targetTeller = await Teller.findById(toTellerId);
    if (!targetTeller) return res.status(404).json({ success: false, message: 'Target teller not found.' });

    ticket.transferHistory.push({
      fromTeller: ticket.assignedTeller,
      toTeller: toTellerId,
      reason,
    });
    ticket.assignedTeller = toTellerId;
    ticket.status = TICKET_STATUS.ASSIGNED;
    await ticket.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`teller_${toTellerId}`).emit('new_ticket', { ticket });
      io.to('displays').emit('ticket_assigned', {
        ticketNumber: ticket.ticketNumber,
        windowNumber: targetTeller.windowNumber,
        tellerName: targetTeller.name,
      });
    }

    res.status(200).json({ success: true, message: 'Ticket transferred.', data: ticket });
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets/queue  — all active tickets (manager view)
exports.getQueue = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({
      status: { $in: [TICKET_STATUS.WAITING, TICKET_STATUS.ASSIGNED, TICKET_STATUS.SERVING] },
    })
      .populate('assignedTeller', 'name windowNumber')
      .sort({ priority: -1, 'timing.issuedAt': 1 });

    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets/my-queue — tickets assigned to the logged-in teller
exports.getMyQueue = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({
      assignedTeller: req.teller._id,
      status: { $in: [TICKET_STATUS.ASSIGNED, TICKET_STATUS.SERVING] },
    }).sort({ priority: -1, 'timing.issuedAt': 1 });

    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (err) {
    next(err);
  }
};

// ─── HELPERS ────────────────────────────────────────────────────────────────

async function getQueuePosition(ticketId, serviceType) {
  const waiting = await Ticket.find({
    status: TICKET_STATUS.WAITING,
    serviceType,
  }).sort({ priority: -1, 'timing.issuedAt': 1 }).select('_id');

  const pos = waiting.findIndex((t) => t._id.toString() === ticketId.toString());
  return pos === -1 ? null : pos + 1;
}
