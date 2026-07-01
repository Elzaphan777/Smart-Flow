const mongoose = require('mongoose');

const TICKET_STATUS = {
  WAITING: 'waiting',       // In queue, not yet assigned
  ASSIGNED: 'assigned',     // Routed to a teller, on their way
  SERVING: 'serving',       // Teller is actively serving
  COMPLETED: 'completed',   // Service done
  CANCELLED: 'cancelled',   // Client left / no-show
  TRANSFERRED: 'transferred', // Moved to another teller
};

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
    },
    // Optional client info collected at kiosk
    clientInfo: {
      name: { type: String, trim: true, default: 'Walk-in Client' },
      phone: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
    },
    priority: {
      type: String,
      enum: ['normal', 'priority'], // priority = elderly, disabled, etc.
      default: 'normal',
    },
    status: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.WAITING,
    },
    assignedTeller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teller',
      default: null,
    },
    // Track timing for analytics
    timing: {
      issuedAt: { type: Date, default: Date.now },
      assignedAt: { type: Date },
      serviceStartedAt: { type: Date },
      completedAt: { type: Date },
      waitTimeMs: { type: Number }, // time from issued → service started
      serviceTimeMs: { type: Number }, // time from service started → completed
    },
    transferHistory: [
      {
        fromTeller: { type: mongoose.Schema.Types.ObjectId, ref: 'Teller' },
        toTeller: { type: mongoose.Schema.Types.ObjectId, ref: 'Teller' },
        reason: { type: String },
        transferredAt: { type: Date, default: Date.now },
      },
    ],
    notes: { type: String },
  },
  { timestamps: true }
);

// Auto-generate ticket number before saving (e.g. GEN-0042, FX-0007)
ticketSchema.pre('save', async function (next) {
  if (this.isNew) {
    const prefix = getPrefix(this.serviceType);
    const count = await mongoose.model('Ticket').countDocuments({
      'timing.issuedAt': {
        $gte: startOfDay(),
      },
    });
    this.ticketNumber = `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

function getPrefix(serviceType) {
  const map = {
    general: 'GEN',
    deposits: 'DEP',
    withdrawals: 'WDR',
    loans: 'LN',
    foreign_exchange: 'FX',
    account_opening: 'ACC',
    bulk_deposits: 'BLK',
    customer_service: 'CS',
  };
  return map[serviceType] || 'TKT';
}

function startOfDay() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

module.exports = mongoose.model('Ticket', ticketSchema);
module.exports.TICKET_STATUS = TICKET_STATUS;
