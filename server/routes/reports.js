const express = require("express");
const crypto = require("crypto");

const db = require("../database/db");
const { analyzeReport } = require("../services/aiEngine");
const { detectDuplicate } = require("../services/duplicateDetector");

const router = express.Router();

const ALLOWED_STATUSES = [
"SUBMITTED",
"UNDER_REVIEW",
"ASSIGNED",
"IN_PROGRESS",
"RESOLVED",
"REJECTED"
];

// Format database records for API responses.
function formatReport(report) {
if (!report) return null;

let priorityReasons = [];

try {
    priorityReasons = report.priority_reason
        ? JSON.parse(report.priority_reason)
        : [];
} catch {
    priorityReasons = [];
}

return {
    ...report,
    priority_reasons: priorityReasons
};

}

// GET /api/reports
// Retrieve all complaints with optional filters.
router.get("/", (req, res) => {
try {
let query = "SELECT * FROM reports WHERE 1=1";
const params = [];

    if (req.query.category) {
        query += " AND category = ?";
        params.push(req.query.category);
    }

    if (req.query.status) {
        query += " AND status = ?";
        params.push(req.query.status);
    }

    if (req.query.priority) {
        query += " AND priority = ?";
        params.push(req.query.priority);
    }

    query += " ORDER BY created_at DESC";

    const reports = db.prepare(query).all(...params);

    res.json({
        success: true,
        count: reports.length,
        reports: reports.map(formatReport)
    });

} catch (error) {
    console.error("Get reports error:", error);

    res.status(500).json({
        success: false,
        message: "Unable to retrieve complaints."
    });
}

});

// GET /api/reports/:id
// Retrieve one complaint.
router.get("/:id", (req, res) => {
try {
const report = db.prepare(
"SELECT * FROM reports WHERE id = ?"
).get(req.params.id);

    if (!report) {
        return res.status(404).json({
            success: false,
            message: "Complaint not found."
        });
    }

    res.json({
        success: true,
        report: formatReport(report)
    });

} catch (error) {
    console.error("Get complaint error:", error);

    res.status(500).json({
        success: false,
        message: "Unable to retrieve complaint."
    });
}

});

// POST /api/reports
// Submit and automatically analyze a complaint.
router.post("/", (req, res) => {
try {
const {
title,
description,
category,
location_name,
latitude,
longitude,
image_url
} = req.body;

    // Validate required fields.
    if (
        typeof title !== "string" ||
        typeof description !== "string" ||
        typeof location_name !== "string" ||
        !title.trim() ||
        !description.trim() ||
        !location_name.trim() ||
        latitude === undefined ||
        longitude === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Title, description, location, latitude and longitude are required."
        });
    }

    if (
        title.trim().length > 150 ||
        description.trim().length > 3000 ||
        location_name.trim().length > 200
    ) {
        return res.status(400).json({
            success: false,
            message: "One or more fields exceed the allowed length."
        });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid latitude or longitude."
        });
    }

    // Run the complaint intelligence engine.
    const analysis = analyzeReport(
        description.trim(),
        category || "OTHER"
    );

    // Retrieve existing complaints for duplicate checking.
    const existingReports = db.prepare(`
        SELECT id, description, category, location_name
        FROM reports
    `).all();

    const newId = crypto.randomUUID();

    // Detect possible duplicate complaints.
    const duplicateResult = detectDuplicate(
        {
            id: newId,
            description: description.trim(),
            category: analysis.category,
            location_name: location_name.trim()
        },
        existingReports
    );

    const now = new Date().toISOString();

    // Save complaint and AI analysis in SQLite.
    const insertReport = db.prepare(`
        INSERT INTO reports (
            id,
            title,
            description,
            category,
            location_name,
            latitude,
            longitude,
            image_url,
            summary,
            priority,
            priority_score,
            priority_reason,
            department,
            status,
            duplicate_of,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertReport.run(
        newId,
        title.trim(),
        description.trim(),
        analysis.category,
        location_name.trim(),
        lat,
        lng,
        image_url || null,
        analysis.summary,
        analysis.priority,
        analysis.priorityScore,
        JSON.stringify(analysis.priorityReasons),
        analysis.department,
        "SUBMITTED",
        duplicateResult.isDuplicate
            ? duplicateResult.matchedReport.id
            : null,
        now,
        now
    );

    // Retrieve the saved complaint.
    const savedReport = db.prepare(
        "SELECT * FROM reports WHERE id = ?"
    ).get(newId);

    res.status(201).json({
        success: true,
        message: "Complaint submitted and analyzed successfully.",

        report: formatReport(savedReport),

        intelligence: {
            confidence: analysis.confidence,
            priorityReasons: analysis.priorityReasons,
            duplicateDetected: duplicateResult.isDuplicate,
            matchedReportId:
                duplicateResult.matchedReport?.id || null,
            similarity: duplicateResult.similarity
        }
    });

} catch (error) {
    console.error("Complaint submission error:", error);

    res.status(500).json({
        success: false,
        message: "Unable to submit complaint."
    });
}

});

// PATCH /api/reports/:id/status
// Update complaint status.
router.patch("/:id/status", (req, res) => {
try {
const { status } = req.body;

    if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid complaint status."
        });
    }

    const existing = db.prepare(
        "SELECT id FROM reports WHERE id = ?"
    ).get(req.params.id);

    if (!existing) {
        return res.status(404).json({
            success: false,
            message: "Complaint not found."
        });
    }

    db.prepare(`
        UPDATE reports
        SET status = ?, updated_at = ?
        WHERE id = ?
    `).run(
        status,
        new Date().toISOString(),
        req.params.id
    );

    const updated = db.prepare(
        "SELECT * FROM reports WHERE id = ?"
    ).get(req.params.id);

    res.json({
        success: true,
        message: "Complaint status updated.",
        report: formatReport(updated)
    });

} catch (error) {
    console.error("Update status error:", error);

    res.status(500).json({
        success: false,
        message: "Unable to update complaint status."
    });
}

});

// PATCH /api/reports/:id/assign
// Assign complaint to an officer.
router.patch("/:id/assign", (req, res) => {
try {
const { assigned_to } = req.body;

    if (
        typeof assigned_to !== "string" ||
        !assigned_to.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "Officer name is required."
        });
    }

    const existing = db.prepare(
        "SELECT id FROM reports WHERE id = ?"
    ).get(req.params.id);

    if (!existing) {
        return res.status(404).json({
            success: false,
            message: "Complaint not found."
        });
    }

    db.prepare(`
        UPDATE reports
        SET assigned_to = ?,
            status = 'ASSIGNED',
            updated_at = ?
        WHERE id = ?
    `).run(
        assigned_to.trim(),
        new Date().toISOString(),
        req.params.id
    );

    const updated = db.prepare(
        "SELECT * FROM reports WHERE id = ?"
    ).get(req.params.id);

    res.json({
        success: true,
        message: "Complaint assigned successfully.",
        report: formatReport(updated)
    });

} catch (error) {
    console.error("Assign complaint error:", error);

    res.status(500).json({
        success: false,
        message: "Unable to assign complaint."
    });
}

});

module.exports = router;
