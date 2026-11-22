import type { Lesson } from '@/types/course';

export const lesson2_1: Lesson = {
  id: '2-1',
  moduleId: 'mod-2',
  number: '2.1',
  title: 'SQL in Depth: Joins, Window Functions, CTEs, Indexes & Query Plans',
  subtitle: 'Write leak-free analytical SQL using multi-table joins, window frames, chained CTEs, B-tree indexes, EXPLAIN QUERY PLAN, and normalized schemas.',
  durationMinutes: 85,
  track: 'ds',
  prerequisites: ['1.2'],
  requires: ['python-functions', 'python-files-json'],
  teaches: [
    'sql-joins',
    'sql-windows',
    'sql-ctes',
    'sql-indexes-plans',
    'sql-normalization',
  ],
  objectives: [
    'Choose INNER, LEFT, and anti-joins intentionally while detecting and preventing many-to-many join row explosions.',
    'Compute rolling aggregates, rankings, and lag intervals cleanly using SQL Window Functions (`OVER (PARTITION BY ... ORDER BY ...)`).',
    'Structure multi-stage feature extraction queries with readable Common Table Expressions (`WITH` clauses).',
    'Design normalized schemas (1NF–3NF), add composite B-tree indexes, and verify index hits with `EXPLAIN QUERY PLAN`.',
  ],
  checkWithoutNotes: [
    'Explain the exact execution order of `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `SELECT`, and `ORDER BY`—and why you cannot filter a `ROW_NUMBER()` alias in `WHERE`.',
    'If `users` has 10,000 unique rows and `sessions` has 50,000 rows, what happens if an un-deduplicated join creates duplicate keys on BOTH sides?',
    'Contrast `GROUP BY` with `OVER (PARTITION BY ...)` on a 1,000-row orders table.',
    'Why does writing `WHERE DATE(created_at) = "2025-03-01"` force a full table scan even when `created_at` has an index, and how do you rewrite it to hit the index?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why SQL Mastery Separates Working AI Engineers from Notebook Toy Builders',
      paragraphs: [
        'In tutorials, training datasets arrive as neat CSV files already sitting on disk. On an engineering team, the truth lives inside transactional relational databases such as PostgreSQL, analytical warehouses such as BigQuery or DuckDB, and audit logs stored in SQLite or Postgres tables.',
        'Whether you are assembling training labels for a churn classifier, building point-in-time historical features without future leakage, auditing retrieval logs for a RAG assistant, or debugging slow dashboard endpoints, SQL is the extraction language you run before Python ever sees a single array. Pulling three giant unjoined tables into Pandas and merging them in RAM regularly triggers out-of-memory crashes on production containers and wastes gigabytes of network transfer.',
        'Interviewers test analytical SQL relentlessly because query bugs silently corrupt downstream models. A mistaken INNER JOIN silently drops every brand-new customer who has placed zero orders, skewing your model toward heavy buyers. An un-indexed timestamp filter turns a 4-millisecond API lookup into a 12-second sequential table scan that backs up worker queues during peak traffic.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Spreadsheets vs Relational Databases vs Window Frames',
      frontendConcept: 'An Excel workbook where someone pastes customer names repeatedly on every order row and uses manual lookup formulas across tabs',
      aiConcept: 'Normalized Relational Tables (1NF–3NF), Explicit Joins, and SQL Window Frames',
      explanation:
        'Imagine a physical filing cabinet compared to a messy sticky-note wall. On a sticky-note wall (denormalized flat files), changing one customer email requires updating forty separate notes—miss one and your data contradicts itself. Relational databases normalize entities into clean single-truth tables (`users`, `orders`, `subscriptions`) connected by primary and foreign keys, then reassemble exact shapes on demand with `JOIN`, `CTE`, and `OVER (...)` window frames.',
    },
    {
      type: 'prose',
      heading: 'Schema Normalization (1NF–3NF) vs Analytical Denormalization',
      paragraphs: [
        'Operational tables follow Three Normal Forms to prevent update anomalies. First Normal Form (1NF) enforces atomic cell values and unique rows—no comma-separated lists like `"pro,enterprise"` stuffed inside one column. Second Normal Form (2NF) ensures every non-key attribute depends on the whole primary key rather than half of a composite key. Third Normal Form (3NF) removes transitive dependencies so non-key columns do not depend on other non-key columns (for instance, storing `country_currency` in a `countries` lookup table instead of duplicating it across millions of `orders` rows).',
        'Analytical warehouses intentionally break 3NF selectively by creating star-schema fact tables (`orders`) and dimension tables (`users`, `products`) or pre-joined feature marts. As an AI engineer, your rule is clear: store canonical source records in normalized tables so writes remain consistent, then use SQL `WITH` Common Table Expressions and joins to materialize clean denormalized feature snapshots for training.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Preventing Join Dropouts and Many-to-Many Explosions',
      paragraphs: [
        'Consider computing total customer lifetime spend from `users (user_id, signup_date)` and `orders (order_id, user_id, amount, status)`. A naive `INNER JOIN` removes every user with zero completed orders. Switching to `LEFT JOIN` keeps every user from the left table (`users`) and outputs `NULL` for unmatched columns on the right (`orders`). Wrapping `COALESCE(SUM(o.amount), 0.0)` turns `NULL` into `0.0`—crucial because `SUM(NULL)` returns `NULL` rather than zero, and `amount + NULL` evaluates to `NULL` in SQL.',
        'Just as dangerous is an accidental many-to-many join. Suppose `users` mistakenly contains two rows for `user_id = 42` (perhaps an old and new profile) and `orders` contains five orders for `user_id = 42`. Joining directly multiplies rows (`2 * 5 = 10`), doubling reported revenue cleanly without raising any SQL error! Always assert cardinality before joining: deduplicate or aggregate child tables inside a CTE down to one row per join key (`GROUP BY user_id`) before joining onto the parent entity.',
        'Notice also a subtle filter trap with `LEFT JOIN`: putting `WHERE o.status = \'completed\'` turns a `LEFT JOIN` back into an `INNER JOIN` because unmatched zero-order users have `o.status IS NULL`, which fails `= \'completed\'`! Move child-table filters inside the `ON` clause (`LEFT JOIN orders o ON u.user_id = o.user_id AND o.status = \'completed\'`) or filter inside a CTE before joining.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1 Output: Safe Multi-CTE Feature Aggregation',
      language: 'sql',
      code: `WITH completed_totals AS (
  SELECT
    user_id,
    COUNT(*) AS order_count,
    SUM(amount) AS total_spent
  FROM orders
  WHERE status = 'completed'
  GROUP BY user_id
)
SELECT
  u.user_id,
  u.name,
  COALESCE(ct.order_count, 0) AS order_count,
  COALESCE(ct.total_spent, 0.0) AS total_spent
FROM users u
LEFT JOIN completed_totals ct
  ON u.user_id = ct.user_id
ORDER BY total_spent DESC, u.user_id ASC;
-- Example Output:
-- (1, 'Sara', 2, 100.0)
-- (2, 'Omar', 1, 25.0)
-- (3, 'Lina', 0, 0.0)   <-- Preserved cleanly with zero orders!`,
      caption: 'Aggregating child records in a CTE guarantees 1:1 join cardinality and avoids the `WHERE` filter trap on `LEFT JOIN`.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Window Functions (`OVER`, `PARTITION BY`, `LAG`, Framing)',
      paragraphs: [
        'Regular `GROUP BY` collapses many input rows into one summary row per group. Often in machine learning feature pipelines, you must keep every original transaction row while attaching group context—such as "the customer’s rolling average over their previous 3 orders" or "days elapsed since their prior purchase." Window functions solve this cleanly without self-joins.',
        'Look closely at SQL execution order: `FROM` / `JOIN` -> `WHERE` -> `GROUP BY` -> `HAVING` -> Window Functions -> `SELECT` -> `DISTINCT` -> `ORDER BY` -> `LIMIT`. Because `WHERE` executes before Window Functions, SQL forbids writing `WHERE ROW_NUMBER() OVER (...) = 1`. Instead, compute the rank inside a `WITH ranked AS (...)` CTE and filter `WHERE rn = 1` in the outer query.',
        'Choose the right ranking function deliberately: `ROW_NUMBER()` assigns strict sequential numbers `1, 2, 3` even across ties (useful for strict deduplication); `RANK()` gives ties the same number and skips (`1, 1, 3`); `DENSE_RANK()` gives ties the same number without gaps (`1, 1, 2`). When computing rolling historical averages for ML, specify `ROWS BETWEEN 6 PRECEDING AND 1 PRECEDING` so the current row’s target amount is excluded from its own feature!',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 2: Leak-Free Rolling Features & Prior Order Lag',
      language: 'sql',
      code: `-- Compute prior-order gap and strictly historical 2-order rolling mean
SELECT
  user_id,
  order_date,
  amount,
  COALESCE(
    AVG(amount) OVER (
      PARTITION BY user_id
      ORDER BY order_date
      ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING
    ),
    0.0
  ) AS prev_2_avg_spend,
  LAG(amount) OVER (
    PARTITION BY user_id ORDER BY order_date
  ) AS prev_amount
FROM orders
WHERE status = 'completed';
-- For user 101 with orders (Jan-01: 40, Jan-10: 60, Jan-20: 100):
-- Row 1 -> prev_2_avg_spend = 0.0,  prev_amount = NULL
-- Row 2 -> prev_2_avg_spend = 40.0, prev_amount = 40.0
-- Row 3 -> prev_2_avg_spend = 50.0, prev_amount = 60.0  (current 100 excluded!)`,
      caption: 'Excluding `CURRENT ROW` via `1 PRECEDING` prevents future target leakage inside SQL feature tables.',
    },
    {
      type: 'code-builder',
      puzzleId: 'puzzle-2-1-sql',
      title: 'Warm-Up Puzzle: SQL Query Clause Order',
      prompt:
        'SQL evaluates clauses in a strict logical order. Arrange the clauses below into valid SQL syntax to aggregate completed order spend per user.',
      lines: [
        'SELECT user_id, SUM(amount) AS total_spent',
        'FROM orders',
        "WHERE status = 'completed'",
        'GROUP BY user_id',
        'ORDER BY total_spent DESC;',
      ],
      explanation:
        'Valid SQL syntax follows `SELECT` -> `FROM` -> `WHERE` (filters individual rows before grouping) -> `GROUP BY` -> `ORDER BY`, even though the engine evaluates `FROM` and `WHERE` first.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: B-Tree Indexes, SARGable Predicates, and `EXPLAIN QUERY PLAN`',
      paragraphs: [
        'Without an index, finding one user’s orders forces a sequential scan (`SCAN orders`), inspecting every single row on disk. Creating a B-tree index (`CREATE INDEX idx_orders_user_ts ON orders(user_id, created_at)`) builds a sorted balanced tree storing pointers to table rows, turning an O(N) scan into an O(log N) lookup (`SEARCH orders USING INDEX`).',
        'Composite index column order follows the leftmost-prefix rule. An index on `(user_id, created_at)` accelerates queries filtering on `user_id` alone OR on `(user_id, created_at)` together, because entries are sorted first by `user_id` and secondarily by `created_at`. However, a query filtering solely on `created_at` skips the index unless you add a separate index starting with `created_at`.',
        'Even with a proper index, wrapping an indexed column inside a function disables index search ("non-SARGable" predicate). Writing `WHERE SUBSTR(created_at, 1, 7) = \'2024-03\'` forces the engine to evaluate `SUBSTR` on every row. Rewrite it as a range scan: `WHERE created_at >= \'2024-03-01\' AND created_at < \'2024-04-01\'`, then run `EXPLAIN QUERY PLAN` in SQLite (or `EXPLAIN ANALYZE` in PostgreSQL) to confirm `SEARCH ... USING INDEX` instead of `SCAN`.',
      ],
    },
    {
      type: 'table',
      title: 'Reading `EXPLAIN QUERY PLAN` & Diagnosing Slow Queries',
      headers: ['Query Plan Signal', 'Meaning', 'Production Fix'],
      rows: [
        ['`SCAN table`', 'Full table read inspecting every row (`O(N)`)', 'Add selective index or replace function-wrapped column with half-open range filter'],
        ['`SEARCH table USING INDEX idx`', 'B-tree index lookup (`O(log N)`)', 'Healthy; inspect selectivity if millions of ties match'],
        ['`USING COVERING INDEX`', 'All `SELECT` columns satisfied inside index leaf nodes without visiting base table', 'Ideal for hot read paths and pagination'],
        ['`USE TEMP B-TREE FOR ORDER BY`', 'Engine sorts output in memory/disk because sort column mismatches index order', 'Include `ORDER BY` key in trailing composite index columns'],
      ],
    },
    {
      type: 'prose',
      heading: 'Common SQL Mistakes & How to Debug Them',
      paragraphs: [
        '1) Filtering a `LEFT JOIN` right-hand table inside `WHERE`: moving `WHERE right.flag = 1` silently discards every unmatched row from the left table (`NULL != 1`). Debug by replacing `WHERE` with `AND right.flag = 1` inside the `JOIN ... ON` clause or pre-filtering inside a CTE.',
        '2) Unintentional `NULL` propagation and `COUNT(*)` vs `COUNT(col)`: `COUNT(*)` counts rows including NULLs, whereas `COUNT(amount)` skips NULL rows, and `NOT IN (SELECT col FROM other)` returns zero rows completely if `other.col` contains a single `NULL`! Prefer `NOT EXISTS` or `LEFT JOIN ... WHERE other.key IS NULL` for anti-joins.',
        '3) Mixing `GROUP BY` non-aggregated columns: some engines reject selecting ungrouped columns; others pick an arbitrary value silently. Every column in `SELECT` must either appear in `GROUP BY` or sit inside an aggregate function (`MAX`, `SUM`, `COUNT`).',
        '4) Forgetting tie-breakers in `ROW_NUMBER()` and `LIMIT`: without a deterministic secondary sort key (such as `ORDER BY amount DESC, order_id ASC`), two equal-amount orders can swap winners across database runs and break reproducible ML exports.',
        '5) Using `ROWS BETWEEN` carelessly when duplicate timestamps exist: `RANGE BETWEEN` includes ties at the same timestamp together, whereas `ROWS BETWEEN` counts exact physical row offsets. Always understand which framing mode your downstream features expect.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 2.1 Recap: Production SQL Rules',
      body: '- Normalize source tables (1NF–3NF) to keep writes clean, then join via CTEs for ML snapshots.\n- Pre-aggregate child tables before joining to eliminate silent many-to-many row multiplication.\n- Use `OVER (PARTITION BY ... ROWS BETWEEN ... 1 PRECEDING)` for lag/rolling features without leaking current targets.\n- Prefer `NOT EXISTS` over `NOT IN` when `NULL` values can exist.\n- Inspect `EXPLAIN QUERY PLAN` and write SARGable range predicates to keep queries hitting indexes.',
    },
    {
      type: 'python-lab',
      labId: 'lab-2-1-sql',
      language: 'sql',
      difficulty: 'guided',
      requires: ['python-functions'],
      title: 'Lab 2.1A: Interactive SQL — Completed Spend per User',
      prompt:
        'Write a SQL query against the pre-loaded `orders (order_id, user_id, status, amount)` table returning `user_id` and `SUM(amount) AS total_spent` for `status = \'completed\'` orders only, grouped by `user_id` and sorted descending by `total_spent`.',
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
      hints: [
        'Row-level filtering belongs in `WHERE` before `GROUP BY`, not in `HAVING`.',
        'Add `WHERE status = \'completed\'`, then `GROUP BY user_id`, then `ORDER BY total_spent DESC`.',
        'Exact structure: `SELECT user_id, SUM(amount) AS total_spent FROM orders WHERE status = \'completed\' GROUP BY user_id ORDER BY total_spent DESC;`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-2-1-sql-join',
      language: 'sql',
      difficulty: 'spec',
      requires: ['python-functions'],
      title: 'Lab 2.1B: Interactive SQL — Safe Multi-Table LEFT JOIN',
      prompt:
        'Given `users (user_id, name)` and `orders (order_id, user_id, amount)`, note that user #3 (`Lina`) has zero orders. Write a `LEFT JOIN` query returning `u.name, COALESCE(SUM(o.amount), 0) AS total_spent` for every user, grouped by `u.user_id, u.name` and sorted by `total_spent DESC, u.user_id ASC`.',
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
      hints: [
        'Use `LEFT JOIN` so unmatched rows in `users` are preserved with `NULL` order amounts.',
        'Group by `u.user_id, u.name` so two customers with the same name never merge into one bucket.',
        'Insert `LEFT JOIN orders o ON u.user_id = o.user_id` and `GROUP BY u.user_id, u.name` above `ORDER BY`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-2-1-sql-window',
      language: 'sql',
      difficulty: 'debug',
      requires: ['python-functions'],
      title: 'Lab 2.1C: Interactive SQL — Top Order per User (CTE + Window)',
      prompt:
        'Given `orders (order_id, user_id, amount)`, fix the incomplete CTE query using `ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY amount DESC) AS rn` so it returns each user’s single largest order (`user_id, order_id, amount` where `rn = 1`), ordered by `user_id ASC`.',
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
      hint: 'Add `WHERE rn = 1` in the outer SELECT before `ORDER BY user_id ASC;`.',
      hints: [
        'Window aliases computed in a CTE behave like normal columns in the outer query.',
        'Add `WHERE rn = 1` between `FROM ranked` and `ORDER BY user_id ASC;`.',
        'Exact outer query: `SELECT user_id, order_id, amount FROM ranked WHERE rn = 1 ORDER BY user_id ASC;`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-2-1-sql-cte-index',
      language: 'sql',
      difficulty: 'challenge',
      requires: ['python-functions'],
      title: 'Lab 2.1D: EXPLAIN QUERY PLAN — Rewrite Non-SARGable Index Query',
      prompt:
        'We indexed `events(user_id, created_at)`. Writing `WHERE SUBSTR(created_at, 1, 7) = \'2024-03\'` defeats the index! Rewrite this `EXPLAIN QUERY PLAN` diagnostic query to use an indexed composite filter on `user_id = 7` and the half-open date range `created_at >= \'2024-03-01\' AND created_at < \'2024-04-01\'`, verifying the plan shows `SEARCH` with `USING INDEX` (not `SCAN`).',
      setupCode: `conn.execute("CREATE TABLE events (event_id INTEGER PRIMARY KEY, user_id INTEGER, created_at TEXT, kind TEXT)")
conn.execute("CREATE INDEX idx_events_user_ts ON events(user_id, created_at)")
conn.executemany("INSERT INTO events VALUES (?, ?, ?, ?)", [
    (1, 7, '2024-02-28', 'view'),
    (2, 7, '2024-03-05', 'click'),
    (3, 7, '2024-03-21', 'purchase'),
    (4, 8, '2024-03-11', 'click'),
])
conn.commit()`,
      starterCode: `EXPLAIN QUERY PLAN
SELECT event_id, kind
FROM events
WHERE SUBSTR(created_at, 1, 7) = '2024-03';`,
      testCode: `details = " ".join(str(r[-1]) for r in rows).upper()
assert "SEARCH" in details and "IDX_EVENTS_USER_TS" in details, f"Query must use index idx_events_user_ts via SEARCH, got plan: {rows}"
assert "SCAN" not in details, f"Must avoid full table SCAN, got plan: {rows}"
print("PASS: SARGable composite predicate hit idx_events_user_ts cleanly!")`,
      solutionCode: `EXPLAIN QUERY PLAN
SELECT event_id, kind
FROM events
WHERE user_id = 7
  AND created_at >= '2024-03-01'
  AND created_at < '2024-04-01';`,
      hint: 'Lead with the leftmost column `user_id = 7` and replace `SUBSTR(...)` with `created_at >= ... AND created_at < ...`.',
      hints: [
        'Composite index `idx_events_user_ts(user_id, created_at)` requires filtering on `user_id` first.',
        'Replace `SUBSTR(created_at, 1, 7) = \'2024-03\'` with `user_id = 7 AND created_at >= \'2024-03-01\' AND created_at < \'2024-04-01\'`.',
        'Keep `EXPLAIN QUERY PLAN` at the top so SQLite returns the index `SEARCH` plan tuple.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q2-1-1',
      type: 'multiple-choice',
      question: 'When joining `users` (10k rows) with `orders` (50k rows), your output unexpectedly balloons to 400k rows. What is the most likely bug?',
      options: [
        'You used `INNER JOIN` instead of `LEFT JOIN`, which duplicates rows whenever any order lacks a matching profile',
        'The join key had duplicate rows on both sides, creating an accidental many-to-many Cartesian explosion',
        'You omitted an `ORDER BY` clause at the end of the query, forcing SQLite to emit repeated row combinations',
        'SQL converted integer IDs to floating-point strings and matched partial decimal prefixes across tables',
      ],
      correctIndex: 1,
      explanation: 'Duplicate keys on both tables multiply row counts (`m * n`). Neither `INNER JOIN`, missing `ORDER BY`, nor integer formatting multiplies unique keys; always verify uniqueness or pre-aggregate inside a CTE first.',
    },
    {
      id: 'q2-1-2',
      type: 'spot-bug',
      question: 'Why does the query below drop every customer with zero orders despite explicitly using `LEFT JOIN`?',
      code: `SELECT u.user_id, COUNT(o.order_id) AS completed_orders
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE o.status = 'completed'
GROUP BY u.user_id;`,
      options: [
        'Because `COUNT(o.order_id)` skips rows whenever `o.order_id` is positive, shrinking the output count to zero',
        'Because SQL requires `GROUP BY` to appear above `WHERE` whenever a `LEFT JOIN` references two tables',
        'Because `WHERE o.status = \'completed\'` rejects `NULL` status rows produced by `LEFT JOIN`, turning it into an `INNER JOIN`',
        'Because table aliases `u` and `o` cannot share the same join column name `user_id` inside `ON`',
      ],
      correctIndex: 2,
      explanation: 'Unmatched left rows have `NULL` in every right-table column, and `NULL = \'completed\'` evaluates to UNKNOWN (filtered out by `WHERE`). Moving `AND o.status = \'completed\'` into `ON` fixes it; options A, B, and D describe nonexistent SQL rules.',
    },
    {
      id: 'q2-1-3',
      type: 'multiple-choice',
      question: 'What is the core behavioral difference between `GROUP BY` and Window Functions (`OVER (...)`)?',
      options: [
        'GROUP BY collapses rows into one summary row per group; Window functions preserve every row while appending group or rolling stats',
        'Window functions collapse duplicate rows automatically into one group header; GROUP BY preserves all original transaction timestamps',
        'Window functions can only calculate `COUNT(*)` over string columns, whereas GROUP BY supports numeric sums',
        'They return identical row counts whenever the table already contains a primary key index on `user_id`',
      ],
      correctIndex: 0,
      explanation: '`OVER (...)` attaches aggregates, lags, or rankings directly onto each original row without collapsing granularity, unlike `GROUP BY`. Options B, C, and D reverse or misstate these semantics.',
    },
    {
      id: 'q2-1-4',
      type: 'ordering',
      question: 'Arrange these SQL clauses into the logical execution order in which the database engine evaluates a query:',
      items: [
        'FROM & JOIN',
        'WHERE',
        'GROUP BY & HAVING',
        'Window Functions & SELECT',
        'ORDER BY & LIMIT',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'The database resolves tables/joins first, filters individual rows (`WHERE`), forms groups (`GROUP BY`/`HAVING`), evaluates window functions and `SELECT` projections, and sorts/truncates (`ORDER BY`/`LIMIT`) last.',
    },
    {
      id: 'q2-1-5',
      type: 'predict-output',
      question: 'Given `orders` amounts for user 1: `[40, 40, 20]`, what ranks does `DENSE_RANK() OVER (ORDER BY amount DESC)` output sorted highest to lowest?',
      options: [
        '`[1, 2, 3]` because every row in a window partition always gets a strictly distinct rank',
        '`[1, 1, 3]` because `DENSE_RANK` skips rank `2` after assigning a two-way tie at rank `1`',
        '`[2, 2, 1]` because sorting descending numbers ties from the bottom value upward',
        '`[1, 1, 2]` because tied values share rank `1` and the next distinct value receives `2` without gaps',
      ],
      correctIndex: 3,
      explanation: '`DENSE_RANK()` assigns ties equal ranks and increments by `1` for the next distinct value (`[1, 1, 2]`). `[1, 2, 3]` is `ROW_NUMBER()`, and `[1, 1, 3]` is `RANK()`.',
    },
    {
      id: 'q2-1-6',
      type: 'multi-select',
      question: 'Which two SQL patterns eliminate index usage or silently produce wrong results in production?',
      options: [
        'Wrapping an indexed timestamp column in `DATE(created_at)` inside a `WHERE` filter',
        'Filtering `user_id NOT IN (SELECT blocked_id FROM flags)` when `flags.blocked_id` can contain `NULL`',
        'Pre-aggregating order totals in a `WITH` CTE before `LEFT JOIN`ing onto `users`',
        'Using `COALESCE(SUM(amount), 0)` after a `LEFT JOIN` on an empty order history',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Calling functions on indexed columns disables B-tree search, and `NOT IN` against a subquery containing `NULL` yields zero matches (`x != NULL` is UNKNOWN). Pre-aggregating in CTEs and `COALESCE` are recommended safe patterns.',
    },
    {
      id: 'q2-1-7',
      type: 'multiple-choice',
      question: 'A table has composite index `idx(tenant_id, created_at)`. Which `WHERE` predicate still benefits directly from that index under the leftmost-prefix rule?',
      options: [
        '`WHERE created_at >= \'2025-01-01\'` filtering without mentioning `tenant_id` anywhere in the predicate',
        '`WHERE tenant_id = 42 AND created_at >= \'2025-01-01\'` leading cleanly with `tenant_id`',
        '`WHERE LOWER(CAST(tenant_id AS TEXT)) = \'42\'` transforming the leading column before comparison',
        '`WHERE created_at LIKE \'%2025%\'` scanning trailing substrings across all tenants simultaneously',
      ],
      correctIndex: 1,
      explanation: 'A composite B-tree on `(tenant_id, created_at)` is sorted primarily by `tenant_id`, so leading with `tenant_id = 42` plus an un-wrapped `created_at` range uses the tree directly. Leading wildcards, omitted leading columns, and wrapped expressions force scans.',
    },
    {
      id: 'q2-1-8',
      type: 'multiple-choice',
      question: 'Why does storing comma-separated tags like `"ai,rag,sql"` inside a single `skills` text column violate First Normal Form (1NF)?',
      options: [
        'Because SQL strings longer than eight characters cannot be indexed inside PostgreSQL or SQLite tables',
        'Because 1NF requires scalar/atomic values per cell rather than packed multi-value lists that break relational joins',
        'Because commas inside text columns always trigger syntax errors during `GROUP BY` aggregations',
        'Because 1NF forbids any text columns from appearing outside dedicated foreign-key lookup tables',
      ],
      correctIndex: 1,
      explanation: '1NF mandates atomic cell values (one value per cell, typically modeled via a `user_skills(user_id, skill_id)` junction table). Options A, C, and D fabricate restrictions that do not exist.',
    },
    {
      id: 'q2-1-9',
      type: 'numeric',
      question: 'Table `users` accidentally has 3 duplicate rows for `user_id = 9` and `orders` has 4 rows for `user_id = 9`. How many rows does a raw `INNER JOIN` on `user_id` emit for `user_id = 9`?',
      options: [],
      correctIndex: 0,
      correctNumber: 12,
      tolerance: 0,
      unit: 'rows',
      explanation: 'Joining `m = 3` matching left rows against `n = 4` matching right rows emits their Cartesian product `3 * 4 = 12` rows.',
    },
  ],
};
