# Hostel Management System (HMS)

**Team 42** | NJ Madhav, P Krishna Sai , Tathya Sharma.
**Instructors:** Sai Srithaja & Arun Avinash Chauhan  
**Version:** 1.0 | April 2026

---

## About the Project

A full-stack web application to manage hostel operations including room allocation, complaint and ticket management, notice board, and user administration.

Three roles are supported — **Student**, **Warden**, and **Admin** — each with their own dashboard and access level enforced via JWT middleware on every protected route.

---

## Tech Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Frontend | React 18 (Create React App) |
| Backend  | Node.js + Express           |
| Database | MySQL 8                     |
| Auth     | JWT + bcrypt                |

---

## Project Structure
hostel-app/
├── src/                        ← React frontend source
│   └── api.js                  ← Axios API helper
├── public/                     ← React public assets
├── hms-backend/                ← Node.js + Express backend
│   ├── server.js               ← Entry point
│   ├── src/
│   │   ├── config/db.js        ← MySQL connection pool
│   │   ├── controllers/        ← Business logic
│   │   ├── middleware/auth.js  ← JWT verification
│   │   └── routes/             ← API route definitions
│   └── .env                    ← Environment config (create manually)
├── hms_backup.sql              ← Full MySQL database dump

├── SRS_TEAM42.docx
├── SDS_team42.pdf
└── HMS_Test_Plan_TEAM42.xlsx
---

## Deployment

Not hosted on a live URL. Please run locally using the steps below.

---

## How to Run Locally

### Prerequisites
- Node.js v18+
- MySQL 8
- Git

### Step 1 — Clone the repository

```bash
git clone https://github.com/madhav00-sketch/HMS-Team42.git
cd HMS-Team42
```

### Step 2 — Set up the database

Open MySQL CLI or MySQL Workbench and run:

```sql
CREATE DATABASE hms_db;
USE hms_db;
SOURCE hms_backup.sql;
```

Or from Command Prompt:

```bash
mysql -u root -p hms_db < hms_backup.sql
```

This loads all tables and sample data — 225 rooms, 350+ students, wardens and admins.

### Step 3 — Configure and run the backend

```bash
cd hms-backend
```

Create a `.env` file inside `hms-backend/` with:

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hms_db
JWT_SECRET=hms_team42_secret_2024

Then:

```bash
npm install
node server.js
```

Backend runs at: `http://localhost:5000`  
Health check: `http://localhost:5000/api/health`

### Step 4 — Run the frontend

Open a new terminal in the root project folder:

```bash
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## Test Login Credentials

All accounts use the same default password.

| Role    | User ID      | Password |
|---------|-----------------|----------|
| Admin   | AD001  | password123 |
| Warden  | WD001 | password123 |
| Student | HS2024001  | password123 |

More accounts are available after importing `hms_backup.sql`.

---

## API Endpoints

| Method | Endpoint            | Description             | Access  |
|--------|---------------------|-------------------------|---------|
| POST   | /api/auth/login     | Login, returns JWT      | Public  |
| GET    | /api/rooms          | Get all rooms           | Warden  |
| POST   | /api/rooms          | Add a room              | Warden  |
| GET    | /api/complaints     | Get complaints          | Both    |
| POST   | /api/complaints     | Submit a complaint      | Student |
| PATCH  | /api/complaints/:id | Update complaint status | Warden  |
| GET    | /api/notices        | Get all notices         | Both    |
| POST   | /api/notices        | Post a notice           | Warden  |
| GET    | /api/users          | Get all users           | Admin   |
| POST   | /api/users          | Add a user              | Admin   |
| PATCH  | /api/users/:id      | Edit/deactivate user    | Admin   |

---

## Notes for Evaluators

- The `.env` file is not pushed to GitHub for security. Create it manually using the format above.
- `hms_backup.sql` contains the full database schema and sample data.
- Role-based access is enforced on both frontend (UI hiding) and backend (JWT middleware).
- Known issues documented in the Test Plan: token not invalidated on logout, complaint list lacks pagination, XSS sanitisation pending.

---

## Documents

All project documents ( download to open SRS and Testplan) :

- `SRS_TEAM42.docx` — Software Requirements Specification
- `SDS_team42.pdf` — Software Design Specification
- `HMS_Test_Plan_TEAM42.xlsx` — Test Plan (56 test cases across 8 modules)