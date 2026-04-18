# 🎤 ResiCTRL — Complete Demo Walkthrough for Judges

> **Estimated demo time:** 15–20 minutes  
> **Prerequisite:** All 3 servers running (backend :5000, admin :3000, hosteller :3001)

---

## 🚀 Step 0: Start the Application

Open **3 terminal windows** and run one command in each:

```bash
# Terminal 1 — Backend API
cd backend
npm run dev
# ✅ EXPECT: "🚀 ResiCTRL Backend running on port 5000"

# Terminal 2 — Admin Portal
cd admin-portal
npm run dev -- -p 3000
# ✅ EXPECT: "✓ Ready in ~1s" on localhost:3000

# Terminal 3 — Hosteller Portal
cd hosteller-portal
npm run dev -- -p 3001
# ✅ EXPECT: "✓ Ready in ~1s" on localhost:3001
```

> [!TIP]
> Keep **two browser tabs** open side-by-side: `localhost:3000` (Admin) and `localhost:3001` (Student)

---

## 📌 PART 1: ADMIN PORTAL (localhost:3000)

---

### Step 1.1 — Admin Login

1. Open `http://localhost:3000` in your browser
2. You'll see the **"Admin Secure Login"** page with a shield icon
3. Enter your admin credentials:
   - **Email:** `warden@dtu.ac.in`
   - **Password:** *(your admin password)*
4. Click **"Sign In"**
5. ✅ **EXPECT:** Redirect to the Admin Dashboard

> [!NOTE]
> Point out the "Don't have an account? **Register**" link — this leads to `/register` where a new admin can register using the secret Admin Registration Key. This prevents unauthorized admin creation.

---

### Step 1.2 — Dashboard Overview

After login, you're on the **Overview Dashboard**. Walk the judges through each section:

| Section | What to point out |
|---|---|
| **Header** | "Good morning, Dr." — personalized greeting with admin's name from JWT |
| **System Online** badge | Green dot — backend is connected |
| **TOTAL HOSTELLERS** | Total registered students (e.g., 5) |
| **INSIDE HOSTEL** | Students currently inside campus |
| **OUTSIDE WITHOUT LEAVE** | ⚠️ Red "Needs attention" badge — students outside who haven't applied for leave |
| **ON APPROVED LEAVE** | Students currently on approved leave |
| **PENDING LEAVES** | Number awaiting admin approval |
| **PENDING COMPLAINTS** | Unresolved complaints count |
| **Alert Cards** | "2 students outside without leave" — lists names. Click **"View Students →"** to go to the Students page |
| **Recent Activity** | Last 10 camera scan events with timestamps |

> **Say to judges:** *"This dashboard gives the warden a single-glance overview of the hostel. Critical alerts like students outside without leave are highlighted in red so they never miss it."*

---

### Step 1.3 — Student Management

1. Click **"Students"** in the left sidebar
2. ✅ **EXPECT:** Table of all hostellers with their photos, names, roll numbers, hostels, rooms, and location status

**Show the features:**

#### A. Search & Filter
- Type a student name in the **"Search by name, roll number..."** search box
- ✅ **EXPECT:** Table filters in real-time

#### B. Add a New Student
1. Click the **"+ Add Student"** button (top right)
2. Fill in the modal form:
   - **Full Name:** `Demo Student`
   - **Roll Number:** `2K25/DEMO/001`
   - **Email:** `demo@dtu.ac.in`
   - **Date of Birth:** `2003-01-15`
   - **Gender:** `Male`
   - **Hostel:** `Aryabhatta Hostel`
   - **Room:** `101`
   - **Phone:** `9876543210`
   - **Guardian Phone:** `9876543211`
3. Click **"Save Student"**
4. ✅ **EXPECT:** Modal closes, new student appears in the list

#### C. View Student Profile
1. Click on any student row (e.g., click on "Aarav Mehta")
2. ✅ **EXPECT:** Full student profile page opens showing:
   - Profile card (name, roll, hostel, email, phone)
   - **Current Location** badge (INSIDE green / OUTSIDE red)
   - **Attendance stats** (attendance percentage)
   - **Scan History** — list of entry/exit timestamps
   - **Leave History** — all applied leaves with status
   - **Complaint History** — submitted complaints

> **Say:** *"Each student has a complete 360° profile. The warden can see their attendance, scan history, leave records, and complaints all in one place."*

3. Click the **← back arrow** or **"Students"** in sidebar to go back

