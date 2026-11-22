import type { Lesson } from '@/types/course';

export const lesson1_0: Lesson = {
  id: '1-0',
  moduleId: 'mod-1',
  number: '1.0',
  title: 'Python Zero-to-One: Types, Strings, Conversions, Lists & Loops',
  subtitle: 'Start here from absolute zero: master numbers, strings, type conversions, lists, conditionals, and loops without functions yet.',
  durationMinutes: 60,
  track: 'core',
  prerequisites: ['0.3'],
  requires: ['terminal-paths', 'tracebacks'],
  teaches: [
    'python-variables',
    'python-types',
    'python-strings',
    'python-conversions',
    'python-lists',
    'python-loops',
    'python-conditionals',
    'python-print',
  ],
  objectives: [
    'Store integers, floats, strings, and booleans cleanly and convert safely between types (`int()`, `float()`, `str()`).',
    'Clean messy text inputs using string methods (`.strip()`, `.lower()`, `.split()`, f-strings) needed for real data and prompts.',
    'Iterate across lists with `for` loops and filter values using `if / elif / else` branches.',
    'Inspect `TypeError` and `ValueError` messages calmly and fix loop accumulator bugs.',
  ],
  checkWithoutNotes: [
    'What is the exact difference between `42`, `42.0`, and `"42"` in Python, and what happens if you run `"42" + 8`?',
    'Given `raw = "  Alice@Example.COM\\n"`, which two string methods clean trailing whitespace and normalize casing?',
    'Explain why changing `score = 0` inside a `for` loop on every iteration breaks a counter or running total.',
    'Why does `bool("False")` evaluate to `True` in Python?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'Every AI system—from a weekend chatbot to a production recommendation engine—runs on top of plain Python data handling. Long before a neural network computes a single matrix multiplication, an engineer has to read text typed by users, strip extra spaces, turn `"0.87"` from text into the real decimal `0.87`, filter out broken records, and loop over batches of inputs.',
        'Beginners frequently stumble not because deep learning math is hard, but because messy real-world inputs arrive as strings (`" 42 "` or `"true"`), missing values break arithmetic, or a subtle loop mistake resets a counter every step. Mastering Python primitive types, type conversions, string cleanup, lists, conditionals, and `for` loops gives you the bedrock vocabulary you will read and write every single workday.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Labeled Storage Boxes & Strict Recipes',
      paragraphs: [
        'Writing Python is writing a step-by-step recipe that executes strictly from top to bottom unless a loop or `if` branch redirects flow. Think of **Variables** as labeled storage boxes: `model_name = "gpt-mini"` puts text inside a box labeled `model_name`, while `confidence = 0.91` stores a decimal number. Python chooses the box type automatically from the value you assign, so checking `type(x)` tells you immediately what kind of data sits inside.',
        'Python distinguishes four fundamental everyday **Data Types**: whole integers (`int`, such as `42` or `-3`), floating-point decimals (`float`, such as `0.85` or `100.0`), quoted text strings (`str`, such as `"hello"` or `\'USD\'`), and logical truth values (`bool`, strictly capitalized `True` or `False`). Remember one vital rule: `"42"` inside quotes is text, **not** a number! Python refuses to guess whether `"42" + 8` means mathematical `50` or text concatenation `"428"`, so it stops immediately with a helpful `TypeError` instead of silently inventing wrong answers.',
        'When you need to hold many items together in order—like user ratings `[0.45, 0.82, 0.91]` or tokens `["ai", "engineering"]`—you pack them into a **List** using square brackets `[...]`. A **`for` loop** walks through that list one element at a time from left to right, and an **`if / elif / else`** block acts like a gatekeeper deciding which lines run based on comparisons such as `>=`, `==`, or `in`. Notice also Python\'s Golden Syntax Rule: code inside a `for` loop or `if` branch **must** be indented consistently by **4 spaces**; indentation is how Python knows which steps belong inside the block.',
      ],
    },
    {
      type: 'visual-diagram',
      diagramId: 'python-blocks',
      title: 'Visual Map: Day-1 Python Flow (Variables, Lists, Loops & Decisions)',
      caption: 'Trace data step-by-step from named variables and lists through `for` loops and `if` branches.',
    },
    {
      type: 'concept-reel',
      reelId: 'python-loop-reel',
      title: 'Animated Walkthrough: Watch a Python Loop Count High Scores Step-by-Step',
      description: 'Press Play to watch how Python moves through `[0.45, 0.88, 0.92]` one item at a time.',
    },
    {
      type: 'code-builder',
      puzzleId: 'puzzle-1-0',
      title: 'Warm-Up Puzzle: Build a Passing-Score Counter',
      prompt:
        'Tap the lines below in the right order to create a list of scores, loop through them, and count how many are `>= 80`. (Notice how indented lines sit inside the `for` and `if` blocks!)',
      lines: [
        'scores = [65, 82, 95]',
        'passed = 0',
        'for s in scores:',
        '    if s >= 80:',
        '        passed = passed + 1',
        'print(passed)',
      ],
      explanation:
        'First you create the `scores` list and initialize `passed = 0` OUTSIDE the loop. Next the `for` loop checks each score, the indented `if` tests `s >= 80`, and `passed = passed + 1` adds 1 for each match before printing `2`.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Type Conversions & String Cleanup on Messy Form Input',
      paragraphs: [
        'Suppose a CSV export or web form hands you raw strings for two ticket priority scores: `"  85 "` and `"15"`. Before averaging them, you must strip whitespace with `.strip()`, convert each cleaned string into an integer or float using `int(...)` or `float(...)`, and then format a clean human-readable summary using an **f-string** (`f"Total: {total}"`).',
        'Observe what happens if you forget `.strip()` or conversion: adding `"85" + "15"` produces the text `"8515"` instead of numeric `100`! Meanwhile, passing a non-numeric string like `"N/A"` into `float("N/A")` raises `ValueError`, which is why checking `raw.replace(".", "", 1).isdigit()` (or handling errors cleanly, covered in Lesson 1.2) protects pipelines. Trace the exact execution below:',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Cleaning Text & Converting Types + Explained Output',
      language: 'python',
      code: `raw_email = "  Ada.Lovelace@AI-Corp.COM \\n"
raw_score = " 0.875 "

clean_email = raw_email.strip().lower()
score = float(raw_score.strip())
percent = round(score * 100, 1)

print("Email  :", clean_email)
print("Type   :", type(score).__name__, "| Value:", score)
print(f"Summary: {clean_email} scored {percent}%")`,
      caption: 'Explained output: `Email: ada.lovelace@ai-corp.com`, `Type: float | Value: 0.875`, `Summary: ada.lovelace@ai-corp.com scored 87.5%`. Notice `.strip()` removes surrounding spaces and newlines (`\\n`), `.lower()` standardizes casing, and `float(...)` converts text into math-ready decimals.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Lists, Slicing, Splitting Text & Loops',
      paragraphs: [
        'In NLP and RAG applications, you constantly break text apart into pieces using `.split()`, build filtered lists with `.append()`, slice sequences using `items[start:stop]`, and count items using `len(items)`. Remember that Python list indexing begins at **`0`**, negative indices count backwards from the end (`items[-1]` is the last element), and slices `[start:stop]` include `start` while **excluding** `stop`.',
        'Equally useful is `enumerate(items)` when you need both the position index and the value inside a loop, and `"\n".join(lines)` or `", ".join(tags)` when gluing clean text strings back together. Study the worked trace below:',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 2: Splitting CSV Rows, Filtering & Accumulating',
      language: 'python',
      code: `raw_rows = ["doc1,0.92", "doc2,0.41", "doc3,0.84"]
high_docs = []
total_score = 0.0

for row in raw_rows:
    parts = row.split(",")
    doc_id = parts[0]
    sim = float(parts[1])
    if sim >= 0.80:
        high_docs.append(doc_id)
        total_score += sim

mean_high = total_score / len(high_docs)
print("Matched docs:", high_docs)
print("Mean high   :", round(mean_high, 2))`,
      caption: 'Explained output: `Matched docs: [\'doc1\', \'doc3\']` and `Mean high: 0.88`. Inside the loop, `row.split(",")` produces a two-item list, `float(parts[1])` turns `"0.92"` into `0.92`, and `high_docs.append(doc_id)` appends qualifying IDs without mutating `raw_rows`.',
    },
    {
      type: 'table',
      title: 'Quick Reference: Everyday String, List & Conversion Operations',
      headers: ['Expression', 'Input Example', 'Result', 'Common On-the-Job Use'],
      rows: [
        ['`s.strip()`', `'"  hi \\n"'`, `'"hi"'`, 'Clean user queries and CSV cells before parsing'],
        ['`s.lower()`', `'"Small-Fast"'`, `'"small-fast"'`, 'Normalize model role tags or email addresses'],
        ['`s.split(",")`', `'"a,b,c"'`, `'["a", "b", "c"]'`, 'Break delimited rows or space-separated words into lists'],
        ['`", ".join(xs)`', `'["rag", "ml"]'`, `'"rag, ml"'`, 'Format prompt lists cleanly for LLMs and logs'],
        ['`int("12")` / `float("1.5")`', `'"12"' / '"1.5"'`, '`12` / `1.5`', 'Convert env vars or parsed text into math values'],
        ['`items[-2:]`', `'[10, 20, 30]'`, `'[20, 30]'`, 'Grab the two most recent chat turns or metrics'],
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Slicing, `enumerate()`, `break` / `continue` & Operator Precedence',
      paragraphs: [
        'As datasets grow beyond tiny lists, two loop control keywords keep scripts fast and readable: **`continue`** skips the current loop item and jumps immediately to the next iteration (ideal for skipping blank lines or comments), whereas **`break`** stops the loop altogether the moment you find what you searched for (such as hitting an early budget cap or finding the first matching error). Pairing loops with **`enumerate(items, start=1)`** hands you both the `1`-indexed row number and the value cleanly without manual `i = i + 1` counters.',
        'At the same time, notice **slicing** and **operator precedence**. Given `history = ["u1", "a1", "u2", "a2", "u3"]`, `history[-2:]` grabs the final two chat turns without hardcoding length, `history[::2]` steps every second element, and `history[::-1]` reverses order without modifying `history` in place. When writing compound conditions like `is_admin or score >= 0.8 and active`, remember Python evaluates `not` first, then `and`, then `or`—use explicit parentheses `(is_admin or score >= 0.8) and active` so teammates never have to guess your boolean grouping.',
        'Notice also how **f-string formatting** replaces fragile `+` concatenation in telemetry and prompts: writing `f"{doc_id}: {score:.2f}"` rounds `0.8749` cleanly to `0.87` for logs without altering the underlying float stored in memory. Similarly, checking substring membership with `"error" in line.lower()` handles arbitrary capitalization cleanly before splitting fields.',
        'When practicing on your own machine, verify every assumption step-by-step using `print(type(val), repr(val))`: calling `repr()` reveals hidden leading spaces, tabs (`\\t`), or invisible newline characters (`\\n`) inside quoted strings that normal `print(val)` hides visually—saving hours when parsing messy spreadsheets, logs, or scraped documents.',
      ],
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Initializing accumulators INSIDE the loop:** Writing `total = 0` inside `for s in scores:` resets `total` back to zero on every iteration, leaving only the last number at the end! Always initialize counters and empty result lists (`count = 0`, `kept = []`) **before** the `for` line.',
        '**Mistake 2 — Using `=` instead of `==` inside `if`:** Single `=` assigns a value into a variable (`x = 5`); double `==` asks a true/false question (`if x == 5:`). Mixing them up produces `SyntaxError: invalid syntax`.',
        '**Mistake 3 — String concatenation vs numeric addition (`"5" + 5`):** Mixing `str` and `int` throws `TypeError: can only concatenate str (not "int") to str`. Explicitly convert text with `int(...)` or `float(...)` before math, or use an f-string `f"{val}"` when building output sentences.',
        '**Mistake 4 — Relying on `bool("False")`:** In Python, *any* non-empty string—even `"False"` or `"0"`—is truthy (`bool("False") == True`)! Only the empty string `""`, numeric `0`, empty list `[]`, `None`, and `False` are falsy. Compare `flag_str.strip().lower() == "true"` instead of calling `bool(flag_str)`.',
        '**Mistake 5 — Modifying a list while looping over it:** Removing elements from `items` inside `for x in items:` shifts indices mid-loop and skips items silently. Always build a *new* list `kept = []` and `.append(...)` matching values.',
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Types determine allowed operations:** Know `int`, `float`, `str`, `bool`, and `list`, and convert string inputs explicitly with `int()` or `float()`.',
        '2. **Clean text defensively:** Chain `.strip()`, `.lower()`, and `.split()` on messy user or file text before parsing.',
        '3. **Initialize accumulators outside loops:** Set totals, counts, and output lists above `for` so values accumulate cleanly.',
        '4. **Watch truthiness on strings:** Test `s.strip().lower() == "true"` rather than `bool("False")`, which evaluates to `True`.',
        '5. **Indent 4 spaces consistently:** Indentation defines exactly which code runs inside `for`, `if`, `elif`, and `else` blocks.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-0',
      difficulty: 'guided',
      requires: ['python-variables', 'python-lists', 'python-loops', 'python-conditionals'],
      title: 'Lab 1.0 (Guided): Count & Sum Confident AI Predictions',
      prompt:
        'We have a list `scores = [0.45, 0.82, 0.91, 0.60, 0.78]` and `threshold = 0.75`. Using ONLY a `for` loop and `if` statement (no functions needed yet!), update `confident_count` (add `1`) and `score_sum` (add `s`) for every score `>= threshold`.',
      starterCode: `scores = [0.45, 0.82, 0.91, 0.60, 0.78]
threshold = 0.75
confident_count = 0
score_sum = 0.0

# Loop through each score s in scores:
# If s >= threshold, increment confident_count by 1 and add s to score_sum.

print("Confident count:", confident_count, "Sum:", round(score_sum, 2))`,
      testCode: `assert confident_count == 3, f"Expected confident_count == 3, got {confident_count}"
assert abs(score_sum - (0.82 + 0.91 + 0.78)) < 1e-6, f"Expected 2.51, got {score_sum}"
print("PASS: Lab 1.0 Loop & conditional accumulator passed!")`,
      solutionCode: `scores = [0.45, 0.82, 0.91, 0.60, 0.78]
threshold = 0.75
confident_count = 0
score_sum = 0.0

for s in scores:
    if s >= threshold:
        confident_count = confident_count + 1
        score_sum = score_sum + s`,
      hint: 'Write `for s in scores:`, indent 4 spaces for `if s >= threshold:`, and indent 8 spaces to update `confident_count` and `score_sum`.',
      hints: [
        'Start the loop with `for s in scores:`.',
        'Inside the loop, add `if s >= threshold:`.',
        'Inside the `if` block, increment `confident_count += 1` and `score_sum += s`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-0-2',
      difficulty: 'spec',
      requires: ['python-strings', 'python-conversions', 'python-lists', 'python-loops'],
      title: 'Lab 1.0.2 (From Spec): Clean CSV Tag & Score Records',
      prompt:
        'You receive `raw_entries = ["  ML:85 ", "RAG:92\\n", " sql:78 ", "ML:95"]`. Without writing any function (`def`), loop over `raw_entries`, split each stripped line on `":"`, normalize the tag to uppercase (`.strip().upper()`), convert the score to `int`, collect tags scoring `>= 90` into `top_tags` (no duplicates needed—preserve list order), and compute `avg_score` across ALL 4 entries.',
      starterCode: `raw_entries = ["  ML:85 ", "RAG:92\\n", " sql:78 ", "ML:95"]
top_tags = []
total_points = 0
avg_score = 0.0

# Loop over raw_entries, clean each entry, parse tag & int score,
# track top_tags (score >= 90) and total_points, then set avg_score.

print("Top tags:", top_tags, "Average:", avg_score)`,
      testCode: `assert top_tags == ["RAG", "ML"], f"Expected ['RAG', 'ML'], got {top_tags}"
assert total_points == 350, f"Expected 350, got {total_points}"
assert abs(avg_score - 87.5) < 1e-6, f"Expected 87.5, got {avg_score}"
print("PASS: Lab 1.0.2 String cleaning & conversion passed!")`,
      solutionCode: `raw_entries = ["  ML:85 ", "RAG:92\\n", " sql:78 ", "ML:95"]
top_tags = []
total_points = 0

for entry in raw_entries:
    parts = entry.strip().split(":")
    tag = parts[0].strip().upper()
    val = int(parts[1].strip())
    total_points += val
    if val >= 90:
        top_tags.append(tag)

avg_score = total_points / len(raw_entries)`,
      hint: 'Use `parts = entry.strip().split(":")`, then `tag = parts[0].strip().upper()` and `val = int(parts[1].strip())`.',
      hints: [
        'Clean each line with `entry.strip().split(":")` so trailing `\\n` and outer spaces disappear.',
        'Convert `parts[1].strip()` using `int(...)` before comparing `>= 90`.',
        'After the loop finishes, compute `avg_score = total_points / len(raw_entries)`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-0-3',
      difficulty: 'debug',
      requires: ['python-types', 'python-conversions', 'python-loops'],
      title: 'Lab 1.0.3 (Debug Buggy Code): Fix Mixed-Type Crash & Loop Reset',
      prompt:
        'A beginner wrote a script to compute `total_cost` and `enabled_count` from `requests = ["12", "8", "invalid", "20"]` and `flags = ["true", "False", "TRUE"]`. It has THREE bugs: 1) `"12"` is a string (`TypeError`), 2) `"invalid"` crashes `int()` unless checked with `.isdigit()`, and 3) `enabled_count` resets inside the loop AND misuses `bool(flag)`! Fix the code so `total_cost == 40` and `enabled_count == 2`.',
      starterCode: `requests = ["12", "8", "invalid", "20"]
flags = ["true", "False", "TRUE"]

total_cost = 0
for r in requests:
    total_cost = total_cost + r  # Bug 1 & 2: string type + "invalid" crashes int()!

for f in flags:
    enabled_count = 0            # Bug 3a: resets every loop!
    if bool(f):                  # Bug 3b: bool("False") is True!
        enabled_count += 1

print("total_cost:", total_cost, "enabled_count:", enabled_count)`,
      testCode: `assert total_cost == 40, f"Expected 40, got {total_cost}"
assert enabled_count == 2, f"Expected 2, got {enabled_count}"
print("PASS: Lab 1.0.3 Mixed-type & accumulator bugs fixed!")`,
      solutionCode: `requests = ["12", "8", "invalid", "20"]
flags = ["true", "False", "TRUE"]

total_cost = 0
for r in requests:
    clean_r = r.strip()
    if clean_r.isdigit():
        total_cost = total_cost + int(clean_r)

enabled_count = 0
for f in flags:
    if f.strip().lower() == "true":
        enabled_count += 1`,
      hint: 'Check `r.strip().isdigit()` before `int(r)`, move `enabled_count = 0` ABOVE the loop, and compare `f.strip().lower() == "true"`.',
      hints: [
        'Guard `int(r)` with `if r.strip().isdigit():` so `"invalid"` is safely skipped.',
        'Move `enabled_count = 0` outside and above `for f in flags:`.',
        'Replace `if bool(f):` with `if f.strip().lower() == "true":`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q1-0-1',
      type: 'predict-output',
      code: `x = "10"
y = 5
print(int(x) + y, x + str(y))`,
      question: 'What exact output does this snippet print?',
      options: [
        '`15 105`',
        '`105 15`',
        '`15 15`',
        'Raises `TypeError`',
      ],
      correctIndex: 0,
      explanation: '`int("10") + 5` performs integer addition (`15`), while `"10" + str(5)` concatenates two strings (`"105"`). Option B swaps them, Option C adds strings arithmetically (impossible), and Option D misses that both terms were explicitly converted.',
    },
    {
      id: 'q1-0-2',
      type: 'spot-bug',
      code: `scores = [0.9, 0.4, 0.8]
for s in scores:
    high = 0
    if s >= 0.75:
        high += 1
print(high)`,
      question: 'Why does this code print `1` instead of the expected `2`?',
      options: [
        'Because `scores` uses decimal float numbers instead of integer list elements',
        'Because `>=` only compares against the final item after the loop exits',
        'Because `+= 1` increments variables only when written outside `if` blocks',
        '`high = 0` sits inside the `for` loop, resetting the counter every pass',
      ],
      correctIndex: 3,
      explanation: 'Because `high = 0` sits indented inside the `for` block, each pass erases earlier counts before checking `s`. Initializing `high = 0` before `for s in scores:` fixes the accumulator.',
    },
    {
      id: 'q1-0-3',
      type: 'multiple-choice',
      question: 'What does `bool("False")` evaluate to in Python, and why?',
      options: [
        '`False`, because Python automatically parses English boolean words inside strings',
        '`True`, because any non-empty string is truthy regardless of its characters',
        '`False`, because capitalizing `F` marks it as a literal boolean constant',
        'Raises `ValueError` at runtime unless lowercase `"false"` is supplied',
      ],
      correctIndex: 1,
      explanation: '`bool(s)` only checks whether string `s` is non-empty (`len(s) > 0`); it does NOT parse words like `"False"` or `"0"`. Compare `.strip().lower() == "true"` explicitly instead.',
    },
    {
      id: 'q1-0-4',
      type: 'ordering',
      question: 'Order these 4 steps to turn raw `"  12, 18, 30\\n"` into the integer sum `60`:',
      options: [],
      items: [
        'raw = "  12, 18, 30\\n"',
        'tokens = raw.strip().split(",")',
        'total = 0',
        'for tok in tokens: total += int(tok.strip())',
      ],
      correctIndex: 0,
      explanation: 'First bind `raw`, strip outer whitespace and split on `","`, initialize `total = 0` BEFORE iterating, then loop and convert each stripped token to `int` inside the accumulator.',
    },
    {
      id: 'q1-0-5',
      type: 'numeric',
      question: 'Given `nums = [10, 20, 30, 40, 50]`, what single integer does `sum(nums[1:4])` equal?',
      options: [],
      correctIndex: 0,
      correctNumber: 90,
      tolerance: 0,
      explanation: 'Python slices `[start:stop]` include index `1` (`20`) up to index `3` (`40`), excluding index `4` (`50`). Thus `nums[1:4]` is `[20, 30, 40]`, summing to `90`.',
    },
    {
      id: 'q1-0-6',
      type: 'multi-select',
      question: 'Which TWO expressions produce `False` in Python?',
      options: [
        '`bool([])`',
        '`bool(["a"])`',
        '`"rag" in "Production RAG Pipeline".lower()`',
        '`"10" == 10`',
      ],
      correctIndex: 0,
      correctIndices: [0, 3],
      explanation: 'Empty containers like `[]` are falsy (`bool([])` is `False`), and a string `"10"` is never equal to integer `10` (`"10" == 10` is `False`). Non-empty lists are truthy, and `.lower()` makes `"rag" in ...` evaluate to `True`.',
    },
    {
      id: 'q1-0-7',
      type: 'predict-output',
      code: `tag = "  Model-V2 \\n"
print(tag.strip().lower().replace("-", "_"))`,
      question: 'What exact string is printed?',
      options: [
        '`"model-v2"`',
        '`"  model_v2 \\n"`',
        '`"model_v2"`',
        '`"MODEL_V2"`',
      ],
      correctIndex: 2,
      explanation: 'Chaining runs left-to-right: `.strip()` removes surrounding whitespace and `\\n`, `.lower()` lowercases letters to `"model-v2"`, and `.replace("-", "_")` yields `"model_v2"`.',
    },
    {
      id: 'q1-0-8',
      type: 'multiple-choice',
      question: 'When reading `NameError: name "scroes" is not defined`, what should you check first?',
      options: [
        'Whether `pip install scores` was executed inside the active `.venv` environment',
        'Whether your internet connection dropped before Python finished loading',
        'Whether earlier variable statements accidentally missed trailing semicolons',
        'A misspelled variable name or usage before assignment',
      ],
      correctIndex: 3,
      explanation: '`NameError` means Python looked up an identifier (`scroes`) in scope and found no prior assignment—nearly always a typo (`scroes` vs `scores`) or referencing a variable before defining it.',
    },
    {
      id: 'q1-0-9',
      type: 'spot-bug',
      code: `items = [1, 2, 3, 4]
for x in items:
    if x % 2 == 0:
        items.remove(x)`,
      question: 'Why is mutating `items` with `.remove(x)` inside `for x in items:` risky in general Python code?',
      options: [
        'Removing items shifts elements left mid-loop, risking skipped checks',
        'Python immediately raises `MemoryError` whenever calling `list.remove()` inside loops',
        'The modulo operator `% 2` only supports floating-point arrays rather than integer lists',
        'Lists automatically freeze into read-only tuples the moment a `for` loop begins',
      ],
      correctIndex: 0,
      explanation: 'When element at index `i` is removed, subsequent items slide backward into index `i` while the loop pointer advances to `i + 1`, skipping adjacent elements. Build a new filtered list instead.',
    },
  ],
};
