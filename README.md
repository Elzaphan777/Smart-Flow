# SmartFlow

SmartFlow is an intelligent queue routing and customer service management system designed for banks, service centers, and front-desk operations. It helps distribute customers to the right teller, reduce wait times, and give staff real-time visibility into queue activity.

The platform combines a React frontend, a Node.js/Express backend, and Socket.IO-powered live updates to deliver a smooth customer and teller experience.

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.IO-Live-010101?style=for-the-badge&logo=socket.io" alt="Socket.IO" />
</p>

## Why SmartFlow?

Traditional queue systems often create long waits, poor workload distribution, and unclear service flow. SmartFlow solves this by:

- Automatically routing customers to the most suitable teller
- Supporting multiple service types such as deposits, withdrawals, loans, and forex
- Showing live queue status to staff and customers
- Enabling teller availability tracking and service management
- Providing analysis for team performance and workload monitoring

## Key Features

- Smart ticket issuance and queue management
- Dynamic teller assignment based on availability and specialization
- Real-time updates through WebSockets
- Teller dashboard for queue and service handling
- Manager dashboard for operational visibility and analytics
- Support for public kiosk-style ticket generation
- Role-based access control for managers, tellers, and admins
- Seeded demo accounts for development and testing

## Architecture

SmartFlow is organized as a monorepo with two main components:

- Frontend: React + Vite interface for kiosk, teller, and manager views
- Backend: Express + Socket.IO API with MongoDB persistence

## Tech Stack

### Frontend
- React
- Vite
- Socket.IO client
- Lucide React icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Socket.IO
- bcryptjs for hashing

## Repository Structure

```bash
Smart-Flow/
├── Frontend/                         # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── smartflow-backend/
│   └── smartflow-backend/            # Express + MongoDB backend
│       ├── src/
│       ├── scripts/
│       ├── server.js
│       ├── package.json
│       ├── .env.example
│       └── API_DOCS.md
├── package.json                     # Workspace root
├── README.md
├── API_DOCS.md
├── smartflow.code-workspace
├── package-lock.json
└── .gitignore
```

## Getting Started

### Prerequisites

Before running the app, ensure you have installed:

- Node.js 18+
- npm 9+
- MongoDB running locally or a MongoDB Atlas connection

### 1) Clone the repository

```bash
git clone https://github.com/Elzaphan777/Smart-Flow.git
cd Smart-Flow
```

### 2) Install dependencies

Install the workspace dependencies for both frontend and backend:

```bash
npm install
```

### 3) Configure environment variables

Create a local environment file in the backend project:

```bash
cd smartflow-backend/smartflow-backend
cp .env.example .env
```

Update the values in `.env` with your local configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartflow
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=8h
CLIENT_URL=http://localhost:5173
```

### 4) Start the application

From the root project directory, run:

```bash
npm run dev
```

This starts both services concurrently:

- Backend on the configured port (default: 5000)
- Frontend on the Vite dev server (default: 5173)

### Optional: Run services individually

#### Backend only

```bash
cd smartflow-backend/smartflow-backend
npm run dev
```

#### Frontend only

```bash
cd Frontend
npm run dev
```

### Seed demo data

If you want to populate the database with sample teller accounts and test records:

```bash
cd smartflow-backend/smartflow-backend
npm run seed
```

## Default Demo Accounts

The backend includes seeded accounts for development and testing:

| Role | Staff ID | Password |
|------|----------|----------|
| Admin | ADMIN001 | Admin@1234 |
| Manager | TLR001 | Teller@1234 |
| Teller | TLR002 | Teller@1234 |
| Teller | TLR003 | Teller@1234 |
| Teller | TLR004 | Teller@1234 |
| Teller | TLR005 | Teller@1234 |

## API and Documentation

The project includes API documentation for the backend:

- `API_DOCS.md` at the repository root
- `smartflow-backend/smartflow-backend/API_DOCS.md`

These documents cover endpoints, authentication, queue flows, and WebSocket events.

## Project Goals

SmartFlow is built to support:

- Better queue organization
- Reduced customer waiting time
- Smarter teller allocation
- Improved bank branch operations
- Live monitoring of service performance

## Contributing

Contributions are welcome. If you would like to improve the project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request with a clear summary

## License

This project is licensed under the ISC License.

## Contact

For questions, collaboration, or project updates, reach out through the repository owner or project maintainers.

---

Built for intelligent service operations and smoother customer experiences.
