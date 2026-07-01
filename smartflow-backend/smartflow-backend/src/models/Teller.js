const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Services a teller can be specialized in
const SERVICE_TYPES = [
  'general',
  'deposits',
  'withdrawals',
  'loans',
  'foreign_exchange',
  'account_opening',
  'bulk_deposits',
  'customer_service',
];

const tellerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Teller name is required'],
      trim: true,
    },
    staffId: {
      type: String,
      required: [true, 'Staff ID is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ['teller', 'manager', 'admin'],
      default: 'teller',
    },
    windowNumber: {
      type: Number,
      required: [true, 'Window number is required'],
      unique: true,
    },
    specializations: {
      type: [String],
      enum: SERVICE_TYPES,
      default: ['general'],
    },
    isAvailable: {
      type: Boolean,
      default: false, // false until they log in and go "online"
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    currentTicket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      default: null,
    },
    // Running stats per session / day
    stats: {
      ticketsServedToday: { type: Number, default: 0 },
      totalServiceTimeToday: { type: Number, default: 0 }, // milliseconds
      avgServiceTime: { type: Number, default: 0 }, // milliseconds
    },
  },
  { timestamps: true }
);

// Hash password before saving
tellerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare entered password with hashed
tellerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual: current queue length is tracked on Ticket model, not stored here
tellerSchema.virtual('displayName').get(function () {
  return `${this.name} — Window ${this.windowNumber}`;
});

module.exports = mongoose.model('Teller', tellerSchema);
module.exports.SERVICE_TYPES = SERVICE_TYPES;
