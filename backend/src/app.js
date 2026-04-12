require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") }); // Must be first — loads .env before anything else

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("./config/passport");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const performanceRoutes = require("./routes/performanceRoutes");
const jobAnalyzerRoutes = require("./routes/jobAnalyzerRoutes");
const careerRoutes = require("./routes/careerRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// ─────────────────────────────────────────────────────────────────────────
// 1. Connect to MongoDB
// ─────────────────────────────────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────────────────────────────────
// 2. Create Express app
// ─────────────────────────────────────────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────────────────────────────────
// 3. Global middleware
// ─────────────────────────────────────────────────────────────────────────

// CORS — allow frontend origins listed in .env
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: origin ${origin} not allowed`));
    },
    credentials: true, // Required for cookies / sessions
  })
);

// Parse JSON request bodies (limit protects against payload attacks)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// HTTP request logger
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ─────────────────────────────────────────────────────────────────────────
// 4. Session — required by Passport for the OAuth handshake state cookie.
//    We use session: false on the callback route so no user data is ever
//    stored server-side; sessions are only used during the OAuth round-trip.
// ─────────────────────────────────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 60 * 60, // Sessions expire in 1 hour (only needed for OAuth handshake)
      autoRemove: "native", // Let MongoDB TTL index clean up expired sessions
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    },
  })
);

// ─────────────────────────────────────────────────────────────────────────
// 5. Passport — must come after session middleware
// ─────────────────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ─────────────────────────────────────────────────────────────────────────
// 6. Rate limiting
// ─────────────────────────────────────────────────────────────────────────

// Global: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests from this IP. Please try again after 15 minutes.",
  },
});
app.use(globalLimiter);

// Auth-specific: 20 requests per 15 minutes per IP
// (slightly relaxed from 10 to allow for OAuth round-trips + retries)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts. Please try again after 15 minutes.",
  },
});

// ─────────────────────────────────────────────────────────────────────────
// 7. Health-check route
// ─────────────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CareerForge API is running",
    environment: process.env.NODE_ENV,
    google_oauth: !!(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ),
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────────────────────────
// 8. API Routes
// ─────────────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/job-analyzer", jobAnalyzerRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/ai", aiRoutes);

// ─────────────────────────────────────────────────────────────────────────
// 9. Error handling (must be after all routes)
// ─────────────────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────
// 10. Start server
// ─────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\nCareerForge API running on port ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV}`);
  console.log(
    `   Google OAuth: ${
      process.env.GOOGLE_CLIENT_ID ? "✅ configured" : "⚠️  not configured"
    }`
  );
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});

// ─────────────────────────────────────────────────────────────────────────
// 11. Graceful shutdown
// ─────────────────────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n⚠️  ${signal} received. Shutting down gracefully…`);
  server.close(() => {
    console.log("✅ HTTP server closed.");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("❌ Forced shutdown after timeout.");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  shutdown("unhandledRejection");
});

module.exports = app;
