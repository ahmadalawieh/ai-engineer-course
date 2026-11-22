import type { Lesson } from '@/types/course';

export const lesson1_6: Lesson = {
  id: '1-6',
  moduleId: 'mod-1',
  number: '1.6',
  title: 'Probability, Distributions, Confidence Intervals & Cross-Entropy',
  subtitle: 'Master Bayes base-rate intuition, probability distributions, hypothesis tests, confidence intervals, and numerically stable Softmax + Cross-Entropy—solved by hand and in NumPy.',
  durationMinutes: 75,
  track: 'core',
  prerequisites: ['1.5'],
  requires: ['python-functions', 'numpy-arrays'],
  teaches: [
    'bayes-theorem',
    'distributions',
    'confidence-intervals',
    'hypothesis-testing',
    'softmax',
    'cross-entropy',
  ],
  objectives: [
    'Compute posterior probabilities with Bayes’ theorem by hand and in NumPy without falling for the base-rate fallacy.',
    'Connect common distributions (Bernoulli, Binomial, Gaussian/Normal) to real classification outcomes and measurement noise.',
    'Compute 95% confidence intervals and interpret two-sample A/B test p-values accurately when comparing prompts or models.',
    'Implement max-shifted Softmax, Cross-Entropy loss, and Perplexity cleanly without `exp()` overflow.',
  ],
  checkWithoutNotes: [
    'If a fraud detector has 99% sensitivity and 99% specificity on data where only 0.1% of rows are true fraud, why is Precision near 9% instead of 99%?',
    'What does a 95% confidence interval around a model accuracy (`84% ± 3%`) tell you when deciding whether a new prompt actually improved quality?',
    'What are Type I (false alarm) and Type II (missed effect) errors in an A/B evaluation test?',
    'Explain mathematically why `softmax(logits - np.max(logits))` prevents overflow while returning identical probabilities.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'AI systems never operate with binary certainty—they predict **probabilities** (`churn_prob = 0.78`), compare noisy **evaluation metrics** (`Prompt B scored 86% vs Prompt A 83% on 100 test cases—is that real or coin-flip luck?`), and train on **Cross-Entropy loss**. Without basic statistical thinking, teams routinely celebrate meaningless 2% A/B fluctuations on tiny evaluation sets or deploy fraud detectors that overwhelm human reviewers with 90% false positives.',
        'At the same time, you do not need esoteric measure theory to excel as a junior AI engineer. Mastering four practical tools—**Bayes’ theorem**, **Bernoulli/Binomial/Normal distributions**, **confidence intervals & hypothesis testing**, and **stable Softmax + Cross-Entropy**—equips you to build calibrated classifiers, run rigorous eval gates, and explain model behavior clearly.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Updating Beliefs (Bayes), Measuring Uncertainty (CIs) & Measuring Surprise (Entropy)',
      paragraphs: [
        'First, think of **Bayes’ Theorem** like updating a weather forecast after stepping outside and seeing dark clouds: $P(H \\mid E) = \\frac{P(E \\mid H) P(H)}{P(E)}$. Before seeing any alert ($E$), rare events like fraud or a bug occur at a small **base rate** (**prior** $P(H)$). Even a 99%-accurate detector raises false alarms across the huge non-fraud majority! Ignoring the base rate—assuming `P(fraud | alert) == P(alert | fraud)`—is the classic **base-rate fallacy**.',
        'Second, picture **Distributions** and **Confidence Intervals**. A single coin flip or LLM eval pass/fail is a **Bernoulli($p$)** trial (mean $p$, variance $p(1-p)$). Summing $n$ independent trials gives a **Binomial($n, p$)** count; averaging many noisy trials converges to a bell-shaped **Normal (Gaussian) $\\mathcal{N}(\\mu, \\sigma^2)$** curve with standard error $\\text{SE} = \\sqrt{\\hat{p}(1 - \\hat{p}) / n}$. A **95% confidence interval** ($\\hat{p} \\pm 1.96 \\cdot \\text{SE}$) shows how wide random luck swings on sample size $n$: on only $n = 25$ eval prompts, $80\\%$ pass rate has $\\pm 16\\%$ error bars—meaning a `3%` bump is pure noise! A **hypothesis test** formalizes this: assume *Null Hypothesis* $H_0$ ("no real difference"), compute a **p-value** measuring how surprising the observed gap would be under $H_0$, and guard against **Type I errors** (shipping noise as an improvement) and **Type II errors** (missing a real gain because $n$ was too small).',
        'Third, connect **Cross-Entropy** directly to prediction confidence. Every multi-class classifier and LLM outputs raw **logits** $z$, turns them into probabilities $Q(i)$ via **Softmax**, and pays penalty $-\\log Q(y_{\\text{true}})$. Being confidently right ($Q=0.99$) costs `0.01`; being confidently wrong ($Q=0.01$) costs `4.61`! In LLMs, **Perplexity** ($e^{\\text{Cross-Entropy}}$) equals the effective number of equally likely choices the model hesitates between per token.',
      ],
    },
    {
      type: 'math',
      title: 'Bayes’ Theorem, Standard Error & Cross-Entropy Loss',
      latex: 'P(H \\mid E) = \\frac{P(E \\mid H)\\,P(H)}{P(E)} \\qquad H(P, Q) = -\\sum_i P(i)\\log Q(i) = H(P) + D_{\\text{KL}}(P \\parallel Q)',
      breakdown: [
        { symbol: 'P(H)', meaning: 'Base rate (prior prevalence) before seeing detector evidence' },
        { symbol: '\\text{SE} = \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}', meaning: 'Standard error of an eval proportion: shrinks as $\\frac{1}{\\sqrt{n}}$ (need $4\\times$ samples to halve uncertainty!)' },
        { symbol: '-\\log Q(y)', meaning: 'Cross-Entropy penalty when true class $y$ gets probability $Q(y)$' },
      ],
      intuition:
        'Minimizing Cross-Entropy equals minimizing KL divergence ($D_{\\text{KL}}$) from the true labels—pushing predicted distributions to match reality.',
    },
    {
      type: 'simulator',
      simulatorId: 'bayes-entropy',
      title: 'Interactive Lab: Bayesian Base-Rate & Cross-Entropy Explorer',
      description:
        'Test how disease/fraud prevalence affects positive predictive value (Bayes), and slide predicted probabilities $Q$ to watch Cross-Entropy & KL Divergence spike when confident predictions are wrong.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Hand-Solved Bayes Base Rate & 95% Confidence Interval in NumPy',
      paragraphs: [
        'Solve two quick realistic problems by hand first. First (**Bayes**): Out of `10,000` credit-card payments, fraud rate is `0.1%` (`10` frauds, `9,990` legitimate). Your model flags `99%` of frauds (`9.9 ≈ 10` true positives) AND falsely flags `1%` of legitimate payments (`99.9 ≈ 100` false positives). Total alerts = `110`. Therefore $P(\\text{fraud} \\mid \\text{alert}) = 10 / 110 \\approx 9.1\\%$—over `90%` of alerts are false alarms!',
        'Second (**Confidence Interval**): Suppose Prompt A passes `76` out of `100` golden eval questions ($\\hat{p} = 0.76$). Hand standard error: $\\text{SE} = \\sqrt{0.76 \\times 0.24 / 100} = \\sqrt{0.001824} \\approx 0.0427$. Margin at 95% confidence: $1.96 \\times 0.0427 \\approx 0.084$ (`±8.4%`), giving an interval `[67.6%, 84.4%]`. Notice why a naive report claiming `"79% beats 76%"` on `n=100` could easily flip on the next seed! Verify both hand results in NumPy below:',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Bayes Posterior & Wilson/Wald 95% CI in NumPy',
      language: 'python',
      code: `import numpy as np

# 1. Bayes exact calculation
prior = 0.001
sens, spec = 0.99, 0.99
p_alert = sens * prior + (1.0 - spec) * (1.0 - prior)
ppv = (sens * prior) / p_alert

# 2. 95% CI for k=76 passes out of n=100 eval prompts
n, k = 100, 76
p_hat = k / n
se = np.sqrt(p_hat * (1.0 - p_hat) / n)
ci_low, ci_high = p_hat - 1.96 * se, p_hat + 1.96 * se

print(f"Fraud PPV given alert : {ppv:.3f} ({ppv*100:.1f}%)")
print(f"Eval 95% CI (n=100)   : [{ci_low:.3f}, {ci_high:.3f}] (SE={se:.4f})")`,
      caption: 'Explained output: `Fraud PPV given alert: 0.090 (9.0%)` and `Eval 95% CI (n=100): [0.676, 0.844] (SE=0.0427)`—matching our hand arithmetic exactly!',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Numerically Stable Softmax & Two-Sample Hypothesis Check',
      paragraphs: [
        'Suppose a classifier outputs logits `[1000.0, 1001.0, 999.0]`. Computing `np.exp(1000)` directly overflows IEEE float64 (`1.8e308` max!) into `inf / inf = NaN`. Subtracting `c = np.max(logits)` leaves shifted logits `[-1.0, 0.0, -2.0]`, where every exponential lies cleanly inside `(0, 1]` while dividing cancels $e^{-c}$ algebraically so probabilities remain exact!',
        'Meanwhile, when comparing two model variants `A` (`nA`, `kA` passes) vs `B` (`nB`, `kB` passes), a pooled two-proportion **z-test** computes pooled rate $p_0 = (k_A + k_B)/(n_A + n_B)$ and standard error $\\text{SE}_0 = \\sqrt{p_0(1 - p_0)(1/n_A + 1/n_B)}$. If $|z| = |\\hat{p}_B - \\hat{p}_A| / \\text{SE}_0 \\ge 1.96$, the difference clears the classic $p < 0.05$ threshold (two-sided); otherwise it sits inside normal sampling luck.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 2: Stable Softmax, Cross-Entropy & A/B z-Score',
      language: 'python',
      code: `import numpy as np

def stable_softmax(logits: np.ndarray) -> np.ndarray:
    shifted = logits - np.max(logits)
    exps = np.exp(shifted)
    return exps / np.sum(exps)

probs = stable_softmax(np.array([1000.0, 1001.0, 999.0]))
ce_loss = -np.log(probs[1] + 1e-12)

# Two-proportion z-score comparing Prompt A (76/100) vs Prompt B (84/100)
p_a, p_b, n_a, n_b = 0.76, 0.84, 100, 100
p_pool = (76 + 84) / (n_a + n_b)
se_pool = np.sqrt(p_pool * (1 - p_pool) * (1 / n_a + 1 / n_b))
z_stat = (p_b - p_a) / se_pool

print("Stable probs:", np.round(probs, 4), "| Loss:", round(float(ce_loss), 4))
print("A/B z-stat  :", round(float(z_stat), 3), "| Significant at |z|>=1.96?", abs(z_stat) >= 1.96)`,
      caption: 'Explained output: `Stable probs: [0.2447 0.6652 0.0900] | Loss: 0.4076` and `A/B z-stat: 1.414 | Significant at |z|>=1.96? False`. A seemingly large 8-point jump on `n=100` does NOT yet clear `p < 0.05`!',
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Normal Empirical Rule, Sample Size Planning & Calibration',
      paragraphs: [
        'Two additional rules prevent expensive evaluation mistakes in production. First, for bell-shaped **Gaussian (Normal)** metrics such as request latency or score residuals with mean $\\mu$ and standard deviation $\\sigma$, roughly **68%** of points fall within $\\mu \\pm 1\\sigma$, **95%** within $\\mu \\pm 2\\sigma$, and **99.7%** within $\\mu \\pm 3\\sigma$. Flagging prompts exceeding $\\mu + 3\\sigma$ catches sudden latency spikes without triggering hourly false alarms.',
        'Second, plan A/B eval sample size **before** running experiments: approximate two-arm sample size per variant scales as $n \\approx \\frac{16 \\sigma^2}{\\text{MDE}^2}$, where $\\text{MDE}$ is the Minimum Detectable Effect you care about. Trying to detect a tiny `2%` improvement requires roughly `4×` as many prompts as detecting a `4%` jump! Finally, inspect **probability calibration**: a well-calibrated classifier whose predicted confidence is `0.80` across 100 tickets should be right roughly 80 times—whereas uncalibrated neural nets often output `0.99` even when wrong `20%` of the time, distorting downstream threshold routing.',
        'Notice also **KL divergence asymmetry** ($D_{\\text{KL}}(P \\parallel Q) \\ne D_{\\text{KL}}(Q \\parallel P)$): training Cross-Entropy minimizes $D_{\\text{KL}}(P_{\\text{data}} \\parallel Q_{\\text{model}})$, which penalizes putting near-zero probability on any real event infinitely harshly (**zero-avoiding**)—explaining why language models prefer covering valid phrasings rather than collapsing blindly to a single sentence.',
        'Consider two more practical bridges you will encounter in ML and LLMs. First, **Bayesian sequential updating** turns today\'s posterior directly into tomorrow\'s prior: if an automated spam check raises odds from `0.1%` up to `9%` (`Worked Example 1`), running a *second* independent verification signal starting with prior `0.09` jumps confidence above `90%`! Chaining multiple weak detectors beats relying on a single noisy threshold.',
        'Second, notice how **LLM `temperature` ($T$)** directly controls `softmax(logits / T)`: dividing logits by `T = 0.2` sharpens probability peaks onto the single highest-scoring token (deterministic, factual coding/extraction), whereas `T = 1.2` flattens differences across candidate tokens to increase creative variety at the risk of more hallucinations.',
        'When reading classifier metrics or binary predictions, also recognize **log-odds (`logit = log(p / (1 - p))`)**: a raw logit of `0.0` always maps cleanly to exact `50%` probability (`sigmoid(0) = 0.5`), `+2.2` maps near `90%`, and `-2.2` maps near `10%`, making threshold calibration effortless to inspect mentally.',
      ],
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Calling `np.exp(logits)` without subtracting `np.max(logits)`:** Works nicely on tiny toy `[1.0, 2.0]` arrays, then explodes into `NaN` in training the moment logits drift above `~710` (float64) or `~88` (float32). Always shift by `np.max(logits)` first.',
        '**Mistake 2 — Assuming `np.log(0.0)` returns a finite penalty:** If predicted probability rounds to exact `0.0`, `np.log(0.0)` outputs `-inf`, crashing training with `inf` loss! Always clip or add `+ 1e-12` inside `-np.log(prob + 1e-12)` (or use combined `log_softmax` directly).',
        '**Mistake 3 — Confusing `P(alert | fraud)` with `P(fraud | alert)`:** Always run Bayes with the true prevalence prior before quoting precision to stakeholders.',
        '**Mistake 4 — Peeking repeatedly at A/B tests and stopping the first day `|z| > 1.96`:** Checking daily inflates false positives (Type I errors); choose target sample size $n$ upfront using desired minimum detectable effect before launching.',
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Factor in base rates (Bayes):** Rare positive classes produce many false alarms unless precision accounts for low priors.',
        '2. **Quantify sample noise with CIs:** Standard error $\\sqrt{p(1-p)/n}$ shrinks slowly ($1/\\sqrt{n}$); tiny eval sets carry wide error bars.',
        '3. **Respect p-values without worshiping them:** Small `n` causes high Type II misses; peeking causes Type I false wins.',
        '4. **Shift Softmax by `max(logits)`:** Prevents `exp()` overflow identically in math and in code.',
        '5. **Cross-Entropy measures distribution mismatch:** Minimizing $-\\log Q(y)$ pushes calibrated probability onto true answers.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-6-1',
      difficulty: 'guided',
      requires: ['softmax', 'cross-entropy'],
      title: 'Lab 1.6.1 (Guided): Numerically Stable Softmax & Cross-Entropy',
      prompt:
        'Implement `softmax(logits)` using the max-shift stability trick (`logits - np.max(logits)`) and `cross_entropy(logits, target_idx)` returning `-float(np.log(probs[target_idx] + 1e-12))`.',
      starterCode: `import numpy as np

def softmax(logits: np.ndarray) -> np.ndarray:
    # Subtract np.max(logits) before np.exp, then divide by sum
    pass

def cross_entropy(logits: np.ndarray, target_idx: int) -> float:
    probs = softmax(logits)
    # Return -float(np.log(probs[target_idx] + 1e-12))
    pass

print("Probs:", softmax(np.array([1000.0, 1001.0, 999.0])))
print("Loss :", cross_entropy(np.array([2.0, 1.0, 0.1]), 0))`,
      testCode: `import numpy as np
p = softmax(np.array([1000.0, 1001.0, 999.0]))
assert not np.any(np.isnan(p)), "Softmax overflowed!"
assert np.isclose(p.sum(), 1.0)
assert p[1] > p[0] > p[2]

loss = cross_entropy(np.array([2.0, 1.0, 0.1]), 0)
expected = -np.log(np.exp(2.0) / (np.exp(2.0) + np.exp(1.0) + np.exp(0.1)))
assert abs(loss - expected) < 1e-5, f"Expected {expected}, got {loss}"
print("PASS: Lab 1.6.1 Stable Softmax & Cross-Entropy verified!")`,
      solutionCode: `import numpy as np

def softmax(logits: np.ndarray) -> np.ndarray:
    shifted = logits - np.max(logits)
    exps = np.exp(shifted)
    return exps / np.sum(exps)

def cross_entropy(logits: np.ndarray, target_idx: int) -> float:
    probs = softmax(logits)
    return -float(np.log(probs[target_idx] + 1e-12))`,
      hint: 'Compute `shifted = logits - np.max(logits)`, `exps = np.exp(shifted)`, and return `exps / np.sum(exps)`.',
      hints: [
        'Subtract `np.max(logits)` before `np.exp` so the largest shifted logit equals `0.0`.',
        'Divide `exps` by `np.sum(exps)` so probabilities sum to `1.0`.',
        'Inside `cross_entropy`, return `-float(np.log(probs[target_idx] + 1e-12))`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-6-2',
      difficulty: 'spec',
      requires: ['bayes-theorem', 'confidence-intervals', 'hypothesis-testing'],
      title: 'Lab 1.6.2 (From Spec): Bayes Posterior & 95% Eval Confidence Interval Calculator',
      prompt:
        'Implement two evaluation statistics helpers: 1) `bayes_ppv(prior, sensitivity, specificity)` returning $P(\\text{positive} \\mid \\text{alarm})$. 2) `eval_ci_95(successes, n)` returning `(mean, low, high)` where `mean = successes / n`, `se = math.sqrt(mean * (1 - mean) / n)`, and `low, high = mean - 1.96 * se, mean + 1.96 * se` (clamped to `[0.0, 1.0]`).',
      starterCode: `import math

def bayes_ppv(prior: float, sensitivity: float, specificity: float) -> float:
    pass

def eval_ci_95(successes: int, n: int) -> tuple[float, float, float]:
    pass`,
      testCode: `ppv = bayes_ppv(0.001, 0.99, 0.99)
assert abs(ppv - (0.00099 / (0.00099 + 0.00999))) < 1e-6, f"Got {ppv}"

mean, lo, hi = eval_ci_95(76, 100)
assert abs(mean - 0.76) < 1e-6
assert abs(lo - (0.76 - 1.96 * (0.76 * 0.24 / 100) ** 0.5)) < 1e-6
assert abs(hi - (0.76 + 1.96 * (0.76 * 0.24 / 100) ** 0.5)) < 1e-6
m2, lo2, hi2 = eval_ci_95(100, 100)
assert (m2, lo2, hi2) == (1.0, 1.0, 1.0)
print("PASS: Lab 1.6.2 Bayes PPV & 95% CI helpers passed!")`,
      solutionCode: `import math

def bayes_ppv(prior: float, sensitivity: float, specificity: float) -> float:
    tp = sensitivity * prior
    fp = (1.0 - specificity) * (1.0 - prior)
    return tp / (tp + fp)

def eval_ci_95(successes: int, n: int) -> tuple[float, float, float]:
    mean = successes / n
    se = math.sqrt(mean * (1.0 - mean) / n)
    lo = max(0.0, mean - 1.96 * se)
    hi = min(1.0, mean + 1.96 * se)
    return (mean, lo, hi)`,
      hint: 'Compute `tp = sensitivity * prior`, `fp = (1 - specificity) * (1 - prior)`, return `tp / (tp + fp)`. Clamp CI with `max(0.0, ...)` and `min(1.0, ...)`.',
      hints: [
        'Total alarms equal True Positives (`sensitivity * prior`) + False Positives (`(1 - specificity) * (1 - prior)`).',
        'Standard error is `math.sqrt(mean * (1.0 - mean) / n)`.',
        'Clamp `lo` at `0.0` and `hi` at `1.0`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-6-3',
      difficulty: 'debug',
      requires: ['softmax', 'cross-entropy', 'distributions'],
      title: 'Lab 1.6.3 (Debug Buggy Code): Fix Log-of-Zero Crash & Missing Batch Axis in Softmax',
      prompt:
        'A broken batch loss function handles a 2D array `logits_batch` of shape `(batch_size, num_classes)` and integer array `targets` of shape `(batch_size,)`. Right now: 1) `np.max(logits_batch)` takes the global scalar max across ALL rows instead of per row (`axis=1, keepdims=True`), AND `np.sum(exps)` sums across all rows instead of `axis=1, keepdims=True`, AND 2) `np.log(probs)` lacks `+ 1e-12` epsilon safety! Fix `batch_cross_entropy(logits_batch, targets)` returning the scalar mean Cross-Entropy loss across the batch.',
      starterCode: `import numpy as np

def batch_cross_entropy(logits_batch: np.ndarray, targets: np.ndarray) -> float:
    shifted = logits_batch - np.max(logits_batch)  # Bug 1: missing axis=1, keepdims=True
    exps = np.exp(shifted)
    probs = exps / np.sum(exps)                    # Bug 2: missing axis=1, keepdims=True
    rows = np.arange(len(targets))
    picked = probs[rows, targets]
    return float(-np.mean(np.log(picked)))         # Bug 3: log(0) -> inf if extreme logits!`,
      testCode: `import numpy as np
logits = np.array([
    [1000.0, 0.0, -500.0],
    [0.0, 2.0, 1.0],
])
targets = np.array([0, 1])
loss = batch_cross_entropy(logits, targets)
assert np.isfinite(loss), f"Loss must be finite, got {loss}"
# Row 0 prob[0] ~ 1.0 -> loss ~ 0.0; Row 1 -> -log(exp(2)/(1+exp(2)+exp(1)))
r1_exp = -np.log(np.exp(2.0) / (1.0 + np.exp(2.0) + np.exp(1.0)))
assert abs(loss - 0.5 * r1_exp) < 1e-5, f"Expected {0.5 * r1_exp}, got {loss}"
print("PASS: Lab 1.6.3 Batch softmax axis & log epsilon bugs fixed!")`,
      solutionCode: `import numpy as np

def batch_cross_entropy(logits_batch: np.ndarray, targets: np.ndarray) -> float:
    shifted = logits_batch - np.max(logits_batch, axis=1, keepdims=True)
    exps = np.exp(shifted)
    probs = exps / np.sum(exps, axis=1, keepdims=True)
    rows = np.arange(len(targets))
    picked = probs[rows, targets]
    return float(-np.mean(np.log(picked + 1e-12)))`,
      hint: 'Pass `axis=1, keepdims=True` to both `np.max(...)` and `np.sum(...)`, and write `np.log(picked + 1e-12)`.',
      hints: [
        'Row-wise max requires `axis=1, keepdims=True` so each example shifts independently.',
        'Row-wise denominator requires `np.sum(exps, axis=1, keepdims=True)`.',
        'Add `+ 1e-12` inside `np.log(picked + 1e-12)` so `-inf` never appears.',
      ],
      packages: ['numpy'],
    },
  ],
  quiz: [
    {
      id: 'q1-6-1',
      type: 'multiple-choice',
      question: 'A fraud detector achieves 99% sensitivity and 99% specificity, yet only 0.1% of transactions are fraud. Roughly what % of flagged alerts are actually fraud?',
      options: [
        '`99%`',
        '`~9%`',
        '`50%`',
        '`0.1%`',
      ],
      correctIndex: 1,
      explanation: 'Out of 10,000 transactions: ~10 frauds (~10 flagged TP) and ~9,990 legitimate (~100 false positive alarms). Precision = `10 / 110 ≈ 9.1%`.',
    },
    {
      id: 'q1-6-2',
      type: 'multiple-choice',
      question: 'Why does `softmax` subtract `np.max(logits)` before computing `np.exp`?',
      options: [
        'To force every predicted class probability vector to sum cleanly to `0.0`',
        'To keep exponents $\\le 0$ so `exp()` avoids `inf`/`NaN` overflow',
        'To convert Softmax probability curves into piecewise-linear ReLU outputs',
        'To discard negative logits completely before computing normalization totals',
      ],
      correctIndex: 1,
      explanation: 'Subtracting a constant $c$ cancels out in $\\frac{e^{z_i - c}}{\\sum_j e^{z_j - c}}$, keeping the largest exponent equal to `0` (`exp(0) = 1.0`).',
    },
    {
      id: 'q1-6-3',
      type: 'numeric',
      question: 'If an LLM achieves an average Cross-Entropy loss of `ln(2) ≈ 0.693` nats per token, what is its Perplexity ($e^H$)?',
      options: [],
      correctIndex: 0,
      correctNumber: 2.0,
      tolerance: 0.05,
      explanation: 'Perplexity $= e^{H} = e^{\\ln 2} = 2.0$, meaning uncertainty equals choosing uniformly among `2` equally likely tokens.',
    },
    {
      id: 'q1-6-4',
      type: 'multiple-choice',
      question: 'How does increasing your golden evaluation dataset size from `n = 100` to `n = 400` change the width of a 95% confidence interval?',
      options: [
        'It shrinks the interval width down to roughly one-fourth (`1/4`) directly',
        'It leaves the interval width unchanged whenever mean accuracy stays constant',
        'It doubles the interval width to cover wider outlier distributions cleanly',
        'It cuts the interval width in half because standard error scales as $1/\\sqrt{n}$',
      ],
      correctIndex: 3,
      explanation: 'Since $\\text{SE} = \\sqrt{\\hat{p}(1-\\hat{p})/n}$, multiplying $n$ by $4$ divides $\\sqrt{n}$ by $2$, halving the margin of error.',
    },
    {
      id: 'q1-6-5',
      type: 'spot-bug',
      code: `shifted = logits_batch - np.max(logits_batch)
exps = np.exp(shifted)
probs = exps / np.sum(exps)`,
      question: 'When `logits_batch` has shape `(32, 10)` (32 examples, 10 classes), what is wrong with this code?',
      options: [
        '`np.exp` strictly fails on 2D batches unless reshaped to 1D vectors',
        '`np.max` sorts rows alphabetically before subtracting offsets',
        'Without `axis=1, keepdims=True`, probabilities sum to `1.0` across the whole batch',
        'Subtracting `np.max` flips negative logit entries into positive values',
      ],
      correctIndex: 2,
      explanation: 'Without `axis=1, keepdims=True`, `np.sum(exps)` sums over the whole batch instead of dividing each row by its own sum!',
    },
    {
      id: 'q1-6-6',
      type: 'multi-select',
      question: 'Which TWO statistical errors can distort A/B model evaluations?',
      options: [
        'Type I error: stopping early when noise briefly gives `p < 0.05` and shipping a no-op change',
        'Type II error: running on too small a sample (`n=20`), missing a genuine `+6%` improvement',
        'Using stratified sampling to keep class ratios consistent across train/test splits',
        'Computing 95% confidence intervals around pass rates before signing off',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Peeking early inflates Type I false discoveries, while underpowered `n=20` tests miss true gains (Type II error).',
    },
    {
      id: 'q1-6-7',
      type: 'predict-output',
      code: `import numpy as np
q_true = 0.01
print(round(float(-np.log(q_true)), 2))`,
      question: 'Approximately what Cross-Entropy loss is printed when predicted probability on the true class is `0.01`?',
      options: [
        '`4.61`',
        '`0.01`',
        '`1.00`',
        '`-4.61`',
      ],
      correctIndex: 0,
      explanation: '$-\\ln(0.01) = \\ln(100) \\approx 4.605$, rounding to `4.61`—a severe penalty for being 99% confident in the wrong classes.',
    },
    {
      id: 'q1-6-8',
      type: 'ordering',
      question: 'Order the steps to run an honest A/B prompt evaluation comparison:',
      options: [],
      items: [
        'Pick sample size n upfront before looking at live metrics',
        'Run both prompts A and B on the same stratified test set',
        'Compute pass rates, 95% confidence intervals, and two-sample p-value',
        'Ship Prompt B only if gain is statistically and practically meaningful',
      ],
      correctIndex: 0,
      explanation: 'Choose sample size before testing to prevent peeking, evaluate both variants on identical paired prompts, compute CIs/p-values, then ship only justified improvements.',
    },
    {
      id: 'q1-6-9',
      type: 'multiple-choice',
      question: 'Which probability distribution models the total count of `k` successful passes out of `n` independent binary eval cases each passing with probability `p`?',
      options: [
        'Poisson rate distribution',
        'Continuous uniform curve',
        'Cauchy heavy-tail family',
        'Binomial distribution',
      ],
      correctIndex: 3,
      explanation: 'A single pass/fail is Bernoulli($p$); the sum of $n$ independent identical Bernoulli trials follows Binomial($n, p$).',
    },
  ],
};
