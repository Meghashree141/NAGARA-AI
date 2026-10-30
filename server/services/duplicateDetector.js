// NAGARA AI - Duplicate Complaint Detection
// Uses Jaccard similarity to compare complaint descriptions.

function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(word => word.length > 2);
}

// Calculates similarity between two descriptions.
function calculateSimilarity(textA, textB) {
    const wordsA = new Set(tokenize(textA));
    const wordsB = new Set(tokenize(textB));

    if (wordsA.size === 0 || wordsB.size === 0) {
        return 0;
    }

    const intersection = [...wordsA].filter(word => wordsB.has(word));
    const union = new Set([...wordsA, ...wordsB]);

    return intersection.length / union.size;
}

// Checks existing complaints for a possible duplicate.
function detectDuplicate(newReport, existingReports) {
    let bestMatch = null;
    let highestSimilarity = 0;

    for (const report of existingReports) {
        if (report.id === newReport.id) continue;

        const sameCategory =
            report.category === newReport.category;

        const sameLocation =
            report.location_name?.toLowerCase() ===
            newReport.location_name?.toLowerCase();

        if (!sameCategory || !sameLocation) continue;

        const similarity = calculateSimilarity(
            newReport.description,
            report.description
        );

        if (similarity > highestSimilarity) {
            highestSimilarity = similarity;
            bestMatch = report;
        }
    }

    const threshold = 0.4;

    return {
        isDuplicate: highestSimilarity >= threshold,
        matchedReport:
            highestSimilarity >= threshold ? bestMatch : null,
        similarity: Number(highestSimilarity.toFixed(3))
    };
}

module.exports = {
    tokenize,
    calculateSimilarity,
    detectDuplicate
};