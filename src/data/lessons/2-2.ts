import type { Lesson } from '@/types/course';
import { MESSY_CUSTOMERS_CSV } from '../datasets/messy_customers';

export const lesson2_2: Lesson = {
  id: '2-2',
  moduleId: 'mod-2',
  number: '2.2',
  title: 'Pandas in Depth, Time Series & EDA on Messy Data',
  subtitle: 'Clean dirty real-world CSVs, validate joins, analyze missingness mechanisms (MCAR/MAR/MNAR), and engineer leak-free time-series features.',
  durationMinutes: 90,
  track: 'ds',
  prerequisites: ['2.1'],
  requires: ['sql-joins', 'numpy-arrays', 'python-exceptions'],
  teaches: [
    'pandas-wrangling',
    'pandas-groupby-merge',
    'missing-data-mcar-mar-mnar',
    'pandas-timeseries',
    'eda-workflow',
  ],
  objectives: [
    'Run a repeatable 6-step Exploratory Data Analysis (EDA) audit on messy real-world CSV and JSON datasets.',
    'Diagnose missingness types (MCAR, MAR, MNAR) and implement group-aware imputation with missingness flags.',
    'Use vectorized Pandas `groupby().agg()`, `groupby().transform()`, and `pd.merge(..., validate=...)` safely.',
    'Parse dirty timestamps, align intervals with `.resample()`, and compute leak-free `.shift(1)` rolling time-series features.',
  ],
  checkWithoutNotes: [
    'Explain the behavioral difference between `df.groupby("tier")["spend"].mean()` and `df.groupby("tier")["spend"].transform("mean")`.',
    'Name the three missingness mechanisms (MCAR, MAR, MNAR) and explain why MNAR requires a binary `is_missing` indicator column before imputing.',
    'How does `pd.merge(..., validate="one_to_many")` protect your pipeline from silent join duplication?',
    'Why must a 7-day rolling spend feature call `.shift(1)` before `.rolling(...)` when predicting whether today’s order is fraudulent?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Real-World Datasets Break Clean-Notebook Assumptions',
      paragraphs: [
        'In production AI and analytics teams, your hardest bugs rarely stem from choosing between two gradient boosting hyperparameters. They come from messy ingestion files: duplicate primary keys exported twice during a billing retry, currency strings containing dollar signs and commas (`"$1,250.50"`), ages entered as `-4` or `205`, mixed date formats (`2024-02-03` alongside `04/18/2024`), inconsistent categorical casing (`"us"`, `"USA"`, `"U.S."`), and silent null markers (`"N/A"`, `"null"`, empty strings).',
        'If you jump straight to `model.fit()` before profiling shape, primary-key uniqueness, value ranges, and missingness semantics, Pandas silently casts numeric columns to `object` strings, `pd.merge()` quietly multiplies row counts, and `.dropna()` deletes precisely the high-risk customers you needed to detect. A disciplined Exploratory Data Analysis (EDA) workflow turns raw chaos into an explicit data contract.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: Columnar DataFrames vs Excel Pivot Tables',
      frontendConcept: 'Clicking through Excel tabs to sort columns, highlight blanks red, and run VLOOKUP + Pivot Tables manually',
      aiConcept: 'Vectorized Pandas DataFrames, `groupby.transform()`, and Explicit Schema Validation',
      explanation:
        'Spreadsheets force manual clicks that break silently when next week’s export arrives. Pandas represents every column as a contiguous typed array in memory so you can script repeatable assertions—checking null rates, enforcing valid numeric domains, validating join cardinality, and generating identical clean snapshots every night in CI.',
    },
    {
      type: 'prose',
      heading: 'The 6-Step Production EDA Workflow on Messy Data',
      paragraphs: [
        'Every time you open an unfamiliar dataset—such as the bundled messy customer dataset (`src/data/datasets/messy_customers.ts`) included in this course—execute six quick checks in order before engineering a single feature. First, inspect row count, column dtypes, and exact memory footprint (`df.info()`), watching immediately for `object` dtypes on numeric or date columns.',
        'Second, check primary-key uniqueness (`df["customer_id"].duplicated().sum()`) and resolve duplicates deterministically before any join. Third, profile missing values (`df.isna().mean()`) AFTER normalizing literal sentinel strings like `"N/A"` and `"null"`. Fourth, validate numeric domains (`age.between(13, 110)`, `spend >= 0`) to catch placeholder codes like `-4` or `999`. Fifth, standardize categorical strings (`strip().lower()` plus explicit synonym maps such as mapping `"us"`, `"u.s."`, `"usa"` -> `"US"`). Sixth, verify timestamp parsing and monotonic chronology.',
      ],
    },
    {
      type: 'code',
      title: 'Bundled Messy Dataset Preview (`messy_customers.ts`) & EDA Cleaning',
      language: 'python',
      code: `import io
import pandas as pd

RAW_CUSTOMERS = """${MESSY_CUSTOMERS_CSV.split('\n').slice(0, 7).join('\n')}"""

df = pd.read_csv(io.StringIO(RAW_CUSTOMERS), na_values=["N/A", "null", ""])
# 1. Deduplicate primary key deterministically
df = df.drop_duplicates(subset=["customer_id"], keep="first").copy()
# 2. Clean currency strings -> float
df["monthly_spend"] = (
    df["monthly_spend"].astype(str).str.replace(r"[$,]", "", regex=True)
)
df["monthly_spend"] = pd.to_numeric(df["monthly_spend"], errors="coerce")
# 3. Domain clamp invalid ages (-4, 205) -> NaN
df["age"] = df["age"].where(df["age"].between(13, 120))
# 4. Canonicalize country & mixed dates
country_map = {"us": "US", "u.s.": "US", "usa": "US", "uk": "UK", "united kingdom": "UK"}
df["country"] = df["country"].str.strip().str.lower().replace(country_map).str.upper()
df["signup_date"] = pd.to_datetime(df["signup_date"], format="mixed", errors="coerce")
print(df[["customer_id", "country", "age", "monthly_spend", "signup_date"]])`,
      caption: 'Every transformation turns ambiguous dirty values (`$1,250.50`, `-4`, `U.S.`, mixed dates) into strict typed columns.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: `groupby().agg()`, `transform()`, JSON Normalization & Validated Merges',
      paragraphs: [
        'Pandas offers two distinct grouping patterns that beginners frequently confuse. Calling `orders.groupby("customer_id")["amount"].agg(["count", "sum", "mean"])` collapses transaction rows down to one summary row per customer—ideal for joining customer lifetime spend onto a user table. Calling `df.groupby("plan_tier")["monthly_spend"].transform("mean")` keeps the exact original row index and length while broadcasting each tier’s mean back to every matching row—essential for computing relative features (`spend - tier_mean`) or imputing missing values within each segment.',
        'Real-world pipelines also ingest semi-structured JSON payloads alongside flat CSV exports. Notice the bundled support tickets (`MESSY_TICKETS_JSON` in `src/data/datasets/messy_customers.ts`): keys like `"priority"` mix `"high"`, `"HIGH"`, and `null`, subjects carry leading/trailing whitespace, and unresolved tickets have `resolved_hours: null`. Loading via `pd.read_json(io.StringIO(MESSY_TICKETS_JSON))` (or `pd.json_normalize(...)` when nested dictionaries appear), normalizing string casing (`str.strip().str.lower().fillna("unknown")`), and flagging open tickets (`is_unresolved = df["resolved_hours"].isna().astype(int)`) converts erratic JSON logs into structured tabular features.',
        'When combining tables, always pass `validate` and `indicator` during development: `pd.merge(clean_customers, orders, on="customer_id", how="left", validate="one_to_many", indicator=True)`. If `clean_customers` still held a duplicate `customer_id`, Pandas immediately raises `MergeError` instead of silently doubling revenue! Meanwhile, checking `(merged["_merge"] == "right_only").sum()` on an outer test audit immediately surfaces orphan foreign keys (`customer_id = 999`) caused by deleted test accounts or ETL race conditions. Notice also that aggregating `order_id` with `"count"` intentionally skips `NaN` so zero-order customers report `0` orders rather than `1`.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Missing Data Mechanisms (MCAR, MAR, MNAR) & Safe Imputation',
      paragraphs: [
        'Never blindly run `.dropna()` or `.fillna(0)` across an unfamiliar DataFrame. Dropping missing rows throws away statistical power and injects survivorship bias whenever incomplete rows differ systematically from complete rows. Filling missing `age` or `income` with `0` injects impossible synthetic anchors that warp linear regressions, averages, and distance-based clustering models. Always classify why values disappeared using three formal statistical mechanisms.',
        '**MCAR (Missing Completely at Random):** a telemetry packet dropped due to a random network timeout unrelated to the user or the hidden value; dropping sparse rows or using simple global median imputation introduces no systematic bias. **MAR (Missing at Random):** missingness depends on another observed column—for example, enterprise customers skip optional demographic fields (`age`) more frequently than self-serve consumers. Imputing within observed groups (`groupby("plan_tier").transform(...)` computed strictly on training data) preserves conditional group accuracy.',
        '**MNAR (Missing Not at Random):** the unobserved value itself drives missingness—high earners refuse to disclose income, defaulting borrowers leave risk fields blank, or failing hardware sensors stop reporting right before overheating. Here, missingness itself carries strong predictive signal! Always append a binary `col_is_missing = df[col].isna().astype(int)` indicator column BEFORE imputing a placeholder value, and remember to fit group medians strictly inside your training split.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Time Series Resampling & Leak-Free Rolling Windows',
      paragraphs: [
        'Event logs arrive asynchronously with uneven gaps—five clicks on Tuesday and zero on Wednesday. If you compute `.rolling(3)` directly on raw un-resampled rows, "3 rows" means 10 minutes for an active user and 6 months for an inactive user! First convert timestamps with `pd.to_datetime(..., utc=True)`, sort chronologically per entity (`sort_values(["customer_id", "order_ts"])`), and normalize regular intervals with `.resample("1D", on="order_ts")["amount"].sum().fillna(0.0)` when daily grids are needed.',
        'Second, guard ruthlessly against look-ahead leakage in rolling windows. By default, `series.rolling(3).mean()` includes the current row `t` inside the average of `[t-2, t-1, t]`. If you are predicting whether transaction `t` is fraudulent or high-value, including transaction `t` inside its own historical feature leaks the label! Always chain `.shift(1)` after grouping: `df.groupby("customer_id")["amount"].transform(lambda s: s.shift(1).rolling(3, min_periods=1).mean())`. Look at the output for customer `101` with orders `[250, 400, 600]`: row 0 gets `NaN`, row 1 gets `250.0`, and row 2 gets `(250 + 400) / 2 = 325.0`, cleanly blind to `600`.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 3 Output: Chronological `shift(1)` Rolling Feature',
      language: 'python',
      code: `import pandas as pd

orders = pd.DataFrame({
    "customer_id": [101, 101, 101, 108, 108],
    "order_ts": pd.to_datetime([
        "2024-02-01", "2024-02-14", "2024-03-15", "2024-05-10", "2024-05-24"
    ]),
    "amount": [250.0, 400.0, 600.5, 320.25, 320.5],
}).sort_values(["customer_id", "order_ts"])

orders["prior_2_mean"] = orders.groupby("customer_id")["amount"].transform(
    lambda s: s.shift(1).rolling(window=2, min_periods=1).mean()
)
print(orders[["customer_id", "amount", "prior_2_mean"]].to_string(index=False))
#  customer_id  amount  prior_2_mean
#          101  250.00           NaN
#          101  400.00        250.00
#          101  600.50        325.00
#          108  320.25           NaN
#          108  320.50        320.25`,
      caption: 'Sorting before `groupby().transform(lambda s: s.shift(1).rolling(...))` guarantees strict past-only features.',
    },
    {
      type: 'prose',
      heading: 'Common Pandas Mistakes & How to Debug Them',
      paragraphs: [
        '1) Iterating with `df.iterrows()`: Python loops over DataFrame rows allocate new `Series` objects on every iteration and silently drop dtypes. Debug slow scripts by replacing `iterrows()` with vectorized arithmetic, `np.where`, `.map()`, or `.groupby().transform()`.',
        '2) `SettingWithCopyWarning` and chained indexing (`df[df["age"] > 0]["flag"] = 1`): chained brackets may modify a temporary slice copy while leaving `df` unchanged. Always filter with `.copy()` or mutate in one step via `df.loc[df["age"] > 0, "flag"] = 1`.',
        '3) Joining unsorted or un-deduplicated DataFrames: always inspect `df["key"].is_unique` and pass `validate="one_to_many"` or `"many_to_one"` into `pd.merge()` so dirty upstream snapshots fail fast instead of exploding downstream row counts.',
        '4) Calling `.rolling()` without sorting timestamps first: Pandas rolls over physical row order rather than timestamp order unless `.sort_values()` ran immediately beforehand.',
        '5) Unintended index misalignment when assigning a grouped Series back to `df`: `df.groupby(...).mean()` shrinks to group keys, causing `NaN` alignment errors unless you use `.transform("mean")` or `.reset_index()`.',
        '6) Mixing timezone-naive (`2024-03-10 08:00`) and timezone-aware UTC (`2024-03-10T10:00Z`) timestamps: comparing or subtracting mixed timestamps triggers `TypeError`. Always pass `utc=True` inside `pd.to_datetime(..., format="mixed", utc=True, errors="coerce")` immediately at ingestion time.',
        '7) Holding repeated low-cardinality text columns (`country`, `plan_tier`) as unconstrained Python `object` strings in multi-million-row exports: converting stabilized categories to `.astype("category")` slashes memory footprint cleanly while speeding up `groupby` hashing across large analytical jobs.',
        '8) Assuming row counts stay unchanged after `.merge()` or `.dropna()`: add `assert len(merged) == len(orders)` invariants inside ETL pipelines so upstream key duplication breaks CI immediately rather than distorting production training batches.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 2.2 Recap: Disciplined Data Wrangling',
      body: '- Run the 6-step EDA audit (`dtypes`, duplicate PKs, literal nulls, domain bounds, canonical strings, mixed dates) before modeling.\n- Preserve MNAR signal with binary `_is_missing` flags instead of blindly dropping or zero-filling.\n- Pass `validate=...` into `pd.merge()` to catch silent duplicate keys immediately.\n- Use `groupby().transform()` to broadcast group stats without shrinking rows.\n- Always `.sort_values()` and apply `.shift(1)` before `.rolling()` so current targets never leak into features.',
    },
    {
      type: 'python-lab',
      labId: 'lab-2-1',
      difficulty: 'guided',
      requires: ['numpy-arrays'],
      title: 'Lab 2.2A: Group-Aware Imputation (NumPy Foundations)',
      prompt:
        'Implement `group_mean_impute(groups, values)` where `values` contains `np.nan` entries. Replace each `np.nan` with the mean of its own group (falling back to the global non-NaN mean if an entire group is `NaN`).',
      starterCode: `import numpy as np

def group_mean_impute(groups: np.ndarray, values: np.ndarray) -> np.ndarray:
    out = values.astype(float).copy()
    global_mean = float(np.nanmean(out))
    # For each unique group in np.unique(groups):
    # compute mean of non-NaN entries (or fallback to global_mean)
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
      hint: 'Use boolean masks `mask = (groups == grp)` and `np.isnan(out)` to target only missing items inside each group.',
      hints: [
        'Loop over `for grp in np.unique(groups):` and create `mask = (groups == grp)`.',
        'Extract `valid = out[mask][~np.isnan(out[mask])]`, checking `len(valid) > 0` before calling `.mean()`.',
        'Assign `out[mask & np.isnan(out)] = fill` using bitwise `&`.',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-2-2-clean',
      difficulty: 'spec',
      requires: ['numpy-arrays', 'python-exceptions'],
      title: 'Lab 2.2B: Clean Messy CSV & Add MNAR Missingness Flag',
      prompt:
        'Using Pandas, implement `clean_customers(raw_csv: str) -> pd.DataFrame` that: (1) loads CSV treating `"N/A"` and `"null"` as `NaN`; (2) deduplicates `customer_id` keeping first; (3) strips `$` and `,` from `monthly_spend` and coerces to float; (4) sets `monthly_spend_is_missing` (`1` if spend is `NaN`, else `0`) BEFORE filling missing spend with `0.0`; (5) coerces `age` outside `[13, 120]` to `NaN` and lowercases/strips `email`.',
      starterCode: `import io
import pandas as pd

def clean_customers(raw_csv: str) -> pd.DataFrame:
    df = pd.read_csv(io.StringIO(raw_csv), na_values=["N/A", "null", ""])
    # 1. Deduplicate on customer_id (keep="first")
    # 2. Clean email (strip + lower)
    # 3. Clean monthly_spend -> float, add monthly_spend_is_missing, fillna(0.0)
    # 4. Clamp age outside [13, 120] to NaN
    return df

sample = """customer_id,email,age,monthly_spend
101,  Alice@Example.COM ,29,"$1,250.50"
101,alice@example.com,29,"$1,250.50"
103,sara@example.com,-4,N/A
105,mina@example.com,205,null
"""
print(clean_customers(sample))`,
      testCode: `import pandas as pd
sample = """customer_id,email,age,monthly_spend
101,  Alice@Example.COM ,29,"$1,250.50"
101,alice@example.com,29,"$1,250.50"
103,sara@example.com,-4,N/A
105,mina@example.com,205,null
"""
out = clean_customers(sample)
assert len(out) == 3, f"Expected 3 unique customers, got {len(out)}"
assert out.loc[out['customer_id'] == 101, 'email'].iloc[0] == 'alice@example.com'
assert abs(out.loc[out['customer_id'] == 101, 'monthly_spend'].iloc[0] - 1250.50) < 1e-6
assert out.loc[out['customer_id'] == 103, 'monthly_spend_is_missing'].iloc[0] == 1
assert out.loc[out['customer_id'] == 103, 'monthly_spend'].iloc[0] == 0.0
assert pd.isna(out.loc[out['customer_id'] == 103, 'age'].iloc[0])
assert pd.isna(out.loc[out['customer_id'] == 105, 'age'].iloc[0])
print("PASS: Messy CSV cleaned with MNAR flags and domain validation!")`,
      solutionCode: `import io
import pandas as pd

def clean_customers(raw_csv: str) -> pd.DataFrame:
    df = pd.read_csv(io.StringIO(raw_csv), na_values=["N/A", "null", ""])
    df = df.drop_duplicates(subset=["customer_id"], keep="first").copy()
    df["email"] = df["email"].astype(str).str.strip().str.lower()
    spend_clean = df["monthly_spend"].astype(str).str.replace(r"[$,]", "", regex=True)
    df["monthly_spend"] = pd.to_numeric(spend_clean, errors="coerce")
    df["monthly_spend_is_missing"] = df["monthly_spend"].isna().astype(int)
    df["monthly_spend"] = df["monthly_spend"].fillna(0.0)
    df["age"] = pd.to_numeric(df["age"], errors="coerce")
    df["age"] = df["age"].where(df["age"].between(13, 120))
    return df`,
      hint: 'Call `df.drop_duplicates(subset=["customer_id"], keep="first").copy()` first, strip `$` and `,` before `pd.to_numeric(..., errors="coerce")`, and record `_is_missing` before `.fillna(0.0)`.',
      hints: [
        'Use `.str.replace(r"[$,]", "", regex=True)` on `monthly_spend` before `pd.to_numeric(..., errors="coerce")`.',
        'Compute `df["monthly_spend_is_missing"] = df["monthly_spend"].isna().astype(int)` BEFORE calling `.fillna(0.0)`.',
        'Use `df["age"] = df["age"].where(df["age"].between(13, 120))` so out-of-range ages turn into `NaN`.',
      ],
      packages: ['pandas', 'numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-2-2-timeseries',
      difficulty: 'debug',
      requires: ['numpy-arrays'],
      title: 'Lab 2.2C: Fix Look-Ahead Leakage in Time-Series Rolling Spend',
      prompt:
        'The starter function computes `rolling_2_avg` WITHOUT sorting timestamps or excluding the current row (`shift(1)`), causing future leakage and misordered windows! Fix `add_prior_rolling_spend(df)` so rows are sorted by `["customer_id", "order_ts"]` and `prior_2_avg` averages strictly the previous up-to-2 orders (`min_periods=1`, `0.0` on a user’s very first order).',
      starterCode: `import pandas as pd

def add_prior_rolling_spend(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["order_ts"] = pd.to_datetime(out["order_ts"])
    # BUG: unsorted + includes current row instead of shift(1)!
    out["prior_2_avg"] = out.groupby("customer_id")["amount"].transform(
        lambda s: s.rolling(2, min_periods=1).mean()
    )
    return out`,
      testCode: `import pandas as pd
raw = pd.DataFrame({
    "customer_id": [1, 1, 1, 2],
    "order_ts": ["2024-03-10", "2024-01-05", "2024-02-01", "2024-01-20"],
    "amount": [500.0, 100.0, 200.0, 50.0],
})
res = add_prior_rolling_spend(raw).reset_index(drop=True)
assert res["amount"].tolist() == [100.0, 200.0, 500.0, 50.0], "Must sort chronologically per customer_id"
assert abs(res.loc[0, "prior_2_avg"] - 0.0) < 1e-6, f"First order must be 0.0, got {res.loc[0, 'prior_2_avg']}"
assert abs(res.loc[1, "prior_2_avg"] - 100.0) < 1e-6, f"Second order prior avg must be 100.0, got {res.loc[1, 'prior_2_avg']}"
assert abs(res.loc[2, "prior_2_avg"] - 150.0) < 1e-6, f"Third order prior avg must be (100+200)/2=150.0, got {res.loc[2, 'prior_2_avg']}"
assert abs(res.loc[3, "prior_2_avg"] - 0.0) < 1e-6, "New customer first order must be 0.0"
print("PASS: Chronological shift(1) eliminated time-series leakage!")`,
      solutionCode: `import pandas as pd

def add_prior_rolling_spend(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["order_ts"] = pd.to_datetime(out["order_ts"])
    out = out.sort_values(["customer_id", "order_ts"]).reset_index(drop=True)
    out["prior_2_avg"] = (
        out.groupby("customer_id")["amount"]
        .transform(lambda s: s.shift(1).rolling(2, min_periods=1).mean())
        .fillna(0.0)
    )
    return out`,
      hint: 'Sort `out` by `["customer_id", "order_ts"]` first, then chain `s.shift(1).rolling(2, min_periods=1).mean()` and `.fillna(0.0)`.',
      hints: [
        'Call `out = out.sort_values(["customer_id", "order_ts"]).reset_index(drop=True)` right after parsing `order_ts`.',
        'Inside `transform`, shift by 1 BEFORE calling `.rolling(2, min_periods=1).mean()`.',
        'Append `.fillna(0.0)` so the very first order of each customer receives `0.0` instead of `NaN`.',
      ],
      packages: ['pandas'],
    },
    {
      type: 'python-lab',
      labId: 'lab-2-2-merge-eda',
      difficulty: 'challenge',
      requires: ['sql-joins'],
      title: 'Lab 2.2D: Validated Merge & Cohort Revenue Summary',
      prompt:
        'Implement `summarize_customer_orders(customers: pd.DataFrame, orders: pd.DataFrame) -> pd.DataFrame` that: (1) deduplicates `customers` on `customer_id`; (2) filters `orders` to `status == "completed"`; (3) left-merges using `validate="one_to_many"` so orphan orders (`999`) are excluded while zero-order customers stay; (4) aggregates `order_count` and `total_spend` (`0.0` if none) per `customer_id`, sorted by `customer_id` ascending.',
      starterCode: `import pandas as pd

def summarize_customer_orders(customers: pd.DataFrame, orders: pd.DataFrame) -> pd.DataFrame:
    # Deduplicate customers on customer_id, filter completed orders,
    # pd.merge(..., validate="one_to_many"), and groupby customer_id
    pass`,
      testCode: `import pandas as pd
cust = pd.DataFrame({"customer_id": [1, 1, 2, 3], "tier": ["pro", "pro", "free", "pro"]})
ords = pd.DataFrame({
    "order_id": [10, 11, 12, 13],
    "customer_id": [1, 2, 2, 999],
    "amount": [50.0, 20.0, 30.0, 500.0],
    "status": ["completed", "refunded", "completed", "completed"],
})
res = summarize_customer_orders(cust, ords)
assert res["customer_id"].tolist() == [1, 2, 3]
assert abs(res.loc[res["customer_id"] == 1, "total_spend"].iloc[0] - 50.0) < 1e-6
assert abs(res.loc[res["customer_id"] == 2, "total_spend"].iloc[0] - 30.0) < 1e-6
assert abs(res.loc[res["customer_id"] == 3, "total_spend"].iloc[0] - 0.0) < 1e-6
assert res.loc[res["customer_id"] == 3, "order_count"].iloc[0] == 0
print("PASS: Validated merge and cohort aggregation handled duplicates and orphans cleanly!")`,
      solutionCode: `import pandas as pd

def summarize_customer_orders(customers: pd.DataFrame, orders: pd.DataFrame) -> pd.DataFrame:
    clean_cust = customers.drop_duplicates(subset=["customer_id"], keep="first").copy()
    comp_orders = orders[orders["status"] == "completed"].copy()
    merged = pd.merge(
        clean_cust[["customer_id"]],
        comp_orders[["customer_id", "order_id", "amount"]],
        on="customer_id",
        how="left",
        validate="one_to_many",
    )
    summary = (
        merged.groupby("customer_id", as_index=False)
        .agg(
            order_count=("order_id", "count"),
            total_spend=("amount", "sum"),
        )
        .sort_values("customer_id")
        .reset_index(drop=True)
    )
    summary["total_spend"] = summary["total_spend"].fillna(0.0)
    return summary`,
      hint: 'Keep `order_id` (`count` ignores `NaN`!) and `amount` (`sum` returns `0.0` or `NaN` filled to `0.0`) after `pd.merge(..., how="left", validate="one_to_many")`.',
      hints: [
        'Call `drop_duplicates(subset=["customer_id"], keep="first")` on `customers` before merging so `validate="one_to_many"` passes.',
        'Filter `orders[orders["status"] == "completed"]` before `pd.merge`, then group by `customer_id`.',
        'Use `.agg(order_count=("order_id", "count"), total_spend=("amount", "sum"))` because `count` ignores `NaN` `order_id` for 0-order users.',
      ],
      packages: ['pandas'],
    },
  ],
  quiz: [
    {
      id: 'q2-2-1',
      type: 'multiple-choice',
      question: 'Why does calling `df.groupby("plan_tier")["spend"].transform("mean")` behave differently from `.mean()`?',
      options: [
        '`transform("mean")` returns a Series aligned to every original row index so you can assign it straight back as a column',
        '`transform("mean")` deletes all missing values permanently from the source DataFrame before computing group ratios',
        '`mean()` preserves every single duplicate row while `transform("mean")` collapses groups down to unique tier keys',
        '`transform("mean")` only operates on string columns whereas `.mean()` automatically casts floats to integer categories',
      ],
      correctIndex: 0,
      explanation: '`.mean()` collapses rows down to one row per group key; `.transform("mean")` broadcasts the group statistic back across every original row index. Options B, C, and D swap or misrepresent these methods.',
    },
    {
      id: 'q2-2-2',
      type: 'multiple-choice',
      question: 'Borrowers who are most likely to default intentionally leave `monthly_income` blank. Which missingness type is this and what is the right fix?',
      options: [
        'MCAR — delete all rows containing `NaN` immediately so the training distribution contains zero blanks',
        'MAR — replace every blank with literal integer `0` without storing any auxiliary missingness flag',
        'MNAR — add an `income_is_missing` binary feature before imputing so the model preserves the predictive signal',
        'Pure ingestion noise — randomly shuffle values from other customers into the missing positions',
      ],
      correctIndex: 2,
      explanation: 'Because missingness depends on the unobserved income value itself (MNAR), adding an `_is_missing` flag retains the risk signal before imputing. Dropping rows biases the cohort (A), zero-filling distorts linear scale without a flag (B), and shuffling destroys data (D).',
    },
    {
      id: 'q2-2-3',
      type: 'spot-bug',
      question: 'Spot the critical bug in this rolling fraud-feature snippet:',
      code: `df = df.sort_values(["user_id", "ts"])
df["recent_avg"] = df.groupby("user_id")["amount"].transform(
    lambda s: s.rolling(5, min_periods=1).mean()
)`,
      options: [
        '`sort_values` reverses chronological order unless `ascending=False` is passed explicitly to Pandas',
        'It omits `.shift(1)` before `.rolling(...)`, leaking the current transaction’s own `amount` into `recent_avg`',
        'Calling `.transform()` inside `groupby` throws `ValueError` whenever any user has fewer than 5 rows',
        'Pandas `rolling(5)` only computes sums and silently returns zeros whenever `.mean()` is chained afterward',
      ],
      correctIndex: 1,
      explanation: 'By default `.rolling(5)` includes the current row `t` inside the window, leaking the target transaction amount into its own feature unless `.shift(1)` precedes `.rolling(...)`.',
    },
    {
      id: 'q2-2-4',
      type: 'predict-output',
      question: 'Given `s = pd.Series([10.0, 30.0, 50.0])`, what are the exact values of `s.shift(1).rolling(2, min_periods=1).mean().fillna(0.0)`?',
      options: [
        '`[10.0, 20.0, 40.0]`',
        '`[0.0, 10.0, 40.0]`',
        '`[0.0, 20.0, 40.0]`',
        '`[0.0, 10.0, 20.0]`',
      ],
      correctIndex: 3,
      explanation: '`s.shift(1)` produces `[NaN, 10.0, 30.0]`. A trailing 2-row rolling mean (`min_periods=1`) produces `[NaN, 10.0, (10+30)/2=20.0]`, and `.fillna(0.0)` outputs `[0.0, 10.0, 20.0]`.',
    },
    {
      id: 'q2-2-5',
      type: 'multi-select',
      question: 'Which two arguments passed to `pd.merge()` help surface bad joins and orphan keys immediately during EDA?',
      options: [
        '`validate="one_to_many"` to raise an error if the left table contains unexpected duplicate keys',
        '`indicator=True` to label each output row as `"left_only"`, `"right_only"`, or `"both"`',
        '`sort=False` to suppress duplicate-key detection and force Cartesian expansion quietly',
        '`suffixes=("", "")` so colliding non-key columns overwrite each other without warning',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: '`validate="one_to_many"` catches cardinality bugs immediately and `indicator=True` exposes unmatched orphan rows. Disabling sort or using blank suffixes hides join issues.',
    },
    {
      id: 'q2-2-6',
      type: 'ordering',
      question: 'Order these Pandas EDA & cleaning actions cleanly from raw messy CSV ingestion to validated join:',
      items: [
        'Load CSV with explicit `na_values` sentinel strings (`"N/A"`, `"null"`)',
        'Inspect `df.info()` dtypes and strip currency/whitespace artifacts before `pd.to_numeric`',
        'Check primary-key uniqueness and deduplicate deterministically',
        'Validate domain ranges (`age.between(13, 120)`) and append MNAR `_is_missing` flags',
        'Merge with child tables using `validate="one_to_many"`',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'You must load sentinels cleanly, cast numeric/text fields, enforce unique primary keys, flag/validate anomalies, and only then join tables with cardinality validation.',
    },
    {
      id: 'q2-2-7',
      type: 'multiple-choice',
      question: 'After calling `pd.read_csv()` on a dirty file, `monthly_spend` shows dtype `object` instead of `float64`. What is the cleanest fix?',
      options: [
        'Leave `monthly_spend` as `object` so scikit-learn automatically parses currency commas at fit time',
        'Strip `$` and `,` via vectorized `.str.replace(...)` and convert with `pd.to_numeric(..., errors="coerce")`',
        'Drop the entire `monthly_spend` column whenever any single string cell contains a dollar sign',
        'Call `df.iterrows()` to divide every string value by `100` manually inside a nested Python loop',
      ],
      correctIndex: 1,
      explanation: 'Stripping currency punctuation vectorized and calling `pd.to_numeric(..., errors="coerce")` turns clean numbers into `float64` and unexpected text into `NaN`. Options A, C, and D crash, discard signal, or waste CPU.',
    },
    {
      id: 'q2-2-8',
      type: 'numeric',
      question: 'Table `customers` accidentally has 2 rows for `customer_id=101`, and `orders` has 3 completed orders for `customer_id=101`. Without deduplicating `customers`, how many rows does `pd.merge(customers, orders, on="customer_id")` emit for `customer_id=101`?',
      options: [],
      correctIndex: 0,
      correctNumber: 6,
      tolerance: 0,
      unit: 'rows',
      explanation: 'Unvalidated merges emit the Cartesian product per key: `2 * 3 = 6` rows, inflating reported revenue by 2x.',
    },
    {
      id: 'q2-2-9',
      type: 'multiple-choice',
      question: 'Why should you call `.resample("1D", on="ts")` before `.rolling(7)` on sparse customer click events?',
      options: [
        'Because `.resample()` permanently deletes outlier transactions exceeding three standard deviations',
        'Because `.rolling(7)` on raw irregular rows spans 7 events (minutes vs months) rather than 7 calendar days',
        'Because Pandas forbids calling `.rolling()` on any DataFrame that contains UTC timestamps',
        'Because `.resample("1D")` converts integer user IDs into normalized one-hot vectors automatically',
      ],
      correctIndex: 1,
      explanation: 'Row-count rolling windows vary wildly in physical time when events arrive irregularly; resampling onto a uniform daily grid ensures a 7-step window truly spans 7 days.',
    },
  ],
};
