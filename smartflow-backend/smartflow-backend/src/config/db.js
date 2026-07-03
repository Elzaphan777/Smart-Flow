const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt connecting to the local/provided MONGODB_URI with a timeout
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`⚠️  Local MongoDB connection failed: ${error.message}`);
    console.log(`ℹ️  Starting in-memory MongoDB fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();

      const conn = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);

      // Auto-seed in-memory DB since it starts empty
      setTimeout(async () => {
        try {
          const Teller = require('../models/Teller');
          const count = await Teller.countDocuments();
          if (count === 0) {
            console.log('🌱 In-Memory DB is empty. Auto-seeding default tellers...');
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
            await Teller.create(seedTellers);
            console.log('🌱 Auto-seeded in-memory DB successfully.');
          }
        } catch (seedErr) {
          console.error('❌ In-Memory Auto-seed failed:', seedErr.message);
        }
      }, 500);

    } catch (memError) {
      console.error(`❌ In-Memory MongoDB Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
