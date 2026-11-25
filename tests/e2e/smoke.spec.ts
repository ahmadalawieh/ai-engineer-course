import { expect, test } from '@playwright/test';

test.describe('AI Engineer Studio 3-Screen E2E Smoke Suite', () => {
  test('mission board stepper, split-pane staging runner, and ship & verify repo proof', async ({
    page,
  }) => {
    // 1. Screen 1: Minimal Mission Board & 5-Node Stepper
    await page.goto('/');
    await expect(page.getByRole('button', { name: '1. Mission Board' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Clean Messy Webhook Customer Payloads/i })).toBeVisible();

    // Switch to System 1 on the stepper
    await page.getByRole('button', { name: /System 1: Doc Extraction/i }).click();
    await expect(page.getByRole('heading', { name: /Extract Strict JSON From Messy LLM Output/i })).toBeVisible();

    // Expand drawer and open S1-2 directly
    await page.getByRole('button', { name: /View all 4 tickets in System 1/i }).click();
    await page.getByRole('button', { name: /S1-2/i }).click();

    // 2. Screen 2: Split-Pane Ticket Workspace & Pyodide Staging Simulator
    await expect(page.getByText(/Acceptance Criteria/i)).toBeVisible();
    await page.getByRole('button', { name: 'Solution', exact: true }).click();
    await page.getByRole('button', { name: /Run Staging Check/i }).click();
    await expect(page.getByText(/Merged to Staging/i)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Invoice #1042 \(Clean\)/i)).toBeVisible();

    // 3. Screen 3: Ship & Verify Real Starter Repo Proof
    await page.getByRole('button', { name: /3\. Ship & Verify/i }).click();
    await expect(page.getByRole('heading', { name: 'doc-ops-extractor' })).toBeVisible();

    const repoInput = page.getByPlaceholder(/Public GitHub repo URL/i);
    const jsonArea = page.getByPlaceholder(/Paste JSON from evidence\.json/i);
    const verifyBtn = page.getByRole('button', { name: /Validate & Save Evidence/i });

    await repoInput.fill('not-a-url');
    await verifyBtn.click();
    await expect(page.getByText(/valid public GitHub repository URL/i)).toBeVisible();

    const validEvidence = JSON.stringify({
      project_id: 'doc-ops-extractor',
      generated_at: '2026-11-25T12:00:00Z',
      mode: 'local_pytest',
      passed: true,
      tests: { passed: 4, failed: 0 },
      latency_ms: { p50: 12, p95: 24 },
      cost_usd: { per_request: 0.0004, total_run: 0.0016 },
      security: {
        secret_scan_passed: true,
        injection_tests_passed: true,
        findings: [],
      },
    });
    await repoInput.fill('https://github.com/example-learner/doc-ops-extractor');
    await jsonArea.fill(validEvidence);
    await verifyBtn.click();
    await expect(page.getByText(/Verified doc-ops-extractor: 4 pytest checks passed/i)).toBeVisible();
  });
});
