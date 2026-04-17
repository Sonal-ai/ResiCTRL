import 'dotenv/config';
import app from './app.js';
import prisma from './configs/prismaClient.js';
import { configureCloudinary } from './configs/cloudinary.js';
import cron from 'node-cron';
import { processDailyAttendance } from './services/attendanceEngine.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
    console.log(`🚀 ResiCTRL Backend running on port ${PORT}`);
    try {
        await prisma.$connect();
        console.log(`📦 Database connected successfully!`);
        configureCloudinary();
        console.log(`☁️  Cloudinary configured successfully!`);

        // ── Attendance Cron Job (Phase 2.5) ──
        // Runs daily at 11:05 PM IST (23:05). Only enabled when ENABLE_CRON=true.
        // Not suitable for Vercel serverless — use Vercel Cron or external scheduler there.
        if (process.env.ENABLE_CRON === 'true') {
            cron.schedule('5 23 * * *', async () => {
                console.log('⏰ Running daily attendance cron at 11:05 PM...');
                try {
                    await processDailyAttendance();
                    console.log('✅ Daily attendance processed successfully.');
                } catch (err) {
                    console.error('❌ Attendance cron error:', err);
                }
            }, {
                timezone: 'Asia/Kolkata'
            });
            console.log(`⏰ Attendance cron scheduled (daily 23:05 IST)`);
        } else {
            console.log(`⏰ Attendance cron DISABLED (set ENABLE_CRON=true to enable)`);
        }
    } catch (error) {
        console.error(`❌ Database connection failed:`, error);
    }
});

// ────────────────────── Graceful Shutdown ──────────────────────
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    
    server.close(async () => {
        console.log("✔️  HTTP server closed.");
        
        try {
            await prisma.$disconnect();
            console.log("✔️  Database connections closed.");
            process.exit(0);
        } catch (error) {
            console.error("❌ Error during database disconnection:", error);
            process.exit(1);
        }
    });

    // Force shutdown if it takes too long
    setTimeout(() => {
        console.error("❌ Could not close connections in time, forcefully shutting down.");
        process.exit(1);
    }, 10000);
};

// Listen for termination signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