#### D. CSV Bulk Upload
- Point out the **"Upload CSV"** button
- *"Admins can bulk-upload 100s of students from an Excel CSV file instead of adding them one by one."*

---

### Step 1.4 — Attendance Register

1. Click **"Attendance"** in the sidebar
2. ✅ **EXPECT:** A school-style attendance register grid

**Point out these features:**

| Feature | What to show |
|---|---|
| **Summary cards** | AVG ATTENDANCE %, TOTAL PRESENT, TOTAL ABSENT, ON LEAVE |
| **Date Range Pickers** | FROM and TO dates — change the date range to see different periods |
| **Quick Presets** | Click **"This Week"**, **"Last 7 Days"**, **"Last 14 Days"**, **"This Month"**, **"Last 30 Days"** — grid updates instantly |
| **Grid cells** | Green **P** = Present, Red **A** = Absent, Yellow **L** = On Leave, Gray **-** = No Record |
| **Per-student row** | Each student has their attendance %, total P, A, L counts |
| **Hostel Filter** | Type a hostel name to filter students by hostel |
| **Student Search** | Search by name or roll number |
| **Export CSV** button | Click it → downloads a `.csv` file with all the data |

> **Say:** *"This is like a traditional register but automated. Attendance is recorded automatically every night at 11:05 PM using a cron job. Students inside are marked Present, outside without leave are Absent, and those with approved leaves are marked On Leave."*

---

### Step 1.5 — Leave Management

1. Click **"Leave Requests"** in the sidebar
2. ✅ **EXPECT:** Table of all leave applications with status badges

**Demo the approval flow:**

1. Find a leave with **"Pending"** (amber) status
2. Click the **"Approve"** button (green) on that row
3. ✅ **EXPECT:** Status changes to **"Approved"** (green badge)
4. The student will now show as "On Leave" on the dashboard instead of "Outside Without Leave"

> **Say:** *"When the warden approves a leave, the student's curfew violation is automatically cleared. The system knows they're outside with permission."*

---

### Step 1.6 — Complaint Management

1. Click **"Complaints"** in the sidebar
2. ✅ **EXPECT:** Complaints table with search, and dropdown filters for Status, Category, and Priority

**Show the filters:**
- Change **"All Categories"** dropdown to **"water"** — filters to water complaints only
- Change **"All Priority"** to see URGENT, HIGH, MEDIUM, LOW complaints
- Change **"All Status"** to filter by PENDING, IN_PROGRESS, RESOLVED, REJECTED

**Resolve a complaint:**
1. Click on a complaint row to open the detail modal
2. You'll see: title, description, category + subcategory, auto-assigned priority, image (if attached)
3. Change the **Status** dropdown to **"Resolved"**
4. Type an **Admin Response:** `Issue has been resolved. Plumber sent.`
5. Click **"Update Status"**
6. ✅ **EXPECT:** Modal closes, complaint row shows "Resolved" green badge

> **Say:** *"Complaints have 7 categories with 26 subcategories. The system auto-assigns priority — safety issues get URGENT, furniture gets LOW. The admin can override the priority and leave a response."*

---

### Step 1.7 — Election System

1. Click **"Elections"** in the sidebar
2. ✅ **EXPECT:** Elections page (empty if no elections created yet)

**Create an election:**
1. Click **"+ Create Election"** button
2. Fill in the form:
   - **Title:** `Hostel Committee Election 2026`
   - **Hostel:** `Aryabhatta Hostel`
   - **Start Date:** Today's date, any past time
   - **End Date:** Tomorrow's date
3. Click **"Create"**
4. ✅ **EXPECT:** New election card appears with **"UPCOMING"** badge

**Manage the election:**
1. Click **"Add Candidate"** on the election card
2. Select a **Student** from the dropdown (e.g., Aarav Mehta)
3. Select **Position:** `President`
4. Enter **Manifesto:** `Better mess food and cleaner rooms!`
5. Click **"Add"**
6. ✅ **EXPECT:** Candidate appears under the election
7. Add 1-2 more candidates for "President" or other positions

**Start voting:**
1. Click the **"Start"** button (or change status to ACTIVE)
2. ✅ **EXPECT:** Badge changes from "UPCOMING" to **"ACTIVE"** (green)
3. *"Now students can vote from their portal."*

> **Say:** *"The election system supports 4 positions: President, Mess Secretary, Cultural Secretary, Sports Secretary. Each student can vote once per position — the system enforces this at the database level with a unique constraint."*

