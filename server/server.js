const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Initialize database.
require("./database/db");

// Import API routes.
const reportsRouter = require("./routes/reports");
const analyticsRouter = require("./routes/analytics");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware.
app.use(cors());
app.use(express.json({ limit: "2mb" }));

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
    console.error("Server error:", error);

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