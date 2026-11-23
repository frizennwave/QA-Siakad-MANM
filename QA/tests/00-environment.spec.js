// PHASE 1 / 5.2 Environment Validation. Generik, berlaku untuk aplikasi apa pun.
const { test, expect } = require("../lib/fixtures");
const { BASE_URL } = require("../lib/env");

test("TC000 Validasi environment: aplikasi dapat diakses", async ({
    page,
    tc,
    evidence,
}) => {
    tc({
        module: "ENV",
        feature: "ENV-01",
        featureName: "ENVIRONMENT",
        requirement: "-",
        role: "PUBLIC",
        type: "Environment",
        priority: "Critical",
        objective:
            "Memastikan URL target dapat dibuka sebelum pengujian dimulai",
        expected:
            "Halaman awal terbuka dengan HTTP status < 400 dan memiliki judul halaman",
    });

    const resp = await page.goto("/dashboard");
    await page.waitForLoadState("networkidle").catch(() => {});
    await evidence.snap(`Halaman awal ${BASE_URL}`);

    expect(resp, "Tidak ada respons dari server").not.toBeNull();
    expect(resp.status(), `HTTP status halaman awal`).toBeLessThan(400);
    await expect(page).toHaveTitle(/.+/);

    // Console error & request gagal dicatat (results/logs.jsonl), tidak otomatis menggagalkan test.
    if (evidence.consoleErrors.length || evidence.failedRequests.length) {
        test.info().annotations.push({
            type: "note",
            description: `Console error: ${evidence.consoleErrors.length}, request gagal: ${evidence.failedRequests.length}. Lihat results/logs.jsonl`,
        });
    }
});
