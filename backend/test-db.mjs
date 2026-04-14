import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log(`📡 DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 40)}...`);
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Quick query to verify tables exist
    const adminCount = await prisma.admin.count();
    const hostellerCount = await prisma.hosteller.count();
    const leaveCount = await prisma.leave.count();
    const scanCount = await prisma.scanEvent.count();
    const attendanceCount = await prisma.attendanceRecord.count();
    
    console.log('\n📊 Table Record Counts:');
    console.log(`   Admins:             ${adminCount}`);
    console.log(`   Hostellers:         ${hostellerCount}`);
    console.log(`   Leaves:             ${leaveCount}`);
    console.log(`   Scan Events:        ${scanCount}`);
    console.log(`   Attendance Records: ${attendanceCount}`);
    console.log('\n✅ All tables accessible — DB is healthy!');
  } catch (error) {
    console.error('❌ Database connection FAILED:', error.message);
    if (error.message.includes('connect')) {
      console.error('\n💡 Possible causes:');
      console.error('   1. Supabase project may be paused (free tier pauses after inactivity)');
      console.error('   2. DATABASE_URL may be incorrect');
      console.error('   3. Network/firewall blocking the connection');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
