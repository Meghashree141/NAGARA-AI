const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

require("dotenv").config();

// Initialize database.
require("./database/db");

// Import API routes.
const reportsRouter = require("./routes/reports");
const analyticsRouter = require("./routes/analytics");

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers.
app.use(helmet());

// Allow requests from the frontend and local development.
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://nagara-ai-frontend.onrender.com",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests without an Origin header, such as local health checks.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origin not allowed by CORS"));
    }
}));

// Limit JSON request size.
app.use(express.json({ limit: "2mb" }));

// API rate limiter: maximum 100 requests per 15 minutes per IP.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

// Apply rate limiting to API routes.
app.use("/api", apiLimiter);

// API health check.
app.get("/", (req, res) => {
    res.json({
        success: true,
        application: "NAGARA AI",
        message: "Civic Intelligence API is running.",
        version: "1.0.0"
    });
});

// Reports API.
app.use("/api/reports", reportsRouter);

// Analytics API.
app.use("/api/analytics", analyticsRouter);

// Handle unknown routes.
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});

// Global error handler.
app.use((error, req, res, next) => {
    console.error("Server error:", error.message);

    if (error.message === "Origin not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "Request origin is not allowed."
        });
    }

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

// Start server.
app.listen(PORT, () => {
    console.log("----------------------------------");
    console.log("       NAGARA AI BACKEND");
    console.log("----------------------------------");
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Reports API: http://localhost:${PORT}/api/reports`);
    console.log(`Analytics API: http://localhost:${PORT}/api/analytics`);
    console.log("----------------------------------");
});