/**
 * Seed Script — creates an admin account + 5 sample tellers
 * Run with: node scripts/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Teller = require('../src/models/Teller');
const connectDB = require('../src/config/db');

const seedTellers = [
  {
    name: 'Admin User',
    staffId: 'ADMIN001',
    email: 'admin@smartflow.com',
    password: 'Admin@1234',
    role: 'admin',
    windowNumber: 0,
    specializations: ['general', 'customer_service'],
  },
  {
    name: 'Kwame Asante',
    staffId: 'TLR001',
    email: 'kwame@smartflow.com',
    password: 'Teller@1234',
    role: 'manager',
    windowNumber: 1,
    specializations: ['general', 'deposits', 'withdrawals', 'customer_service'],
  },
  {
    name: 'Abena Mensah',
    staffId: 'TLR002',
    email: 'abena@smartflow.com',
    password: 'Teller@1234',
    role: 'teller',
    windowNumber: 2,
    specializations: ['foreign_exchange', 'general'],
  },
  {
    name: 'Kofi Boateng',
    staffId: 'TLR003',
    email: 'kofi@smartflow.com',
    password: 'Teller@1234',
    role: 'teller',
    windowNumber: 3,
    specializations: ['loans', 'account_opening'],
  },
  {
    name: 'Ama Owusu',
    staffId: 'TLR004',
    email: 'ama@smartflow.com',
    password: 'Teller@1234',
    role: 'teller',
    windowNumber: 4,
    specializations: ['bulk_deposits', 'deposits'],
  },
  {
    name: 'Yaw Darko',
    staffId: 'TLR005',
    email: 'yaw@smartflow.com',
    password: 'Teller@1234',
    role: 'teller',
    windowNumber: 5,
    specializations: ['general', 'withdrawals', 'customer_service'],
  },
];

const seed = async () => {
  await connectDB();

  try {
    await Teller.deleteMany({});
    console.log('🗑️  Cleared existing tellers');

    const created = await Teller.create(seedTellers);
    console.log(`✅ Seeded ${created.length} tellers:\n`);

    created.forEach((t) => {
      console.log(`  [${t.role.toUpperCase()}] ${t.name} — Staff ID: ${t.staffId} | Window: ${t.windowNumber}`);
    });

    console.log('\n🔑 Default password for all: Teller@1234');
    console.log('🔑 Admin password: Admin@1234\n');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    mongoose.disconnect();
    console.log('Database disconnected.');
  }
};

seed();
