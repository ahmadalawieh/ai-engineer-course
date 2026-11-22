import type { Lesson } from '@/types/course';

export const lesson8_1: Lesson = {
  id: '8-1',
  moduleId: 'mod-8',
  number: '8.1',
  title: 'Coding Interview Basics: Arrays, Strings, Hash Maps, Recursion & Big-O',
  subtitle: 'Pass live Python coding screens confidently using hash maps, two-pointer sliding windows, recursive tree traversal, and clear Big-O time/space explanations.',
  durationMinutes: 85,
  track: 'core',
  prerequisites: ['1.1', '1.2'],
  requires: ['python-functions', 'python-dicts', 'python-sets'],
  teaches: [
    'interview-dsa-hashmaps',
    'interview-sliding-window',
    'interview-recursion-complexity',
  ],
  objectives: [
    'Analyze Big-O time and memory tradeoffs accurately (`O(1)`, `O(n)`, `O(n log n)`, `O(n^2)`) before writing a single line of code.',
    'Replace quadratic nested loops with `O(n)` hash-map lookup and frequency-counting patterns.',
    'Solve streaming string/array window problems cleanly in linear `O(n)` time using two pointers (`left`, `right`).',
    'Write safe recursive functions with explicit base cases and memoization over nested JSON/document trees.',
  ],
  checkWithoutNotes: [
    'Why does scanning a nested loop for matching pairs run in $O(n^2)$ time, and how does a `dict` reduce that same search to $O(n)$ average time?',
    'Trace how a sliding window `[left .. right]` shrinks `left` when a duplicate token enters without ever resetting `right` backward.',
    'Identify the two mandatory parts of every non-crashing recursive function (`base case` + `progress toward smaller subproblem`).',
    'State the Big-O time complexity of sorting `n` candidate chunks (`sorted(...)`) vs looking up `1` chunk ID inside a Python `dict` or `set`.',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why Coding Screens Still Filter Junior AI Engineers',
      paragraphs: [
        'Even when applying specifically for AI Application Engineer or Applied ML roles, nearly every technical interview loop opens with a thirty-to-forty-five-minute live Python coding screen. Hiring teams are NOT asking for obscure competitive-programming tricks like red-black trees; they are testing whether you write clean, bug-free Python under mild pressure, pick the right data structure instinctively, spot edge cases (`empty list`, `negative numbers`, `nested dicts`), and articulate runtime scaling clearly.',
        'In real AI backends, these exact algorithmic patterns appear constantly. Deduplicating 500,000 RAG document chunks in `O(n)` uses a hash set instead of `chunk in seen_list` (`O(n^2)` latency bombs!). Implementing a per-tenant token rate limiter uses a two-pointer sliding window. Parsing nested OpenAI JSON tool payloads or HTML DOM nodes into flat text chunks relies directly on recursion. Mastering these core patterns makes you faster both in interviews and on production infrastructure.',
        'Strong candidates also treat coding screens as collaborative engineering conversations rather than silent typing races. Before coding, restate constraints aloud (`Are inputs sorted? Could strings be empty?`), sketch a brute-force baseline in two sentences, explain how a `dict` or sliding window upgrades complexity from `O(n^2)` to `O(n)`, and trace concrete edge cases by hand right after writing the return statement.',
      ],
    },
    {
      type: 'frontend-bridge',
      title: 'Mental Model: JavaScript `Map`/`Set` + Recursive React Tree Rendering',
      frontendConcept: 'Replacing `arr.find()` inside a `for` loop with a JS `Map`, or writing a recursive React component rendering nested folder trees',
      aiConcept: 'Python `dict`/`set` `O(1)` Indexing, Sliding Window Pointers & Tree Traversal',
      explanation:
        'If you ever replaced an `O(n^2)` nested `.find()` lookup over TypeScript arrays with a `new Map()` lookup (`O(1)` per item), you already know 80% of hash-map interview patterns. Similarly, Python recursion works identically to a component rendering nested comment threads: handle leaf nodes cleanly first (the base case), then call the same helper on children.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Arrays, Strings & `O(n)` Hash Map Lookups',
      paragraphs: [
        'Consider a classic interview warm-up adapted for AI telemetry: given a list of embedding vector latencies `[12, 45, 8, 22, 19]` and a target SLA budget `30`, find the indices `(i, j)` of two requests whose latencies sum exactly to `30`. The naive approach nests two loops (`for i` inside `for j`), checking every pair in `O(n^2)` time. On `n = 100,000` logs, that runs five billion iterations and times out!',
        'Watch how a single-pass hash map solves this in `O(n)` time and `O(n)` space. As you scan each element `val` at index `i`, compute the missing partner `need = target - val`. Ask in `O(1)` hash-table time: *"Have I already seen `need` earlier?"* If yes, return `(seen[need], i)` immediately! If not, record `seen[val] = i` and continue. Recording AFTER checking guarantees an element never pairs with itself.',
        'Hash maps (`dict` and `collections.Counter`) shine equally on strings: normalizing casing (`text.lower()`), stripping punctuation, counting token frequencies, and returning top-`k` queries (`sorted` in `O(u log u)` over unique keys `u`). Always clarify tie-breaking rules with your interviewer (for example: *"If two tokens share the same count, sort alphabetically?"*)—explicit tie-breaking separates thorough engineers immediately.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example: Linear-Time Pair Finder & Frequency Ranker',
      language: 'python',
      code: `from collections import Counter

def find_pair_indices(nums: list[int], target: int) -> tuple[int, int] | None:
    seen: dict[int, int] = {}
    for i, val in enumerate(nums):
        need = target - val
        if need in seen:
            return (seen[need], i)
        seen[val] = i
    return None

def top_k_tokens(tokens: list[str], k: int) -> list[str]:
    counts = Counter(t.lower() for t in tokens if t.strip())
    # Sort descending by count, tie-break alphabetically ascending
    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    return [word for word, _ in ranked[:k]]

print(find_pair_indices([12, 45, 8, 22, 19], 30))  # (2, 3) because 8 + 22 == 30
print(top_k_tokens(["RAG", "sql", "rag", "ml", "sql"], 2))  # ['rag', 'sql']`,
      caption: 'Checking `need in seen` before inserting `seen[val] = i` runs in $O(n)$ time and safely handles duplicate halves like `[15, 15]` summing to `30`.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Sliding Window Over Strings & Token Streams (`O(n)`)',
      paragraphs: [
        'Whenever a problem asks for the *"longest contiguous subarray/substring"* or *"minimum contiguous window matching condition X"*, think **Sliding Window** immediately. Instead of testing every `(start, end)` pair in `O(n^2)` or `O(n^3)` time, maintain two indices `left = 0` and `right` sweeping strictly rightward across the sequence once.',
        'Trace finding the length of the longest contiguous span of unique tokens inside `["rag", "llm", "sql", "llm", "eval", "rag"]`. Expand `right` step by step while recording each token’s latest index in `last_seen: dict[str, int]`. At `right = 3` (`"llm"`), `"llm"` already appeared at index `1 >= left (0)`! Instead of resetting `right` back to index `2`, jump `left = last_seen["llm"] + 1` (`= 2`) directly in `O(1)` time!',
        'Verify that invariant: because `left` and `right` only ever move forward from `0` to `n - 1`, every token is touched at most twice—delivering strict `O(n)` worst-case runtime regardless of duplicate density. Notice the boundary guard `if tok in last_seen and last_seen[tok] >= left`: forgetting `>= left` would accidentally drag `left` BACKWARD when encountering stale tokens before the current window!',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Recursion, Tree Traversal & Memoization',
      paragraphs: [
        'Nested tool responses, directory trees, and structured AST chunks naturally take recursive shapes (lists inside dicts inside lists). A clean recursive parser defines two pillars clearly: **1) Base Case:** when input is a scalar leaf (like a `str`), return `[input]` immediately so recursion terminates cleanly; **2) Recursive Step:** iterate children inside `list` or `dict.values()`, recursively flattening and extending results without mutating shared default lists.',
        'Every recursive call consumes one stack frame in Python (`sys.getrecursionlimit()` defaults near `1000`), so space complexity equals the maximum nesting depth `O(d)`. For combinatorial recursion with overlapping subproblems—like counting ways to segment a string into dictionary tokens or computing Fibonacci paths—naive branching explodes to `O(2^n)` exponential time unless you attach `@functools.lru_cache(maxsize=None)` (memoization), collapsing duplicate subproblem trees immediately down to linear or polynomial time!',
        'Watch out for a subtle Python trap in interviews: **never write `def helper(node, acc=[]):` with a mutable default list!** Default arguments evaluate ONCE at function definition time, causing state from the first test call to leak silently into every subsequent call. Always default `acc=None` or return fresh local lists cleanly.',
      ],
    },
    {
      type: 'table',
      title: 'Big-O Cheat Sheet for Python Coding Interviews',
      headers: ['Operation / Pattern', 'Time Complexity', 'Space Complexity', 'Common AI Engineering Use'],
      rows: [
        ['`x in my_set` / `my_dict[k]`', '`O(1)` average', '`O(n)`', 'Deduplicating retrieved doc IDs & caching'],
        ['`x in my_list` / `list.pop(0)`', '`O(n)` linear scan/shift', '`O(1)`', 'Buggy queue/dedupe trap—replace with `deque` or `set`!'],
        ['Two-pointer Sliding Window', '`O(n)` single pass', '`O(k)` window state', 'Rate-limiter windows & contiguous token spans'],
        ['`sorted(items)` (Timsort)', '`O(n log n)`', '`O(n)`', 'Ranking top-`k` search/RRF results'],
        ['Nested pair loop (`i` then `j`)', '`O(n^2)` quadratic', '`O(1)`', 'All-pairs cosine similarity (watch `n > 5000`!)'],
      ],
    },
    {
      type: 'prose',
      heading: 'Common Coding Interview Mistakes & How to Debug Them',
      paragraphs: [
        '1) Using `x in seen_list` inside a loop to deduplicate items: scanning a Python `list` takes `O(n)` per check, silently turning your "simple" loop into an `O(n^2)` bottleneck that times out on `n = 100,000`. Always swap `seen_list` for a Python `set()` or `dict()`.',
        '2) Forgetting empty or single-element edge cases (`nums = []`, `k = 0`, `text = ""`): test empty inputs and length-1 inputs explicitly right after drafting your loop before clicking Submit.',
        '3) Using mutable default arguments like `def collect(tree, out=[]):`: across multiple interview test cases, `out` keeps growing across unrelated runs! Initialize `if out is None: out = []` or construct pure returned lists.',
        '4) Sliding window `left` jumping backward: when updating `left = last_seen[ch] + 1`, always guard `if ch in last_seen and last_seen[ch] >= left:` (or `left = max(left, last_seen[ch] + 1)`) so old characters outside the active window never pull `left` backward.',
        '5) Using `list.pop(0)` as a FIFO queue in BFS/sliding tasks: removing index `0` shifts every remaining element left in `O(n)` time! Import `collections.deque` and call `popleft()` for true `O(1)` FIFO pops.',
        '6) Skipping `O(n)` sorting tradeoffs (`sorted` vs `heapq.nlargest`): sorting 10M items when you only need the top `5` takes `O(n log n)`, whereas `heapq.nlargest(5, items)` or single-pass min-heaps stay `O(n log k)` with bounded memory.',
        '7) Coding silently without walking through a concrete three-element example by hand after finishing: interviewers award strong engineering signal when you trace edge cases (`[]`, `[x]`, all duplicates) calmly line by line before hitting Run and explain your time/space complexity clearly.',
      ],
    },
    {
      type: 'callout',
      variant: 'key-takeaway',
      title: 'Module 9.1 Recap: Interview Algorithms That Matter',
      body: '- Explain brute-force vs optimal `dict`/`set` or two-pointer complexity aloud BEFORE typing.\n- Swap nested loops (`O(n^2)`) for single-pass hash maps (`O(n)`) and `deque` (`O(1)` `popleft()`).\n- Keep sliding windows strictly monotonic using `left = max(left, last_seen[tok] + 1)`.\n- Write clean recursion with explicit base cases, no mutable default args, and `@lru_cache` on overlapping subproblems.\n- Trace empty lists, duplicates, and single-item inputs systematically before declaring victory.',
    },
    {
      type: 'python-lab',
      labId: 'lab-8-1-hashmap',
      difficulty: 'guided',
      requires: ['python-dicts', 'python-functions'],
      title: 'Lab 9.1A: Linear-Time Pair Finder & Top-K Token Counter',
      prompt:
        'Implement two classic `O(n)` interview helpers: (1) `find_pair_indices(nums: list[int], target: int) -> tuple[int, int] | None`: return earliest `(i, j)` with `i < j` where `nums[i] + nums[j] == target`, or `None`; (2) `top_k_frequent(tokens: list[str], k: int) -> list[str]`: lowercase and strip tokens (ignore blanks), return top `k` tokens sorted by descending count and ascending alphabetical tie-break.',
      starterCode: `def find_pair_indices(nums: list[int], target: int) -> tuple[int, int] | None:
    # Single-pass dict seen: value -> index
    pass

def top_k_frequent(tokens: list[str], k: int) -> list[str]:
    # Count non-empty lowercased tokens, sort (-count, token), return top k
    pass`,
      testCode: `assert find_pair_indices([12, 45, 8, 22, 19], 30) == (2, 3)
assert find_pair_indices([15, 15], 30) == (0, 1)
assert find_pair_indices([5, 5], 20) is None
assert find_pair_indices([], 10) is None
assert top_k_frequent(["RAG", " ", "sql", "rag", "ml", "sql", "agent"], 2) == ["rag", "sql"]
assert top_k_frequent(["b", "a"], 2) == ["a", "b"]
assert top_k_frequent([], 3) == []
print("PASS: Hash map O(n) lookup and frequency ranker passed all edge cases!")`,
      solutionCode: `from collections import Counter

def find_pair_indices(nums: list[int], target: int) -> tuple[int, int] | None:
    seen: dict[int, int] = {}
    for i, val in enumerate(nums):
        need = target - val
        if need in seen:
            return (seen[need], i)
        if val not in seen:
            seen[val] = i
    return None

def top_k_frequent(tokens: list[str], k: int) -> list[str]:
    if k <= 0:
        return []
    cleaned = [t.strip().lower() for t in tokens if t.strip()]
    counts = Counter(cleaned)
    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    return [w for w, _ in ranked[:k]]`,
      hint: 'Check `if need in seen:` BEFORE saving `seen[val] = i` so an element cannot match itself; sort `counts.items()` with key `lambda kv: (-kv[1], kv[0])`.',
      hints: [
        'In `find_pair_indices`, compute `need = target - val`, check `need in seen`, and only store `if val not in seen: seen[val] = i`.',
        'Clean tokens with `[t.strip().lower() for t in tokens if t.strip()]` before counting.',
        'Sort `Counter(cleaned).items()` by `(-kv[1], kv[0])` and slice `[:k]`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-8-1-sliding',
      difficulty: 'spec',
      requires: ['interview-sliding-window'],
      title: 'Lab 9.1B: Longest Unique Contiguous Token Window (`O(n)`)',
      prompt:
        'Implement `longest_unique_window(tokens: list[str]) -> int`: return the maximum length of a contiguous sub-list containing NO duplicate tokens. Run strictly in `O(n)` single-pass sliding window using `left` and `last_seen: dict[str, int]`. Return `0` on an empty list.',
      starterCode: `def longest_unique_window(tokens: list[str]) -> int:
    # Maintain left pointer and last_seen index dict in single O(n) pass
    pass`,
      testCode: `assert longest_unique_window([]) == 0
assert longest_unique_window(["a"]) == 1
assert longest_unique_window(["a", "a", "a"]) == 1
assert longest_unique_window(["rag", "llm", "sql", "llm", "eval", "rag"]) == 4  # ["sql", "llm", "eval", "rag"]
assert longest_unique_window(["a", "b", "c", "a", "d", "e", "b", "f"]) == 6  # ["c", "a", "d", "e", "b", "f"]
print("PASS: Sliding window handled stale duplicates and edge inputs cleanly in O(n)!")`,
      solutionCode: `def longest_unique_window(tokens: list[str]) -> int:
    last_seen: dict[str, int] = {}
    left = 0
    best = 0
    for right, tok in enumerate(tokens):
        if tok in last_seen and last_seen[tok] >= left:
            left = last_seen[tok] + 1
        last_seen[tok] = right
        best = max(best, right - left + 1)
    return best`,
      hint: 'Whenever `tok in last_seen` AND `last_seen[tok] >= left`, advance `left = last_seen[tok] + 1` before updating `last_seen[tok] = right` and `best`.',
      hints: [
        'Initialize `last_seen = {}`, `left = 0`, `best = 0`.',
        'Guard `if tok in last_seen and last_seen[tok] >= left:` so stale entries before `left` never pull `left` backward.',
        'Update `best = max(best, right - left + 1)` on every iteration.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-8-1-recursion',
      difficulty: 'debug',
      requires: ['interview-recursion-complexity'],
      title: 'Lab 9.1C: Fix Mutable Default & Incomplete Recursive JSON Flattener',
      prompt:
        'A broken recursive text extractor `extract_text_leaves(payload, out=[])` suffers from TWO classic interview bugs: (1) a mutable default `out=[]` leaks extracted strings across separate API calls! (2) It skips nested `dict` values and only checks `list`, missing text inside dicts. Fix `extract_text_leaves(payload)` (pure single-arg function) so strings return `[payload]`, `list`/`tuple` recurse in order, `dict` recurses over `.values()`, and numbers/`None` are ignored cleanly.',
      starterCode: `def extract_text_leaves(payload, out=[]):
    # BUG 1: mutable default list leaks across calls!
    # BUG 2: ignores dict values!
    if isinstance(payload, str):
        out.append(payload)
    elif isinstance(payload, list):
        for item in payload:
            extract_text_leaves(item, out)
    return out`,
      testCode: `tree1 = {"title": "RAG", "sections": [{"body": "chunk1"}, ["chunk2", None, 42]]}
res1 = extract_text_leaves(tree1)
assert res1 == ["RAG", "chunk1", "chunk2"], f"Expected ['RAG', 'chunk1', 'chunk2'], got {res1}"
res2 = extract_text_leaves({"note": "second_call"})
assert res2 == ["second_call"], f"State leaked between calls! Got {res2}"
assert extract_text_leaves(None) == []
print("PASS: Recursive JSON leaf extractor handles dicts, lists, and zero cross-call state leaks!")`,
      solutionCode: `def extract_text_leaves(payload) -> list[str]:
    if isinstance(payload, str):
        return [payload]
    leaves: list[str] = []
    if isinstance(payload, (list, tuple)):
        for item in payload:
            leaves.extend(extract_text_leaves(item))
    elif isinstance(payload, dict):
        for val in payload.values():
            leaves.extend(extract_text_leaves(val))
    return leaves`,
      hint: 'Drop the mutable `out=[]` parameter completely! Create a fresh local `leaves = []` inside each call, recursing on `(list, tuple)` and `dict.values()`.',
      hints: [
        'Remove `out=[]` from the signature so each call builds and returns its own fresh list.',
        'Base case: `if isinstance(payload, str): return [payload]`.',
        'Handle both `isinstance(payload, (list, tuple))` and `isinstance(payload, dict)` via `.values()`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q8-1-1',
      type: 'multiple-choice',
      question: 'You need to check whether each of `100,000` candidate chunk IDs already exists inside `seen_ids` while deduplicating search results. Which Python collection ensures `O(1)` average lookup instead of `O(n^2)` total scan time?',
      options: [
        'Use a Python `set()` (or `dict`) for `seen_ids`',
        'Keep `seen_ids` as a standard unsorted `list` and iterate using `.index()` checks',
        'Store IDs inside nested tuples and sort the entire tuple after every single chunk',
        'Convert every chunk ID into concatenated CSV lines and call `.split()` inside the loop',
      ],
      correctIndex: 0,
      explanation: '`set` and `dict` lookup run in `O(1)` average hash time (`O(n)` total), whereas `x in list` scans linearly (`O(n^2)` total).',
    },
    {
      id: 'q8-1-2',
      type: 'spot-bug',
      question: 'What subtle bug breaks this sliding-window helper on `tokens = ["a", "b", "c", "a", "b", "d"]` or similar repeated patterns?',
      code: `def max_unique(tokens):
    seen, left, best = {}, 0, 0
    for right, tok in enumerate(tokens):
        if tok in seen:
            left = seen[tok] + 1
        seen[tok] = right
        best = max(best, right - left + 1)
    return best`,
      options: [
        'Python `enumerate` always returns indices starting from `1` instead of `0`',
        'Stale entries before `left` pull `left` backward unless `seen[tok] >= left` is checked',
        'Dictionaries forbid storing integer indices as values when keys are strings',
        'Computing `right - left + 1` produces negative window lengths after index `2`',
      ],
      correctIndex: 1,
      explanation: 'Without checking `seen[tok] >= left`, encountering an older token already outside the current `[left, right]` window jumps `left` backward and includes duplicate elements.',
    },
    {
      id: 'q8-1-3',
      type: 'predict-output',
      question: 'What does `collect("x")` return on the **second** call in this buggy recursive helper?\n```python\ndef collect(val, acc=[]):\n    acc.append(val)\n    return acc\nprint(collect("a"))\nprint(collect("b"))\n```',
      options: [
        '`["b"]` because Python always resets default parameters on each invocation',
        'A `TypeError` raised by Python when appending strings into empty default lists',
        '`["a", "b"]` because mutable default `acc=[]` is shared across every call',
        '`["a"]` because the second append overwrites index `0` silently',
      ],
      correctIndex: 2,
      explanation: 'Default argument objects in Python are created ONCE at `def` time, so `acc` accumulates across separate calls.',
    },
    {
      id: 'q8-1-4',
      type: 'numeric',
      question: 'A binary search halves a sorted 1,024-element ID array (`n = 1024`) on every step. At most roughly how many comparisons (`log2(1024)`) does it need?',
      options: [],
      correctIndex: 0,
      correctNumber: 10,
      tolerance: 1,
      unit: 'steps',
      explanation: '$\\log_2(1024) = 10$ comparisons (whereas linear scanning could inspect all 1,024 elements).',
    },
    {
      id: 'q8-1-5',
      type: 'multiple-choice',
      question: 'Why should a FIFO work queue in Python use `collections.deque.popleft()` instead of `list.pop(0)`?',
      options: [
        'Because `list.pop(0)` permanently corrupts garbage collection inside asyncio loops',
        'Because Python `list` objects forbid deleting index `0` after ten appends',
        'Because `deque` automatically persists queued strings directly onto PostgreSQL disk',
        '`list.pop(0)` shifts every remaining item (`O(n)`), while `deque.popleft()` is `O(1)`',
      ],
      correctIndex: 3,
      explanation: 'Python lists are contiguous dynamic arrays—popping from index 0 shifts all `n - 1` subsequent pointers left in `O(n)`. `deque` is doubly linked (`O(1)` at both ends).',
    },
    {
      id: 'q8-1-6',
      type: 'multi-select',
      question: 'Select the TWO invariants required for every terminating recursive algorithm over nested JSON trees.',
      options: [
        'At least one explicit **base case** returning directly on leaf/empty nodes',
        'Each recursive call strictly progresses toward a **smaller subproblem / child**',
        'Using global mutable lists instead of return values so stack frames vanish',
        'Catching `RecursionError` silently inside `try/except` without fixing infinite loops',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Every valid recursion pairs a base case (stopping leaf) with strict progress toward smaller children; global state and swallowed errors create silent bugs.',
    },
    {
      id: 'q8-1-7',
      type: 'ordering',
      question: 'Order these Big-O time complexities from FASTEST (best scaling for large `n`) to SLOWEST.',
      items: [
        '`O(1)` — Hash map / set lookup',
        '`O(log n)` — Binary search',
        '`O(n log n)` — Sorting chunks via Timsort',
        '`O(n^2)` — All-pairs nested loop',
      ],
      options: [],
      correctIndex: 0,
      explanation: 'Constant `O(1)` < logarithmic `O(log n)` < linearithmic `O(n log n)` < quadratic `O(n^2)`.',
    },
    {
      id: 'q8-1-8',
      type: 'multiple-choice',
      question: 'Which Python standard library technique speeds up an exponential recursive DP problem (`O(2^n)`) by caching already-solved subproblems automatically?',
      options: [
        'Decorating the pure recursive function with `@functools.lru_cache(maxsize=None)`',
        'Replacing every integer parameter inside the function with floating-point approximations',
        'Calling `sys.setrecursionlimit(1000000)` so exponential branches keep recursing deeper',
        'Wrapping the entire recursion inside `list(enumerate(...))` generators twice',
      ],
      correctIndex: 0,
      explanation: 'Memoization via `@functools.lru_cache` (or `@cache`) stores computed subproblem outputs by argument tuple, pruning exponential recomputation.',
    },
    {
      id: 'q8-1-9',
      type: 'predict-output',
      question: 'What is the worst-case time complexity of sorting `n` document scores with Python’s `sorted(docs, reverse=True)`?',
      options: [
        '`O(1)` constant time regardless of document count',
        '`O(n log n)` comparisons',
        '`O(n^3)` cubic matrix inversions',
        '`O(2^n)` exponential branching',
      ],
      correctIndex: 1,
      explanation: 'Python’s Timsort algorithm executes comparison sorting in `O(n log n)` worst-case time (`O(n)` best-case on nearly sorted inputs).',
    },
  ],
};
