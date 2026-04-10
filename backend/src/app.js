import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Import modular routes
import hostellerRoutes from './routes/hostellerRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// ────────────────────── Security ──────────────────────
app.use(helmet());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
    })
);

// ────────────────────── Rate Limiting ──────────────────────
// Strict limiter for frontend dashboard and human interactions
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { statusCode: 429, message: "Too many requests, please try again later.", success: false },
});

// Generous sanity-check limit for camera hardware
const cameraLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { statusCode: 429, message: "Camera API Hardware Limit Exceeded.", success: false },
});

// ────────────────────── Body Parsing ──────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ────────────────────── Logging ──────────────────────
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
} else {
    app.use(morgan("combined"));
}

// ────────────────────── Routes ──────────────────────
app.use("/api/health",   limiter, (req, res) => res.status(200).json({ status: "OK", timestamp: new Date(), message: "Server is healthy" }));

app.use("/api/auth",     limiter, authRoutes);
app.use("/api/hostellers", limiter, hostellerRoutes);
app.use("/api/leaves",   limiter, leaveRoutes);
app.use("/api/dashboard",limiter, dashboardRoutes);
app.use("/api/scans",    cameraLimiter, scanRoutes);

// ────────────────────── Global Error Handler ──────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
});

export default app;
