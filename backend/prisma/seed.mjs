import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { subDays, addDays, startOfDay } from 'date-fns';

const prisma = new PrismaClient();

async function seed() {
  console.log('🧹 Clearing existing data...');
  await prisma.complaint.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.scanEvent.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.hosteller.deleteMany();
  await prisma.admin.deleteMany();
  console.log('✅ Cleared all tables.\n');

  // ────────────── ADMINS ──────────────
  console.log('👨‍💼 Creating admins...');
  const password = await bcrypt.hash('admin123', 10);
  
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

  const attendant = await prisma.admin.create({
    data: {
      email: 'attendant@dtu.ac.in',
      password,
      name: 'Vikram Singh',
      phone: '+91-9876543211',
      designation: 'ATTENDANT',
    }
  });
  console.log(`   ✅ Warden: ${warden.email} (pass: admin123)`);
  console.log(`   ✅ Attendant: ${attendant.email} (pass: admin123)\n`);

  // ────────────── HOSTELLERS ──────────────
  console.log('🏠 Creating hostellers...');
  const hostellerPassword = await bcrypt.hash('student123', 10);
  const now = new Date();

  const hostellers = await Promise.all([
    prisma.hosteller.create({
      data: {
        roll_number: '2K22/CO/101',
        name: 'Aarav Mehta',
        email: 'aarav@dtu.ac.in',
        password: hostellerPassword,
        dob: new Date('2003-05-15'),
        gender: 'M',
        phone: '+91-9111111111',
        guardian_name: 'Mr. Mehta',
        guardian_contact: '+91-9222222222',
        hostel_name: 'Aryabhatta Hostel',
        room_number: '201A',
        block: 'A',
        floor: '2',
        current_location: 'INSIDE',
        total_working_days: 30,
        total_present_days: 27,
        absent_without_leave_count: 1,
        total_absent_count: 3,
        last_entry_time: subDays(now, 0),
      }
    }),
    prisma.hosteller.create({
      data: {
        roll_number: '2K22/CO/102',
        name: 'Priya Kapoor',
        email: 'priya@dtu.ac.in',
        password: hostellerPassword,
        dob: new Date('2003-08-22'),
        gender: 'F',
        phone: '+91-9333333333',
        guardian_name: 'Mrs. Kapoor',
        guardian_contact: '+91-9444444444',
        hostel_name: 'Kalpana Hostel',
        room_number: '305B',
        block: 'B',
        floor: '3',
        current_location: 'OUTSIDE',
        total_working_days: 30,
        total_present_days: 25,
        absent_without_leave_count: 3,
        total_absent_count: 5,
      }
    }),
    prisma.hosteller.create({
      data: {
        roll_number: '2K23/IT/201',
        name: 'Rohan Gupta',
        email: 'rohan@dtu.ac.in',
        password: hostellerPassword,
        dob: new Date('2004-01-10'),
        gender: 'M',
        phone: '+91-9555555555',
        guardian_name: 'Mr. Gupta',
        guardian_contact: '+91-9666666666',
        hostel_name: 'Aryabhatta Hostel',
        room_number: '104C',
        block: 'C',
        floor: '1',
        current_location: 'INSIDE',
        total_working_days: 30,
        total_present_days: 30,
      }
    }),
    prisma.hosteller.create({
      data: {
        roll_number: '2K23/EE/301',
        name: 'Ananya Singh',
        email: 'ananya@dtu.ac.in',
        password: hostellerPassword,
        dob: new Date('2004-03-17'),
        gender: 'F',
        phone: '+91-9777777777',
        guardian_name: 'Mr. Singh',
        guardian_contact: '+91-9888888888',
        hostel_name: 'Kalpana Hostel',
        room_number: '210A',
        block: 'A',
        floor: '2',
        current_location: 'INSIDE',
        total_working_days: 30,
        total_present_days: 28,
        absent_without_leave_count: 0,
        total_absent_count: 2,
      }
    }),
    prisma.hosteller.create({
      data: {
        roll_number: '2K21/ME/401',
        name: 'Kabir Reddy',
        email: 'kabir@dtu.ac.in',
        password: hostellerPassword,
        dob: new Date('2002-11-05'),
        gender: 'M',
        phone: '+91-9999999999',
        guardian_name: 'Mr. Reddy',
        guardian_contact: '+91-9000000000',
        hostel_name: 'CV Raman Hostel',
        room_number: '402D',
        block: 'D',
        floor: '4',
        current_location: 'OUTSIDE',
        total_working_days: 30,
        total_present_days: 22,
        absent_without_leave_count: 5,
        total_absent_count: 8,
      }
    }),
  ]);

  for (const h of hostellers) {
    console.log(`   ✅ ${h.name} (${h.roll_number}) — ${h.current_location} — pass: student123`);
  }
  console.log();

  // ────────────── LEAVES ──────────────
  console.log('📋 Creating leaves...');
  const [aarav, priya, rohan, ananya, kabir] = hostellers;

  const leaves = await Promise.all([
    // Pending leave
    prisma.leave.create({
      data: {
        hostellerId: aarav.id,
        start_date: addDays(now, 2),
        end_date: addDays(now, 5),
        reason: 'Going home for sister\'s birthday celebration',
        status: 'pending',
      }
    }),
    // Approved leave (active)
    prisma.leave.create({
      data: {
        hostellerId: priya.id,
        start_date: subDays(now, 1),
        end_date: addDays(now, 3),
        reason: 'Medical appointment in Delhi for follow-up check',
        status: 'approved',
        approvedById: warden.id,
      }
    }),
    // Rejected leave
    prisma.leave.create({
      data: {
        hostellerId: kabir.id,
        start_date: subDays(now, 10),
        end_date: subDays(now, 8),
        reason: 'Friend\'s party',
        status: 'rejected',
        approvedById: warden.id,
      }
    }),
    // Another pending
    prisma.leave.create({
      data: {
        hostellerId: ananya.id,
        start_date: addDays(now, 1),
        end_date: addDays(now, 2),
        reason: 'Family emergency, need to go home urgently',
        status: 'pending',
      }
    }),
    // Old approved leave (expired)
    prisma.leave.create({
      data: {
        hostellerId: rohan.id,
        start_date: subDays(now, 15),
        end_date: subDays(now, 12),
        reason: 'Attended tech conference in Bangalore',
        status: 'approved',
        approvedById: warden.id,
      }
    }),
  ]);
  console.log(`   ✅ ${leaves.length} leaves created (2 pending, 2 approved, 1 rejected)\n`);

  // ────────────── SCAN EVENTS ──────────────
  console.log('📷 Creating scan events...');
  const scanData = [];
  // Create scan history for each hosteller - today and yesterday
  for (const h of hostellers) {
    // Yesterday entry
    scanData.push({
      hostellerId: h.id,
      timestamp: new Date(subDays(now, 1).setHours(8, 15, 0)),
      type: 'entry',
      camera_id: 'CAM-GATE-01',
      ocr_confidence: 0.95,
      model_confidence: 0.98,
    });
    // Yesterday exit
    scanData.push({
      hostellerId: h.id,
      timestamp: new Date(subDays(now, 1).setHours(14, 30, 0)),
      type: 'exit',
      camera_id: 'CAM-GATE-01',
      ocr_confidence: 0.92,
      model_confidence: 0.96,
    });
    // Today entry
    scanData.push({
      hostellerId: h.id,
      timestamp: new Date(new Date().setHours(7, 45, 0)),
      type: 'entry',
      camera_id: 'CAM-GATE-02',
      ocr_confidence: 0.97,
      model_confidence: 0.99,
    });
  }
  // Add some extra today exits for students currently OUTSIDE
  scanData.push({
    hostellerId: priya.id,
    timestamp: new Date(new Date().setHours(10, 20, 0)),
    type: 'exit',
    camera_id: 'CAM-GATE-01',
  });
  scanData.push({
    hostellerId: kabir.id,
    timestamp: new Date(new Date().setHours(11, 0, 0)),
    type: 'exit',
    camera_id: 'CAM-GATE-02',
  });

  await prisma.scanEvent.createMany({ data: scanData });
  console.log(`   ✅ ${scanData.length} scan events created\n`);

  // ────────────── ATTENDANCE RECORDS ──────────────
  console.log('📅 Creating attendance records...');
  const attendanceData = [];
  for (let d = 7; d >= 1; d--) {
    const date = startOfDay(subDays(now, d));
    for (const h of hostellers) {
      let status = 'PRESENT';
      if (h.id === kabir.id && d <= 3) status = 'ABSENT';
      if (h.id === priya.id && d === 1) status = 'ON_LEAVE';
      attendanceData.push({ hostellerId: h.id, date, status });
    }
  }
  await prisma.attendanceRecord.createMany({ data: attendanceData });
  console.log(`   ✅ ${attendanceData.length} attendance records (7 days × 5 hostellers)\n`);

  // ────────────── COMPLAINTS ──────────────
  console.log('📢 Creating complaints...');
  const complaints = await Promise.all([
    prisma.complaint.create({
      data: {
        hostellerId: aarav.id,
        title: 'Water leakage in bathroom',
        description: 'There is a continuous water leakage from the ceiling pipe in room 201A bathroom. The floor is always wet and becoming a safety hazard.',
        category: 'maintenance',
        status: 'pending',
      }
    }),
    prisma.complaint.create({
      data: {
        hostellerId: priya.id,
        title: 'Mess food quality has declined',
        description: 'The dinner served for the past week has been of very poor quality. Rice is undercooked and dal is too watery. Many students are complaining.',
        category: 'food',
        status: 'in_progress',
        admin_response: 'We have notified the mess contractor. Inspection scheduled for tomorrow.',
        resolvedById: warden.id,
      }
    }),
    prisma.complaint.create({
      data: {
        hostellerId: rohan.id,
        title: 'Broken window in common room',
        description: 'The large window in the ground floor common room has a big crack and is dangerous. Glass might fall anytime.',
        category: 'maintenance',
        status: 'resolved',
        admin_response: 'Window has been replaced by the maintenance team on April 12.',
        resolvedById: warden.id,
      }
    }),
    prisma.complaint.create({
      data: {
        hostellerId: ananya.id,
        title: 'Loud noise from Room 212',
        description: 'Students in room 212 play loud music every night after 11 PM. It is disturbing sleep for the entire floor.',
        category: 'noise',
        status: 'pending',
      }
    }),
    prisma.complaint.create({
      data: {
        hostellerId: kabir.id,
        title: 'Insect infestation in room',
        description: 'There are cockroaches and ants all over the room and bathroom. Pest control is urgently needed.',
        category: 'hygiene',
        status: 'rejected',
        admin_response: 'Pest control was done last week for the entire block. Please keep food items covered.',
        resolvedById: attendant.id,
      }
    }),
    prisma.complaint.create({
      data: {
        hostellerId: aarav.id,
        title: 'WiFi not working on 2nd floor',
        description: 'The WiFi router on the second floor of Block A has not been working for 3 days. Cannot attend online classes.',
        category: 'general',
        status: 'pending',
      }
    }),
  ]);
  console.log(`   ✅ ${complaints.length} complaints (3 pending, 1 in_progress, 1 resolved, 1 rejected)\n`);

  // ────────────── SUMMARY ──────────────
  console.log('═══════════════════════════════════════════');
  console.log('🎉 SEED COMPLETE! Summary:');
  console.log('───────────────────────────────────────────');
  console.log(`  Admins:      2  (warden@dtu.ac.in / admin123)`);
  console.log(`                  (attendant@dtu.ac.in / admin123)`);
  console.log(`  Hostellers:  5  (all passwords: student123)`);
  console.log(`    - aarav@dtu.ac.in    (INSIDE)`);
  console.log(`    - priya@dtu.ac.in    (OUTSIDE, on leave)`);
  console.log(`    - rohan@dtu.ac.in    (INSIDE, perfect attendance)`);
  console.log(`    - ananya@dtu.ac.in   (INSIDE)`);
  console.log(`    - kabir@dtu.ac.in    (OUTSIDE, frequent violator)`);
  console.log(`  Leaves:      5  (2 pending, 2 approved, 1 rejected)`);
  console.log(`  Scans:       ${scanData.length}`);
  console.log(`  Attendance:  ${attendanceData.length} (7 days)`);
  console.log(`  Complaints:  6  (3 pending, 1 in_progress, 1 resolved, 1 rejected)`);
  console.log('═══════════════════════════════════════════');

  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
