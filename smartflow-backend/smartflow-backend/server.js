require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = require('./src/app');
const connectDB = require('./src/config/db');
const initSocket = require('./src/socket/socketHandler');

const PORT = process.env.PORT || 5000;

// ── Create HTTP server from Express app ──────────────────────────────────────
const server = http.createServer(app);

// ── Attach Socket.io ─────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// Register all socket event handlers
initSocket(io);

// ── Connect to MongoDB, then start server ────────────────────────────────────
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🚀 SmartFlow Backend running on port ${PORT}`);
    console.log(`📡 WebSocket server ready`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
});

// ── Graceful shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
