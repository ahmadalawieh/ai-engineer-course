import { expect, test } from '@playwright/test';

test.describe('AI Engineer Studio 7-Stage Beginner-to-Mid Smoke Suite', () => {
  test('7-stage path, 4-step single-card lesson player, Windows/Mac setup toggle, Pyodide practice, and 7 projects hub', async ({
    page,
  }) => {
    // 1. Screen 1: My Path (7-Stage Roadmap)
    await page.goto('/');
    await expect(page.getByRole('button', { name: '1. My Path' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Your Developer Toolkit/i })).toBeVisible();

    // Open Lesson 1.1
    await page.getByRole('button', { name: /Start Lesson 1\.1/i }).click();

    // 2. Screen 2: Step 1 -> Step 2 (Windows/Mac) -> Step 3 (Pyodide) -> Step 4 (Real Project)
    await expect(page.getByText(/STEP 1 OF 4/i)).toBeVisible();
    await page.getByRole('button', { name: /Next: On Your PC/i }).click();

    await expect(page.getByText(/STEP 2 OF 4/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Windows \(PowerShell\)/i })).toBeVisible();
    await page.getByRole('button', { name: /Next: Try It Here/i }).click();

    await expect(page.getByText(/STEP 3 OF 4/i)).toBeVisible();
    await page.getByRole('button', { name: 'Solution', exact: true }).click();
    await page.getByRole('button', { name: /Run Practice/i }).click();
    await expect(page.getByText(/Your first Python variable and print\(\) worked!/i)).toBeVisible({ timeout: 30_000 });

    await page.getByRole('button', { name: /Next: Add to Real Project/i }).click();
    await expect(page.getByText(/STEP 4 OF 4/i)).toBeVisible();

    // 3. Screen 3: My 7 Projects Hub
    await page.getByRole('button', { name: /3\. My 7 Projects/i }).click();
    await expect(page.getByRole('heading', { name: /Project 1: Freelance Quote/i })).toBeVisible();

    await page.getByRole('button', { name: 'Project 3' }).click();
    const repoInput = page.getByPlaceholder(/Public GitHub repo URL/i);
    const jsonArea = page.getByPlaceholder(/Paste JSON from evidence\.json/i);
    const verifyBtn = page.getByRole('button', { name: /Validate & Save Evidence/i });

    const validEvidence = JSON.stringify({
      project_id: 'doc-ops-extractor',
      generated_at: '2026-11-25T12:00:00Z',
      mode: 'local_pytest',
      passed: true,
      tests: { passed: 4, failed: 0 },
      latency_ms: { p50: 10, p95: 22 },
      cost_usd: { per_request: 0.0004, total_run: 0.0016 },
      security: {
        secret_scan_passed: true,
        injection_tests_passed: true,
        findings: [],
      },
    });
    await repoInput.fill('https://github.com/example-learner/ai-invoice-extractor');
    await jsonArea.fill(validEvidence);
    await verifyBtn.click();
    await expect(page.getByText(/4 pytest checks passed/i)).toBeVisible();
  });
});
