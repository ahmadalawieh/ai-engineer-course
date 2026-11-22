import type { CourseModule } from '@/types/course';

export const module2: CourseModule = {
  id: 'mod-2',
  number: 2,
  title: 'Data Science Foundations & Statistical Inference',
  subtitle: 'Master tabular data wrangling, SQL analytical patterns, A/B testing, data leakage prevention, and business metrics.',
  track: 'ds',
  estimatedHours: 3.5,
  capstoneDeliverable: 'Design a leak-free feature pipeline & analyze a multi-segment A/B experiment.',
  lessons: [
    {
      id: '2-1',
      moduleId: 'mod-2',
      number: '2.1',
      title: 'Tabular Wrangling, Pandas & Analytical SQL',
      subtitle: 'Think in relational tables, window functions, and vectorized aggregations like a Staff Data Scientist.',
      durationMinutes: 16,
      track: 'ds',
      prerequisites: ['1.1'],
      objectives: [
        'Write vectorized Pandas/Polars transformations instead of row-by-row `.iterrows()`.',
        'Use SQL Window Functions (`ROW_NUMBER`, `LAG`, rolling averages) for feature engineering.',
        'Diagnose join explosions (many-to-many) and handle missing values systematically.',
      ],
      blocks: [
        {
          type: 'frontend-bridge',
          title: 'From Spreadsheets to Columnar DataFrames',
          frontendConcept: 'An Excel or Google Sheets table where you filter rows, sort prices, and compute column totals visually',
          aiConcept: 'Columnar DataFrames (Pandas / Polars / DuckDB) + SQL Window Functions',
          explanation:
            'Spreadsheets store and display rows visually. DataFrames store each **column** together (`id`, `spend`, `date`) so filtering or summing 5 million rows only scans the exact columns you need in milliseconds.',
        },
        {
          type: 'code',
          title: 'Production Pattern: Analytical SQL Window Functions + Pandas',
          language: 'sql',
          code: `-- Compute 7-day rolling spend & previous order gap per user WITHOUT collapsing rows
SELECT
  user_id,
  order_date,
  amount,
  AVG(amount) OVER (
    PARTITION BY user_id
    ORDER BY order_date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS rolling_7d_avg,
  order_date - LAG(order_date) OVER (
    PARTITION BY user_id ORDER BY order_date
  ) AS days_since_prev_order
FROM orders
WHERE status = 'completed';`,
          caption: 'Window functions (`OVER (PARTITION BY ...)`) are asked in almost every Data Science technical screen.',
        },
        {
          type: 'prose',
          heading: 'Missing Data Mechanisms (MCAR, MAR, MNAR)',
          paragraphs: [
            'Never blindly call `.dropna()` or `.fillna(0)`! First ask **why** a value is missing:',
            '**MCAR** (Missing Completely at Random): sensor dropped a packet; safe to impute. **MAR** (Missing at Random): missingness depends on another observed column (e.g., older users skip a field); impute conditioned on group or use tree models. **MNAR** (Missing Not at Random): high earners refuse to report income—**the fact it is missing is itself a signal!** Add a binary `is_missing` indicator column before imputing.',
          ],
        },
        {
          type: 'code-builder',
          puzzleId: 'puzzle-2-1-sql',
          title: 'Warm-Up Puzzle: SQL Query Clause Order',
          prompt:
            'SQL evaluates clauses in a strict order. Tap the clauses below into valid SQL execution order to aggregate completed order spend per user.',
          lines: [
            'SELECT user_id, SUM(amount) AS total_spent',
            'FROM orders',
            "WHERE status = 'completed'",
            'GROUP BY user_id',
            'ORDER BY total_spent DESC;',
          ],
          explanation:
            'Valid SQL always flows `SELECT` → `FROM` → `WHERE` (filter rows before grouping) → `GROUP BY` → `ORDER BY`!',
        },
        {
          type: 'python-lab',
          labId: 'lab-2-1-sql',
          language: 'sql',
          title: 'Lab 2.1A: Interactive SQL — Completed Spend per User',
          prompt:
            'Practice real SQL right in your browser! We pre-loaded an `orders` table (`order_id, user_id, status, amount`). Write a SQL query that returns `user_id` and `SUM(amount) AS total_spent` for `status = \'completed\'` orders only, grouped by `user_id` and sorted from highest `total_spent` to lowest.',
          setupCode: `conn.execute("CREATE TABLE orders (order_id INTEGER, user_id INTEGER, status TEXT, amount REAL)")
conn.executemany("INSERT INTO orders VALUES (?, ?, ?, ?)", [
    (1, 101, 'completed', 50.0),
    (2, 102, 'completed', 120.0),
    (3, 101, 'refunded', 999.0),
    (4, 102, 'completed', 60.0),
    (5, 101, 'completed', 40.0),
    (6, 103, 'cancelled', 75.0),
])
conn.commit()`,
          starterCode: `SELECT
  user_id,
  SUM(amount) AS total_spent
FROM orders
-- Filter WHERE status = 'completed'
-- GROUP BY user_id
-- ORDER BY total_spent DESC
;`,
          testCode: `assert len(rows) == 2, f"Expected 2 users with completed orders, got {len(rows)} rows: {rows}"
assert rows[0][0] == 102 and abs(rows[0][1] - 180.0) < 1e-6, f"Top spender should be user 102 with 180.0, got {rows[0]}"
assert rows[1][0] == 101 and abs(rows[1][1] - 90.0) < 1e-6, f"Second should be user 101 with 90.0, got {rows[1]}"
print("PASS: SQL query filtered refunded/cancelled rows and aggregated accurately!")`,
          solutionCode: `SELECT
  user_id,
  SUM(amount) AS total_spent
FROM orders
WHERE status = 'completed'
GROUP BY user_id
ORDER BY total_spent DESC;`,
          hint: 'Put `WHERE status = \'completed\'` before `GROUP BY user_id`, and `ORDER BY total_spent DESC` at the end.',
          packages: [],
        },
        {
          type: 'python-lab',
          labId: 'lab-2-1-sql-join',
          language: 'sql',
          title: 'Lab 2.1B: Interactive SQL — Safe Multi-Table LEFT JOIN',
          prompt:
            'We pre-loaded `users (user_id, name)` and `orders (order_id, user_id, amount)`. Notice user #3 (`Lina`) has **zero** orders! Write a `LEFT JOIN` query returning `u.name, COALESCE(SUM(o.amount), 0) AS total_spent` for **every** user, grouped by `u.user_id, u.name` and sorted by `total_spent DESC, u.user_id ASC`.',
          setupCode: `conn.execute("CREATE TABLE users (user_id INTEGER, name TEXT)")
conn.execute("CREATE TABLE orders (order_id INTEGER, user_id INTEGER, amount REAL)")
conn.executemany("INSERT INTO users VALUES (?, ?)", [(1, 'Sara'), (2, 'Omar'), (3, 'Lina')])
conn.executemany("INSERT INTO orders VALUES (?, ?, ?)", [(10, 1, 40.0), (11, 1, 60.0), (12, 2, 25.0)])
conn.commit()`,
          starterCode: `SELECT
  u.name,
  COALESCE(SUM(o.amount), 0) AS total_spent
FROM users u
-- LEFT JOIN orders o ON u.user_id = o.user_id
-- GROUP BY u.user_id, u.name
ORDER BY total_spent DESC, u.user_id ASC;`,
          testCode: `assert len(rows) == 3, f"Expected all 3 users (including 0-order Lina), got {len(rows)} rows"
assert rows[0][0] == 'Sara' and abs(rows[0][1] - 100.0) < 1e-6, f"Expected Sara=100.0, got {rows[0]}"
assert rows[1][0] == 'Omar' and abs(rows[1][1] - 25.0) < 1e-6, f"Expected Omar=25.0, got {rows[1]}"
assert rows[2][0] == 'Lina' and abs(rows[2][1] - 0.0) < 1e-6, f"Expected Lina=0.0, got {rows[2]}"
print("PASS: LEFT JOIN + COALESCE kept zero-order users cleanly!")`,
          solutionCode: `SELECT
  u.name,
  COALESCE(SUM(o.amount), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
GROUP BY u.user_id, u.name
ORDER BY total_spent DESC, u.user_id ASC;`,
          hint: 'Use `LEFT JOIN orders o ON u.user_id = o.user_id` before `GROUP BY u.user_id, u.name`. `COALESCE(..., 0)` turns `NULL` into `0`.',
          packages: [],
        },
        {
          type: 'python-lab',
          labId: 'lab-2-1-sql-window',
          language: 'sql',
          title: 'Lab 2.1C: Interactive SQL — Top Order per User (Window Function)',
          prompt:
            'A classic Mid-Senior SQL interview task! Given `orders (order_id, user_id, amount)`, use a CTE with `ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY amount DESC) AS rn` to return each user’s **single largest order** (`user_id, order_id, amount` where `rn = 1`), ordered by `user_id ASC`.',
          setupCode: `conn.execute("CREATE TABLE orders (order_id INTEGER, user_id INTEGER, amount REAL)")
conn.executemany("INSERT INTO orders VALUES (?, ?, ?)", [
    (1, 101, 20.0),
    (2, 101, 95.0),
    (3, 101, 50.0),
    (4, 102, 45.0),
    (5, 102, 110.0),
])
conn.commit()`,
          starterCode: `WITH ranked AS (
  SELECT
    user_id,
    order_id,
    amount,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY amount DESC) AS rn
  FROM orders
)
SELECT user_id, order_id, amount
FROM ranked
-- Filter WHERE rn = 1
ORDER BY user_id ASC;`,
          testCode: `assert len(rows) == 2, f"Expected 1 top row per user (2 rows), got {len(rows)}"
assert tuple(rows[0]) == (101, 2, 95.0), f"User 101 top order should be (101, 2, 95.0), got {rows[0]}"
assert tuple(rows[1]) == (102, 5, 110.0), f"User 102 top order should be (102, 5, 110.0), got {rows[1]}"
print("PASS: Window function ROW_NUMBER() ranked each user's top order!")`,
          solutionCode: `WITH ranked AS (
  SELECT
    user_id,
    order_id,
    amount,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY amount DESC) AS rn
  FROM orders
)
SELECT user_id, order_id, amount
FROM ranked
WHERE rn = 1
ORDER BY user_id ASC;`,
          hint: 'Simply add `WHERE rn = 1` before `ORDER BY user_id ASC;` to keep only the #1 ranked order per user.',
          packages: [],
        },
        {
          type: 'python-lab',
          labId: 'lab-2-1',
          title: 'Lab 2.1: Group-By Aggregation & Missing Value Imputation',
          prompt:
            'Without external libraries (pure Python + NumPy), implement `group_mean_impute(groups, values)` where `values` contains `np.nan` entries. Replace each `np.nan` with the mean of its **own group** (or global mean if an entire group is `NaN`).',
          starterCode: `import numpy as np

def group_mean_impute(groups: np.ndarray, values: np.ndarray) -> np.ndarray:
    out = values.astype(float).copy()
    global_mean = float(np.nanmean(out))
    # For each unique group in np.unique(groups):
    # compute np.nanmean for that group's values (fallback to global_mean if all NaN)
    # fill np.isnan entries in that group
    return out

g = np.array(['A', 'A', 'B', 'B', 'B'])
v = np.array([10.0, np.nan, 20.0, 40.0, np.nan])
print(group_mean_impute(g, v))`,
          testCode: `import numpy as np
g = np.array(['A', 'A', 'B', 'B', 'C'])
v = np.array([10.0, np.nan, 20.0, 40.0, np.nan])
res = group_mean_impute(g, v)
assert np.isclose(res[1], 10.0), f"Group A NaN should be 10.0, got {res[1]}"
assert np.isclose(res[4], 70.0 / 3.0), f"All-NaN group C should fallback to global mean, got {res[4]}"
assert not np.any(np.isnan(res)), "No NaNs may remain"
print("PASS: Group-aware imputation handled edge cases cleanly!")`,
          solutionCode: `import numpy as np

def group_mean_impute(groups: np.ndarray, values: np.ndarray) -> np.ndarray:
    out = values.astype(float).copy()
    global_mean = float(np.nanmean(out))
    for grp in np.unique(groups):
        mask = groups == grp
        grp_vals = out[mask]
        valid = grp_vals[~np.isnan(grp_vals)]
        fill = float(valid.mean()) if len(valid) > 0 else global_mean
        out[mask & np.isnan(out)] = fill
    return out`,
          hint: 'Use boolean masks `mask = (groups == grp)` and `np.isnan(out)` to target only the missing items within each group.',
          packages: ['numpy'],
        },
      ],
      quiz: [
        {
          id: 'q2-1-1',
          question: 'When joining `users` (10k rows) with `orders` (50k rows), your output unexpectedly balloons to 400k rows. What is the most likely bug?',
          options: [
            'You used `INNER JOIN` instead of `LEFT JOIN`',
            'The join key had duplicates on both sides (accidental many-to-many Cartesian explosion)',
            'You forgot an `ORDER BY` clause',
            'SQL converted integers to floats',
          ],
          correctIndex: 1,
          explanation: 'Duplicate keys on both tables multiply row counts ($m \\times n$). Always assert key uniqueness before joining!',
        },
        {
          id: 'q2-1-2',
          question: 'Users who default on loans frequently leave the "Monthly Income" field blank. Which missingness type is this and how should you handle it?',
          options: [
            'MCAR — drop those rows immediately',
            'MNAR — add an `income_is_missing` binary feature before imputing',
            'MAR — replace with `0` only',
            'Noise — shuffle the column',
          ],
          correctIndex: 1,
          explanation: 'Missingness correlates with the unobserved value itself (MNAR), so preserving the missingness flag retains predictive signal.',
        },
        {
          id: 'q2-1-3',
          question: 'What differentiates SQL `GROUP BY` from SQL Window Functions (`OVER (...)`)?',
          options: [
            'Window functions collapse rows into one row per group; GROUP BY keeps all rows',
            'GROUP BY collapses rows into one row per group; Window functions keep every original row while computing group/rolling stats',
            'Window functions only work on strings',
            'They are identical in behavior',
          ],
          correctIndex: 1,
          explanation: 'Window functions append aggregate/lagged values alongside each row without reducing granularity.',
        },
      ],
    },
    {
      id: '2-2',
      moduleId: 'mod-2',
      number: '2.2',
      title: 'Statistical Inference, Hypothesis Testing & A/B Testing',
      subtitle: 'Run rigorous online experiments without falling for p-hacking, peeking, or Simpson’s Paradox.',
      durationMinutes: 18,
      track: 'ds',
      prerequisites: ['1.4', '2.1'],
      objectives: [
        'Explain p-values, confidence intervals, Type I ($\\alpha$) vs Type II ($\\beta$) errors, and statistical power.',
        'Calculate required sample size (MDE) before launching an A/B test.',
        'Prevent classic experiment failures: peeking, novelty effects, network spillover, and multiple testing.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'What a P-Value Actually Means (and What It Does Not)',
          paragraphs: [
            'A **p-value** is NOT "the probability that the null hypothesis is true." It is: **assuming there is truly zero effect ($H_0$), what is the probability of observing a difference at least this extreme by pure luck?**',
            'With $p < 0.05$ ($\\alpha = 0.05$), if you run 20 completely useless A/A tests, **1 of them will look "statistically significant" purely by chance**. That is why multiple-testing correction (Bonferroni or Benjamini-Hochberg FDR) and pre-registering one primary metric matter.',
          ],
        },
        {
          type: 'math',
          title: 'Two-Sample Z-Test & Sample Size Formula',
          latex: 'n \\approx \\frac{16 \\, \\sigma^2}{\\Delta^2} \\quad (\\text{for } \\alpha=0.05, \\text{ power } 1-\\beta=0.80) \\qquad z = \\frac{\\hat{p}_B - \\hat{p}_A}{\\sqrt{\\hat{p}(1-\\hat{p})(\\frac{1}{n_A} + \\frac{1}{n_B})}}',
          breakdown: [
            { symbol: '\\sigma^2', meaning: 'Variance of the metric (for conversion rate $p$, $\\sigma^2 = p(1-p)$)' },
            { symbol: '\\Delta', meaning: 'Minimum Detectable Effect (MDE)—smallest lift worth shipping' },
            { symbol: '1 - \\beta', meaning: 'Statistical power (typically 80%): chance of catching a real lift when it exists' },
          ],
          intuition:
            'Look at $\\Delta^2$ in the denominator: **cutting your Minimum Detectable Effect in half requires 4× as many users!** Always compute sample size *before* running the experiment—never stop early just because $p$ dipped below $0.05$ on Day 2 ("peeking").',
        },
        {
          type: 'simulator',
          simulatorId: 'ab-test',
          title: 'Interactive Lab: A/B Test Power, MDE & P-Value Simulator',
          description:
            'Adjust baseline conversion rate, desired lift (MDE), and sample size per variant to watch sampling distributions separate, statistical power rise, and required test duration update.',
        },
        {
          type: 'callout',
          variant: 'interview',
          title: 'Classic DS Interview Traps in Experimentation',
          body: '1) **Novelty Effect**: users click a bright new button on Day 1, then ignore it—run tests for full weekly cycles (7–14 days). 2) **Network Effects / SUTVA violation**: in ridesharing or social feeds, Variant B steals supply from Variant A—use cluster or switchback randomization. 3) **Simpson’s Paradox**: B wins on mobile AND desktop separately, yet loses overall because traffic mix was imbalanced.',
        },
      ],
      quiz: [
        {
          id: 'q2-2-1',
          question: 'Your PM wants to detect a 1% relative lift instead of a 2% relative lift at the same 80% power. How does required sample size change?',
          options: ['Doubles (2×)', 'Quadruples (4×)', 'Halves (0.5×)', 'Stays the same'],
          correctIndex: 1,
          explanation: 'Sample size scales inversely with the square of the MDE ($1/\\Delta^2$). Half the MDE requires $2^2 = 4\\times$ the traffic.',
        },
        {
          id: 'q2-2-2',
          question: 'A product team checks their A/B test dashboard every morning and ships as soon as `p < 0.05` appears on Day 3. What goes wrong?',
          options: [
            'Statistical power drops to 0%',
            'Repeated peeking inflates the actual false-positive rate far above 5%',
            'The sample variance becomes negative',
            'Nothing—early significance is always stronger',
          ],
          correctIndex: 1,
          explanation: 'Optional stopping ("peeking") tests multiple hypotheses across time, pushing false positives from 5% up to 20–30%+ unless sequential testing (e.g. mSPRT) is used.',
        },
        {
          id: 'q2-2-3',
          question: 'You have 80% statistical power. What does that mean?',
          options: [
            '80% of your users are in the treatment group',
            'If a true effect of size $\\ge$ MDE exists, the experiment will detect it 80% of the time (20% Type II false-negative rate)',
            'There is an 80% chance the null hypothesis is false',
            'The p-value is 0.20',
          ],
          correctIndex: 1,
          explanation: 'Power ($1 - \\beta$) is the probability of correctly rejecting a false null hypothesis.',
        },
      ],
    },
    {
      id: '2-3',
      moduleId: 'mod-2',
      number: '2.3',
      title: 'Feature Engineering & Preventing Data Leakage',
      subtitle: 'Garbage features beat genius models down; clean features and leak-free splits win Kaggle and production.',
      durationMinutes: 16,
      track: 'ds',
      prerequisites: ['2.1'],
      objectives: [
        'Spot and eliminate the 3 deadliest forms of data leakage (preprocessing leak, temporal leak, target proxy leak).',
        'Choose proper encodings (One-Hot vs Target Encoding vs Cyclical Sin/Cos) and scalers.',
        'Build time-aware train/validation splits.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Data Leakage: The Silent Model Killer',
          paragraphs: [
            '**Data leakage** happens whenever information from the validation/test set or the future accidentally sneaks into training features. Your model looks like 99% AUC in notebooks—and collapses to random guessing in production.',
            'Three classic leaks: **1) Preprocessing Leak**: calling `scaler.fit_transform(X)` *before* `train_test_split` leaks test mean/variance into train. **2) Temporal Leak**: randomly splitting time-series transactions lets Tuesday’s data predict Monday. **3) Target Proxy Leak**: using `account_cancellation_reason` to predict churn (that column only gets populated *after* churn!).',
          ],
        },
        {
          type: 'table',
          title: 'Feature Encoding & Scaling Playbook',
          headers: ['Feature Type', 'Transform', 'Tree Models Need It?', 'Linear / Neural Nets Need It?'],
          rows: [
            ['Skewed positive ($\\text{income}$, $\\text{latency}$)', '`np.log1p(x)`', 'Optional (helps sometimes)', 'Yes — tames extreme outliers'],
            ['Continuous numeric', '`StandardScaler` / `RobustScaler`', 'No (trees are scale-invariant)', 'Yes — essential for GD convergence'],
            ['Low-cardinality category (<15)', 'One-Hot Encoding', 'Optional', 'Yes'],
            ['High-cardinality (`zip_code`, `merchant_id`)', 'Out-of-fold Target Encoding / Embeddings', 'Yes (avoids sparse blowup)', 'Yes (Entity Embeddings)'],
            ['Cyclical (`hour`, `month`)', '`sin(2*pi*h/24), cos(...)`', 'Helpful', 'Yes (23:59 is adjacent to 00:00)'],
          ],
        },
        {
          type: 'python-lab',
          labId: 'lab-2-3',
          title: 'Lab 2.3: Leak-Free Train/Test Scaling',
          prompt:
            'Fix the classic preprocessing leak! Implement `leak_free_scale(X_train, X_test)` so that scaling parameters (`mean`, `std`) are fit **strictly on `X_train`** and applied to both `X_train` and `X_test`.',
          starterCode: `import numpy as np

def leak_free_scale(X_train: np.ndarray, X_test: np.ndarray):
    # Compute mean & std ONLY on X_train (axis=0, keepdims=True)
    # Transform both X_train and X_test using train stats
    pass

tr = np.array([[10.0, 1.0], [20.0, 3.0]])
te = np.array([[100.0, 5.0]])
print(leak_free_scale(tr, te))`,
          testCode: `import numpy as np
tr = np.array([[10.0, 1.0], [20.0, 3.0]])
te = np.array([[100.0, 5.0]])
tr_s, te_s = leak_free_scale(tr, te)
assert np.allclose(tr_s.mean(axis=0), 0.0), "Train must have mean 0"
assert np.allclose(te_s, [[17.0, 3.0]]), f"Test must be scaled by train stats (mean=15, std=5 -> (100-15)/5=17), got {te_s}"
print("PASS: Zero leakage from test set into scaling statistics!")`,
          solutionCode: `import numpy as np

def leak_free_scale(X_train: np.ndarray, X_test: np.ndarray):
    mean = X_train.mean(axis=0, keepdims=True)
    std = np.where(X_train.std(axis=0, keepdims=True) == 0, 1.0, X_train.std(axis=0, keepdims=True))
    return (X_train - mean) / std, (X_test - mean) / std`,
          hint: 'Never combine `X_train` and `X_test` before computing `mean` and `std`. Fit once on train, transform both.',
          packages: ['numpy'],
        },
      ],
      quiz: [
        {
          id: 'q2-3-1',
          question: 'You are predicting 30-day customer churn using historical daily logs. Which split strategy is valid?',
          options: [
            'Randomly shuffle all rows 80/20',
            'Time-based split (train on Jan–Aug, validate on Sep–Oct) grouped/cut by timestamp',
            'Stratified split across individual daily rows',
            'Split after running SMOTE oversampling on the full dataset',
          ],
          correctIndex: 1,
          explanation: 'Random splits leak future customer trajectories into the past; SMOTE before splitting leaks synthetic test clones into train!',
        },
        {
          id: 'q2-3-2',
          question: 'Why does naive Target Encoding (replacing `city` with global mean churn per city) overfit severely unless done out-of-fold with smoothing?',
          options: [
            'Rare categories with 1–2 rows memorize their own target label directly',
            'It turns strings into complex numbers',
            'Target encoding only works on regression',
            'It removes all variance from numeric features',
          ],
          correctIndex: 0,
          explanation: 'If a zip code appears once and churned, naive target encoding sets its feature to 1.0—a direct target leak unless smoothed & computed out-of-fold.',
        },
        {
          id: 'q2-3-3',
          question: 'Which model family typically does NOT require feature scaling (`StandardScaler`) to train well?',
          options: [
            'Logistic Regression with L2 penalty',
            'K-Means Clustering',
            'Decision Trees / Random Forests / XGBoost',
            'Multi-Layer Perceptrons (Neural Networks)',
          ],
          correctIndex: 2,
          explanation: 'Tree splits only check monotonic thresholds (`x > c`), so multiplying a feature by 1,000 does not change split order.',
        },
      ],
    },
    {
      id: '2-4',
      moduleId: 'mod-2',
      number: '2.4',
      title: 'Evaluation Metrics, Imbalanced Data & Business ROI',
      subtitle: 'Why accuracy lies on imbalanced datasets and how to pick thresholds that maximize business profit.',
      durationMinutes: 16,
      track: 'ds',
      prerequisites: ['2.2'],
      objectives: [
        'Calculate Precision, Recall, F1, ROC-AUC, and PR-AUC from a confusion matrix.',
        'Explain why PR-AUC beats ROC-AUC on rare events (fraud, anomalies, clicks).',
        'Map classifier thresholds directly to expected dollar value / asymmetric error costs.',
      ],
      blocks: [
        {
          type: 'prose',
          heading: 'Accuracy Is Broken for 99% of Real-World Problems',
          paragraphs: [
            'If 99.5% of credit card transactions are legitimate, a model that hardcodes `return False` gets **99.5% accuracy** and catches **0% of fraud**. Whenever classes are imbalanced, look at **Precision** (when it alarms, how often is it right?) and **Recall** (of all real positives, how many did it catch?).',
            'Also know when to prefer **PR-AUC** (Precision-Recall) over **ROC-AUC**: ROC uses False Positive Rate ($\\text{FP} / \\text{all negatives}$). When negatives number in the millions, even 10,000 false alarms barely nudge FPR—making ROC-AUC look deceptively rosy. Precision immediately exposes those false alarms!',
          ],
        },
        {
          type: 'math',
          title: 'Classification & Regression Core Metrics',
          latex: '\\text{Precision} = \\frac{TP}{TP + FP} \\qquad \\text{Recall} = \\frac{TP}{TP + FN} \\qquad F_1 = \\frac{2 \\cdot P \\cdot R}{P + R}',
          breakdown: [
            { symbol: 'TP, FP, FN', meaning: 'True Positives, False Positives (false alarms), False Negatives (missed cases)' },
            { symbol: 'F_1', meaning: 'Harmonic mean of Precision and Recall (punishes extreme imbalance between them)' },
            { symbol: '\\text{RMSE vs MAE}', meaning: 'RMSE ($\\sqrt{\\text{mean}(e^2)}$) heavily penalizes outliers; MAE ($\\text{mean}|e|$) predicts the median and tolerates outliers' },
          ],
          intuition:
            'In production, you rarely use the default `0.5` probability threshold! If missing fraud costs \\$500 (FN) and an SMS check costs \\$2 (FP), your optimal threshold is around `2 / 500 = 0.004`, not `0.5`!',
        },
        {
          type: 'simulator',
          simulatorId: 'roc-threshold',
          title: 'Interactive Lab: Classification Threshold, Confusion Matrix & Cost Optimizer',
          description:
            'Drag the decision threshold between `0.05` and `0.95` and customize False Positive vs False Negative costs to see Precision, Recall, F1, ROC point, and total business profit shift live.',
        },
      ],
      quiz: [
        {
          id: 'q2-4-1',
          question: 'You are building an early cancer screening test where missing a sick patient (FN) is catastrophic compared to ordering a cheap follow-up scan (FP). Which metric should you prioritize?',
          options: ['Precision', 'Specificity', 'Recall (Sensitivity) at an acceptable Precision floor', 'Accuracy'],
          correctIndex: 2,
          explanation: 'High Recall minimizes False Negatives (missed diagnoses). You tune the probability threshold down to catch nearly all true cases.',
        },
        {
          id: 'q2-4-2',
          question: 'With 1,000,000 negatives and 100 positives, why can a model achieve 0.96 ROC-AUC while still being unusable in production?',
          options: [
            'Because a 1% False Positive Rate equals 10,000 false alarms for only 100 real positives (~1% precision!)',
            'Because ROC-AUC cannot handle binary labels',
            'Because 0.96 is worse than random guessing',
            'Because ROC-AUC ignores True Positives',
          ],
          correctIndex: 0,
          explanation: 'When negatives dwarf positives, tiny FPR translates to huge absolute FP counts, crushing Precision—which PR-AUC reveals.',
        },
        {
          id: 'q2-4-3',
          question: 'When predicting house prices in a neighborhood with a few $50M ultra-luxury mansions, which regression loss is least distorted by those extreme outliers?',
          options: ['RMSE', 'MSE', 'MAE (L1 Loss)', 'R-squared'],
          correctIndex: 2,
          explanation: 'MSE/RMSE squares errors, making a single $40M outlier dominate the gradient; MAE grows linearly and estimates the conditional median.',
        },
      ],
    },
  ],
};
