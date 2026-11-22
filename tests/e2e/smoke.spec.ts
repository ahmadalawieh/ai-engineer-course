import { expect, test } from '@playwright/test';

test.describe('AI Mastery Studio E2E Smoke Suite', () => {
  test('tracks, placement test, timed module exam, Pyodide lab, evidence pack, and readiness gating', async ({
    page,
  }) => {
    // 1. Home page & Learning Track switching
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /From Absolute Beginner to Production ML/i })).toBeVisible();

    await page.getByRole('button', { name: 'AI Engineer Fast Track' }).click();
    await expect(page.getByText(/AI Engineer Fast Track Active/i)).toBeVisible();
    await expect(page.getByText(/MODULE 00/i)).toHaveCount(0);

    await page.getByRole('button', { name: 'AI Engineer Zero-to-Hire' }).click();
    await expect(page.getByText(/MODULE 00/i).first()).toBeVisible();

    // Switch Target Level bar
    await page.getByRole('button', { name: 'Mid-Level', exact: true }).click();
    await expect(page.getByText(/Mid-Level AI Engineer/i)).toBeVisible();
    await page.getByRole('button', { name: 'Junior', exact: true }).click();

    // 2. Placement Test flow
    await page.getByRole('button', { name: /Developer Placement Test/i }).click();
    await expect(page.getByRole('button', { name: /Submit & Grade/i })).toBeVisible();
    await page.getByRole('button', { name: /Submit & Grade/i }).click();
    await expect(page.getByRole('button', { name: 'Done' })).toBeVisible();
    await page.getByRole('button', { name: 'Done' }).click();

    // 3. Timed Module Exam flow
    const moduleExamBtn = page.getByRole('button', { name: /20Q Exam/i }).first();
    await moduleExamBtn.click();
    await expect(page.getByRole('button', { name: /Submit & Grade/i })).toBeVisible();
    await page.getByRole('button', { name: /Submit & Grade/i }).click();
    await expect(page.getByText(/Explanation:/i).first()).toBeVisible();
    await page.getByRole('button', { name: 'Done' }).click();

    // 4. In-browser Pyodide Python lab execution on Lesson 1.0
    await page.goto('/?lesson=1-0');
    const solutionBtn = page.getByRole('button', { name: 'Solution', exact: true }).first();
    await expect(solutionBtn).toBeVisible();
    await solutionBtn.click();
    const checkBtn = page.getByRole('button', { name: /Check Solution/i }).first();
    await checkBtn.click();
    await expect(page.getByText(/Passed \(\+60 XP\)/i).first()).toBeVisible({ timeout: 30_000 });

    // 5. Practice Arena: Evidence Pack validation & Readiness Report gating
    await page.goto('/?view=arena');
    await page.getByRole('button', { name: /Evidence Pack/i }).click();

    const firstRepoInput = page.getByPlaceholder(/Public GitHub repo URL/i).first();
    const firstDemoInput = page.getByPlaceholder(/Live deployed demo URL/i).first();
    const firstJsonArea = page.getByPlaceholder(/Paste JSON from evidence\.json/i).first();
    const validateBtns = page.getByRole('button', { name: /Validate & Save Evidence/i });

    // Invalid evidence check
    await firstRepoInput.fill('not-a-url');
    await firstJsonArea.fill('{bad json');
    await validateBtns.first().click();
    await expect(page.getByText(/valid|GitHub|JSON/i).first()).toBeVisible();

    // Valid proj-churn evidence submission matching validator.py output schema
    const sampleEvidence = JSON.stringify({
      project_id: 'proj-churn',
      generated_at: '2026-11-22T00:00:00Z',
      mode: 'offline_fixture',
      passed: true,
      tests: { passed: 5, failed: 0 },
      latency_ms: { p50: 14, p95: 28 },
      cost_usd: { per_request: 0.0005, total_run: 0.0025 },
      security: {
        secret_scan_passed: true,
        injection_tests_passed: true,
        findings: [],
      },
    });
    await firstRepoInput.fill('https://github.com/example-learner/proj-churn');
    await firstDemoInput.fill('https://proj-churn-demo.fly.dev');
    await firstJsonArea.fill(sampleEvidence);
    await validateBtns.first().click();
    await expect(page.getByText(/Saved: 5 tests passed/i)).toBeVisible();

    // Verify Readiness & Report gating + honest disclosure
    await page.getByRole('button', { name: /Readiness & Report/i }).click();
    await expect(page.getByText(/Remaining Requirements to Unlock/i)).toBeVisible();
    await expect(page.getByText(/No course grants an employer job title/i)).toBeVisible();
  });
});