---

### Step 1.8 — Announcement System

1. Click **"Announcements"** in the sidebar
2. ✅ **EXPECT:** Announcements page (empty if none created)

**Create an announcement:**
1. Click **"+ New Announcement"**
2. Fill in the form:
   - **Title:** `Water Tank Cleaning — April 20`
   - **Content:** `Water supply will be interrupted on April 20 from 10 AM to 2 PM for tank cleaning. Please store water in advance.`
   - **Category:** `URGENT`
   - **Priority:** `URGENT`
   - **Hostel:** Leave blank for all hostels, or select a specific hostel
3. Click **"Publish"**
4. ✅ **EXPECT:** Announcement card appears with red URGENT badge

**Create a normal announcement:**
1. Click **"+ New Announcement"** again
2. **Title:** `Hostel Cultural Fest — May 15`
3. **Content:** `Annual hostel cultural fest is on May 15! Register at the warden office.`
4. **Category:** `EVENT`
5. **Priority:** `IMPORTANT`
6. Click **"Publish"**
7. ✅ **EXPECT:** Second card appears with amber IMPORTANT badge

> **Say:** *"Announcements can be targeted to a specific hostel or broadcast to all. URGENT announcements get a pulsing red indicator on the student's feed so they immediately notice it."*

---

### Step 1.9 — Dark/Light Mode

1. In the sidebar footer, click **"Light Mode"** / **"Dark Mode"** toggle
2. ✅ **EXPECT:** Entire UI switches theme instantly
3. Switch back to your preferred theme

---

## 📌 PART 2: STUDENT PORTAL (localhost:3001)

> **Switch to the second browser tab**

---

### Step 2.1 — Student Registration (NEW!)

1. Open `http://localhost:3001/login`
2. Click **"Create Account"** link at the bottom
3. ✅ **EXPECT:** 2-step registration wizard with a progress bar

**Step 1 — Personal Details:**
- **Full Name:** `Judge Demo`
- **Roll Number:** `2K25/DEMO/JDG`
- **Email:** `judgedemo@dtu.ac.in`
- **DOB:** `2003-06-15`
- **Gender:** `Male`
- **Password:** `Demo@1234`
- **Confirm Password:** `Demo@1234`
- Click **"Next — Hostel Details →"**

**Step 2 — Hostel Info:**
- **Hostel:** Select `Aryabhatta Hostel` from dropdown
- **Room Number:** `505A`
- **Phone:** `9999999999` (optional)
- Click **"Create Account"**
4. ✅ **EXPECT:** Auto-login → redirected to the student dashboard

> **Say:** *"Students can self-register. The system validates uniqueness of roll number and email at the database level."*

---

### Step 2.2 — Student Dashboard

After login, you see the **mobile-first dashboard**. Point out:

| Section | What to show |
|---|---|
| **Profile Card** | Student name, roll number, hostel, room, current location |
| **Location Badge** | Green "INSIDE" or Red "OUTSIDE" |
| **Attendance Stats** | Attendance %, present/absent counts |
| **Scan Buttons** | Two buttons: "Simulate Entry" and "Simulate Exit" |

**Demo the scan:**
1. Click **"Simulate Exit"** button
2. ✅ **EXPECT:** Location changes from "INSIDE" to **"OUTSIDE"** with animation
3. *"In production, this would be triggered by an actual camera at the hostel gate. We simulate it here for demo purposes."*

4. Click **"Simulate Entry"** button
5. ✅ **EXPECT:** Location changes back to **"INSIDE"**

> **Say:** *"Each scan creates a timestamped event in the database. The admin dashboard updates in real-time."*

---

### Step 2.3 — Apply for Leave

1. Click the **Calendar (📅)** icon in the top navigation bar — this is "Apply Leave"
2. ✅ **EXPECT:** Leave application form + leave history

**Apply a leave:**
1. Select **Start Date:** Tomorrow
2. Select **End Date:** Day after tomorrow
3. **Reason:** `Family function — need to go home`
4. Click **"Submit Request"**
5. ✅ **EXPECT:** Green success message, new leave appears below with **"Pending"** badge

> **Say:** *"The student applies here, and the warden sees it instantly on the admin portal's Leave Requests page."*

---

### Step 2.4 — File a Complaint

1. Click the **Complaint (💬)** icon in the top navigation bar
2. ✅ **EXPECT:** Complaint form with category grid + complaint history below

