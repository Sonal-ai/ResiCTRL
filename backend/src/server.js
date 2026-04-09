import 'dotenv/config';
import app from './app.js';
import prisma from './configs/prismaClient.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
    console.log(`🚀 ResiCTRL Backend running on port ${PORT}`);
    try {
        await prisma.$connect();
        console.log(`📦 Database connected successfully!`);
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
