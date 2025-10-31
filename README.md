# Social Gaming Platform

A full-stack social gaming platform with **Next.js frontend** and **Express.js backend (Node.js + JavaScript)**, featuring real-time multiplayer games, chat, and virtual economy.

## Features

- **User Authentication**: Register, login, and secure JWT-based authentication
- **Friend System**: Search users, send/accept friend requests
- **Wallet System**: Virtual currency with deposits, withdrawals, and transaction history
- **Happy Farm**: 10x10 grid farming game to earn money
- **Caro Game**: Multiplayer betting game with expandable board
- **Real-time Chat**: Direct messaging with friends
- **Socket.io**: Real-time updates across all features

## Project Structure

\`\`\`
├── backend/              # Express.js backend (Node.js + JavaScript)
│   ├── src/
│   │   ├── server.js    # Main server file
│   │   ├── socket.js    # Socket.io handlers
│   │   ├── db.js        # Database connection
│   │   ├── auth.js      # Authentication utilities
│   │   └── routes/      # API routes (all .js files)
│   └── package.json
├── app/                  # Next.js frontend pages
├── components/           # React components
├── lib/                  # Utilities
│   ├── api.ts           # API client
│   └── socket-client.ts # Socket.io client
├── scripts/             # Database SQL scripts
└── types/               # TypeScript types
\`\`\`

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (local hoặc remote)

### Database Setup

**Xem chi tiết trong [DATABASE_SETUP.md](./DATABASE_SETUP.md)**

### Backend Setup (chat-game-be/)

1. Navigate to backend directory:
\`\`\`bash
cd chat-game-be
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create `.env` file (copy từ `.env.example`):
\`\`\`bash
DB_HOST=100.64.192.68
DB_PORT=5432
DB_NAME=social_gaming
DB_USER=your_database_user
DB_PASSWORD=your_database_password
JWT_SECRET=your-secret-key-change-this
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
\`\`\`

4. Run database migrations in your PostgreSQL:
\`\`\`bash
# Run scripts/001_initial_schema.sql
# Run scripts/002_seed_plants.sql
\`\`\`

5. Start backend server:
\`\`\`bash
npm run dev
\`\`\`

Backend will run on http://localhost:3001

### Frontend Setup

1. Install dependencies (from root):
\`\`\`bash
npm install
\`\`\`

2. Create `.env.local` file (copy từ `.env.example`):
\`\`\`bash
# Database Configuration (PostgreSQL)
DB_HOST=100.64.192.68
DB_PORT=5432
DB_NAME=social_gaming
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# JWT Secret (phải giống với backend)
JWT_SECRET=your-secret-key-change-this

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

3. Start frontend:
\`\`\`bash
npm run dev
\`\`\`

4. Open http://localhost:3000

⚠️ **Lưu ý**: JWT_SECRET phải giống nhau giữa frontend và backend!

## Usage

1. Register a new account at `/register`
2. Login at `/login`
3. Access dashboard to see all features
4. Add friends, play games, chat, and manage your wallet

## Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Socket.io Client
- shadcn/ui components

**Backend:**
- Node.js + Express.js (JavaScript)
- Socket.io Server
- PostgreSQL (native pg driver)
- JWT Authentication
- bcryptjs for password hashing

## API Documentation

See `backend/README.md` for detailed API documentation.
