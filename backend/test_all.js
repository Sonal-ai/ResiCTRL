const app = require('./src/app');
const prisma = require('./src/prismaClient');

const PORT = 5001; // use alternative port to not clash if anything is running
const server = app.listen(PORT, async () => {
  console.log(`Test server running on port ${PORT}...`);
  try {
    const baseURL = `http://localhost:${PORT}/api`;
    
    // Clean DB
    await prisma.scanEvent.deleteMany();
    await prisma.leave.deleteMany();
    await prisma.student.deleteMany();
    
    // 1. Create Student
    console.log('[Test] Creating student...');
    const studentRes = await fetch(`${baseURL}/students`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        roll_number: '2024/XX/999',
        hostel_name: 'H1',
        room_number: '101',
        phone: '1234567890',
        guardian_contact: '0987654321'
      })
    });
    const student = await studentRes.json();
    if (!student.id) throw new Error('Student creation failed');
    console.log('✅ Student created:', student.id);
    
    // 2. Fetch Dashboard Metrics
    let metricsRes = await fetch(`${baseURL}/dashboard/metrics`);
    let metrics = await metricsRes.json();
    console.log('✅ Initial Metrics:', metrics);
    
    // 3. Process Scan (Exit)
    console.log('[Test] Student exiting...');
    const scanRes = await fetch(`${baseURL}/processScan`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: student.id,
        timestamp: new Date().toISOString(),
        type: 'exit',
        ocr_confidence: 0.99,
        model_confidence: 0.98,
        camera_id: 'cam-main-gate-1'
      })
    });
    const scanResult = await scanRes.json();
    console.log('✅ Scan processed:', scanResult.message);
    
    // 4. Verify Metrics updated
    metricsRes = await fetch(`${baseURL}/dashboard/metrics`);
    metrics = await metricsRes.json();
    if (metrics.studentsOutside === 1 && metrics.studentsInside === 0) {
      console.log('✅ Metrics updated correctly! Student is OUTSIDE.');
    } else {
      throw new Error(`Metrics mismatch! Expected 1 outside, got ${metrics.studentsOutside}`);
    }
    
    // 5. Test Leaves
    console.log('[Test] Applying for leave...');
    const leaveRes = await fetch(`${baseURL}/leaves/apply`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: student.id,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        reason: 'Going home'
      })
    });
    const leave = await leaveRes.json();
    console.log('✅ Leave applied:', leave.id);
    
    const approveRes = await fetch(`${baseURL}/leaves/${leave.id}/approve`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: 'admin123' })
    });
    const approvedLeave = await approveRes.json();
    if (approvedLeave.status !== 'approved') throw new Error('Leave approval failed');
    console.log('✅ Leave approved.');
    
    // Verify Dashboard shows Leave
    metricsRes = await fetch(`${baseURL}/dashboard/metrics`);
    metrics = await metricsRes.json();
    if (metrics.studentsOnLeave === 1) {
      console.log('✅ Dashboard reflects student is on leave.');
    } else {
      throw new Error('Dashboard missed leave metric.');
    }
    
    console.log('\n🚀 ALL BACKEND INTEGRATION TESTS PASSED 🚀');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
  } finally {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  }
});
