import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';

// Security middleware
import { sanitizeInput } from './middlewares/sanitizeMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Import modular routes
import hostellerRoutes from './routes/hostellerRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';

const app = express();

// ────────────────────── Vercel Proxy Trust ──────────────────────
// Required for express-rate-limit to read X-Forwarded-For headers behind Vercel Serverless
app.set('trust proxy', 1);

// ────────────────────── Security Headers ──────────────────────
// Helmet with production-tuned config: strict CSP, frame protection, HSTS
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow Cloudinary images
}));

// ────────────────────── CORS ──────────────────────
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(
    cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (mobile apps, Postman, server-to-server)
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) return callback(null, true);
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
    })
);

// ────────────────────── Rate Limiting ──────────────────────
// Strict limiter for auth routes (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // 15 login attempts per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: { statusCode: 429, message: "Too many login attempts, please try again later.", success: false },
});

// Standard limiter for frontend dashboard and human interactions
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

// ────────────────────── Security Middleware ──────────────────────
// HTTP Parameter Pollution protection (prevents duplicate query params attacks)
app.use(hpp());

// Custom XSS sanitization on all incoming data
app.use(sanitizeInput);

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

app.use("/api/auth",       authLimiter, authRoutes);  // Stricter rate limit on auth
app.use("/api/hostellers", limiter, hostellerRoutes);
app.use("/api/leaves",     limiter, leaveRoutes);
app.use("/api/dashboard",  limiter, dashboardRoutes);
app.use("/api/scans",      cameraLimiter, scanRoutes);
app.use("/api/complaints", limiter, complaintRoutes);
app.use("/api/notifications", limiter, notificationRoutes);
app.use("/api/attendance",    limiter, attendanceRoutes);

// ────────────────────── Global Error Handler ──────────────────────
// Centralized handler — replaces inline error middleware
app.use(errorHandler);

export default app;
