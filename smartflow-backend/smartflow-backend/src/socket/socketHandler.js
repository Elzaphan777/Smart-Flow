const jwt = require('jsonwebtoken');
const Teller = require('../models/Teller');

/**
 * Socket.io rooms:
 *  - teller_{id}   : private room for each teller
 *  - managers      : all manager/admin clients
 *  - displays      : public display boards in the branch
 *  - kiosks        : entry kiosk terminals
 *
 * Events emitted BY SERVER:
 *  - new_ticket          → teller room: a ticket has been assigned to this teller
 *  - ticket_assigned     → displays: show client which window to go to
 *  - ticket_waiting      → displays: client is in waiting pool
 *  - now_serving         → displays: teller is now serving X ticket
 *  - queue_update        → managers: generic dashboard refresh trigger
 *  - teller_status_change→ managers: a teller went online/offline/available
 *
 * Events emitted BY CLIENT:
 *  - authenticate        → client sends JWT token to join their room
 *  - join_display        → display board joins display room (no auth needed)
 *  - join_kiosk          → kiosk terminal joins kiosk room
 */
const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── Display board / kiosk (no auth) ──────────────────────────────────
    socket.on('join_display', () => {
      socket.join('displays');
      console.log(`📺 Display board joined: ${socket.id}`);
    });

    socket.on('join_kiosk', () => {
      socket.join('kiosks');
      console.log(`🖥️  Kiosk joined: ${socket.id}`);
    });

    // ── Authenticated teller / manager ───────────────────────────────────
    socket.on('authenticate', async (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const teller = await Teller.findById(decoded.id);

        if (!teller) {
          socket.emit('auth_error', { message: 'Invalid credentials.' });
          return;
        }

        // Join personal room
        socket.join(`teller_${teller._id}`);

        // Managers and admins get the manager broadcast room too
        if (['manager', 'admin'].includes(teller.role)) {
          socket.join('managers');
        }

        socket.emit('authenticated', {
          message: `Authenticated as ${teller.name}`,
          windowNumber: teller.windowNumber,
          role: teller.role,
        });

        console.log(`✅ Teller authenticated: ${teller.name} (Window ${teller.windowNumber})`);

        // Handle disconnect — mark teller offline
        socket.on('disconnect', async () => {
          console.log(`❌ Teller disconnected: ${teller.name}`);
          try {
            await Teller.findByIdAndUpdate(teller._id, {
              isOnline: false,
              isAvailable: false,
            });
            io.to('managers').emit('teller_status_change', {
              tellerId: teller._id,
              windowNumber: teller.windowNumber,
              isOnline: false,
              isAvailable: false,
            });
          } catch (e) {
            console.error('Error updating teller on disconnect:', e.message);
          }
        });
      } catch (err) {
        socket.emit('auth_error', { message: 'Token invalid or expired.' });
      }
    });

    // Generic disconnect for non-authenticated sockets
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;
