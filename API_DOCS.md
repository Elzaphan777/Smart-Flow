# SmartFlow Backend — API Documentation

> Base URL: `http://localhost:5000/api`  
> Real-time: WebSocket via `socket.io` on the same host/port

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and fill in your values
cp .env.example .env

# 3. Seed the database with sample tellers
npm run seed

# 4. Start dev server
npm run dev
```

**Default .env values**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartflow
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=8h
```

---

## Authentication

All protected routes require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <token>
```

Tokens are returned on login and are valid for 8 hours.

**Roles:** `admin` > `manager` > `teller`

---

## Endpoints

### Health Check

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/health` | None | Check server is running |

**Response:**
```json
{ "success": true, "message": "SmartFlow API is running", "timestamp": "..." }
```

---

### Auth Routes `/auth`

#### POST `/auth/login`
Teller logs in. Marks them as online + available.

**Body:**
```json
{ "staffId": "TLR001", "password": "Teller@1234" }
```

**Response:**
```json
{
  "success": true,
  "token": "<jwt>",
  "data": {
    "id": "...",
    "name": "Kwame Asante",
    "staffId": "TLR001",
    "role": "manager",
    "windowNumber": 1,
    "specializations": ["general", "deposits"],
    "isAvailable": true
  }
}
```

---

#### POST `/auth/logout`
Marks teller as offline. **Auth required.**

---

#### GET `/auth/me`
Returns the logged-in teller's profile. **Auth required.**

---

#### POST `/auth/register`
Creates a new teller account. **Manager/Admin only.**

**Body:**
```json
{
  "name": "Esi Brew",
  "staffId": "TLR006",
  "email": "esi@smartflow.com",
  "password": "Teller@1234",
  "role": "teller",
  "windowNumber": 6,
  "specializations": ["general", "withdrawals"]
}
```

**Valid specializations:**
`general`, `deposits`, `withdrawals`, `loans`, `foreign_exchange`, `account_opening`, `bulk_deposits`, `customer_service`

---

### Ticket Routes `/tickets`

#### POST `/tickets/issue` — **PUBLIC** (Kiosk)
Issues a new ticket and immediately routes it to the best available teller.

**Body:**
```json
{
  "serviceType": "foreign_exchange",
  "priority": "normal",
  "clientInfo": {
    "name": "John Doe",
    "phone": "0244000000",
    "accountNumber": "1234567890"
  }
}
```

**Response (routed):**
```json
{
  "success": true,
  "message": "Proceed to Window 2 — Abena Mensah",
  "data": {
    "ticketNumber": "FX-0007",
    "serviceType": "foreign_exchange",
    "status": "assigned",
    "assignedWindow": 2,
    "assignedTeller": "Abena Mensah"
  }
}
```

**Response (waiting — all tellers busy):**
```json
{
  "success": true,
  "message": "All tellers are currently busy. Please wait...",
  "data": {
    "ticketNumber": "FX-0008",
    "status": "waiting",
    "assignedWindow": null,
    "position": 3
  }
}
```

---

#### GET `/tickets/status/:ticketNumber` — **PUBLIC**
Poll ticket status (useful for kiosk/SMS follow-up).

```
GET /tickets/status/FX-0007
```

---

#### GET `/tickets/queue` — Auth (Teller+)
Returns all active tickets (waiting, assigned, serving). Used by manager dashboard.

---

#### GET `/tickets/my-queue` — Auth (Teller)
Returns tickets assigned to the logged-in teller.

---

#### POST `/tickets/:id/call` — Auth (Teller)
Teller confirms they are now serving this ticket. Updates status to `serving`.

---

#### POST `/tickets/:id/complete` — Auth (Teller)
Marks ticket as done. Auto-assigns next waiting ticket to this teller.

**Body (optional):**
```json
{ "notes": "Client required rate conversion receipt" }
```

---

#### POST `/tickets/:id/cancel` — Auth (Teller+)
Cancels a ticket (client no-show, etc.).

---

#### POST `/tickets/:id/transfer` — Auth (Teller+)
Transfers ticket to another teller.

**Body:**
```json
{ "toTellerId": "<mongo_id>", "reason": "Specialist required for forex" }
```

---

### Teller Routes `/tellers`