**Submit a complaint:**
1. Click the **"💧 Water Issues"** category card
2. ✅ **EXPECT:** Card highlights, subcategory dropdown appears
3. Select subcategory: **"No water supply"**
4. Enter **Title:** `No water in 5th floor since morning`
5. Enter **Description:** `Water supply has been off since 6 AM. Common washroom and room taps both dry. Urgent.`
6. *(Optional)* Click **camera icon** to attach a photo
7. Click **"Submit Complaint"**
8. ✅ **EXPECT:** Success message, complaint appears below with:
   - **Status:** PENDING (amber)
   - **Priority:** HIGH (auto-assigned because WATER_ISSUES)
   - Category badge: "water"

> **Say:** *"The system auto-assigns priority based on category. Water and electricity issues get HIGH, safety issues get URGENT, general issues get LOW. The admin can override this."*

---

### Step 2.5 — Elections — Cast Your Vote

1. Click the **Vote (🗳️)** icon in the top navigation bar
2. ✅ **EXPECT:** If there's an active election for your hostel, you'll see:
   - Election title with a green **"LIVE"** badge
   - Candidates grouped by position (President, Mess Secretary, etc.)
   - Each candidate card shows name, roll number, and manifesto

**Cast a vote:**
1. Under "President", click the **"Vote"** button next to a candidate
2. ✅ **EXPECT:** Confirmation dialog: *"Vote for [Name] as President? This cannot be undone."*
3. Click **"OK"**
4. ✅ **EXPECT:** Button changes to green **"✓ Voted"** badge, other candidates for the same position get grayed out
5. You can still vote for a different position (e.g., Mess Secretary)

**Try double-voting:**
- If you try to vote again for President, nothing happens — the vote button is gone

**View Results:**
- Click **"🏆 View Results"** at the bottom
- If the election has ENDED, you'll see results with vote bars
- If still ACTIVE, you'll get *"Results not available yet"*

> **Say:** *"The unique constraint at the database level prevents any double-voting. Even if someone tries to bypass the UI, the server will reject it with a 409 error."*

---

### Step 2.6 — Announcements Feed

1. Click the **Megaphone (📢)** icon in the top navigation bar — "Notices"
2. ✅ **EXPECT:** List of announcements sorted by priority (URGENT first)
   - **URGENT:** Pulsing red badge + red left border
   - **IMPORTANT:** Amber badge + amber left border
   - **NORMAL:** No special border

**Filter by category:**
- Click the category pills at the top: **"🏠 All"**, **"📅 EVENT"**, **"📌 NOTICE"**, **"🚨 URGENT"**, etc.
- ✅ **EXPECT:** List filters immediately

> **Say:** *"Students see only announcements for their hostel plus global announcements. URGENT notices are visually prominent so students can't miss them."*

---

### Step 2.7 — Settings

1. Click the **Settings (⚙️)** icon in the top navigation bar
2. ✅ **EXPECT:** Profile card showing name, email, hostel, room + Change Password form

> **Say:** *"Students can view their profile and change their password securely."*

---

## 📌 PART 3: CROSS-PORTAL VERIFICATION

> This is the "wow factor" — show judges that data syncs between portals

---

### Step 3.1 — Complaint Sync

1. **Switch to Admin tab** (localhost:3000)
2. Click **"Complaints"** in sidebar
3. ✅ **EXPECT:** The complaint you just submitted from the student portal appears in the admin's list with the correct category, priority, and auto-assigned status

---

### Step 3.2 — Leave Sync

1. Click **"Leave Requests"** in sidebar
2. ✅ **EXPECT:** The leave you just applied from the student portal appears as **"Pending"**
3. Click **"Approve"** on that leave
4. **Switch to Student tab** → click Apply Leave → scroll to leave history
5. ✅ **EXPECT:** The leave now shows **"Approved"** green badge

---

### Step 3.3 — Dashboard Metrics Update

1. **Switch to Admin tab** → click **"Overview"**
2. ✅ **EXPECT:** Dashboard metrics reflect:
   - New student count (if you registered one)
   - Pending complaints count
   - Pending leaves count
   - Updated scan activity

---

## 📌 PART 4: SECURITY TALKING POINTS

> Mention these during the demo (no clicks needed — just talk):

