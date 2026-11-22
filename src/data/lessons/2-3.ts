import type { Lesson } from '@/types/course';

export const lesson2_3: Lesson = {
  id: '2-3',
  moduleId: 'mod-2',
  number: '2.3',
  title: 'Statistical Inference, Confidence Intervals & Production A/B Testing',
  subtitle: 'Design trustworthy online experiments, compute power and sample size before launch, and avoid peeking, SRM, Simpson’s Paradox, and multiple-testing traps.',
  durationMinutes: 80,
  track: 'ds',
  prerequisites: ['1.6', '2.2'],
  requires: ['hypothesis-testing', 'confidence-intervals', 'distributions', 'pandas-wrangling'],
  teaches: [
    'ab-testing',
    'sample-size-mde',
    'srm-peeking',
    'multiple-testing',
  ],
  objectives: [
    'Design a randomized experiment with a single pre-registered primary metric, guardrail metrics, and fixed horizon sample size.',
    'Compute required sample size per arm by hand and in NumPy/SciPy from variance and Minimum Detectable Effect (MDE).',
    'Calculate exact two-proportion Z-statistics, p-values, and 95% confidence intervals around observed lift.',
    'Detect Sample Ratio Mismatch (SRM), optional stopping ("peeking"), Simpson’s Paradox, and multiple-testing inflation.',
  ],
  checkWithoutNotes: [
    'State the precise definition of a p-value without claiming it is "the probability the null hypothesis is true."',
    'If your product team cuts Minimum Detectable Effect (`Delta`) in half while keeping alpha and power fixed, by what factor does required sample size change?',
    'Explain how Sample Ratio Mismatch (`50/50` split yielding `48/52` users) invalidates downstream conversion rate conclusions.',
    'How does Simpson’s Paradox cause variant B to beat variant A in both mobile and desktop segments yet lose when combined?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Rigorous Experimentation Matters in Real AI Teams',
      paragraphs: [
        'Offline benchmarks lie subtly all the time. You swap in a new RAG reranker, tune a recommender prompt, or train a fresh churn threshold model that scores higher on yesterday’s validation set—yet live users bounce faster because latency jumped by 400 milliseconds or the new model surfaced repetitive answers.',
        'Online A/B testing is how engineering teams separate genuine product gains from day-of-week traffic swings and wishful thinking. Rather than comparing "last Tuesday before deploy vs this Wednesday after deploy," you randomly split live eligible users into Control (A) and Treatment (B) simultaneously. Every external factor—holidays, ad campaigns, competitor outages—hits both groups equally, leaving the model or feature change as the sole causal explanation.',
        'However, badly run A/B tests are worse than no test at all because they give teams false mathematical certainty to ship harmful changes. Knowing how to power a test, audit randomization health, compute confidence intervals, and prevent multiple-testing illusions is essential whether you evaluate search rankings, LLM prompt templates, or classical ML classifiers.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Signal-to-Noise Ratio in Coin Flips vs User Traffic',
      frontendConcept: 'Checking conversion numbers after 50 visitors on a new landing page and declaring a winner because 6 beat 4',
      aiConcept: 'Sampling Variance, Standard Error, and Pre-Registered Minimum Detectable Effect (MDE)',
      explanation:
        'Flipping a completely fair coin 10 times regularly produces 7 heads by pure luck, yet flipping it 10,000 times almost always lands near 50%. Small samples have huge sampling noise that masquerades as dramatic percentage lifts. Statistical power analysis calculates exactly how many flips—or users—you need before a real effect stands tall above random noise.',
    },
    {
      type: 'math',
      title: 'Sample Size Formula & Two-Proportion Z-Test',
      latex: 'n \\approx \\frac{16 \\, \\sigma^2}{\\Delta^2} \\quad (\\alpha=0.05,\\; 1-\\beta=0.80) \\qquad z = \\frac{\\hat{p}_B - \\hat{p}_A}{\\sqrt{\\hat{p}(1-\\hat{p})(\\frac{1}{n_A} + \\frac{1}{n_B})}}',
      breakdown: [
        { symbol: '\\sigma^2', meaning: 'Per-user metric variance; for binary conversion $p$, $\\sigma^2 = p(1-p)$' },
        { symbol: '\\Delta', meaning: 'Minimum Detectable Effect (MDE): smallest absolute lift worth engineering effort' },
        { symbol: '1 - \\beta', meaning: 'Statistical power (standard target 0.80): probability of detecting a true effect of size $\\Delta$' },
        { symbol: '\\hat{p}', meaning: 'Pooled conversion rate $(c_A + c_B) / (n_A + n_B)$ under the null hypothesis $H_0$' },
      ],
      intuition:
        'Look at $\\Delta^2$ in the denominator: cutting your Minimum Detectable Effect in half requires 4 times as many users! Always run this calculation BEFORE turning on traffic—never peek every morning and stop early the first instant `p < 0.05`.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Sizing an A/B Test & Computing a Lift Confidence Interval by Hand',
      paragraphs: [
        'Suppose your baseline checkout conversion rate is `p = 0.10` (`10%`), and leadership decides a meaningful improvement is an absolute lift of `+0.02` (`10% -> 12%`, a 20% relative gain). Using the standard `alpha = 0.05`, `80%` power approximation `n = 16 * sigma^2 / Delta^2`: first compute `sigma^2 = 0.10 * (1 - 0.10) = 0.09`. Next compute `Delta^2 = 0.02^2 = 0.0004`. Dividing gives `n = (16 * 0.09) / 0.0004 = 1.44 / 0.0004 = 3,600` users per arm (`7,200` total users). Using exact normal quantiles `(z_{1-alpha/2} + z_{1-beta})^2 = (1.96 + 0.8416)^2 = 7.849` with two-arm baseline variance `2 * 0.10 * 0.90 = 0.18` gives `math.ceil((7.849 * 0.18) / 0.0004) = 3,532` users per arm—nearly identical to the quick `16 * sigma^2 / Delta^2` mental rule!',
        'Now suppose a stakeholder asks to detect a tiny `+0.005` (`0.5 percentage point`) improvement instead. Because `0.005` is four times smaller than `0.02`, `Delta^2` shrinks by `16x`, jumping required sample size to `56,512` users per arm (`113,024` total)! Checking this math beforehand prevents launching hopeless underpowered experiments that run for months without resolving anything.',
        'Once your test finishes (`A: 400/4000 = 10.0%`, `B: 472/4000 = 11.8%`), compute BOTH the p-value and the 95% confidence interval around the `+1.8%` lift. Unpooled standard error is `sqrt(0.10*0.90/4000 + 0.118*0.882/4000) = 0.00696`, giving `95% CI = 0.018 +/- 1.96 * 0.00696 = [+0.44%, +3.16%]`. Because the entire confidence interval sits cleanly above zero, we reject the null hypothesis and also confirm the lower bound (`+0.44%`) still clears our engineering maintenance threshold.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1 & 2 Output: Exact Sample Size, Z-Test & 95% Lift CI',
      language: 'python',
      code: `import math
import numpy as np
from scipy.stats import norm

# 1. Exact sample size per arm (alpha=0.05 two-sided, power=0.80)
p0, mde = 0.10, 0.02
z_alpha = norm.ppf(0.975)  # 1.96
z_beta = norm.ppf(0.80)    # 0.8416
n_exact = math.ceil(((z_alpha + z_beta) ** 2 * 2 * p0 * (1 - p0)) / (mde ** 2))
print("Exact n per arm:", n_exact)  # 3532 (vs rule-of-thumb 3600)

# 2. Evaluate completed test: Control A=400/4000 (10.0%), Treatment B=472/4000 (11.8%)
n_a, c_a = 4000, 400
n_b, c_b = 4000, 472
p_a, p_b = c_a / n_a, c_b / n_b
lift = p_b - p_a
se_unpooled = math.sqrt(p_a * (1 - p_a) / n_a + p_b * (1 - p_b) / n_b)
ci_low, ci_high = lift - 1.96 * se_unpooled, lift + 1.96 * se_unpooled
p_pool = (c_a + c_b) / (n_a + n_b)
z_stat = lift / math.sqrt(p_pool * (1 - p_pool) * (1 / n_a + 1 / n_b))
p_val = 2 * (1 - norm.cdf(abs(z_stat)))
print(f"Lift={lift:.4f}, 95% CI=[{ci_low:.4f}, {ci_high:.4f}], z={z_stat:.2f}, p={p_val:.4f}")
# Lift=0.0180, 95% CI=[0.0044, 0.0316], z=2.58, p=0.0099`,
      caption: 'Reporting the 95% confidence interval (`[+0.44%, +3.16%]`) alongside the p-value tells stakeholders both uncertainty and business magnitude.',
    },
    {
      type: 'simulator',
      simulatorId: 'ab-test',
      title: 'Interactive Lab: A/B Test Power, MDE & P-Value Simulator',
      description:
        'Adjust baseline conversion rate, desired lift (MDE), and sample size per variant to watch sampling distributions separate, statistical power rise, and required test duration update.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Four Experiment Killers (SRM, Peeking, Multiple Testing, Simpson’s)',
      paragraphs: [
        'Even with perfect Z-test arithmetic, four structural bugs invalidate experiments constantly. First is **Sample Ratio Mismatch (SRM)**: you configured a 50/50 split, yet after 10,000 users Control received 5,200 users and Treatment received 4,800. A quick chi-square goodness-of-fit test (`chi2 = (5200-5000)^2/5000 + (4800-5000)^2/5000 = 16.0`, `p < 0.0001`) proves the split is broken—often because a slow new AI feature causes impatient mobile browsers to close the tab before telemetry fires! Never interpret conversion rates when an SRM check fails.',
        'Second is **optional stopping (peeking)**: with `alpha = 0.05`, testing one true-null A/A split once yields a 5% false-positive rate. Checking that same running test every single morning for 14 days and shipping as soon as `p < 0.05` runs 14 correlated tests on noisy cumulative streams, driving false positives well above 20%! Fix a pre-registered sample size beforehand or use formal sequential testing boundaries.',
        'Third is **multiple comparisons**: testing 20 different secondary metrics or 20 button colors against Control at `alpha = 0.05` guarantees 1 expected false positive (`20 * 0.05 = 1`). Apply Bonferroni (`alpha / k`) for strict family-wise control or Benjamini-Hochberg FDR when screening many candidate changes.',
        'Fourth is **Simpson’s Paradox & SUTVA violations**: if Variant B gets routed disproportionately to desktop users while mobile users convert lower overall, B can beat A inside both mobile and desktop individually while losing on the blended aggregate! Stratifying randomization by device tier prevents mix shifts, while cluster or switchback randomization prevents two-sided marketplace spillover (SUTVA violations).',
      ],
    },
    {
      type: 'callout',
      variant: 'interview',
      title: 'Classic Data Science Experimentation Traps',
      body: '1) **Novelty Effect**: users click a flashy widget on Day 1 then churn back to baseline—run experiments across full 7-to-14-day weekly cycles.\n2) **Guardrail Metrics**: never measure clicks alone; pair a primary success metric with latency (`p95`), crash rate, and token cost guardrails.\n3) **Confidence Interval Over P-Value Alone**: `p = 0.001` on 5 million users might reflect a negligible `+0.01%` lift whose 95% CI sits completely below your engineering maintenance cost.',
    },
    {
      type: 'prose',
      heading: 'Common Experimentation Mistakes & How to Debug Them',
      paragraphs: [
        '1) Randomizing by page view instead of `user_id` (`session_id`): seeing Button A on refresh #1 and Button B on refresh #2 destroys attribution and breaks independence assumptions in `SE`. Hash `user_id` deterministically (`sha256(salt + user_id)`) unless testing truly stateless server settings.',
        '2) Analyzing heavy-tailed continuous metrics (revenue per user) with naive Z-tests without outlier checks: one enterprise purchase of \\$50,000 blows up sample variance and kills power. Consider winsorizing extreme outliers, modeling log-spend, or using non-parametric bootstrap confidence intervals.',
        '3) Ignoring SRM alerts because "the sample still looks large enough": SRM is a symptom of missing-not-at-random telemetry or bot filtering bugs; larger `N` makes biased estimators more confidently wrong.',
        '4) Forgetting day-of-week seasonality by running a test only Friday–Sunday: weekend shoppers behave differently from Monday enterprise buyers; always span integer multiples of 7 days.',
        '5) Skipping an A/A test when setting up a brand-new experimentation framework: split traffic 50/50 serving identical experiences first to confirm false positives occur near the nominal 5% rate and SRM alerts remain clean before trusting real product lifts.',
        '6) Overlooking variance reduction (CUPED) on noisy retention or spend metrics: subtracting pre-experiment user spend covariates (`Y_adj = Y - theta * (X_pre - mean(X_pre))`) shrinks metric variance cleanly without biasing treatment effects, cutting required traffic duration substantially on repeat-user platforms.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 2.3 Recap: Trustworthy A/B Experiments',
      body: '- Pre-register one primary metric, guardrail metrics, and fixed sample size using `16 * sigma^2 / MDE^2` before launch.\n- Always run a Sample Ratio Mismatch (`chi2`) sanity check on assignment counts before reading outcomes.\n- Never peek and stop early on `p < 0.05`; report the 95% lift Confidence Interval alongside the p-value.\n- Adjust `alpha` (`Bonferroni` or Benjamini-Hochberg) when testing multiple variants or metrics.\n- Watch for novelty effects, SUTVA marketplace interference, and Simpson’s Paradox across traffic segments.',
    },
    {
      type: 'python-lab',
      labId: 'lab-2-2-ci',
      difficulty: 'guided',
      requires: ['confidence-intervals', 'numpy-arrays'],
      title: 'Lab 2.3A: Two-Proportion Lift, 95% Confidence Interval & P-Value',
      prompt:
        'Implement `ab_proportion_summary(c_a, n_a, c_b, n_b)` returning `(lift, ci_low, ci_high, p_value)` where `lift = p_b - p_a`, the 95% CI uses `1.96 * unpooled_se`, and `p_value` uses a two-sided pooled-proportion Z-test via `scipy.stats.norm`.',
      starterCode: `import math
from scipy.stats import norm

def ab_proportion_summary(c_a: int, n_a: int, c_b: int, n_b: int):
    p_a = c_a / n_a
    p_b = c_b / n_b
    lift = p_b - p_a
    # 1. Compute unpooled_se = sqrt(p_a*(1-p_a)/n_a + p_b*(1-p_b)/n_b)
    # 2. Compute ci_low, ci_high = lift +/- 1.96 * unpooled_se
    # 3. Compute pooled proportion, z_stat, and two-sided p_value
    pass

print(ab_proportion_summary(400, 4000, 472, 4000))`,
      testCode: `lift, lo, hi, pval = ab_proportion_summary(400, 4000, 472, 4000)
assert abs(lift - 0.018) < 1e-6
assert abs(lo - 0.00435) < 5e-4 and abs(hi - 0.03165) < 5e-4
assert 0.009 < pval < 0.011, f"Expected p ~ 0.0099, got {pval}"
_, lo2, hi2, pval2 = ab_proportion_summary(100, 1000, 102, 1000)
assert lo2 < 0 < hi2 and pval2 > 0.5
print("PASS: Lift, 95% CI, and two-sided Z-test p-value match exact theory!")`,
      solutionCode: `import math
from scipy.stats import norm

def ab_proportion_summary(c_a: int, n_a: int, c_b: int, n_b: int):
    p_a = c_a / n_a
    p_b = c_b / n_b
    lift = p_b - p_a
    se_unpooled = math.sqrt(p_a * (1.0 - p_a) / n_a + p_b * (1.0 - p_b) / n_b)
    ci_low = lift - 1.96 * se_unpooled
    ci_high = lift + 1.96 * se_unpooled
    p_pool = (c_a + c_b) / (n_a + n_b)
    se_pool = math.sqrt(p_pool * (1.0 - p_pool) * (1.0 / n_a + 1.0 / n_b))
    z_stat = lift / se_pool
    p_value = float(2.0 * (1.0 - norm.cdf(abs(z_stat))))
    return lift, ci_low, ci_high, p_value`,
      hint: 'Use unpooled variance for the lift confidence interval and pooled variance under $H_0$ for the Z-statistic.',
      hints: [
        'Compute `se_unpooled = math.sqrt(p_a * (1 - p_a) / n_a + p_b * (1 - p_b) / n_b)`.',
        'Compute `p_pool = (c_a + c_b) / (n_a + n_b)` and `z_stat = lift / math.sqrt(p_pool * (1 - p_pool) * (1/n_a + 1/n_b))`.',
        'Two-sided p-value is `2.0 * (1.0 - norm.cdf(abs(z_stat)))`.',
      ],
      packages: ['scipy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-2-2-sample-size',
      difficulty: 'spec',
      requires: ['hypothesis-testing'],
      title: 'Lab 2.3B: Pre-Launch Sample Size Calculator (Power & MDE)',
      prompt:
        'Implement `required_n_per_arm(baseline_p: float, mde: float, alpha: float = 0.05, power: float = 0.80) -> int` using normal quantiles `norm.ppf(1 - alpha / 2)` and `norm.ppf(power)` and pooled baseline variance `2 * baseline_p * (1 - baseline_p)`, rounded up via `math.ceil`.',
      starterCode: `import math
from scipy.stats import norm

def required_n_per_arm(baseline_p: float, mde: float, alpha: float = 0.05, power: float = 0.80) -> int:
    # Compute z_alpha, z_beta, numerator = ((z_alpha + z_beta)**2) * 2 * baseline_p * (1 - baseline_p)
    # Divide by mde**2 and return math.ceil(...)
    pass

print(required_n_per_arm(0.10, 0.02))`,
      testCode: `n1 = required_n_per_arm(0.10, 0.02)
n2 = required_n_per_arm(0.10, 0.01)
assert 3520 <= n1 <= 3545, f"Expected ~3532, got {n1}"
assert abs((n2 / n1) - 4.0) < 0.02, f"Halving MDE must 4x sample size, got ratio {n2/n1}"
print("PASS: Exact sample-size sizing scales cleanly with 1/MDE^2!")`,
      solutionCode: `import math
from scipy.stats import norm

def required_n_per_arm(baseline_p: float, mde: float, alpha: float = 0.05, power: float = 0.80) -> int:
    z_alpha = norm.ppf(1.0 - alpha / 2.0)
    z_beta = norm.ppf(power)
    n_float = ((z_alpha + z_beta) ** 2 * 2.0 * baseline_p * (1.0 - baseline_p)) / (mde ** 2)
    return math.ceil(n_float)`,
      hint: 'Verify `z_alpha = norm.ppf(1 - alpha / 2)` (`~1.96`) and `z_beta = norm.ppf(power)` (`~0.8416`).',
      hints: [
        'Use `norm.ppf(1.0 - alpha / 2.0)` for a two-sided test.',
        'Variance sum for two equal-sized arms near `baseline_p` is `2.0 * baseline_p * (1.0 - baseline_p)`.',
        'Return `math.ceil(((z_alpha + z_beta) ** 2 * 2.0 * baseline_p * (1.0 - baseline_p)) / (mde ** 2))`.',
      ],
      packages: ['scipy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-2-2-srm',
      difficulty: 'debug',
      requires: ['hypothesis-testing'],
      title: 'Lab 2.3C: Sample Ratio Mismatch (SRM) & Multiple-Testing Guard',
      prompt:
        'A broken reviewer checked only raw proportions (`abs(n_a - n_b) < 500`) instead of a chi-square test AND skipped Bonferroni multiple-testing adjustment! Implement `audit_experiment(n_a, n_b, p_values, expected_share_a=0.5, alpha=0.05)` returning `(srm_ok: bool, bonferroni_significant: list[bool])` where `srm_ok` is `True` iff the chi-square goodness-of-fit p-value is `>= 0.001` (`chisquare`), and `bonferroni_significant` marks each `p <= alpha / len(p_values)`.',
      starterCode: `from scipy.stats import chisquare

def audit_experiment(n_a: int, n_b: int, p_values: list[float], expected_share_a: float = 0.5, alpha: float = 0.05):
    # BUG: fixed tolerance fails completely at different traffic scales and ignores Bonferroni!
    srm_ok = abs(n_a - n_b) < 500
    bonf = [p < alpha for p in p_values]
    return srm_ok, bonf`,
      testCode: `ok1, sig1 = audit_experiment(5010, 4990, [0.008, 0.03, 0.25], alpha=0.05)
assert ok1 is True, "5010 vs 4990 on 50/50 split should pass SRM check"
assert sig1 == [True, False, False], f"With 3 metrics alpha/3=0.0167, expected [True, False, False], got {sig1}"
ok2, _ = audit_experiment(5250, 4750, [0.001], alpha=0.05)
assert ok2 is False, "5250 vs 4750 (p < 1e-6) must trigger SRM failure!"
print("PASS: SRM chi-square audit and Bonferroni guard caught telemetry skew and inflated alphas!")`,
      solutionCode: `from scipy.stats import chisquare

def audit_experiment(n_a: int, n_b: int, p_values: list[float], expected_share_a: float = 0.5, alpha: float = 0.05):
    total = n_a + n_b
    expected = [total * expected_share_a, total * (1.0 - expected_share_a)]
    _, srm_p = chisquare([n_a, n_b], f_exp=expected)
    srm_ok = bool(srm_p >= 0.001)
    cutoff = alpha / max(len(p_values), 1)
    bonf = [bool(p <= cutoff) for p in p_values]
    return srm_ok, bonf`,
      hint: 'Compare `[n_a, n_b]` against `[total * expected_share_a, total * (1 - expected_share_a)]` using `chisquare(..., f_exp=...)`.',
      hints: [
        'Call `_, srm_p = chisquare([n_a, n_b], f_exp=[total * expected_share_a, total * (1 - expected_share_a)])`.',
        'Set `srm_ok = bool(srm_p >= 0.001)` so severe split imbalances raise an immediate red flag.',
        'Compute `cutoff = alpha / len(p_values)` and return `[p <= cutoff for p in p_values]`.',
      ],
      packages: ['scipy'],
    },
  ],
  quiz: [
    {
      id: 'q2-3-1',
      type: 'multiple-choice',
      question: 'Your PM wants to detect a 1% absolute lift instead of a 2% absolute lift at the same 80% statistical power. How does required sample size change?',
      options: [
        'It doubles (2x) because MDE sits linearly in the standard error term',
        'It quadruples (4x) because sample size scales inversely with `MDE^2`',
        'It halves (0.5x) because smaller changes require tracking fewer edge users',
        'It stays unchanged so long as the baseline conversion rate stays at 10%',
      ],
      correctIndex: 1,
      explanation: 'Required sample size follows `16 * sigma^2 / MDE^2`. Halving MDE divides by `(1/2)^2 = 1/4`, multiplying needed users by `4x`.',
    },
    {
      id: 'q2-3-2',
      type: 'multiple-choice',
      question: 'A product team checks their A/B test dashboard every morning and ships early whenever `p < 0.05` appears on Day 3. What happens?',
      options: [
        'Statistical power drops immediately to zero because Control had fewer weekend impressions',
        'The sample variance becomes negative whenever cumulative p-values cross 0.05 upward',
        'Repeated optional peeking inflates the real false-positive rate well above the nominal 5% alpha',
        'Nothing goes wrong—hitting `p < 0.05` earlier proves the underlying effect is stronger',
      ],
      correctIndex: 2,
      explanation: 'Evaluating noisy cumulative streams day after day creates multiple opportunities for luck to cross `p < 0.05`, inflating false positives far above 5% unless sequential boundaries are used.',
    },
    {
      id: 'q2-3-3',
      type: 'multiple-choice',
      question: 'What is the exact meaning of having 80% statistical power (`1 - beta = 0.80`) in an experiment?',
      options: [
        '80% of total production traffic has been bucketed into the new Treatment arm',
        'If a true effect of at least size MDE exists, the experiment will detect it 80% of the time',
        'There is an 80% posterior probability that the null hypothesis is false before collecting data',
        'The expected p-value at completion is guaranteed to be less than or equal to `0.20`',
      ],
      correctIndex: 1,
      explanation: 'Power (`1 - beta`) is the probability of correctly rejecting a false null hypothesis when the true lift equals or exceeds MDE (leaving a 20% Type II false-negative rate).',
    },
    {
      id: 'q2-3-4',
      type: 'numeric',
      question: 'Using the approximation `n = 16 * p * (1 - p) / MDE^2` with `p = 0.20` (`p*(1-p) = 0.16`) and `MDE = 0.04`, how many users are needed per arm?',
      options: [],
      correctIndex: 0,
      correctNumber: 1600,
      tolerance: 1,
      unit: 'users',
      explanation: '`16 * 0.16 / (0.04^2) = 2.56 / 0.0016 = 1,600` users per arm.',
    },
    {
      id: 'q2-3-5',
      type: 'multiple-choice',
      question: 'On a configured 50/50 split, Variant A logged 52,100 users and Variant B logged 47,900 users (`SRM p < 1e-8`). What should you do?',
      options: [
        'Declare Variant A winner immediately because more users stayed engaged in the Control bucket',
        'Downsample Variant A randomly to 47,900 rows and proceed to ship whichever variant has higher conversion',
        'Ignore the ratio discrepancy since both buckets clearly exceed 30,000 samples for normal approximation',
        'Halt decision-making and debug why telemetry or assignment dropped users asymmetrically before trusting any lift',
      ],
      correctIndex: 3,
      explanation: 'SRM indicates broken randomization or asymmetric dropout (e.g., crashes/latency dropping B telemetry). Downsampling or ignoring it does not fix non-random bias.',
    },
    {
      id: 'q2-3-6',
      type: 'multi-select',
      question: 'Which two experiment designs directly prevent SUTVA marketplace spillover between drivers or riders in the same city?',
      options: [
        'Cluster randomization at the city or metro-region level instead of individual request level',
        'Time-based switchback randomization alternating Treatment and Control across non-overlapping time windows',
        'Peeking at the global p-value every 2 hours until the dashboard turns green',
        'Shuffling individual page views independently regardless of user session cookie',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'City-level cluster randomization and switchback schedules isolate shared supply/demand pools so Treatment does not cannibalize Control inside the same region.',
    },
    {
      id: 'q2-3-7',
      type: 'spot-bug',
      question: 'A team runs 20 independent secondary metric checks at `alpha = 0.05` and highlights the single metric with `p = 0.032` as a breakthrough discovery. What is wrong?',
      options: [
        'With 20 tests at `alpha = 0.05`, observing at least one `p < 0.05` happens routinely by pure luck without multiple-testing correction',
        'Secondary metrics require `p > 0.50` before they can be compared against Control conversion rates',
        'Bonferroni correction requires multiplying `alpha = 0.05` by 20 (`alpha = 1.0`) whenever 20 metrics are evaluated',
        'A two-sided p-value of `0.032` corresponds to a negative conversion lift unless `N` is an even integer',
      ],
      correctIndex: 0,
      explanation: 'Under 20 true-null tests, the probability of at least one false positive at `0.05` is `1 - 0.95^20 = 64.2%`. Bonferroni divides `alpha / 20 = 0.0025`, so `0.032` is non-significant noise.',
    },
    {
      id: 'q2-3-8',
      type: 'multiple-choice',
      question: 'Variant B beats Control A on mobile (`12% vs 10%`) AND beats Control A on desktop (`25% vs 22%`), yet blended conversion is lower for B (`14% vs 18%`). What explains this?',
      options: [
        'A syntax overflow in the pooled Z-statistic denominator whenever conversion rates exceed 20%',
        'Simpson’s Paradox caused by disproportionate traffic mix sending most B traffic to lower-converting mobile users',
        'The Central Limit Theorem breaking down whenever two cohorts differ in sample size by more than 5%',
        'Benjamini-Hochberg FDR adjustment flipping positive subgroup lifts into negative aggregate estimates',
      ],
      correctIndex: 1,
      explanation: 'Simpson’s Paradox reverses blended rankings when subgroup proportions differ sharply between variants. Stratified randomization balances device shares evenly.',
    },
    {
      id: 'q2-3-9',
      type: 'ordering',
      question: 'Order the end-to-end lifecycle of a disciplined online A/B test from design to launch decision:',
      items: [
        'Define single primary metric, latency/cost guardrails, and MDE',
        'Compute fixed sample size per arm (`16 * sigma^2 / MDE^2`) and duration (7–14 days)',
        'Launch deterministic user-level randomization and run an early SRM check',
        'Wait for full planned horizon without early stopping',
        'Evaluate primary lift, 95% confidence interval, multiple-testing corrections, and guardrails',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Always pre-register metrics and sample size, verify randomization health (SRM), respect the planned duration without peeking, and decide using both confidence intervals and guardrails.',
    },
  ],
};
