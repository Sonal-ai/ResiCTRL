# ResiCTRL 🏫

**A production-grade hostel management system built for real-world campus operations.**

ResiCTRL digitizes every aspect of hostel administration — from student tracking and attendance automation to complaint resolution, elections, and notice boards — across two dedicated portals for administrators and students.

![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Express%205%20%7C%20Prisma%20%7C%20PostgreSQL-blue)
![Tests](https://img.shields.io/badge/Tests-54%20passing-brightgreen)
![Security](https://img.shields.io/badge/Security-Hardened-green)

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Security](#-security)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

---

## 🏗 Architecture

```
ResiCTRL/
├── backend/              → Express 5 REST API + Prisma ORM
├── admin-portal/         → Next.js 16 Admin Dashboard
└── hosteller-portal/     → Next.js 16 Student Mobile-First App
```

The system is split into three independently deployable services:

| Service | Port | Description |
|---|---|---|
| **Backend API** | `5000` | REST API with JWT auth, rate limiting, and Prisma ORM |
| **Admin Portal** | `3000` | Full-featured dashboard for wardens and staff |
| **Hosteller Portal** | `3001` | Mobile-first student interface |

---

## ✨ Features

### 📊 Real-Time Dashboard
- Live metrics: total students, inside/outside counts, curfew violations
- Students outside without approved leave detection
- Pending leaves, complaint stats, and recent scan activity
- Aggregated single-API summary endpoint for instant loading

### 👨‍🎓 Student Management
- Full CRUD with search, pagination, and hostel filtering
- CSV bulk upload for batch student registration
- Individual student profile pages with attendance heatmaps, scan history, leaves, and complaints
- Edit modal for in-place updates
- Cloudinary-powered profile image uploads

### 📅 Attendance System
- **Automated daily attendance** via `node-cron` (runs at 23:05 IST)
- Marks students as PRESENT (inside), ABSENT (outside without leave), or ON_LEAVE
- **Attendance Register page** — school-style day-by-day grid with:
  - Date range picker + quick presets (This Week, 7/14/30 Days, This Month)
  - Per-student P/A/L cells with color coding
  - Summary stats: avg attendance %, total present/absent/leave
  - Hostel filter and student search
  - **CSV export** for offline records
- Per-student attendance percentage tracking

### 🚪 Entry/Exit Tracking
- Camera scan simulation for entry/exit event logging
- Automatic `current_location` (INSIDE/OUTSIDE) state management
- Timestamped scan event history per student
- OCR and model confidence score tracking

### 📋 Leave Management
- Students apply for leave with date range and reason
- Admin approval/rejection with auditing (who approved)
- Student-side leave history view
- Active leave count integration with dashboard metrics

### 🔔 Complaint System (Structured)
- **7 Categories** with **26 Subcategories**:
  - 💧 Water Issues (Water logging, Cooler not working, No supply, Dirty water)
  - ⚡ Electricity (Power cut, Faulty switch, Fan/Light not working)
  - 🍽️ Mess/Food (Poor quality, Unhygienic, Late service, Limited quantity)
  - 🪑 Furniture (Table, Chair, Almirah, Door, Bed issues)
  - 🧼 Hygiene (Mosquitoes, Garbage, Dirty washrooms, Drain blockage)
  - 🚨 Safety (Honeybee hive, Stray animals, Broken window, Unsafe wiring)
  - 📋 General (Other issues)
- **Auto-Priority Engine**: Safety/Electrical → URGENT, Furniture/General → LOW
- **4 Priority Levels**: LOW, MEDIUM, HIGH, URGENT (color-coded)
- **4 Status Levels**: PENDING, IN_PROGRESS, RESOLVED, REJECTED
- Admin manages via modal with priority override and response
- Optional image upload for evidence (Cloudinary)
- Zod cross-validation: subcategory must belong to selected category
- **20 unit tests** covering category validation, auto-priority, and schemas

### 🗳️ Election / Polling System
- Hostel committee elections with multiple positions:
  - 👑 President, 🍽️ Mess Secretary, 🎭 Cultural Secretary, ⚽ Sports Secretary
- Full election lifecycle: **UPCOMING → ACTIVE → ENDED**
- Per-position candidate registration with manifesto
- **One vote per student per position** (DB unique constraint + backend check)
- Voting only allowed during active election time window
- Results visible only after election ends (admins can preview anytime)
- Results display with vote bar charts and 🏆 winner indicators
- Admin: create election, add candidates, start/end voting, view results
- Student: browse candidates, vote with confirmation, view results

### 📢 Announcement / Notice Board
- Hostel-specific or global announcements
- **5 Categories**: EVENT, NOTICE, URGENT, MESS, GENERAL (with icons)
- **3 Priority Levels**: NORMAL, IMPORTANT, URGENT
- Optional expiry date (auto-hidden after expiry)
- URGENT announcements: pulsing badge + red left border
- IMPORTANT announcements: amber left border
- Category pill filter on student feed
- Admin: full CRUD with edit/delete from card actions
- Sorted by priority (URGENT first) then recency

### 🔔 Notification System
- Database-backed notifications triggered on:
  - Leave approval/rejection
  - Complaint status updates
  - Violation detection
- Read/unread tracking with mark-all-read

### 🔒 Auth & Security
*(See [Security section](#-security) below)*

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Express 5** | HTTP framework |
| **Prisma 5** | Type-safe ORM |
| **PostgreSQL** | Production database |
| **JWT** | Stateless authentication (7-day expiry) |
| **Zod 4** | Runtime request validation |
| **Helmet** | HTTP security headers + CSP |
| **express-rate-limit** | API rate limiting |
| **node-cron** | Automated attendance processing |
| **Cloudinary** | Image upload & storage |
| **Multer** | Multipart form handling |
| **bcryptjs** | Password hashing |
| **Vitest** | Unit testing framework |

### Frontend (Both Portals)
| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **Tailwind CSS 4** | Utility-first styling |
| **Axios** | HTTP client with interceptors |
| **Lucide React** | Icon library |
| **date-fns** | Date formatting |
| **next-themes** | Dark/light mode |
| **clsx** | Conditional className |

---

## 🗄 Database Schema

**11 models** across 4 domains:

```
Core:           Admin, Hosteller
Operations:     Leave, ScanEvent, AttendanceRecord, Complaint
Governance:     Election, Candidate, Vote
Communication:  Announcement, Notification
```

### Key Relationships
- `Hosteller` → has many Leaves, ScanEvents, AttendanceRecords, Complaints, Candidacies, Votes
- `Admin` → approves Leaves, resolves Complaints, creates Announcements
- `Election` → has many Candidates and Votes
- `Candidate` → belongs to Hosteller + Election, has many Votes
- `Vote` → `@@unique([voterId, position, electionId])` prevents double voting
- `AttendanceRecord` → `@@unique([hostellerId, date])` one record per student per day

### Performance Indexes
Indexed fields: `status`, `category`, `priority`, `hostel_name`, `current_location`, `hostellerId`, `electionId`, `expiry_date`, `userId`

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Admin registration (requires `ADMIN_REGISTRATION_KEY`) |
| POST | `/login` | Public | Admin login |
| POST | `/hosteller/login` | Public | Student login |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/summary` | Admin | Aggregated dashboard metrics |
| GET | `/metrics` | Admin | Basic student counts |
| GET | `/curfew-violations` | Admin | Current curfew violators |

### Students (`/api/hostellers`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Admin | List all (paginated, filterable) |
| POST | `/` | Admin | Create student |
| POST | `/bulk-upload` | Admin | CSV bulk import |
| GET | `/:id` | Admin | Student profile with analytics |
| PUT | `/:id` | Admin | Update student |

### Attendance (`/api/attendance`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/register` | Admin | Day-by-day attendance grid (max 90 days) |
| GET | `/date-range` | Auth | Available date boundaries |

### Leaves (`/api/leaves`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Student | Apply for leave |
| GET | `/` | Admin | List all (paginated) |
| GET | `/my` | Student | Own leave history |
| PUT | `/:id` | Admin | Approve/reject |

### Complaints (`/api/complaints`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/categories` | Auth | Category/subcategory tree |
| POST | `/` | Student | Submit (with image, auto-priority) |
| GET | `/` | Admin | List (filter by category/status/priority) |
| GET | `/my` | Student | Own complaints |
| GET | `/stats` | Admin | Status + category + priority stats |
| PUT | `/:id/status` | Admin | Update status/priority/response |

### Elections (`/api/elections`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/positions` | Auth | Valid position names |
| POST | `/` | Admin | Create election |
| GET | `/` | Admin | List all elections |
| GET | `/active` | Auth | Active election for hostel |
| POST | `/vote` | Student | Cast vote |
| GET | `/:id` | Auth | Election details |
| GET | `/:id/candidates` | Auth | Candidates by position |
| GET | `/:id/results` | Auth | Results (after ENDED) |
| POST | `/:id/candidates` | Admin | Add candidate |
| PUT | `/:id/status` | Admin | Change election status |

### Announcements (`/api/announcements`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/meta` | Auth | Category/priority enum values |
| POST | `/` | Admin | Create announcement |
| GET | `/` | Auth | List (auto-filtered by hostel for students) |
| PUT | `/:id` | Admin | Update |
| DELETE | `/:id` | Admin | Delete |

### Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Auth | List notifications |
| PUT | `/:id/read` | Auth | Mark read |
| PUT | `/read-all` | Auth | Mark all read |

### Scans (`/api/scans`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Auth | Log camera scan event |
| GET | `/recent` | Auth | Recent scan activity |

---

## 🔒 Security

### Authentication & Authorization
- **JWT tokens** with 7-day expiry, no fallback secrets
- Secure cookie flags (`httpOnly`, `secure`, `sameSite`)
- **Role-based access**: `WARDEN`, `ATTENDANT` (admin), `HOSTELLER` (student)
- Admin registration protected by `ADMIN_REGISTRATION_KEY`
- Auto-logout on 401 via Axios interceptors + periodic (60s) token expiry checks

### Middleware Stack
- **Helmet** with Content Security Policy (CSP)
- **CORS** with strict origin validation from `CORS_ORIGIN` env var
- **Rate Limiting**: 15 requests/15min (auth), 100 req/15min (general), 30 req/min (camera scans)
- **HPP** (HTTP Parameter Pollution protection)
- **Custom XSS Sanitization** — recursive input sanitization (replaces deprecated `xss-clean`)
- **MIME-type whitelist** on uploads: only JPEG, PNG, WebP allowed
- **Centralized error handler** — prevents stack trace leaks in production

### Validation
- **Zod schemas** on all API endpoints with detailed error messages
- Category ↔ subcategory cross-validation for complaints
- Date range validation with max limits
- UUID format validation for all IDs

---

## 🚀 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) (or use a hosted service like Supabase/Neon)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ResiCTRL.git
cd ResiCTRL
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file (see [Environment Variables](#-environment-variables)):
```bash
cp .env.example .env
# Edit .env with your database URL, JWT secret, Cloudinary keys, etc.
```

Push the database schema and start the server:
```bash
npx prisma db push
npm run dev
```
Backend runs on `http://localhost:5000`

### 3. Admin Portal Setup
```bash
cd admin-portal
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```
Admin portal runs on `http://localhost:3000`

### 4. Hosteller Portal Setup
```bash
cd hosteller-portal
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```
Student portal runs on `http://localhost:3001`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/resictrl"
DIRECT_URL="postgresql://user:pass@host:5432/resictrl"

# Server
PORT=5000

# Auth
JWT_SECRET="your-strong-random-secret"
ADMIN_REGISTRATION_KEY="your-admin-registration-key"

# CORS (comma-separated origins)
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"

# Cloudinary (image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Features
ENABLE_CRON="true"    # Daily attendance automation
```

### Frontend Portals (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🧪 Testing

The backend includes **54 automated tests** using Vitest:

```bash
cd backend
npm test
```

| Test Suite | Tests | What it covers |
|---|---|---|
| `sanitize.test.js` | 9 | XSS sanitization middleware |
| `validation.test.js` | 16 | Zod schema validation for all endpoints |
| `auth.test.js` | 9 | JWT security, admin registration key |
| `complaint.test.js` | 20 | Categories, subcategories, auto-priority, cross-validation |

---

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma              # 11 models + indexes
├── src/
│   ├── configs/                    # Prisma client, Cloudinary config
│   ├── controllers/                # Route handlers
│   │   ├── authController.js
│   │   ├── hostellerController.js
│   │   ├── leaveController.js
│   │   ├── complaintController.js
│   │   ├── dashboardController.js
│   │   ├── attendanceController.js
│   │   ├── electionController.js
│   │   └── announcementController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js       # JWT + role-based access
│   │   ├── errorHandler.js         # Centralized error handling
│   │   ├── sanitizeMiddleware.js   # Custom XSS protection
│   │   └── uploadMiddleware.js     # Multer + MIME whitelist
│   ├── models/
│   │   ├── repositories/           # Data access layer (Prisma queries)
│   │   └── validations/            # Zod schemas
│   ├── routes/                     # Express route definitions
│   ├── services/                   # Business logic (notifications, cron)
│   ├── utils/                      # Helpers (pagination, API response, JWT)
│   ├── app.js                      # Express app configuration
│   └── server.js                   # Server entry point + cron setup
└── tests/                          # Vitest unit tests

admin-portal/
└── src/
    ├── app/
    │   ├── (dashboard)/
    │   │   ├── page.js             # Overview dashboard
    │   │   ├── students/           # Student directory + profiles
    │   │   ├── attendance/         # Attendance register
    │   │   ├── leaves/             # Leave management
    │   │   ├── complaints/         # Complaint management
    │   │   ├── elections/          # Election management
    │   │   └── announcements/      # Announcement management
    │   └── login/
    ├── components/
    │   └── Sidebar.jsx             # Navigation sidebar
    └── lib/
        └── api.js                  # Axios client + interceptors

hosteller-portal/
└── src/
    ├── app/
    │   ├── (dashboard)/            # Student dashboard
    │   ├── leave/                  # Leave application
    │   ├── complaints/             # Complaint submission
    │   ├── elections/              # Voting interface
    │   ├── announcements/          # Notice board feed
    │   ├── settings/               # Profile & password
    │   └── login/
    ├── components/
    │   └── TopNav.jsx              # Navigation bar
    └── lib/
        └── api.js                  # Axios client + interceptors
```

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

ISC

---

<p align="center">
  Built with ❤️ for smarter hostel management
</p>
