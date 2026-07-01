const express = require('express');
const router = express.Router();
const {
  issueTicket,
  getTicketStatus,
  callTicket,
  completeTicket,
  cancelTicket,
  transferTicket,
  getQueue,
  getMyQueue,
} = require('../controllers/ticketController');
const { protect, restrict } = require('../middleware/auth');

// Public — kiosk endpoints (no auth needed at kiosk terminal)
router.post('/issue', issueTicket);
router.get('/status/:ticketNumber', getTicketStatus);

// Authenticated — teller & manager endpoints
router.get('/queue', protect, restrict('teller', 'manager', 'admin'), getQueue);
router.get('/my-queue', protect, getMyQueue);
router.post('/:id/call', protect, callTicket);
router.post('/:id/complete', protect, completeTicket);
router.post('/:id/cancel', protect, cancelTicket);
router.post('/:id/transfer', protect, transferTicket);

module.exports = router;
