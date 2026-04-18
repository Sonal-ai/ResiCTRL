import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { subDays, addDays, startOfDay } from 'date-fns';

const prisma = new PrismaClient();

async function seed() {
  console.log('🧹 Clearing ALL existing data...');
  // Delete in reverse dependency order
  await prisma.vote.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.election.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.scanEvent.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.hosteller.deleteMany();
  await prisma.admin.deleteMany();
  console.log('✅ Cleared all tables.\n');

  const now = new Date();
  const password = await bcrypt.hash('admin123', 10);
  const hostellerPassword = await bcrypt.hash('student123', 10);

  // ══════════════════════════════════════════════════════════════
  // 1. ADMINS
  // ══════════════════════════════════════════════════════════════
  console.log('👨‍💼 Creating admins...');

  const warden = await prisma.admin.create({
    data: {
      email: 'warden@dtu.ac.in',
      password,
      name: 'Dr. Rajesh Sharma',
      phone: '+91-9876543210',
      designation: 'WARDEN',
      hostel_name: 'Aryabhatta Hostel',
      room_number: 'W-01',
    }
  });

  const resiWarden = await prisma.admin.create({
    data: {
      email: 'resiwarden@dtu.ac.in',
      password,
      name: 'Prof. Meena Bhatia',
      phone: '+91-9876543212',
      designation: 'RESI_WARDEN',
      hostel_name: 'Kalpana Hostel',
      room_number: 'W-02',
    }
  });

  const attendant = await prisma.admin.create({
    data: {
      email: 'attendant@dtu.ac.in',
      password,
      name: 'Vikram Singh',
      phone: '+91-9876543211',
      designation: 'ATTENDANT',
    }
  });

  console.log(`   ✅ ${warden.name} (${warden.email})`);
  console.log(`   ✅ ${resiWarden.name} (${resiWarden.email})`);
  console.log(`   ✅ ${attendant.name} (${attendant.email})\n`);

  // ══════════════════════════════════════════════════════════════
  // 2. HOSTELLERS (8 students across 3 hostels)
  // ══════════════════════════════════════════════════════════════
  console.log('🏠 Creating hostellers...');

  const hostellers = await Promise.all([
    prisma.hosteller.create({
      data: {
        roll_number: '2K22/CO/101', name: 'Aarav Mehta', email: 'aarav@dtu.ac.in',
        password: hostellerPassword, dob: new Date('2003-05-15'), gender: 'Male',
        phone: '+91-9111111111', guardian_name: 'Mr. Mehta', guardian_contact: '+91-9222222222',
        hostel_name: 'Aryabhatta Hostel', room_number: '201A', block: 'A', floor: '2',
        current_location: 'INSIDE', total_working_days: 30, total_present_days: 27,
        absent_without_leave_count: 1, total_absent_count: 3, last_entry_time: subDays(now, 0),
      }
    }),
    prisma.hosteller.create({
      data: {
        roll_number: '2K22/CO/102', name: 'Priya Kapoor', email: 'priya@dtu.ac.in',
        password: hostellerPassword, dob: new Date('2003-08-22'), gender: 'Female',
        phone: '+91-9333333333', guardian_name: 'Mrs. Kapoor', guardian_contact: '+91-9444444444',
        hostel_name: 'Kalpana Hostel', room_number: '305B', block: 'B', floor: '3',
        current_location: 'OUTSIDE', total_working_days: 30, total_present_days: 25,
        absent_without_leave_count: 3, total_absent_count: 5,
      }
    }),
    prisma.hosteller.create({
      data: {
        roll_number: '2K23/IT/201', name: 'Rohan Gupta', email: 'rohan@dtu.ac.in',
        password: hostellerPassword, dob: new Date('2004-01-10'), gender: 'Male',
        phone: '+91-9555555555', guardian_name: 'Mr. Gupta', guardian_contact: '+91-9666666666',
        hostel_name: 'Aryabhatta Hostel', room_number: '104C', block: 'C', floor: '1',
        current_location: 'INSIDE', total_working_days: 30, total_present_days: 30,
      }
    }),
    prisma.hosteller.create({
      data: {
        roll_number: '2K23/EE/301', name: 'Ananya Singh', email: 'ananya@dtu.ac.in',
        password: hostellerPassword, dob: new Date('2004-03-17'), gender: 'Female',
        phone: '+91-9777777777', guardian_name: 'Mr. Singh', guardian_contact: '+91-9888888888',
        hostel_name: 'Kalpana Hostel', room_number: '210A', block: 'A', floor: '2',
        current_location: 'INSIDE', total_working_days: 30, total_present_days: 28,
        absent_without_leave_count: 0, total_absent_count: 2,
      }
    }),
    prisma.hosteller.create({
      data: {
        roll_number: '2K21/ME/401', name: 'Kabir Reddy', email: 'kabir@dtu.ac.in',
        password: hostellerPassword, dob: new Date('2002-11-05'), gender: 'Male',
        phone: '+91-9999999999', guardian_name: 'Mr. Reddy', guardian_contact: '+91-9000000000',
        hostel_name: 'CV Raman Hostel', room_number: '402D', block: 'D', floor: '4',
        current_location: 'OUTSIDE', total_working_days: 30, total_present_days: 22,
        absent_without_leave_count: 5, total_absent_count: 8,
      }
    }),
    prisma.hosteller.create({
      data: {
        roll_number: '2K22/EC/150', name: 'Diya Nair', email: 'diya@dtu.ac.in',
        password: hostellerPassword, dob: new Date('2003-12-01'), gender: 'Female',
        phone: '+91-9101010101', guardian_name: 'Mrs. Nair', guardian_contact: '+91-9202020202',
        hostel_name: 'Kalpana Hostel', room_number: '112A', block: 'A', floor: '1',
        current_location: 'INSIDE', total_working_days: 30, total_present_days: 29,
        absent_without_leave_count: 0, total_absent_count: 1,
      }
    }),
    prisma.hosteller.create({
      data: {
        roll_number: '2K23/CE/205', name: 'Arjun Patel', email: 'arjun@dtu.ac.in',
        password: hostellerPassword, dob: new Date('2004-06-20'), gender: 'Male',
        phone: '+91-9303030303', guardian_name: 'Mr. Patel', guardian_contact: '+91-9404040404',
        hostel_name: 'CV Raman Hostel', room_number: '302B', block: 'B', floor: '3',
        current_location: 'INSIDE', total_working_days: 30, total_present_days: 26,
        absent_without_leave_count: 2, total_absent_count: 4,
      }
    }),
    prisma.hosteller.create({
      data: {
        roll_number: '2K22/SE/110', name: 'Neha Verma', email: 'neha@dtu.ac.in',
        password: hostellerPassword, dob: new Date('2003-09-14'), gender: 'Female',
        phone: '+91-9505050505', guardian_name: 'Mr. Verma', guardian_contact: '+91-9606060606',
        hostel_name: 'Aryabhatta Hostel', room_number: '308A', block: 'A', floor: '3',
        current_location: 'INSIDE', total_working_days: 30, total_present_days: 28,
        absent_without_leave_count: 1, total_absent_count: 2,
      }
    }),
  ]);

  const [aarav, priya, rohan, ananya, kabir, diya, arjun, neha] = hostellers;
  for (const h of hostellers) {
    console.log(`   ✅ ${h.name} (${h.roll_number}) — ${h.hostel_name} — ${h.current_location}`);
  }
  console.log();

  // ══════════════════════════════════════════════════════════════
  // 3. LEAVES
  // ══════════════════════════════════════════════════════════════
  console.log('📋 Creating leaves...');
  const leaves = await Promise.all([
    prisma.leave.create({ data: { hostellerId: aarav.id, start_date: addDays(now, 2), end_date: addDays(now, 5), reason: "Going home for sister's birthday celebration", status: 'pending' } }),
    prisma.leave.create({ data: { hostellerId: priya.id, start_date: subDays(now, 1), end_date: addDays(now, 3), reason: 'Medical appointment in Delhi for follow-up check', status: 'approved', approvedById: warden.id } }),
    prisma.leave.create({ data: { hostellerId: kabir.id, start_date: subDays(now, 10), end_date: subDays(now, 8), reason: "Friend's party in Noida", status: 'rejected', approvedById: warden.id } }),
    prisma.leave.create({ data: { hostellerId: ananya.id, start_date: addDays(now, 1), end_date: addDays(now, 2), reason: 'Family emergency, need to go home urgently', status: 'pending' } }),
    prisma.leave.create({ data: { hostellerId: rohan.id, start_date: subDays(now, 15), end_date: subDays(now, 12), reason: 'Attended tech conference in Bangalore', status: 'approved', approvedById: warden.id } }),
    prisma.leave.create({ data: { hostellerId: diya.id, start_date: addDays(now, 5), end_date: addDays(now, 7), reason: 'Cousin wedding in Mumbai', status: 'pending' } }),
    prisma.leave.create({ data: { hostellerId: arjun.id, start_date: subDays(now, 5), end_date: subDays(now, 3), reason: 'Internship interview at Google Bangalore', status: 'approved', approvedById: resiWarden.id } }),
    prisma.leave.create({ data: { hostellerId: neha.id, start_date: subDays(now, 20), end_date: subDays(now, 18), reason: 'Went home for Diwali celebrations', status: 'approved', approvedById: warden.id } }),
  ]);
  console.log(`   ✅ ${leaves.length} leaves (3 pending, 4 approved, 1 rejected)\n`);

  // ══════════════════════════════════════════════════════════════
  // 4. SCAN EVENTS
  // ══════════════════════════════════════════════════════════════
  console.log('📷 Creating scan events...');
  const scanData = [];
  for (const h of hostellers) {
    // 3 days of scan history
    for (let d = 3; d >= 1; d--) {
      scanData.push({ hostellerId: h.id, timestamp: new Date(subDays(now, d).setHours(7, 30 + Math.floor(Math.random() * 30), 0)), type: 'entry', camera_id: 'CAM-GATE-01', ocr_confidence: 0.93 + Math.random() * 0.06, model_confidence: 0.95 + Math.random() * 0.04 });
      scanData.push({ hostellerId: h.id, timestamp: new Date(subDays(now, d).setHours(14, Math.floor(Math.random() * 30), 0)), type: 'exit', camera_id: 'CAM-GATE-01', ocr_confidence: 0.90 + Math.random() * 0.08, model_confidence: 0.93 + Math.random() * 0.06 });
      scanData.push({ hostellerId: h.id, timestamp: new Date(subDays(now, d).setHours(18, Math.floor(Math.random() * 30), 0)), type: 'entry', camera_id: 'CAM-GATE-02', ocr_confidence: 0.94 + Math.random() * 0.05, model_confidence: 0.96 + Math.random() * 0.03 });
    }
    // Today entry
    scanData.push({ hostellerId: h.id, timestamp: new Date(new Date().setHours(7, 45, 0)), type: 'entry', camera_id: 'CAM-GATE-02', ocr_confidence: 0.97, model_confidence: 0.99 });
  }
  // Today exits for students currently OUTSIDE
  scanData.push({ hostellerId: priya.id, timestamp: new Date(new Date().setHours(10, 20, 0)), type: 'exit', camera_id: 'CAM-GATE-01' });
  scanData.push({ hostellerId: kabir.id, timestamp: new Date(new Date().setHours(11, 0, 0)), type: 'exit', camera_id: 'CAM-GATE-02' });

  await prisma.scanEvent.createMany({ data: scanData });
  console.log(`   ✅ ${scanData.length} scan events\n`);

  // ══════════════════════════════════════════════════════════════
  // 5. ATTENDANCE RECORDS
  // ══════════════════════════════════════════════════════════════
  console.log('📅 Creating attendance records...');
  const attendanceData = [];
  for (let d = 14; d >= 1; d--) {
    const date = startOfDay(subDays(now, d));
    for (const h of hostellers) {
      let status = 'PRESENT';
      if (h.id === kabir.id && d <= 5) status = 'ABSENT';
      if (h.id === priya.id && d <= 2) status = 'ON_LEAVE';
      if (h.id === arjun.id && (d === 4 || d === 5)) status = 'ON_LEAVE';
      if (h.id === aarav.id && d === 7) status = 'ABSENT';
      attendanceData.push({ hostellerId: h.id, date, status });
    }
  }
  await prisma.attendanceRecord.createMany({ data: attendanceData });
  console.log(`   ✅ ${attendanceData.length} attendance records (14 days × 8 hostellers)\n`);

  // ══════════════════════════════════════════════════════════════
  // 6. COMPLAINTS (using schema categories)
  // ══════════════════════════════════════════════════════════════
  console.log('📢 Creating complaints...');
  const complaints = await Promise.all([
    prisma.complaint.create({ data: { hostellerId: aarav.id, title: 'Water leakage in bathroom', description: 'Continuous water leakage from the ceiling pipe in room 201A bathroom. The floor is always wet and becoming a safety hazard.', category: 'WATER_ISSUES', subcategory: 'Water logging', priority: 'HIGH', status: 'PENDING' } }),
    prisma.complaint.create({ data: { hostellerId: priya.id, title: 'Mess food quality declined', description: 'The dinner served for the past week has been very poor quality. Rice is undercooked and dal is too watery. Many students complaining.', category: 'MESS_FOOD', subcategory: 'Poor food quality', priority: 'MEDIUM', status: 'IN_PROGRESS', admin_response: 'We have notified the mess contractor. Inspection scheduled for tomorrow.', resolvedById: warden.id } }),
    prisma.complaint.create({ data: { hostellerId: rohan.id, title: 'Broken window in common room', description: 'The large window in the ground floor common room has a big crack. Glass might fall anytime — dangerous.', category: 'SAFETY', subcategory: 'Broken window', priority: 'URGENT', status: 'RESOLVED', admin_response: 'Window has been replaced by the maintenance team on April 12.', resolvedById: warden.id } }),
    prisma.complaint.create({ data: { hostellerId: ananya.id, title: 'Fan not working in Room 210', description: 'The ceiling fan in room 210A stopped working yesterday. Summer heat is unbearable without it.', category: 'ELECTRICITY', subcategory: 'Fan not working', priority: 'HIGH', status: 'PENDING' } }),
    prisma.complaint.create({ data: { hostellerId: kabir.id, title: 'Cockroach infestation', description: 'Cockroaches and ants all over the room and bathroom. Pest control is urgently needed.', category: 'HYGIENE', subcategory: 'Too many mosquitoes', priority: 'MEDIUM', status: 'REJECTED', admin_response: 'Pest control was done last week for the entire block. Please keep food items covered.', resolvedById: attendant.id } }),
    prisma.complaint.create({ data: { hostellerId: aarav.id, title: 'WiFi not working on 2nd floor', description: 'The WiFi router on the second floor of Block A has not been working for 3 days. Cannot attend online classes.', category: 'GENERAL', subcategory: 'Other', priority: 'HIGH', status: 'PENDING' } }),
    prisma.complaint.create({ data: { hostellerId: diya.id, title: 'Door handle broken in Room 112', description: 'The door handle of Room 112A is broken and we cannot lock the room properly. Security concern.', category: 'FURNITURE', subcategory: 'Door handle issue', priority: 'HIGH', status: 'IN_PROGRESS', admin_response: 'Maintenance team has been informed. Will fix by tomorrow.', resolvedById: attendant.id } }),
    prisma.complaint.create({ data: { hostellerId: arjun.id, title: 'No water supply since morning', description: 'There has been no water supply in CV Raman Block B since 6 AM. Classes start at 8 AM and we cannot even brush.', category: 'WATER_ISSUES', subcategory: 'No water supply', priority: 'URGENT', status: 'RESOLVED', admin_response: 'Plumber fixed the main valve. Supply restored at 7:30 AM.', resolvedById: warden.id } }),
    prisma.complaint.create({ data: { hostellerId: neha.id, title: 'Washroom drains clogged', description: 'The drains in 3rd floor washroom of Block A are clogged. Water is overflowing into the corridor.', category: 'HYGIENE', subcategory: 'Drain blockage', priority: 'URGENT', status: 'PENDING' } }),
  ]);
  console.log(`   ✅ ${complaints.length} complaints (4 PENDING, 2 IN_PROGRESS, 2 RESOLVED, 1 REJECTED)\n`);

  // ══════════════════════════════════════════════════════════════
  // 7. NOTIFICATIONS
  // ══════════════════════════════════════════════════════════════
  console.log('🔔 Creating notifications...');
  const notifications = await prisma.notification.createMany({
    data: [
      { userId: aarav.id, userType: 'hosteller', title: 'Leave Submitted', message: 'Your leave request for Apr 20-23 has been submitted and is pending approval.', type: 'LEAVE', isRead: false },
      { userId: priya.id, userType: 'hosteller', title: 'Leave Approved', message: 'Your medical leave from Apr 17-21 has been approved by Dr. Rajesh Sharma.', type: 'LEAVE', isRead: true },
      { userId: kabir.id, userType: 'hosteller', title: 'Leave Rejected', message: "Your leave request for 'Friend's party' has been rejected. Reason: Insufficient grounds.", type: 'LEAVE', isRead: false },
      { userId: priya.id, userType: 'hosteller', title: 'Complaint Update', message: 'Your complaint about mess food quality is now being reviewed. Admin response: inspection scheduled.', type: 'COMPLAINT', isRead: false },
      { userId: rohan.id, userType: 'hosteller', title: 'Complaint Resolved', message: 'Your complaint about the broken window has been resolved. Window replaced.', type: 'COMPLAINT', isRead: true },
      { userId: warden.id, userType: 'admin', title: 'New Leave Request', message: 'Aarav Mehta (2K22/CO/101) has submitted a leave request for Apr 20-23.', type: 'LEAVE', isRead: false },
      { userId: warden.id, userType: 'admin', title: 'New Leave Request', message: 'Ananya Singh (2K23/EE/301) has submitted an urgent leave request.', type: 'LEAVE', isRead: false },
      { userId: warden.id, userType: 'admin', title: 'Urgent Complaint', message: 'Neha Verma reported drain blockage on 3rd floor — marked URGENT.', type: 'COMPLAINT', isRead: false },
      { userId: aarav.id, userType: 'hosteller', title: 'New Announcement', message: 'A new urgent notice has been posted: "Water Supply Disruption on April 19"', type: 'ANNOUNCEMENT', isRead: false },
      { userId: diya.id, userType: 'hosteller', title: 'Complaint Update', message: 'Your complaint about broken door handle is in progress. Team will fix tomorrow.', type: 'COMPLAINT', isRead: false },
      { userId: ananya.id, userType: 'hosteller', title: 'Election Started', message: 'Hostel Committee Election 2026 voting is now open! Cast your vote.', type: 'ELECTION', isRead: false },
      { userId: arjun.id, userType: 'hosteller', title: 'Complaint Resolved', message: 'Water supply to CV Raman Block B has been restored.', type: 'COMPLAINT', isRead: true },
    ]
  });
  console.log(`   ✅ ${notifications.count} notifications\n`);

  // ══════════════════════════════════════════════════════════════
  // 8. ELECTION + CANDIDATES
  // ══════════════════════════════════════════════════════════════
  console.log('🗳️  Creating election...');
  const election = await prisma.election.create({
    data: {
      title: 'Hostel Committee Election 2026',
      hostel_name: 'Aryabhatta Hostel',
      start_date: subDays(now, 2),
      end_date: addDays(now, 5),
      status: 'ACTIVE',
      createdById: warden.id,
    }
  });

  const candidates = await Promise.all([
    // President candidates
    prisma.candidate.create({ data: { hostellerId: aarav.id, electionId: election.id, position: 'President', manifesto: 'Better mess food quality and 24/7 WiFi for all hostels. I promise to hold monthly open forums.' } }),
    prisma.candidate.create({ data: { hostellerId: rohan.id, electionId: election.id, position: 'President', manifesto: 'Focus on sports facilities and study rooms. Will push for air-conditioned common areas.' } }),
    // Mess Secretary candidates
    prisma.candidate.create({ data: { hostellerId: ananya.id, electionId: election.id, position: 'Mess Secretary', manifesto: 'Weekly menu rotation, feedback system, and special meals for festivals.' } }),
    prisma.candidate.create({ data: { hostellerId: diya.id, electionId: election.id, position: 'Mess Secretary', manifesto: 'Healthy food options, juice counter, and transparent billing system.' } }),
    // Cultural Secretary candidates
    prisma.candidate.create({ data: { hostellerId: neha.id, electionId: election.id, position: 'Cultural Secretary', manifesto: 'Monthly cultural nights, movie screenings, and inter-hostel competitions.' } }),
    prisma.candidate.create({ data: { hostellerId: arjun.id, electionId: election.id, position: 'Cultural Secretary', manifesto: 'Music room, art workshops, and annual hostel fest with celebrity performances.' } }),
    // Sports Secretary candidates
    prisma.candidate.create({ data: { hostellerId: kabir.id, electionId: election.id, position: 'Sports Secretary', manifesto: 'New gym equipment, cricket tournaments, and inter-hostel league.' } }),
  ]);

  console.log(`   ✅ Election: "${election.title}" (ACTIVE)`);
  console.log(`   ✅ ${candidates.length} candidates across 4 positions\n`);

  // ══════════════════════════════════════════════════════════════
  // 9. VOTES (some students have already voted)
  // ══════════════════════════════════════════════════════════════
  console.log('🗳️  Creating votes...');
  const [presAarav, presRohan, messAnanya, messDiya, cultNeha, cultArjun, sportsKabir] = candidates;

  const votes = await Promise.all([
    // Priya votes
    prisma.vote.create({ data: { voterId: priya.id, candidateId: presAarav.id, position: 'President', electionId: election.id } }),
    prisma.vote.create({ data: { voterId: priya.id, candidateId: messAnanya.id, position: 'Mess Secretary', electionId: election.id } }),
    prisma.vote.create({ data: { voterId: priya.id, candidateId: cultNeha.id, position: 'Cultural Secretary', electionId: election.id } }),
    prisma.vote.create({ data: { voterId: priya.id, candidateId: sportsKabir.id, position: 'Sports Secretary', electionId: election.id } }),
    // Diya votes
    prisma.vote.create({ data: { voterId: diya.id, candidateId: presRohan.id, position: 'President', electionId: election.id } }),
    prisma.vote.create({ data: { voterId: diya.id, candidateId: cultArjun.id, position: 'Cultural Secretary', electionId: election.id } }),
    prisma.vote.create({ data: { voterId: diya.id, candidateId: sportsKabir.id, position: 'Sports Secretary', electionId: election.id } }),
    // Neha votes
    prisma.vote.create({ data: { voterId: neha.id, candidateId: presAarav.id, position: 'President', electionId: election.id } }),
    prisma.vote.create({ data: { voterId: neha.id, candidateId: messDiya.id, position: 'Mess Secretary', electionId: election.id } }),
    prisma.vote.create({ data: { voterId: neha.id, candidateId: sportsKabir.id, position: 'Sports Secretary', electionId: election.id } }),
    // Arjun votes
    prisma.vote.create({ data: { voterId: arjun.id, candidateId: presAarav.id, position: 'President', electionId: election.id } }),
    prisma.vote.create({ data: { voterId: arjun.id, candidateId: messAnanya.id, position: 'Mess Secretary', electionId: election.id } }),
  ]);
  console.log(`   ✅ ${votes.length} votes from 4 voters\n`);

  // ══════════════════════════════════════════════════════════════
  // 10. ANNOUNCEMENTS
  // ══════════════════════════════════════════════════════════════
  console.log('📣 Creating announcements...');
  const announcements = await Promise.all([
    prisma.announcement.create({ data: { title: 'Water Supply Disruption on April 19', content: 'Due to maintenance work on the main water pipeline, water supply will be disrupted from 10 AM to 4 PM on April 19. Please store water in advance. Tanker arrangements have been made.', category: 'URGENT', priority: 'URGENT', hostel_name: null, createdById: warden.id, expiry_date: addDays(now, 2) } }),
    prisma.announcement.create({ data: { title: 'Hostel Day Celebrations — April 25', content: 'Annual Hostel Day will be celebrated on April 25 with cultural performances, food stalls, and games. All hostellers are invited to participate. Registration for events is open at the common room notice board.', category: 'EVENT', priority: 'IMPORTANT', hostel_name: null, createdById: warden.id, expiry_date: addDays(now, 8) } }),
    prisma.announcement.create({ data: { title: 'Mess Menu Updated for April', content: 'New mess menu for April has been finalized based on student feedback. Highlights: Paneer dish on Wednesdays, Biryani on Fridays, fresh fruit with lunch daily. View complete menu at mess notice board.', category: 'MESS', priority: 'NORMAL', hostel_name: null, createdById: resiWarden.id } }),
    prisma.announcement.create({ data: { title: 'Room Inspection Notice', content: 'Quarterly room inspection will be conducted by the warden on April 22. Please ensure rooms are clean and all hostel property is in order. Any damage will be charged to the room occupants.', category: 'NOTICE', priority: 'IMPORTANT', hostel_name: 'Aryabhatta Hostel', createdById: warden.id, expiry_date: addDays(now, 5) } }),
    prisma.announcement.create({ data: { title: 'WiFi Upgrade Complete', content: 'WiFi infrastructure has been upgraded across all hostels. New speeds: 100 Mbps shared per floor. Each student can connect up to 3 devices. Report any connectivity issues to the IT helpdesk.', category: 'GENERAL', priority: 'NORMAL', hostel_name: null, createdById: attendant.id } }),
    prisma.announcement.create({ data: { title: 'Hostel Committee Election — Vote Now!', content: 'Hostel Committee Election 2026 voting is now open! Cast your vote for President, Mess Secretary, Cultural Secretary, and Sports Secretary. Voting closes on April 23. Every vote matters!', category: 'EVENT', priority: 'URGENT', hostel_name: 'Aryabhatta Hostel', createdById: warden.id, expiry_date: addDays(now, 5) } }),
    prisma.announcement.create({ data: { title: 'Pest Control Schedule', content: 'Pest control treatment will be conducted in all hostel blocks on April 20 (Saturday). All rooms will be treated between 9 AM - 1 PM. Please vacate rooms during this time and remove food items.', category: 'NOTICE', priority: 'IMPORTANT', hostel_name: null, createdById: attendant.id, expiry_date: addDays(now, 3) } }),
    prisma.announcement.create({ data: { title: 'Sports Tryouts', content: 'Inter-hostel cricket and badminton tryouts happening this Saturday at the sports complex. Interested students sign up at the common room by Thursday. Limited slots available!', category: 'EVENT', priority: 'NORMAL', hostel_name: null, createdById: resiWarden.id, expiry_date: addDays(now, 4) } }),
  ]);
  console.log(`   ✅ ${announcements.length} announcements\n`);

  // ══════════════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎉 SEED COMPLETE! ALL TABLES POPULATED');
  console.log('═══════════════════════════════════════════════════════════');
  console.log();
  console.log('🔐 LOGIN CREDENTIALS:');
  console.log('───────────────────────────────────────────────────────────');
  console.log('  ADMINS (password: admin123)');
  console.log(`    • ${warden.email}     (Warden)`);
  console.log(`    • ${resiWarden.email}  (Resi-Warden)`);
  console.log(`    • ${attendant.email}   (Attendant)`);
  console.log();
  console.log('  STUDENTS (password: student123)');
  for (const h of hostellers) {
    const loc = h.current_location === 'INSIDE' ? '🟢' : '🔴';
    console.log(`    ${loc} ${h.email.padEnd(22)} ${h.name.padEnd(16)} ${h.hostel_name}`);
  }
  console.log();
  console.log('📊 DATA SUMMARY:');
  console.log('───────────────────────────────────────────────────────────');
  console.log(`  Admins:          3`);
  console.log(`  Hostellers:      ${hostellers.length}`);
  console.log(`  Leaves:          ${leaves.length}  (3 pending, 4 approved, 1 rejected)`);
  console.log(`  Scan Events:     ${scanData.length}`);
  console.log(`  Attendance:      ${attendanceData.length} (14 days)`);
  console.log(`  Complaints:      ${complaints.length}  (4 PENDING, 2 IN_PROGRESS, 2 RESOLVED, 1 REJECTED)`);
  console.log(`  Notifications:   ${notifications.count}`);
  console.log(`  Elections:       1  (ACTIVE)`);
  console.log(`  Candidates:      ${candidates.length}`);
  console.log(`  Votes:           ${votes.length}`);
  console.log(`  Announcements:   ${announcements.length}`);
  console.log('═══════════════════════════════════════════════════════════');

  await prisma.$disconnect();
}

seed().catch(e => { console.error('❌ Seed failed:', e); process.exit(1); });
