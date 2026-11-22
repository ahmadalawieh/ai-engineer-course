import type { Lesson } from '@/types/course';

export const lesson0_3: Lesson = {
  id: '0-3',
  moduleId: 'mod-0',
  number: '0.3',
  title: 'Reading Tracebacks, Jupyter Pitfalls & Reproducible Workflows',
  subtitle: 'Debug Python stack traces calmly, avoid hidden-state bugs in notebooks, and structure clean logging and project layouts.',
  durationMinutes: 60,
  track: 'core',
  prerequisites: ['0.1', '0.2'],
  requires: ['terminal-paths', 'python-install'],
  teaches: [
    'tracebacks',
    'jupyter-cells',
    'logging-basics',
    'reproducibility',
  ],
  objectives: [
    'Read multi-frame Python stack tracebacks bottom-up to locate the exact error type, message, and root line in seconds.',
    'Recognize Jupyter notebook out-of-order cell pitfalls and know when to extract reusable logic into `.py` modules.',
    'Replace ad-hoc `print()` debugging with structured `logging` levels and reproducible random seeds.',
    'Diagnose silent bug-swallowing patterns (such as bare `except: pass`) before shipping code.',
  ],
  checkWithoutNotes: [
    'Why should you always read a Python Traceback from the bottom line up instead of staring at the very top line?',
    'How can a Jupyter notebook pass cleanly while you are working on it, yet crash with `NameError` when someone runs "Restart & Run All"?',
    'What is the difference between `print()` debugging and using Python\'s `logging` module with levels like `INFO` and `ERROR`?',
    'Why is writing `except: pass` inside a data pipeline one of the most dangerous habits in AI engineering?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'Beginners often treat a red Python error message as proof they "did something wrong" and panic instead of reading the text. Experienced engineers treat tracebacks like medical X-rays: Python literally hands you the exact file name, line number, function call chain, and failure reason in plain English. Knowing how to dissect a 25-line stack trace calmly saves hours of blind trial-and-error during both daily feature work and live technical interviews.',
        'At the same time, data and AI teams rely heavily on Jupyter notebooks (`*.ipynb`) for exploratory analysis and plotting—yet hiring managers routinely reject portfolio repositories stuffed with broken notebooks that only passed because the author ran Cell 5 before Cell 2 and deleted Cell 3 afterward. Knowing how to prove notebook cleanliness (`Restart & Run All`), extract production functions into clean `.py` modules, emit structured `logging` telemetry, pin random seeds, and eliminate silent `except: pass` traps immediately separates reliable engineers from hobbyists.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Flight Recorders, Erasable Chalkboards & Clean Blueprints',
      paragraphs: [
        'Think of a **Python Traceback** like an airplane flight recorder stack. Every time function A calls function B, which calls function C, Python pushes a frame card onto the stack. When function C hits invalid data and crashes, Python prints those stack frames from the oldest outer entrypoint at the very top (`File "main.py"`) down to the **exact failing line at the very bottom** (`KeyError: \'tenant_id\'`). Reading from the **bottom line upward** answers two distinct questions in order: first *what exception fired and on which exact line*, and second *which caller passed bad data into that function*.',
        'Now contrast a **Jupyter Notebook** against a production **`.py` module**. Think of an interactive notebook like a kitchen chalkboard with an active computer memory (**kernel**). Even after you erase Cell 1, rename a variable, or reorder cells visually, variables created ten minutes ago remain alive inside Python RAM! A notebook can appear completely green while holding hidden stale state—which is why "works on my notebook" fails the moment someone opens it fresh tomorrow.',
        'That mental model also clarifies when to graduate code out of notebooks. Use `.ipynb` files as lightweight scratchpads for inspecting distributions, viewing matplotlib charts, or testing prompts interactively. As soon as a helper function cleans data, builds prompts, computes metrics, or loads configs, move it into a dedicated `.py` module inside `src/` (`src/features.py`, `src/eval_metrics.py`) so both notebooks and automated `pytest` tests import the exact same single source of truth.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Reading a Multi-Frame Traceback Bottom-Up',
      paragraphs: [
        'Suppose a colleague pings you in Slack because the customer-support RAG API returned HTTP 500 on a newly onboarded account and dumped the traceback below. Notice that real production tracebacks often span twenty frames through FastAPI, Starlette, and your own application files. Do not read from line 1 downward through framework internals—jump straight to the **final line** (`KeyError: \'tenant\'`) and look directly above it at the **lowest frame belonging to your repository** (`File "rag_app.py", line 14, in build_prompt`).',
        'Immediately you know *why* it crashed: `doc[\'tenant\']` attempted dictionary indexing when the incoming `doc` dictionary lacked a `"tenant"` key. Moving one frame upward (`File "main.py", line 42`) tells you `run_request` passed `doc` straight into `build_prompt` without schema validation! The snippet below demonstrates parsing these exact fields programmatically—useful both for reading logs mentally and for writing error alerts:',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Dissecting a Real Python Traceback + Parser Output',
      language: 'python',
      code: `tb = """Traceback (most recent call last):
  File "main.py", line 42, in run_request
    prompt = build_prompt(doc)
  File "rag_app.py", line 14, in build_prompt
    return f"[{doc['tenant']}] {doc['text']}"
KeyError: 'tenant'"""

lines = [ln.strip() for ln in tb.strip().splitlines() if ln.strip()]
error_line = lines[-1]
error_type, error_msg = error_line.split(":", 1)
file_frames = [ln for ln in lines if ln.startswith('File "')]
failing_frame = file_frames[-1]
print("Error type:", error_type)
print("Message   :", error_msg.strip())
print("Bottom frame:", failing_frame)`,
      caption: 'Explained output: `Error type: KeyError`, `Message: \'tenant\'`, `Bottom frame: File "rag_app.py", line 14, in build_prompt`. Inspecting the final exception line and final `File "..."` frame pinpoints the root location before tracing callers upward.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Out-of-Order Jupyter State, Logging & Fail-Loud Handling',
      paragraphs: [
        'Imagine a notebook where Cell 1 initially defines `discount = 0.2`, Cell 2 computes `price = 100 * (1 - discount)`, and twenty minutes later the author edits Cell 1 to rename `discount` to `promo_rate` without re-running Cell 1—or drags Cell 2 above Cell 1. Because `discount = 0.2` is still lingering in kernel memory, Cell 2 runs without complaining! Tomorrow, when a teammate clicks **Restart Kernel & Run All Cells** on a fresh kernel, Cell 2 crashes immediately with `NameError: name \'discount\' is not defined`. Checking variable definition order from Cell 0 downward catches this hidden-state trap cleanly.',
        'At the same time, notice how production scripts replace scattered `print("here 1")` statements with structured logging (`logging.INFO`, `logging.WARNING`, `logging.ERROR`). Unlike `print()`, logging adds timestamps, severity levels, and easy filtering—and unlike dangerous bare `except: pass` blocks that silently bury corrupted records, explicit exception handling logs actionable diagnostics (`record_id`, failure reason) and returns explicit failure states or re-raises critical errors so broken data never silently poisons model training.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 2: Structured Logging Instead of Silent Errors',
      language: 'python',
      code: `import json

def safe_parse_record(raw_json: str) -> dict:
    try:
        return {"ok": True, "data": json.loads(raw_json), "error": None}
    except json.JSONDecodeError as exc:
        log_event = {"level": "ERROR", "event": "json_parse_failed", "detail": str(exc)}
        print(json.dumps(log_event))
        return {"ok": False, "data": None, "error": str(exc)}

print("Valid  :", safe_parse_record('{"score": 0.9}'))
print("Invalid:", safe_parse_record('{bad json'))`,
      caption: 'Explained output: valid JSON succeeds cleanly; malformed JSON emits a machine-readable `ERROR` record (`json_parse_failed`) and returns `ok: False` explicitly instead of swallowing bugs behind silent `except: pass`.',
    },
    {
      type: 'prose',
      heading: 'Standard AI Project Layout & Experiment Reproducibility',
      paragraphs: [
        'Before finishing setup foundations, adopt one clean folder convention across your repositories: keep source code inside `src/`, automated tests inside `tests/`, small sample fixtures inside `data/`, exploratory notebooks inside `notebooks/`, dependencies pinned in `requirements.txt`, and environment templates in `.env.example`. When someone clones your GitHub repository six months later, they immediately know where code, tests, and config live without digging through twenty loose scripts at root level.',
        'When your team shares `.ipynb` notebooks for data audits or model error reports, you can even verify clean top-to-bottom execution automatically from the terminal using `jupyter nbconvert --to notebook --execute notebooks/eda.ipynb`, which spins up a blank kernel and exits non-zero if any cell fails. Pair that habit with `logger = logging.getLogger(__name__)` inside `.py` files so every warning or error timestamp automatically tags the exact module (`src.rag`, `src.eval`) that raised it.',
        'Finally, remember **reproducibility**. Whenever a script splits train/test datasets, shuffles prompts, or samples Monte Carlo batches, pass an explicit seed (`random.seed(42)`, `np.random.default_rng(42)`, or `random_state=42`). Without a fixed seed, two runs of the exact same code produce drifting metrics, making it impossible to prove whether your new prompt or feature genuinely improved accuracy or simply got lucky on an easier split.',
      ],
    },
    {
      type: 'table',
      title: 'Common Python Exceptions You Will See on the Job',
      headers: ['Exception Name', 'What Python Is Telling You', 'First Debugging Check'],
      rows: [
        ['`IndentationError`', 'Spaces/tabs do not align cleanly inside a block', 'Use consistent 4 spaces per indent level; never mix tabs and spaces'],
        ['`NameError`', 'Variable or function name is undefined or misspelled', 'Check spelling and verify definition runs *before* usage (notebook order!)'],
        ['`TypeError`', 'Incompatible types mixed (e.g. `"5" + 2` or calling a non-function)', 'Print `type(x)` on inputs right before the failing line'],
        ['`KeyError`', 'Dictionary is missing the requested key (`d["score"]`)', 'Inspect `d.keys()` or switch to safe `.get("score", default)`'],
        ['`IndexError`', 'List index out of bounds (e.g. `items[0]` on an empty list `[]`)', 'Guard `if not items:` before indexing position `0`'],
      ],
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Catching everything silently with `except: pass`:** Swallowing exceptions makes a failing pipeline look green while dropping records, silently writing `None`, or zeroing metrics. Always catch specific exception types (`ValueError`, `KeyError`, `json.JSONDecodeError`), emit structured context logs, and either propagate the error or return an explicit failure object.',
        '**Mistake 2 — Keeping business logic trapped inside notebooks:** Notebooks excel at visual charts and exploratory tables; FastAPI servers, CI checks, and scheduled jobs cannot cleanly import functions from `.ipynb` JSON documents. Move reusable logic into `src/*.py` modules and import them cleanly inside thin notebooks.',
        '**Mistake 3 — Skipping `Restart & Run All` before pushing a notebook:** Stale variables in RAM create invisible landmines. Make restarting the kernel and running top-to-bottom your non-negotiable final step before staging any `.ipynb` file.',
        '**Mistake 4 — Comparing unseeded model or eval runs:** Tweaking hyperparameters without fixing `random_state` mixes random sampling noise with real model changes. Always pin seeds cleanly inside config constants so any teammate reproduces identical baseline numbers.',
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Read tracebacks bottom-up:** Inspect the final error type/message and bottom frame first before tracing callers upward.',
        '2. **Prove notebook reproducibility:** Always run `Restart & Run All` before committing or sharing `.ipynb` work.',
        '3. **Move reusable logic into `.py` modules:** Keep notebooks thin for visualization and keep core logic importable and testable.',
        '4. **Log errors loudly and cleanly:** Avoid bare `except: pass`; emit structured log fields capturing what failed and why.',
        '5. **Pin random seeds in code:** Fix `random_state` / `default_rng(seed)` whenever experiments must be compared fairly.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-0-3-1',
      difficulty: 'guided',
      requires: ['tracebacks'],
      title: 'Lab 0.3.1 (Guided): Python Traceback Inspector',
      prompt:
        'Implement `extract_traceback_summary(tb_text)` returning `{"error_type": str, "message": str, "frame": str}`. Take the non-empty lines of `tb_text`: the last line has `ErrorType: message` (split on `":"`, max 1 split), and `"frame"` is the LAST stripped line starting with `File "`.',
      starterCode: `def extract_traceback_summary(tb_text: str) -> dict[str, str]:
    lines = [ln.strip() for ln in tb_text.splitlines() if ln.strip()]
    # Parse lines[-1] into error_type and message, and find last File "..." line
    return {"error_type": "", "message": "", "frame": ""}

sample_tb = """Traceback (most recent call last):
  File "api.py", line 12, in handle
    return score_user(row)
  File "features.py", line 29, in score_user
    return row["tenure_days"] * 2
KeyError: 'tenure_days'"""
print(extract_traceback_summary(sample_tb))`,
      testCode: `tb1 = """Traceback (most recent call last):
  File "api.py", line 12, in handle
    return score_user(row)
  File "features.py", line 29, in score_user
    return row["tenure_days"] * 2
KeyError: 'tenure_days'"""
r1 = extract_traceback_summary(tb1)
assert r1["error_type"] == "KeyError", f"Got {r1}"
assert r1["message"] == "'tenure_days'", f"Got {r1}"
assert r1["frame"] == 'File "features.py", line 29, in score_user', f"Got {r1}"
print("PASS: Lab 0.3.1 Traceback parser passed!")`,
      solutionCode: `def extract_traceback_summary(tb_text: str) -> dict[str, str]:
    lines = [ln.strip() for ln in tb_text.splitlines() if ln.strip()]
    last = lines[-1]
    if ":" in last:
        err_type, msg = last.split(":", 1)
    else:
        err_type, msg = last, ""
    frames = [ln for ln in lines if ln.startswith('File "')]
    return {
        "error_type": err_type.strip(),
        "message": msg.strip(),
        "frame": frames[-1] if frames else "",
    }`,
      hint: 'Use `lines[-1].split(":", 1)` for `error_type` and `message`, and pick `frames[-1]` from `[ln for ln in lines if ln.startswith(\'File "\')]`.',
      hints: [
        'Split `lines[-1]` with `.split(":", 1)` so colons inside the error message stay intact.',
        'Filter all lines starting with `File "` into a list `frames` and take `frames[-1]`.',
        'Call `.strip()` on `error_type` and `message`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-0-3-2',
      difficulty: 'spec',
      requires: ['jupyter-cells', 'reproducibility'],
      title: 'Lab 0.3.2 (From Spec): Notebook Top-to-Bottom Reproducibility Checker',
      prompt:
        'Implement `find_uninitialized_reads(cells)` where `cells` is a list of cell dicts `{"reads": list[str], "writes": list[str]}` representing a notebook run strictly from Cell 0 to Cell N-1. Return a sorted list of variable names that are read by a cell BEFORE any earlier cell (or the same cell\'s `writes`? Check strictly: variables read before an *earlier* cell wrote them!) defines them.',
      starterCode: `def find_uninitialized_reads(cells: list[dict]) -> list[str]:
    # Track defined = set() as you walk cells in order 0..N-1.
    # For each cell, any v in cell["reads"] not in defined is broken!
    # Afterward add cell["writes"] to defined.
    return []`,
      testCode: `good_nb = [
    {"reads": [], "writes": ["df", "alpha"]},
    {"reads": ["df", "alpha"], "writes": ["preds"]},
]
assert find_uninitialized_reads(good_nb) == []

broken_nb = [
    {"reads": ["rate"], "writes": ["total"]},
    {"reads": ["total", "tax"], "writes": ["rate"]},
]
assert find_uninitialized_reads(broken_nb) == ["rate", "tax"], f"Got {find_uninitialized_reads(broken_nb)}"
print("PASS: Lab 0.3.2 Notebook Restart-&-Run-All validator passed!")`,
      solutionCode: `def find_uninitialized_reads(cells: list[dict]) -> list[str]:
    defined = set()
    missing = set()
    for cell in cells:
        for v in cell.get("reads", []):
            if v not in defined:
                missing.add(v)
        for v in cell.get("writes", []):
            defined.add(v)
    return sorted(missing)`,
      hint: 'Maintain `defined = set()` and `missing = set()`; check every variable in `cell["reads"]` against `defined` *before* adding `cell["writes"]`.',
      hints: [
        'Loop through `cells` from first to last.',
        'For each `v` in `cell.get("reads", [])`: if `v not in defined`, add `v` to `missing`.',
        'Then add every `v` in `cell.get("writes", [])` to `defined`, and return `sorted(missing)`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-0-3-3',
      difficulty: 'debug',
      requires: ['logging-basics'],
      title: 'Lab 0.3.3 (Debug Buggy Code): Fix Silent Error Swallowing in Pipeline',
      prompt:
        'This `load_scores(raw_items)` function currently uses a dangerous bare `except: pass`, hiding bad rows silently instead of recording structured errors! Fix `load_scores(raw_items)` so it converts valid numeric strings (`float(item)`) into `"values": list[float]`, and whenever `ValueError` or `TypeError` occurs, appends `{"level": "ERROR", "bad_item": str(item)}` to `"logs": list[dict]`. Return `{"values": ..., "logs": ...}`.',
      starterCode: `def load_scores(raw_items: list) -> dict:
    values, logs = [], []
    for item in raw_items:
        try:
            values.append(float(item))
        except:
            pass
    return {"values": values, "logs": logs}`,
      testCode: `res = load_scores(["0.85", "bad", "0.9", None])
assert res["values"] == [0.85, 0.9], f"Got {res}"
assert res["logs"] == [
    {"level": "ERROR", "bad_item": "bad"},
    {"level": "ERROR", "bad_item": "None"},
], f"Expected structured ERROR logs, got {res['logs']}"
print("PASS: Lab 0.3.3 Specific exception catching & structured logging passed!")`,
      solutionCode: `def load_scores(raw_items: list) -> dict:
    values, logs = [], []
    for item in raw_items:
        try:
            values.append(float(item))
        except (ValueError, TypeError):
            logs.append({"level": "ERROR", "bad_item": str(item)})
    return {"values": values, "logs": logs}`,
      hint: 'Replace bare `except:` and `pass` with `except (ValueError, TypeError):` and append `{"level": "ERROR", "bad_item": str(item)}` to `logs`.',
      hints: [
        'Use explicit exception catching: `except (ValueError, TypeError):`.',
        '`"bad"` triggers `ValueError` while `None` triggers `TypeError` when passed to `float(item)`.',
        'Append `{"level": "ERROR", "bad_item": str(item)}` inside the `except` block.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q0-3-1',
      type: 'multiple-choice',
      question: 'When debugging a 30-line Python traceback, where should you look FIRST to see what actually crashed?',
      options: [
        'The top line printing `Traceback (most recent call last)`',
        'The `.gitignore` configuration file inside the project root',
        'The final error line at the bottom and last File frame',
        'The middle line inside the third-party package install folder',
      ],
      correctIndex: 2,
      explanation: 'Python prints the oldest caller at the top and the exact error type, message, and failing frame at the bottom; `.gitignore` and intermediate library lines do not tell you the direct failure site first.',
    },
    {
      id: 'q0-3-2',
      type: 'multiple-choice',
      question: 'Why can a Jupyter notebook run fine interactively during exploration yet fail for a teammate?',
      options: [
        'Jupyter deletes every Python function inside `.ipynb` files after saving',
        'Running cells out of order leaves stale variables active in kernel RAM',
        'Notebooks automatically convert floating-point arrays into plain strings',
        'Git strips `import` lines whenever `.ipynb` files are committed',
      ],
      correctIndex: 1,
      explanation: 'Executing cells out of order keeps deleted or later-defined variables alive in RAM; "Restart & Run All" exposes hidden ordering bugs. Jupyter and Git preserve valid cells and imports.',
    },
    {
      id: 'q0-3-3',
      type: 'predict-output',
      question: 'Which Python exception name does running this 2-line script raise?',
      code: `metrics = {"accuracy": 0.91}
print(metrics["f1_score"])`,
      options: [
        'KeyError',
        'IndexError',
        'IndentationError',
        'ZeroDivisionError',
      ],
      correctIndex: 0,
      explanation: 'Looking up a missing key (`"f1_score"`) in a Python dictionary with `[...]` raises `KeyError`; `IndexError` is for list positions, `IndentationError` for spacing, and `ZeroDivisionError` for division by zero.',
    },
    {
      id: 'q0-3-4',
      type: 'spot-bug',
      question: 'What is the serious flaw in this production ingestion helper?',
      code: `def parse_all(rows):
    out = []
    for r in rows:
        try:
            out.append(int(r))
        except:
            pass
    return out`,
      options: [
        'Appending integers into `out` corrupts memory on empty input lists',
        'Calling `int(r)` inside a `for` loop always raises `NameError`',
        'Bare `except: pass` hides corrupt input rows and KeyboardInterrupt silently',
        'Returning `out` after a `try` block ignores valid numeric strings',
      ],
      correctIndex: 2,
      explanation: 'Bare `except: pass` catches every exception—even syntax/system interrupts—without logging which row broke; `out.append` handles empty lists fine, `int(r)` works inside loops, and `return out` returns parsed items normally.',
    },
    {
      id: 'q0-3-5',
      type: 'multiple-choice',
      question: 'When should notebook code be moved into tested `.py` modules (like `src/pipeline.py`)?',
      options: [
        'Never—production FastAPI servers directly import `.ipynb` JSON cells',
        'Only after training models for more than six months on GPUs',
        'Whenever code uses Python `for` loops or NumPy arrays',
        'As soon as logic is reused across runs, tested with pytest, or deployed',
      ],
      correctIndex: 3,
      explanation: 'Shared pipelines, CI tests (`pytest`), and deployed services require clean `.py` modules; APIs do not import `.ipynb` notebooks directly, and `.py` extraction happens long before six months.',
    },
    {
      id: 'q0-3-6',
      type: 'predict-output',
      question: 'What happens if you run Cell 1 first and Cell 2 second after clicking "Restart & Run All"?',
      code: `# Cell 1:
total = price * 1.1
# Cell 2:
price = 50`,
      options: [
        'Prints `55.0` cleanly without errors',
        'Raises `NameError` on Cell 1 because `price` is defined later',
        'Raises `KeyError` because `price` is an integer key',
        'Skips Cell 1 automatically and executes Cell 2 first',
      ],
      correctIndex: 1,
      explanation: 'Top-to-bottom execution evaluates `price * 1.1` before `price = 50` runs, raising `NameError`; Python never reorders notebook cells automatically.',
    },
    {
      id: 'q0-3-7',
      type: 'multi-select',
      question: 'Select ALL practices that improve reproducibility and debuggability in AI engineering workflows:',
      options: [
        'Pinning random seeds (`default_rng(42)`) in train/test experiments',
        'Logging structured JSON events with failure context on invalid inputs',
        'Running "Restart & Run All" before sharing or committing a notebook',
        'Wrapping entire 200-line scripts inside a single `except: pass` block',
      ],
      correctIndex: 0,
      correctIndices: [0, 1, 2],
      explanation: 'Fixed seeds, structured logs, and clean "Restart & Run All" checks catch silent bugs and drift; wrapping large scripts in `except: pass` hides errors completely.',
    },
    {
      id: 'q0-3-8',
      type: 'ordering',
      question: 'Order the debugging steps from receiving an error (top) to closing the issue safely (bottom):',
      options: [],
      correctIndex: 0,
      items: [
        'Read the bottom error type and failing line in the Traceback',
        'Write a minimal failing test reproducing the bad input',
        'Inspect local variables/types right before the failing line',
        'Apply the clean fix (without bare `except: pass`)',
        'Re-run the test suite to confirm regression passes',
      ],
      explanation: 'Start at the bottom of the traceback, lock in a minimal reproduction, inspect actual inputs, fix cleanly, and verify with tests.',
    },
    {
      id: 'q0-3-9',
      type: 'numeric',
      question: 'Suppose a script parses 10 input rows: 7 convert cleanly to `float` and 3 trigger logged `ValueError` entries. How many items appear in the returned `values` list?',
      options: [],
      correctIndex: 0,
      correctNumber: 7,
      tolerance: 0.01,
      unit: 'floats',
      explanation: 'The 7 valid rows are appended to `values`, while the 3 malformed rows go to `logs`.',
    },
  ],
};
