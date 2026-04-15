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
import complaintRoutes from './routes/complaintRoutes.js';

const app = express();

// ────────────────────── Vercel Proxy Trust ──────────────────────
// Required for express-rate-limit to read X-Forwarded-For headers behind Vercel Serverless
app.set('trust proxy', 1);

// ────────────────────── Security ──────────────────────
app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(
    cors({
        origin: allowedOrigins,
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
app.get("/", (req, res) => res.status(200).send("Welcome to the ResiCTRL Vercel API. Append /api/health to check status."));

// Fixed: Express 5 requires app.get() for simple route handlers, not app.use()
app.get("/api/health", limiter, (req, res) => res.status(200).json({ status: "OK", timestamp: new Date(), message: "Server is healthy" }));

app.use("/api/auth",     limiter, authRoutes);
app.use("/api/hostellers", limiter, hostellerRoutes);
app.use("/api/leaves",   limiter, leaveRoutes);
app.use("/api/dashboard",limiter, dashboardRoutes);
app.use("/api/scans",    cameraLimiter, scanRoutes);
app.use("/api/complaints", limiter, complaintRoutes);

// ────────────────────── Global Error Handler ──────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
});

export default app;
