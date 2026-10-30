const BASE_URL =
    process.env.API_BASE_URL || "http://localhost:5000";

let passed = 0;
let failed = 0;
let reportId = null;

async function api(path, options = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const text = await response.text();

    let data;
    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }

    return { response, data };
}

async function test(name, callback) {
    try {
        await callback();
        console.log(`PASS: ${name}`);
        passed++;
    } catch (error) {
        console.log(`FAIL: ${name} - ${error.message}`);
        failed++;
    }
}

async function main() {
    console.log("\nNAGARA AI - API TEST SUITE");
    console.log("Testing:", BASE_URL);
    console.log("--------------------------------");

    await test("Backend health check", async () => {
        const { response } = await api("/");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
    });

    await test("Analytics API", async () => {
        const { response } = await api("/api/analytics");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
    });

    await test("Complaint listing API", async () => {
        const { response } = await api("/api/reports");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
    });

    await test("Invalid complaint validation", async () => {
        const { response } = await api("/api/reports", {
            method: "POST",
            body: JSON.stringify({})
        });

        if (response.status < 400) {
            throw new Error("Invalid complaint was accepted");
        }
    });

    await test("Valid complaint submission", async () => {
        const unique = Date.now();

        const { response, data } = await api("/api/reports", {
            method: "POST",
            body: JSON.stringify({
                title: `Test Road Damage ${unique}`,
                description:
                    "A large pothole is causing difficulty for vehicles and pedestrians.",
                location_name: `Test Location ${unique}`,
                latitude: 12.2958,
                longitude: 76.6394
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const report = data.report || data;
        reportId = report.id;

        if (!reportId) {
            throw new Error("Report ID missing");
        }
    });

    await test("Complaint tracking", async () => {
        if (!reportId) throw new Error("No report created");

        const { response } =
            await api(`/api/reports/${reportId}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
    });

    await test("Complaint status update", async () => {
        if (!reportId) throw new Error("No report created");

        const { response } = await api(
            `/api/reports/${reportId}/status`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    status: "UNDER_REVIEW"
                })
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
    });

    console.log("\n========== TEST RESULTS ==========");
    console.log("Total:", passed + failed);
    console.log("Passed:", passed);
    console.log("Failed:", failed);
    console.log("Test complaint ID:", reportId || "Not created");
    console.log("==================================");

    if (failed > 0) process.exitCode = 1;
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});