# ResiCTRL 🏫

ResiCTRL is a full-stack web application designed to digitize, streamline, and secure hostel operations. It features real-time curriculum tracking, camera simulation for entry/exit logging, and an interactive student and leave management dashboard.

![ResiCTRL Architecture](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Prisma%20%7C%20SQLite-blue)

## Features
- **📊 Real-time Dashboard:** Monitor total students, current occupancy, and curfew violations.
- **👨‍🎓 Student Management:** Add and manage student records, contact numbers, and hostel assignments.
- **🚪 Entry/Exit tracking:** Simulate and log high-frequency camera scans determining location state (Inside/Outside).
- **📅 Leave Management:** Apply for leave on behalf of students and approve/reject them.

## Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS, Axios, Lucide React
- **Backend:** Node.js, Express.js, Prisma ORM
- **Database:** SQLite (Zero-config local database, easily swappable to PostgreSQL or MongoDB).

---

## 🚀 Setup & Installation Instructions

Follow these steps to run ResiCTRL locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v16.14.0 or above)
- Git

### 1. Setting Up the Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   Create a file named `.env` in the `backend/` folder and add the following:
   ```env
   DATABASE_URL="file:./dev.db"
   PORT=5000
   ```
4. Initialize the Database and Push Prisma Schema:
   ```bash
   npx prisma db push
   ```
   *(This creates the `dev.db` SQLite file locally—no SQL server needed!)*

5. Start the backend server:
   ```bash
   node src/server.js
   # Or "npm run dev" if nodemon is configured
   ```
   The backend should now be running on `http://localhost:5000`.

### 2. Setting Up the Frontend

1. Open a **new terminal tab** and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:5173` to see the live dashboard!

---

## Usage Guide
1. Go to the **Students** tab and add a few students using the "Add Student" button.
2. Navigate back to the **Overview Dashboard** and click **"Simulate Scan"** to mimic entry/exit scans from cameras. You'll see the metrics instantly change.
3. Use the **Leave Management** tab to apply for a student's leave and approve it—this temporarily removes them from the "Outside Hostel" active violation metrics.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
