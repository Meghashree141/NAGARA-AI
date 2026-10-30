const express = require("express");
const db = require("../database/db");

const router = express.Router();

// GET /api/analytics
// Provides dashboard statistics and location hotspots.
router.get("/", (req, res) => {
    try {
        const total = db.prepare(
            "SELECT COUNT(*) AS total FROM reports"
        ).get().total;

        const resolved = db.prepare(
            "SELECT COUNT(*) AS total FROM reports WHERE status = 'RESOLVED'"
        ).get().total;

        const pending = db.prepare(
            "SELECT COUNT(*) AS total FROM reports WHERE status NOT IN ('RESOLVED', 'REJECTED')"
        ).get().total;

        const rejected = db.prepare(
            "SELECT COUNT(*) AS total FROM reports WHERE status = 'REJECTED'"
        ).get().total;

        const priorityCounts = db.prepare(`
            SELECT priority, COUNT(*) AS count
            FROM reports
            GROUP BY priority
        `).all();

        const statusCounts = db.prepare(`
            SELECT status, COUNT(*) AS count
            FROM reports
            GROUP BY status
        `).all();

        const categoryCounts = db.prepare(`
            SELECT category, COUNT(*) AS count
            FROM reports
            GROUP BY category
            ORDER BY count DESC
        `).all();

        const hotspots = db.prepare(`
            SELECT
                location_name,
                COUNT(*) AS total_reports,
                ROUND(AVG(latitude), 6) AS latitude,
                ROUND(AVG(longitude), 6) AS longitude,
                SUM(CASE WHEN priority = 'CRITICAL' THEN 1 ELSE 0 END) AS critical_reports,
                SUM(CASE WHEN priority = 'HIGH' THEN 1 ELSE 0 END) AS high_reports
            FROM reports
            GROUP BY location_name
            ORDER BY total_reports DESC
        `).all();

        res.json({
            success: true,
            overview: {
                total,
                resolved,
                pending,
                rejected
            },
            priorityCounts,
            statusCounts,
            categoryCounts,
            hotspots
        });

    } catch (error) {
        console.error("Analytics error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to generate analytics."
        });
    }
});

module.exports = router;