| Feature | What to say |
|---|---|
| **Admin Registration Key** | *"Admin accounts can't be created without a secret key. This prevents unauthorized admin access."* |
| **JWT Authentication** | *"We use JSON Web Tokens with 7-day expiry. Tokens are stored in httpOnly cookies and localStorage."* |
| **Role-Based Access** | *"Three roles: WARDEN, ATTENDANT, HOSTELLER. Each API endpoint checks the role. A student can't access admin endpoints."* |
| **Rate Limiting** | *"Auth endpoints: 15 requests per 15 minutes. General API: 100 per minute. Prevents brute-force attacks."* |
| **XSS Protection** | *"All user input is sanitized server-side. Script tags, event handlers, and javascript: URIs are stripped."* |
| **Helmet + CSP** | *"HTTP security headers including Content Security Policy are enforced via Helmet middleware."* |
| **Input Validation** | *"Every request is validated using Zod schemas. Invalid data is rejected with descriptive error messages."* |
| **Password Hashing** | *"Passwords are hashed with bcrypt (10 salt rounds). Raw passwords are never stored."* |
| **Unique Constraints** | *"Database-level constraints prevent duplicate votes, duplicate roll numbers, and duplicate emails."* |

---

## 📌 PART 5: TECHNICAL ARCHITECTURE (if asked)

> Use this if judges ask about the tech stack:

```
┌──────────────┐     ┌──────────────┐     ┌────────────────────┐
│ Admin Portal │     │  Hosteller   │     │      Backend        │
│  Next.js 16  │────▶│   Portal     │────▶│  Express 5 + Prisma │
│  Port 3000   │     │  Next.js 16  │     │     Port 5000       │
└──────────────┘     │  Port 3001   │     └─────────┬──────────┘
                     └──────────────┘               │
                                                    ▼
                                            ┌──────────────┐
                                            │  PostgreSQL   │
                                            │  (Supabase)   │
                                            └──────────────┘
                                                    │
                                            ┌──────────────┐
                                            │  Cloudinary   │
                                            │  (Images)     │
                                            └──────────────┘
```

| Layer | Tech |
|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 |
| **Backend** | Express 5, Prisma ORM, Zod validation |
| **Database** | PostgreSQL (11 models, indexed) |
| **Auth** | JWT + bcrypt + role-based middleware |
| **Storage** | Cloudinary for images |
| **Automation** | node-cron for daily attendance at 23:05 IST |
| **Testing** | 76 unit tests + 30 integration tests (Vitest) |

---

## 📌 QUICK REFERENCE — URLs

| Page | URL |
|---|---|
| Admin Login | `http://localhost:3000/login` |
| Admin Register | `http://localhost:3000/register` |
| Admin Dashboard | `http://localhost:3000` |
| Admin Students | `http://localhost:3000/students` |
| Admin Attendance | `http://localhost:3000/attendance` |
| Admin Leaves | `http://localhost:3000/leaves` |
| Admin Complaints | `http://localhost:3000/complaints` |
| Admin Elections | `http://localhost:3000/elections` |
| Admin Announcements | `http://localhost:3000/announcements` |
| Student Login | `http://localhost:3001/login` |
| Student Register | `http://localhost:3001/register` |
| Student Dashboard | `http://localhost:3001` |
| Student Leave | `http://localhost:3001/leave` |
| Student Complaints | `http://localhost:3001/complaints` |
| Student Elections | `http://localhost:3001/elections` |
| Student Announcements | `http://localhost:3001/announcements` |
| Student Settings | `http://localhost:3001/settings` |

---

## ✅ Demo Checklist (In Order)

- [ ] Start all 3 servers
- [ ] **Admin:** Login
- [ ] **Admin:** Show Dashboard metrics + alerts
- [ ] **Admin:** Students → Search → Add Student → View Profile
- [ ] **Admin:** Attendance → Quick presets → Grid → Export CSV
- [ ] **Admin:** Leaves → Approve a pending leave
- [ ] **Admin:** Complaints → Filter → Resolve a complaint
- [ ] **Admin:** Elections → Create → Add Candidates → Start
- [ ] **Admin:** Announcements → Create URGENT + EVENT notices
- [ ] **Student:** Register (2-step wizard)
- [ ] **Student:** Dashboard → Simulate Entry/Exit scans
- [ ] **Student:** Apply Leave
- [ ] **Student:** File Complaint (Water Issues → No water supply)
- [ ] **Student:** Vote in Election
- [ ] **Student:** View Announcements (URGENT first)
- [ ] **Cross-Portal:** Show complaint appears in admin list
- [ ] **Cross-Portal:** Approve leave in admin → verify in student
- [ ] Mention security features (JWT, rate limiting, XSS, Zod)