#### GET `/tellers/online` — **PUBLIC**
Returns all currently online tellers with their queue lengths. Used by display boards.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Abena Mensah",
      "windowNumber": 2,
      "specializations": ["foreign_exchange", "general"],
      "isAvailable": false,
      "currentTicket": { "ticketNumber": "FX-0007", "serviceType": "foreign_exchange" }
    }
  ]
}
```

---

#### PATCH `/tellers/availability` — Auth (Teller)
Toggle teller's availability (e.g. going on break).

**Body:**
```json
{ "isAvailable": false }
```

---

#### GET `/tellers` — Auth (Manager+)
All tellers with their current state.

#### GET `/tellers/:id` — Auth
Single teller by MongoDB ID.

#### PATCH `/tellers/:id` — Auth (Manager+)
Update name, specializations, or window number.

#### DELETE `/tellers/:id` — Auth (Admin)
Remove a teller account.

#### GET `/tellers/stats/today` — Auth (Manager+)
Today's performance per teller (tickets served, avg service time).

---

### Dashboard Routes `/dashboard`

#### GET `/dashboard/service-types` — **PUBLIC**
Returns list of valid service types for the kiosk dropdown.

```json
{ "data": ["general", "deposits", "withdrawals", "loans", "foreign_exchange", ...] }
```

---

#### GET `/dashboard/snapshot` — Auth (Manager+)
Live branch snapshot: online tellers, queue lengths per teller, service breakdown of waiting tickets.

---

#### GET `/dashboard/analytics?date=2026-06-12` — Auth (Manager+)
Full daily analytics:
- Total tickets issued
- Breakdown by service type (count, avg wait, avg service time)
- Volume by hour (peak detection)
- Per-teller performance stats

---

## Ticket Statuses

| Status | Meaning |
|--------|---------|
| `waiting` | In queue, no teller available yet |
| `assigned` | Routed to a teller, client should go to window |
| `serving` | Teller actively serving |
| `completed` | Done |
| `cancelled` | No-show or manually cancelled |
| `transferred` | Moved to another teller |

---

## WebSocket Events

Connect with `socket.io-client`:
```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:5000');
```

### Joining Rooms

**Kiosk terminal:**
```js
socket.emit('join_kiosk');
```

**Display board:**
```js
socket.emit('join_display');
```

**Teller / Manager (after login):**
```js
socket.emit('authenticate', jwtToken);
socket.on('authenticated', (data) => console.log(data.message));
socket.on('auth_error', (err) => console.error(err.message));
```

---

### Events Your Frontend Listens For

| Event | Room | Payload | Use |
|-------|------|---------|-----|
| `new_ticket` | `teller_{id}` | `{ ticket }` | Teller dashboard: new ticket in queue |
| `ticket_assigned` | `displays` | `{ ticketNumber, windowNumber, tellerName }` | Display board: show routing info |
| `ticket_waiting` | `displays` | `{ ticketNumber, serviceType }` | Display board: show waiting state |
| `now_serving` | `displays` | `{ ticketNumber, windowNumber }` | Display board: "NOW SERVING" banner |
| `queue_update` | `managers` | `{ type }` | Manager dashboard: re-fetch snapshot |
| `teller_status_change` | `managers` | `{ tellerId, windowNumber, isAvailable, isOnline }` | Manager dashboard: teller card update |

---

## Seeded Test Accounts

| Name | Staff ID | Password | Role | Window |
|------|----------|----------|------|--------|
| Admin User | ADMIN001 | Admin@1234 | admin | — |
| Kwame Asante | TLR001 | Teller@1234 | manager | 1 |
| Abena Mensah | TLR002 | Teller@1234 | teller | 2 |
| Kofi Boateng | TLR003 | Teller@1234 | teller | 3 |
| Ama Owusu | TLR004 | Teller@1234 | teller | 4 |
| Yaw Darko | TLR005 | Teller@1234 | teller | 5 |

---

## Project Structure

```
smartflow-backend/
├── server.js               # Entry point (HTTP + Socket.io)
├── src/
│   ├── app.js              # Express app + routes
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── models/
│   │   ├── Teller.js       # Teller schema + auth methods
│   │   └── Ticket.js       # Ticket schema + auto ticket numbering
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── ticketController.js
│   │   ├── tellerController.js
│   │   └── dashboardController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tickets.js
│   │   ├── tellers.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   ├── auth.js         # JWT protect + role restrict
│   │   └── errorHandler.js
│   ├── socket/
│   │   └── socketHandler.js # All WebSocket logic
│   └── utils/
│       └── routingEngine.js # Core intelligent routing algorithm
└── scripts/
    └── seed.js             # Database seeder
```
