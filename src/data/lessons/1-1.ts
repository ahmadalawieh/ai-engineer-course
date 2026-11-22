import type { Lesson } from '@/types/course';

export const lesson1_1: Lesson = {
  id: '1-1',
  moduleId: 'mod-1',
  number: '1.1',
  title: 'Functions, Dictionaries, Sets, Comprehensions & NumPy Arrays',
  subtitle: 'Turn manual scripts into reusable functions, O(1) dictionary/set lookups, clean comprehensions, and vectorized NumPy math.',
  durationMinutes: 75,
  track: 'core',
  prerequisites: ['1.0'],
  requires: ['python-variables', 'python-types', 'python-strings', 'python-conversions', 'python-lists', 'python-loops', 'python-conditionals'],
  teaches: [
    'python-functions',
    'python-dicts',
    'python-sets',
    'python-comprehensions',
    'numpy-arrays',
    'numpy-copy-views',
  ],
  objectives: [
    'Write clean reusable functions (`def`), understand `return` vs `print`, local scope, and avoid mutable default argument bugs.',
    'Store structured records in dictionaries (`dict`) and deduplicate or test membership quickly using `set` operations.',
    'Replace boilerplate build-and-append loops cleanly with list and dictionary comprehensions.',
    'Vectorize numerical operations across NumPy arrays and distinguish `.copy()` clones from slice views.',
  ],
  checkWithoutNotes: [
    'Why does a function that uses `print(result)` without `return result` cause `TypeError` when a caller tries `x = my_fn() + 1`?',
    'Explain why writing `def add_tag(tag, tags=[]):` shares state across calls, and how `tags=None` fixes it.',
    'When should you reach for a `set` or `dict` instead of scanning a `list` with `if item in my_list:`?',
    'What is the difference between a NumPy slice (`sub = arr[1:3]`) and `arr[1:3].copy()` if you assign `sub[0] = 99`?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'Copy-pasting top-level loops works only for ten-line scratch scripts. Real AI repositories contain dozens of reusable building blocks: `clean_prompt()`, `extract_features()`, `deduplicate_chunks()`, and `score_batch()`. Packaging steps inside **functions (`def`)** lets teammates call, test, and import your logic without duplicating code.',
        'At the same time, real payloads—LLM tool schemas, retrieved document metadata, user feature profiles—are keyed lookups (`{"user_id": 42, "plan": "pro"}`), unique ID filters, and dense numerical vectors. Choosing a **dictionary (`dict`)** or **set (`set`)** turns slow linear list scans into instant hash-table lookups, **comprehensions** express filtering in one readable line, and **NumPy arrays** run arithmetic over millions of floats directly in compiled C buffers without Python loop overhead.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'From Spreadsheet Formulas to NumPy Arrays',
      frontendConcept: 'Highlighting an entire column in Excel/Google Sheets and applying `+ 5` or `=AVERAGE(A1:A100)` in one step.',
      aiConcept: 'Python dictionaries store labeled profiles; sets hold unique IDs; functions (`def`) wrap recipes; NumPy arrays update millions of numbers in one shot.',
      explanation:
        'Instead of looping element by element in Python (checking each value\'s runtime type on every step), **NumPy** packs fixed-type numbers (`float64` or `int64`) contiguously in memory so operations like `scores + 5` execute directly inside tight C loops across entire vectors.',
    },
    {
      type: 'code-compare',
      title: 'Step-by-Step Python Loop vs One-Line Vectorized NumPy',
      jsLabel: 'Manual Python Loop (1 by 1)',
      jsCode: `scores = [70, 85, 90]
bonus = 5

boosted = []
for s in scores:
    boosted.append(s + bonus)

# Fine for 3 items, slow and verbose
# across 10,000,000 embeddings!`,
      pyLabel: 'Python + NumPy (Vectorized C Buffer)',
      pyCode: `import numpy as np

bonus = 5
scores = np.array([70, 85, 90], dtype=float)

# Broadcast +5 across all elements in 1 line:
boosted = scores + bonus      # -> array([75., 90., 95.])
average = scores.mean()       # -> 81.67`,
      takeaway:
        'NumPy removes Python per-element boxing overhead by executing vectorized C loops directly over contiguous typed numeric arrays.',
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Named Machines (`def`), Hash Lockers (`dict`/`set`) & Array Views',
      paragraphs: [
        'Picture a **`def` function** like an espresso machine on a counter: ingredients enter through **parameters** (`def score_item(val, bonus=5):`), internal steps execute cleanly inside a **local scope** (temporary variables disappear when the function finishes), and **`return`** hands the finished drink back to whoever pressed the button. Beginners often confuse `print()` (which only writes text to the screen and returns `None`) with `return` (which hands a real Python value back to the caller!).',
        'Now picture **Dictionaries** and **Sets** as numbered lockers accessed directly by hash address rather than walking down a hallway inspecting every door. Checking whether `"user_9812"` already exists inside a 100,000-element `list` forces Python to compare items sequentially one by one; checking `"user_9812" in seen_ids` on a `set` or looking up `profiles["user_9812"]` on a `dict` jumps straight to the locker in constant average time ($O(1)$). Use `d.get(key, default)` whenever a key might be missing so your API returns a fallback instead of crashing with `KeyError`.',
        'Finally, remember one critical rule for **Comprehensions** and **NumPy views**. A **list comprehension** `[x * 2 for x in nums if x > 0]` or **dict comprehension** `{k: round(v, 2) for k, v in metrics.items()}` concisely replaces 4-line append loops—as long as you keep it to one readable transform/filter without deeply nested ternary knots. And in **NumPy**, slicing (`part = arr[1:3]`) creates a **view** sharing the exact same memory bytes as `arr`! Modifying `part[0] = 999` silently mutates `arr[1]` unless you call `.copy()`.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Safe Function Defaults, Dictionaries & Sets',
      paragraphs: [
        'Look closely at how real ingestion helpers combine functions, safe `.get()` dictionary lookups, and set deduplication while avoiding Python\'s most infamous gotcha: **mutable default arguments** (`def fn(items=[]):`). Default values in Python are evaluated *once* when `def` is defined—not freshly per call! Using `items=None` and assigning `items = [] if items is None else list(items)` guarantees every call starts clean.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Deduplicating & Summarizing Tenant Events + Explained Output',
      language: 'python',
      code: `def count_unique_users(events: list[dict], allowed_plans: set[str] | None = None) -> dict[str, int]:
    if allowed_plans is None:
        allowed_plans = {"pro", "enterprise"}
    by_plan: dict[str, set[str]] = {}
    for ev in events:
        plan = ev.get("plan", "free")
        if plan not in allowed_plans:
            continue
        uid = ev["user_id"]
        if plan not in by_plan:
            by_plan[plan] = set()
        by_plan[plan].add(uid)
    return {plan: len(uids) for plan, uids in by_plan.items()}

sample_events = [
    {"user_id": "u1", "plan": "pro"},
    {"user_id": "u1", "plan": "pro"},
    {"user_id": "u2", "plan": "enterprise"},
    {"user_id": "u3", "plan": "free"},
]
print(count_unique_users(sample_events))`,
      caption: 'Explained output: `{\'pro\': 1, \'enterprise\': 1}`. Using a `set` automatically collapses duplicate `u1` events on the `"pro"` plan, `.get("plan", "free")` handles missing keys safely, and the dict comprehension turns each user-ID set into a clean count.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: NumPy Vectorized Math, Boolean Masking & Copy Safety',
      paragraphs: [
        'NumPy unlocks two superpowers beyond `arr + 5`: **boolean masking** (`arr[arr >= 0.8]` extracts only high-confidence predictions in one expression) and **element-wise clipping / normalization** (`np.clip(arr, 0.0, 100.0)` or `(arr - arr.mean()) / arr.std()`).',
        'Watch also what happens when you slice a NumPy array into `window = scores[:2]`. Because NumPy optimizes memory by returning a zero-copy view, overwriting `window[0] = 0.0` mutates the original `scores` array! Whenever downstream logic modifies a subset, add `.copy()` explicitly.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 2: Vectorized Masking & View vs `.copy()` + Explained Output',
      language: 'python',
      code: `import numpy as np

raw = np.array([68.0, 92.0, 104.0, 79.0])
clipped = np.clip(raw, 0.0, 100.0)
passing = clipped[clipped >= 80.0]

safe_clone = clipped[:2].copy()
safe_clone[0] = 0.0

print("Clipped:", clipped)
print("Passing:", passing)
print("Clone  :", safe_clone, "| Original clipped[0] intact:", clipped[0])`,
      caption: 'Explained output: `Clipped: [ 68.  92. 100.  79.]`, `Passing: [ 92. 100.]`, `Clone: [ 0. 92.] | Original clipped[0] intact: 68.0`. Calling `.copy()` prevents edits on `safe_clone` from leaking back into `clipped`.',
    },
    {
      type: 'table',
      title: 'Beginner Cheat Sheet: Functions, Dicts, Sets & NumPy',
      headers: ['Pattern', 'Example Code', 'What It Does', 'Critical Gotcha'],
      rows: [
        ['Function return', '`def fn(x): return x + 1`', 'Hands computed value back to caller', 'Forgetting `return` returns `None` automatically'],
        ['Safe dict lookup', '`d.get("k", 0)`', 'Returns `0` if `"k"` is absent', 'Direct `d["k"]` raises `KeyError` when absent'],
        ['Mutable default fix', '`def fn(xs=None): xs = xs or []`', 'Gives every call a fresh list', '`def fn(xs=[]):` shares ONE list across all calls!'],
        ['Set lookup', '`seen = {"a", "b"}; "a" in seen`', '$O(1)$ deduplication & membership', 'Empty set is `set()`, NOT `{}` (which is an empty dict!)'],
        ['List comprehension', '`[x * 2 for x in xs if x > 0]`', 'Transforms & filters cleanly in 1 line', 'Avoid nesting 3+ clauses; switch to a helper function'],
        ['NumPy clone', '`sub = arr[:3].copy()`', 'Independent memory copy', '`arr[:3]` without `.copy()` is a mutable view!'],
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Pure Functions, Set Algebra & NumPy Shapes / `dtype`s',
      paragraphs: [
        'Clean engineering separates **pure functions** (returning a new result from inputs without mutating arguments or global variables) from side effects like writing files or calling network endpoints. Inside a function, variables assigned stay inside **local scope** and vanish cleanly when `return` finishes; mutating a caller\'s list in place (`items.sort()`) often surprises upstream callers, whereas returning `sorted(items)` keeps inputs intact.',
        'When comparing two tag sets—such as `expected_tags = {"billing", "refund", "urgent"}` versus `predicted_tags = {"refund", "vip"}`—Python sets give instant algebra without nested loops: **intersection** `expected_tags & predicted_tags` returns shared matches (`{"refund"}`), **union** `expected_tags | predicted_tags` combines both cleanly, and **difference** `expected_tags - predicted_tags` highlights missed tags (`{"billing", "urgent"}`). Similarly, pairing `.items()` with `sorted(counts.items(), key=lambda kv: -kv[1])` lets you rank the top-occurring categories cleanly in one readable expression.',
        'In **NumPy**, inspect `.shape` and `.dtype` whenever shapes look suspicious: `arr = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.float32)` has `.shape == (2, 3)` (`2` rows, `3` columns) and 32-bit floats using half the RAM of `float64`. Broadcasting automatically pairs `(2, 3)` with `(3,)` row-by-row or `(2, 1)` column-by-column, enabling zero-loop normalization across feature matrices. Passing `axis=0` reduces down each column (returning `(3,)` feature averages), whereas `axis=1` reduces across each row (returning `(2,)` per-example totals).',
        'Before leaving functions and NumPy, notice how `*args` and keyword arguments (`fn(scores, bonus=5.0)`) improve readability at call sites: naming optional boolean or numeric flags (`cap=True`, `threshold=0.75`) makes every caller line self-documenting six months later when someone reviews your pipeline.',
        'Two additional everyday helpers tie Python collections together cleanly: **`zip(names, scores)`** pairs matching entries from two parallel lists side-by-side (`for name, score in zip(names, scores):`), eliminating fragile manual `scores[i]` indexing, while **tuples (`(row, col)` or `(min_val, max_val)`)** let functions return multiple distinct outputs cleanly for caller unpacking (`lo, hi = compute_bounds(arr)`). Unlike lists, tuples are immutable once built—making them safe dictionary keys (`cache[(model, temperature)]`) when implementing response caching later in Module 6.',
        'Finally, remember Python\'s **sorting key pattern**: `sorted(rows, key=lambda r: r["score"], reverse=True)` ranks structured dictionary records cleanly without mutating `rows`, returning a freshly ordered list ready for top-k truncation (`[:k]`).',
        'Whenever summarizing categorical frequencies across thousands of logs, `counts[label] = counts.get(label, 0) + 1` (or `collections.Counter`) counts every occurrence in a single linear pass rather than scanning the list once per category.',
      ],
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Using `print` instead of `return` inside `def`:** If `double(5)` prints `10` instead of returning `10`, then `y = double(5) + 1` crashes with `TypeError: unsupported operand type(s) for +: \'NoneType\' and \'int\'`. Always verify your function explicitly `return`s its output.',
        '**Mistake 2 — Writing `{}` expecting an empty set:** In Python, `{}` creates an empty `dict`! Calling `.add()` on `{}` immediately throws `AttributeError: \'dict\' object has no attribute \'add\'`. Always initialize empty sets with `set()`.',
        '**Mistake 3 — Mutable default argument `def log_step(step, history=[]):`:** Every subsequent call without passing `history` silently appends into the same shared list from earlier calls. Always default to `None` and initialize inside the function body.',
        '**Mistake 4 — Unintended mutation via NumPy slice views:** Creating `slice_a = weights[:10]` and editing `slice_a` corrupts `weights` in place. Use `.copy()` whenever isolating sub-arrays.',
        '**Mistake 5 — Reading `d[k]` on optional JSON fields:** External payloads frequently omit optional keys. Use `d.get(k, default)` or check `if k in d:` before indexing.',
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Functions encapsulate tested logic:** Always `return` computed values explicitly and use `None` defaults instead of `[]` or `{}`.',
        '2. **Pick dicts & sets for fast lookups:** Use `.get(key, default)` for safe keyed records and `set()` for instant deduplication.',
        '3. **Prefer readable comprehensions:** One-line `[expr for x in xs if cond]` expresses clean maps and filters cleanly.',
        '4. **Vectorize numerical work with NumPy:** Perform arithmetic (`arr + bonus`), clipping, and boolean masking (`arr[arr >= 0.8]`) across arrays in one step.',
        '5. **Use `.copy()` on NumPy slices:** Slices share underlying memory views unless explicitly copied.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-1',
      difficulty: 'guided',
      requires: ['python-functions', 'numpy-arrays'],
      title: 'Lab 1.1 (Guided): Vectorized NumPy AI Score Booster',
      prompt:
        'Write a function `boost_and_cap(scores, bonus)` that takes a NumPy array `scores`, adds `bonus` to every score in one vectorized line, and caps any value above `100.0` down to `100.0` using `np.minimum(..., 100.0)` without mutating the caller\'s original `scores` array.',
      starterCode: `import numpy as np

def boost_and_cap(scores: np.ndarray, bonus: float) -> np.ndarray:
    # Step 1: updated = scores + bonus
    # Step 2: return np.minimum(updated, 100.0)
    pass

my_scores = np.array([70.0, 88.0, 97.0])
print("Before:", my_scores)
print("After +5:", boost_and_cap(my_scores, 5.0))`,
      testCode: `import numpy as np
s1 = np.array([70.0, 88.0, 97.0])
res1 = boost_and_cap(s1, 5.0)
assert isinstance(res1, np.ndarray), "Must return a NumPy array!"
assert np.allclose(res1, [75.0, 93.0, 100.0]), f"Expected [75.0, 93.0, 100.0], got {res1}"
assert np.allclose(s1, [70.0, 88.0, 97.0]), "Must not mutate original array in-place!"

s2 = np.array([40.0, 100.0])
res2 = boost_and_cap(s2, 10.0)
assert np.allclose(res2, [50.0, 100.0]), f"Expected [50.0, 100.0], got {res2}"
print("PASS: Lab 1.1 Vectorized NumPy booster passed!")`,
      solutionCode: `import numpy as np

def boost_and_cap(scores: np.ndarray, bonus: float) -> np.ndarray:
    updated = scores + bonus
    return np.minimum(updated, 100.0)`,
      hint: 'Write `updated = scores + bonus` and return `np.minimum(updated, 100.0)`.',
      hints: [
        '`scores + bonus` creates a brand-new vectorized array without touching `scores`.',
        'Use `np.minimum(updated, 100.0)` to cap elements above `100.0`.',
        'Remember to `return` the resulting NumPy array!',
      ],
      packages: ['numpy'],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-1-2',
      difficulty: 'spec',
      requires: ['python-functions', 'python-dicts', 'python-sets', 'python-comprehensions'],
      title: 'Lab 1.1.2 (From Spec): Document Index & Stopword Filter',
      prompt:
        'Implement `index_keywords(docs, stopwords)` where `docs` is a dict `{doc_id: text_str}` and `stopwords` is a set of lowercase words to ignore. Return `{doc_id: sorted_unique_keywords}` where each document text is split on whitespace, lowercased, stripped of `",."`, and filtered to exclude empty strings and words in `stopwords`.',
      starterCode: `def index_keywords(docs: dict[str, str], stopwords: set[str]) -> dict[str, list[str]]:
    # Build {doc_id: sorted list of unique clean keywords}
    return {}`,
      testCode: `docs = {
    "d1": "The RAG pipeline uses the RAG index.",
    "d2": "Clean data, fast retrieval.",
}
stop = {"the", "a"}
res = index_keywords(docs, stop)
assert res == {
    "d1": ["index", "pipeline", "rag", "uses"],
    "d2": ["clean", "data", "fast", "retrieval"],
}, f"Got {res}"
print("PASS: Lab 1.1.2 Dict/Set/Comprehension keyword indexer passed!")`,
      solutionCode: `def index_keywords(docs: dict[str, str], stopwords: set[str]) -> dict[str, list[str]]:
    out = {}
    for doc_id, text in docs.items():
        tokens = {
            w.strip(",.").lower()
            for w in text.split()
            if w.strip(",.").lower() and w.strip(",.").lower() not in stopwords
        }
        out[doc_id] = sorted(tokens)
    return out`,
      hint: 'Inside a loop over `docs.items()`, clean each word with `.strip(",.").lower()`, gather unique non-stopword tokens in a set, and store `sorted(tokens)`.',
      hints: [
        'Use a set comprehension `{...}` to deduplicate words automatically.',
        'Strip punctuation and lowercase before checking `not in stopwords`.',
        'Return `{doc_id: sorted(tokens) ...}` so word order is deterministic.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-1-3',
      difficulty: 'debug',
      requires: ['python-functions', 'numpy-copy-views'],
      title: 'Lab 1.1.3 (Debug Buggy Code): Fix Mutable Default & NumPy Slice View Aliasing',
      prompt:
        'Two subtle bugs lurk below: 1) `append_tag(tag, tags=[])` leaks tags across independent calls because of a mutable default list! 2) `zero_first_two(arr)` intends to return a modified copy whose first two entries are `0.0` WITHOUT changing the caller\'s `arr`, yet it slices without `.copy()` AND forgets to return the full array. Fix both functions!',
      starterCode: `import numpy as np

def append_tag(tag: str, tags: list[str] = []) -> list[str]:
    tags.append(tag)
    return tags

def zero_first_two(arr: np.ndarray) -> np.ndarray:
    head = arr[:2]
    head[:] = 0.0
    return head`,
      testCode: `import numpy as np
a = append_tag("rag")
b = append_tag("eval")
assert a == ["rag"] and b == ["eval"], f"Mutable default leaked! a={a}, b={b}"
assert append_tag("ml", ["core"]) == ["core", "ml"]

orig = np.array([1.0, 2.0, 3.0, 4.0])
out = zero_first_two(orig)
assert np.allclose(orig, [1.0, 2.0, 3.0, 4.0]), f"Original array mutated: {orig}"
assert np.allclose(out, [0.0, 0.0, 3.0, 4.0]), f"Expected full 4-element copy, got {out}"
print("PASS: Lab 1.1.3 Mutable default & NumPy view bugs fixed!")`,
      solutionCode: `import numpy as np

def append_tag(tag: str, tags: list[str] | None = None) -> list[str]:
    result = [] if tags is None else list(tags)
    result.append(tag)
    return result

def zero_first_two(arr: np.ndarray) -> np.ndarray:
    cloned = arr.copy()
    cloned[:2] = 0.0
    return cloned`,
      hint: 'Use `tags=None` inside `append_tag` (copying `tags` if provided) and call `cloned = arr.copy()` inside `zero_first_two` before zeroing `cloned[:2]`.',
      hints: [
        'Change default `tags=[]` to `tags=None` and initialize `result = [] if tags is None else list(tags)`.',
        'In `zero_first_two`, clone the entire array first with `cloned = arr.copy()`.',
        'Zero `cloned[:2] = 0.0` and return `cloned`.',
      ],
      packages: ['numpy'],
    },
  ],
  quiz: [
    {
      id: 'q1-1-1',
      type: 'predict-output',
      code: `def add_item(x, bucket=[]):
    bucket.append(x)
    return bucket

print(add_item("a"))
print(add_item("b"))`,
      question: 'What does the second `print` display due to the mutable default argument bug?',
      options: [
        '`["b"]` after resetting the default bucket argument',
        '`["a"]` from the cached first execution',
        'Raises `ValueError` on the second call',
        '`["a", "b"]`',
      ],
      correctIndex: 3,
      explanation: 'Python evaluates default `bucket=[]` once when `def add_item` executes, so both calls mutate and return the same list (`["a", "b"]`). Using `bucket=None` avoids this bug.',
    },
    {
      id: 'q1-1-2',
      type: 'spot-bug',
      code: `import numpy as np
w = np.array([10.0, 20.0, 30.0])
subset = w[0:2]
subset[0] = -1.0`,
      question: 'What unexpected side effect occurs after running these four lines?',
      options: [
        '`subset` turns into a standard 1D Python list rather than a typed array',
        '`w` automatically truncates down to length `2` to match `subset`',
        '`w[0]` silently updates to `-1.0` because slicing returns a memory view',
        'NumPy raises `PermissionError` because array slice views are read-only',
      ],
      correctIndex: 2,
      explanation: 'NumPy slices return memory views rather than independent copies, so writing `subset[0] = -1.0` mutates `w[0]` in place. Call `w[0:2].copy()` whenever you want an independent clone.',
    },
    {
      id: 'q1-1-3',
      type: 'multiple-choice',
      question: 'Why do production pipelines avoid initializing an empty set with `seen = {}`?',
      options: [
        '`{}` creates an empty `dict`, so `seen.add(x)` raises `AttributeError`',
        '`{}` restricts keys exclusively to integer values rather than strings',
        '`{}` creates a frozen constant object rejecting any future inserts',
        '`{}` pre-allocates a fixed multi-megabyte hash buffer per loop',
      ],
      correctIndex: 0,
      explanation: 'Empty braces `{}` are reserved for empty `dict` literals in Python. Always use `set()` for an empty set; non-empty sets use elements without colons like `{"a", "b"}`.',
    },
    {
      id: 'q1-1-4',
      type: 'predict-output',
      code: `def add_five(x):
    print(x + 5)

res = add_five(10)
print(res)`,
      question: 'What does the second line (`print(res)`) output?',
      options: [
        '`15` returned automatically from `add_five`',
        '`10` unchanged because `x` was local',
        'Raises `NameError` because `res` received no `return`',
        '`None`',
      ],
      correctIndex: 3,
      explanation: '`add_five` prints `15` to stdout but lacks a `return` statement, so Python automatically returns `None` into `res`.',
    },
    {
      id: 'q1-1-5',
      type: 'numeric',
      question: 'What numeric sum does `sum([x * 2 for x in [1, 2, 3, 4] if x % 2 == 1])` equal?',
      options: [],
      correctIndex: 0,
      correctNumber: 8,
      tolerance: 0,
      explanation: 'The odd numbers kept by `if x % 2 == 1` are `1` and `3`. Multiplying each by `2` gives `[2, 6]`, whose sum is `8`.',
    },
    {
      id: 'q1-1-6',
      type: 'multi-select',
      question: 'Which TWO statements accurately compare Python `dict`/`set` lookups against `list` scans?',
      options: [
        'Checking `id in seen_set` runs in average $O(1)$ hash-table time rather than scanning every element',
        'Dictionaries preserve insertion order in modern Python (3.7+) and support safe `.get(key, default)`',
        'Lists are faster than sets for checking membership across 500,000 IDs',
        'Sets automatically store duplicate copies so you can count frequency without a dict',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Sets and dicts use hash tables ($O(1)$ average lookup), and dicts preserve insertion order and support `.get()`. Lists require $O(n)$ linear scans for `in`, and sets store unique items rather than counts.',
    },
    {
      id: 'q1-1-7',
      type: 'multiple-choice',
      question: 'Why does `scores + 5` on a large `np.ndarray` run substantially faster than `[s + 5 for s in py_list]`?',
      options: [
        'NumPy skips executing on every odd index and extrapolates values linearly',
        'Python lists store every float element on disk instead of inside system RAM',
        'NumPy executes compiled C loops over contiguous uniform typed memory',
        'NumPy automatically uploads every array addition to a cloud GPU worker',
      ],
      correctIndex: 2,
      explanation: 'Python lists hold pointers to boxed `PyObject` wrappers checked individually per step, whereas NumPy runs tight C loops directly over contiguous typed memory buffers.',
    },
    {
      id: 'q1-1-8',
      type: 'ordering',
      question: 'Order these lines to safely read `"retries"` from `cfg` with fallback `3` and square an array:',
      options: [],
      items: [
        'import numpy as np',
        'retries = cfg.get("retries", 3)',
        'arr = np.array([1.0, 2.0, 3.0])',
        'squared = arr ** 2',
      ],
      correctIndex: 0,
      explanation: 'Import NumPy first, read `retries` safely with `.get()`, construct the NumPy array, and perform vectorized exponentiation `arr ** 2`.',
    },
    {
      id: 'q1-1-9',
      type: 'multiple-choice',
      question: 'Given `arr = np.array([0.4, 0.85, 0.72, 0.91])`, what does `arr[arr >= 0.8]` return?',
      options: [
        '`array([0.85, 0.91])`',
        '`array([False, True, False, True])` as a boolean mask vector',
        '`2`, representing the integer count of matching threshold items',
        'Raises `IndexError` because float conditions cannot index arrays',
      ],
      correctIndex: 0,
      explanation: '`arr >= 0.8` creates the boolean mask `[False, True, False, True]`, and indexing `arr[mask]` extracts only the matching elements `array([0.85, 0.91])`.',
    },
  ],
};
