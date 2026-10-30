// ============================================
// NAGARA AI - CIVIC INTELLIGENCE ENGINE
// ============================================

// 1. CATEGORY KEYWORDS

const CATEGORY_RULES = {
    ROAD_DAMAGE: [
        "pothole",
        "road damage",
        "broken road",
        "cracked road",
        "road",
        "crater"
    ],

    WATERLOGGING: [
        "waterlogging",
        "flood",
        "flooding",
        "standing water",
        "water accumulation",
        "rainwater",
        "drainage"
    ],

    WASTE_MANAGEMENT: [
        "garbage",
        "waste",
        "trash",
        "rubbish",
        "overflowing bin",
        "dump",
        "litter"
    ],

    STREETLIGHT: [
        "streetlight",
        "street light",
        "lamp",
        "dark street",
        "light not working",
        "broken light"
    ],

    PUBLIC_SAFETY: [
        "electric wire",
        "hanging wire",
        "fire",
        "exposed wire",
        "electric shock",
        "dangerous",
        "open manhole"
    ],

    WATER_SUPPLY: [
        "water supply",
        "no water",
        "pipeline",
        "leaking pipe",
        "drinking water",
        "contaminated water"
    ]
};


// 2. DEPARTMENT RECOMMENDATION

const DEPARTMENTS = {
    ROAD_DAMAGE: "Road Maintenance Department",
    WATERLOGGING: "Drainage Department",
    WASTE_MANAGEMENT: "Sanitation Department",
    STREETLIGHT: "Electrical Department",
    PUBLIC_SAFETY: "Emergency Response Department",
    WATER_SUPPLY: "Water Supply Department",
    OTHER: "General Civic Department"
};


// 3. CATEGORY CLASSIFICATION

function categorizeReport(description, selectedCategory) {

    const text = description.toLowerCase();

    let bestCategory = "OTHER";
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {

        const score = keywords.reduce((total, keyword) => {

            return total + (text.includes(keyword) ? 1 : 0);

        }, 0);

        if (score > bestScore) {

            bestScore = score;
            bestCategory = category;

        }
    }

    if (bestScore === 0 && selectedCategory) {

        bestCategory = selectedCategory;

    }

    return {

        category: bestCategory,

        confidence: bestScore > 0
            ? Math.min(0.95, 0.65 + bestScore * 0.1)
            : 0.4

    };
}


// 4. AUTOMATIC SUMMARY GENERATION

function generateSummary(description) {

    const cleaned = description
        .replace(/\s+/g, " ")
        .trim();

    if (cleaned.length <= 150) {

        return cleaned;

    }

    const sentence = cleaned.split(/[.!?]/)[0];

    return sentence.length > 150
        ? sentence.slice(0, 147) + "..."
        : sentence;

}


// 5. EXPLAINABLE PRIORITY ENGINE

function calculatePriority(description, category) {

    const text = description.toLowerCase();

    let score = 0;

    const reasons = [];

    const safetyKeywords = [
        "electric shock",
        "fire",
        "hanging wire",
        "exposed wire",
        "open manhole",
        "injury",
        "accident",
        "dangerous",
        "children at risk"
    ];

    const urgentKeywords = [
        "urgent",
        "emergency",
        "immediately",
        "severe",
        "critical",
        "trapped"
    ];

    const impactKeywords = [
        "school",
        "hospital",
        "main road",
        "heavy traffic",
        "many people",
        "public",
        "pedestrian"
    ];


    // Safety analysis

    const safetyDetected = safetyKeywords.some(
        keyword => text.includes(keyword)
    );

    if (safetyDetected) {

        score += 45;

        reasons.push(
            "Potential public safety hazard detected"
        );

    }


    // Urgency analysis

    const urgencyDetected = urgentKeywords.some(
        keyword => text.includes(keyword)
    );

    if (urgencyDetected) {

        score += 25;

        reasons.push(
            "Urgent language detected"
        );

    }


    // Public impact analysis

    const impactDetected = impactKeywords.some(
        keyword => text.includes(keyword)
    );

    if (impactDetected) {

        score += 20;

        reasons.push(
            "Potential impact on public movement or services"
        );

    }


    // Category-based analysis

    if (category === "WATERLOGGING") {

        score += 10;

        reasons.push(
            "Waterlogging can disrupt public movement"
        );

    }


    if (category === "PUBLIC_SAFETY") {

        score += 10;

        reasons.push(
            "Public safety category requires attention"
        );

    }


    score = Math.min(score, 100);


    let priority = "LOW";

    if (score >= 70) {

        priority = "CRITICAL";

    } else if (score >= 50) {

        priority = "HIGH";

    } else if (score >= 25) {

        priority = "MEDIUM";

    }


    if (reasons.length === 0) {

        reasons.push(
            "No explicit high-risk indicators detected"
        );

    }


    return {

        score,
        priority,
        reasons

    };

}


// 6. MAIN AI ANALYSIS FUNCTION

function analyzeReport(description, selectedCategory) {

    const classification = categorizeReport(
        description,
        selectedCategory
    );


    const summary = generateSummary(description);


    const priorityResult = calculatePriority(
        description,
        classification.category
    );


    const department =
        DEPARTMENTS[classification.category] ||
        DEPARTMENTS.OTHER;


    return {

        category: classification.category,

        confidence: classification.confidence,

        summary,

        priority: priorityResult.priority,

        priorityScore: priorityResult.score,

        priorityReasons: priorityResult.reasons,

        department

    };

}


// 7. EXPORT FUNCTIONS

module.exports = {

    analyzeReport,

    categorizeReport,

    generateSummary,

    calculatePriority,

    DEPARTMENTS

};