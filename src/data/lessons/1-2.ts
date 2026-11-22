import type { Lesson } from '@/types/course';

export const lesson1_2: Lesson = {
  id: '1-2',
  moduleId: 'mod-1',
  number: '1.2',
  title: 'Production Python: Files, JSON, Exceptions, Dataclasses & Type Hints',
  subtitle: 'Read and serialize real JSON safely, handle typed exceptions without silent traps, model clean records with dataclasses, and organize modules.',
  durationMinutes: 75,
  track: 'core',
  prerequisites: ['1.1'],
  requires: ['python-functions', 'python-dicts', 'python-sets'],
  teaches: [
    'python-files-json',
    'python-exceptions',
    'python-dataclasses',
    'python-type-hints',
    'python-modules',
  ],
  objectives: [
    'Read and write text/JSONL datasets cleanly with `with open(..., encoding="utf-8")` and distinguish strict JSON from Python dictionary syntax.',
    'Catch specific exceptions (`ValueError`, `json.JSONDecodeError`, `FileNotFoundError`) and raise explicit domain errors when contracts break.',
    'Replace messy untyped dictionaries with `@dataclass` schemas and readable Python type annotations.',
    'Structure multi-file Python imports cleanly using `if __name__ == "__main__":` guards.',
  ],
  checkWithoutNotes: [
    'Name three syntax differences between valid JSON text and a Python dictionary literal.',
    'Why do engineers wrap file operations in `with open(path, "r", encoding="utf-8") as f:` instead of calling `open()` without `with`?',
    'What goes wrong if you replace `except json.JSONDecodeError:` with a bare `except:` block that returns `{}`?',
    'When importing a helper from `utils.py`, why should test or script execution at the bottom live inside `if __name__ == "__main__":`?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'Junior engineers rarely write standalone 20-line puzzles on the job—they read JSONL training datasets off disk, validate structured responses returned by LLM APIs, define strongly typed configuration objects, and import helpers across modules inside a repository. When an incoming payload misses a required key or arrives with trailing syntax corruption, a loose dictionary script crashes vaguely halfway through batch processing with no hint which record broke.',
        'At the same time, mistaking Python dictionary formatting for strict JSON syntax causes constant bugs when configuring API payloads, tool schemas, or `package.json`/Docker files. Learning context-managed file I/O (`with open`), strict JSON serialization, targeted `try / except / raise` error contracts, `@dataclass` schemas, modern type hints, and clean module guards turns brittle scripts into production-grade software.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Shipping Containers (JSON), Blueprints (`@dataclass`) & Circuit Breakers (`try/except`)',
      paragraphs: [
        'First, understand why **Python `dict`** and **JSON (`str`)** are two completely different things. Think of a Python `dict` as live objects inside Python RAM—it allows single quotes (`\'name\'`), trailing commas, `True`/`False`/`None`, and arbitrary tuple keys. Think of **JSON** as a standardized shipping-container string sent over networks or saved to disk between Python, JavaScript, Go, and databases: strict JSON **must** use double quotes (`"name"`), forbids trailing commas, uses lowercase `true`/`false`/`null`, and allows only string keys. Calling `json.loads(text)` unpacks that JSON string into Python objects; calling `json.dumps(obj)` packs Python objects back into strict JSON.',
        'Second, use **`with open(path, "r", encoding="utf-8") as f:`** whenever reading or writing files on disk. The `with` **context manager** guarantees Python flushes buffers and closes the file descriptor automatically even if an exception fires halfway through reading—preventing leaked file handles or half-written corrupted JSON outputs.',
        'Third, stop passing mystery `"bag of keys"` dicts around ten functions (`user["score"]` vs `user["scores"]`!). A **`@dataclass`** defines a clean blueprint declaring field names, types (`float`, `list[str]`), and safe default factories (`field(default_factory=list)`), giving you autocomplete, crisp `__repr__` printing, and validation hooks. Paired with **Python type hints** (`def score_doc(text: str, limit: int = 5) -> list[str]:`) and targeted **`try / except`** circuit breakers, bugs surface loudly at module boundaries instead of corrupting metrics silently.',
      ],
    },
    {
      type: 'table',
      title: 'Python Dictionary Literal vs Strict JSON Specification',
      headers: ['Feature', 'Python `dict` (In-Memory Object)', 'Strict JSON (Wire / File String)', 'Conversion Method'],
      rows: [
        ['Quotes around keys/strings', 'Single `\'a\'` or double `"a"`', 'Strictly double `"a"` only', '`json.dumps(py_dict)` converts safely'],
        ['Booleans & null values', '`True`, `False`, `None`', '`true`, `false`, `null`', '`json.loads(json_str)` restores Python types'],
        ['Trailing commas', 'Allowed (`[1, 2,]`)', 'Forbidden (raises `JSONDecodeError`)', 'Never hand-build JSON with string `+`!'],
        ['Comments inside data', '`# comment` allowed in `.py` files', 'Not allowed in strict JSON', 'Keep schema notes in `.md` or docstrings'],
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Defensive JSONL File Parsing & Typed Exceptions',
      paragraphs: [
        'In real RAG ingestion and model evaluation pipelines, datasets frequently arrive as **JSON Lines (`.jsonl`)** where every line holds one independent JSON object. One malformed line on row 4,812 should never erase four thousand valid rows silently—nor should it go unrecorded! Instead, parse line by line inside `try / except json.JSONDecodeError`, raise explicit `ValueError` when required schema fields are missing, and log structured rejection metrics.',
        'Notice we use Python\'s in-memory `io.StringIO` below alongside standard file-handle methods (`.read()`, `.splitlines()`) so you can run the exact same file-reading logic both inside your browser and on real disk files opened via `with open("events.jsonl", "r", encoding="utf-8") as f:`.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Safe JSONL Loader with Explicit Validation + Output',
      language: 'python',
      code: `import io
import json

def load_valid_records(file_obj) -> tuple[list[dict], list[str]]:
    valid, errors = [], []
    for line_no, raw in enumerate(file_obj, start=1):
        text = raw.strip()
        if not text:
            continue
        try:
            obj = json.loads(text)
            if "id" not in obj or not isinstance(obj.get("score"), (int, float)):
                raise ValueError("Missing 'id' or numeric 'score'")
            valid.append(obj)
        except (json.JSONDecodeError, ValueError) as exc:
            errors.append(f"line {line_no}: {exc}")
    return valid, errors

stream = io.StringIO('{"id": "d1", "score": 0.91}\\n{bad json\\n{"id": "d2"}\\n')
rows, errs = load_valid_records(stream)
print("Valid :", rows)
print("Errors:", errs)`,
      caption: 'Explained output: `Valid: [{\'id\': \'d1\', \'score\': 0.91}]`, `Errors: ["line 2: Expecting property name...", "line 3: Missing \'id\' or numeric \'score\'"]`. Valid rows survive while broken lines record exact line numbers and reasons.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: `@dataclass`, Type Hints & Module Guards',
      paragraphs: [
        'When your codebase tracks documents, LLM responses, or evaluation runs, a `@dataclass` eliminates guesswork about key names and ensures non-trivial defaults (like lists) never hit mutable-default sharing via `field(default_factory=list)`. Notice also Python\'s **module entrypoint guard**: `if __name__ == "__main__":`. When you run `python rag_schema.py` directly, Python sets `__name__ == "__main__"` and executes your demo CLI block; when another file runs `from rag_schema import DocumentChunk`, `__name__` equals `"rag_schema"`, so the demo CLI block stays safely quiet during import!',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 2: Clean `@dataclass` Model + Module Entrypoint Guard',
      language: 'python',
      code: `from dataclasses import dataclass, field, asdict
import json

@dataclass
class EvalResult:
    case_id: str
    passed: bool
    latency_ms: float
    tags: list[str] = field(default_factory=list)

    def summary(self) -> str:
        status = "PASS" if self.passed else "FAIL"
        return f"[{status}] {self.case_id} ({self.latency_ms:.1f}ms)"

item = EvalResult(case_id="rag-01", passed=True, latency_ms=142.3, tags=["acl"])
print(item.summary())
print(json.dumps(asdict(item)))`,
      caption: 'Explained output: `[PASS] rag-01 (142.3ms)` and `{"case_id": "rag-01", "passed": true, "latency_ms": 142.3, "tags": ["acl"]}`. Notice `asdict(item)` + `json.dumps(...)` converts Python `True` cleanly into strict JSON `true`.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Immutable Configs (`frozen=True`), Custom Errors & Clean Imports',
      paragraphs: [
        'As pipelines grow across multiple files (`src/config.py`, `src/ingest.py`, `src/eval.py`), teams frequently declare `@dataclass(frozen=True)` for shared settings like timeouts, batch sizes, and model names. Adding `frozen=True` prevents downstream helper functions from accidentally overwriting `cfg.model = ...` mid-run—raising `FrozenInstanceError` immediately at the bug site instead of subtly skewing later metrics.',
        'Pair clean configs with **custom domain exceptions** subclassing `ValueError` or `RuntimeError` (such as `class SchemaValidationError(ValueError): pass`) and **exception chaining** (`raise SchemaValidationError("missing tenant") from exc`). Preserving `from exc` keeps the original `JSONDecodeError` or `KeyError` attached inside Python\'s traceback so engineers see both *what business contract failed* and *what low-level line broke* simultaneously. When debugging logs locally, `json.dumps(obj, indent=2)` prints human-readable indented blocks, while streaming `.jsonl` logs use compact single-line `json.dumps(obj)` without indentation.',
        'For quick small config files, `pathlib.Path("cfg.json").read_text(encoding="utf-8")` and `.write_text(..., encoding="utf-8")` provide clean one-line wrappers around `with open(...)`, while large datasets stream line-by-line inside `with open(...)` so memory usage stays constant regardless of file size. Also remember modern Python `3.10+` type-hint syntax: `str | None` indicates a value may be missing (`None`), signaling to every reader that an explicit `if val is None:` guard is required before calling string methods.',
        'Finally, organize reusable helpers inside a clean `src/` package with explicit absolute imports (`from src.ingest import load_valid_records`). Run your scripts from the repo root via module syntax (`python -m src.eval`) rather than stepping into sub-folders (`cd src && python eval.py`), because `python -m` anchors Python\'s import path consistently across local development, `pytest`, and Docker containers.',
        'You may also wonder when to reach for a plain Python **`class`** (defining custom `__init__`, private internal caches, or stateful client pools) versus **`@dataclass`**. Whenever an object primarily stores structured fields plus small inspection helpers—such as `DocumentChunk`, `ModelConfig`, or `EvalResult`—`@dataclass` generates `__init__`, equality comparison (`==`), and clean debug printing automatically with one-fifth the boilerplate. Reach for standard classes when managing live stateful connections (like an HTTP pool, retry counter, or vector index wrapper) whose setup logic differs from plain field assignment.',
        'When writing reports or evaluation artifacts back to disk, pass `ensure_ascii=False` to `json.dumps(..., indent=2, ensure_ascii=False)` alongside UTF-8 `open(..., "w", encoding="utf-8")` so non-English scripts—including Arabic, accented European text, or mathematical symbols—stay human-readable instead of turning into unreadable `\\u0623` escape codes.',
      ],
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Using `str(my_dict)` instead of `json.dumps(my_dict)`:** Printing a Python dict uses single quotes and `True`/`None`, producing invalid JSON that breaks JavaScript clients or `json.loads()`. Always serialize using `json.dumps(obj)`!',
        '**Mistake 2 — Using mutable `tags: list[str] = []` directly inside a `@dataclass`:** Python refuses this immediately with `ValueError: mutable default <class \'list\'> for field tags is not allowed`. Always use `field(default_factory=list)`.',
        '**Mistake 3 — Bare `except Exception:` returning dummy `0` or `{}`:** Catching overly broad exceptions silently hides typos (`NameError`, `AttributeError`) or disk-full errors. Catch the exact failure (`json.JSONDecodeError`, `KeyError`, `ValueError`), log or record it, and let unexpected programmer bugs fail loudly.',
        '**Mistake 4 — Forgetting `encoding="utf-8"` in `open()`:** Windows defaults to legacy codepages (`cp1252`), which crash with `UnicodeDecodeError` on multilingual text, smart quotes, or emoji! Always pass `encoding="utf-8"`.',
        '**Mistake 5 — Missing `if __name__ == "__main__":` in library modules:** Writing top-level demo calls or `model.fit()` outside `if __name__ == "__main__":` executes slow scripts automatically whenever `pytest` or an API server imports a function from that file.',
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Keep Python dicts and JSON distinct:** JSON is always a strict double-quoted string; use `json.loads()` and `json.dumps()`.',
        '2. **Open files with context managers:** Always use `with open(path, mode, encoding="utf-8") as f:` so handles close cleanly even after errors.',
        '3. **Catch specific exceptions:** Handle `json.JSONDecodeError`, `ValueError`, or `KeyError` explicitly rather than silencing everything with bare `except:`.',
        '4. **Use `@dataclass` & type hints:** Replace error-prone untyped dictionaries with readable, IDE-checked schemas and `field(default_factory=list)`.',
        '5. **Guard module scripts:** Wrap top-level CLI runners inside `if __name__ == "__main__":` so imports remain side-effect-free.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-2-1',
      difficulty: 'guided',
      requires: ['python-files-json', 'python-exceptions'],
      title: 'Lab 1.2.1 (Guided): Safe JSON Config Parser & Round-Trip Serializer',
      prompt:
        'Implement two helpers: 1) `parse_model_config(raw_json)` returning the parsed dict if valid JSON with `"model"` (str) and `"temperature"` (int or float between `0.0` and `2.0`), otherwise raising `ValueError`. 2) `to_strict_json(config)` returning a strict JSON string sorted by keys (`json.dumps(config, sort_keys=True)`).',
      starterCode: `import json

def parse_model_config(raw_json: str) -> dict:
    # Step 1: Parse raw_json with json.loads (convert JSONDecodeError -> ValueError)
    # Step 2: Check "model" is non-empty str and 0.0 <= temperature <= 2.0
    # Step 3: Return parsed dict
    pass

def to_strict_json(config: dict) -> str:
    # Return json.dumps(config, sort_keys=True)
    pass

print(parse_model_config('{"model": "mini", "temperature": 0.2}'))`,
      testCode: `cfg = parse_model_config('{"model": "mini-4", "temperature": 0.0, "stream": true}')
assert cfg["model"] == "mini-4" and cfg["stream"] is True
assert to_strict_json({"b": True, "a": None}) == '{"a": null, "b": true}'

for bad in ['{bad}', '{"temperature": 0.5}', '{"model": "m", "temperature": 3.5}']:
    try:
        parse_model_config(bad)
        assert False, f"Should have raised ValueError for {bad}"
    except ValueError:
        pass
print("PASS: Lab 1.2.1 Strict JSON parser & validator passed!")`,
      solutionCode: `import json

def parse_model_config(raw_json: str) -> dict:
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON: {exc}") from exc
    if not isinstance(data, dict) or not isinstance(data.get("model"), str) or not data["model"].strip():
        raise ValueError("Missing valid 'model' string")
    temp = data.get("temperature")
    if not isinstance(temp, (int, float)) or isinstance(temp, bool) or not (0.0 <= temp <= 2.0):
        raise ValueError("Invalid 'temperature' outside [0.0, 2.0]")
    return data

def to_strict_json(config: dict) -> str:
    return json.dumps(config, sort_keys=True)`,
      hint: 'Wrap `json.loads` in `try/except json.JSONDecodeError`, raise `ValueError` on invalid fields (`note: isinstance(True, int)` is `True` in Python!), and use `json.dumps(config, sort_keys=True)`.',
      hints: [
        'Use `try: data = json.loads(raw_json) except json.JSONDecodeError as exc: raise ValueError(...) from exc`.',
        'Verify `isinstance(data.get("model"), str)` and `isinstance(temp, (int, float))` and `0.0 <= temp <= 2.0`.',
        'Return `json.dumps(config, sort_keys=True)` in `to_strict_json`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-2-2',
      difficulty: 'spec',
      requires: ['python-dataclasses', 'python-type-hints'],
      title: 'Lab 1.2.2 (From Spec): `@dataclass` Document Record & File-Like JSONL Exporter',
      prompt:
        'Define a `@dataclass` `ChunkRecord` with typed fields `chunk_id: str`, `tenant: str`, `tokens: int`, and `tags: list[str] = field(default_factory=list)`. Add a method `is_valid(self) -> bool` returning `True` iff `chunk_id` and `tenant` are non-empty strings and `tokens > 0`. Then implement `export_jsonl(records: list[ChunkRecord]) -> str` serializing ONLY valid records (one `json.dumps(asdict(rec), sort_keys=True)` per line, joined with `"\\n"`).',
      starterCode: `from dataclasses import dataclass, field, asdict
import json

# Define @dataclass ChunkRecord and export_jsonl(records)
`,
      testCode: `r1 = ChunkRecord("c1", "acme", 120, ["hr"])
r2 = ChunkRecord("c2", "acme", 0)
r3 = ChunkRecord("c3", "beta", 64)
assert r1.is_valid() is True and r2.is_valid() is False
assert r2.tags == [] and r3.tags == []
r2.tags.append("test")
assert r3.tags == [], "tags default list must not be shared across instances!"

out = export_jsonl([r1, r2, r3])
lines = out.splitlines()
assert len(lines) == 2
assert json.loads(lines[0])["chunk_id"] == "c1"
assert json.loads(lines[1])["tenant"] == "beta"
print("PASS: Lab 1.2.2 Dataclass schema & JSONL export passed!")`,
      solutionCode: `from dataclasses import dataclass, field, asdict
import json

@dataclass
class ChunkRecord:
    chunk_id: str
    tenant: str
    tokens: int
    tags: list[str] = field(default_factory=list)

    def is_valid(self) -> bool:
        return bool(self.chunk_id.strip() and self.tenant.strip() and self.tokens > 0)

def export_jsonl(records: list[ChunkRecord]) -> str:
    return "\\n".join(
        json.dumps(asdict(r), sort_keys=True)
        for r in records
        if r.is_valid()
    )`,
      hint: 'Use `tags: list[str] = field(default_factory=list)`, check non-empty strings and `self.tokens > 0` in `is_valid`, and serialize valid items with `asdict`.',
      hints: [
        'Decorate `class ChunkRecord:` with `@dataclass` and set `tags: list[str] = field(default_factory=list)`.',
        'Inside `is_valid`, verify `bool(self.chunk_id.strip() and self.tenant.strip() and self.tokens > 0)`.',
        'Filter `[r for r in records if r.is_valid()]` and join `json.dumps(asdict(r), sort_keys=True)` with `"\\n"`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-1-2-3',
      difficulty: 'debug',
      requires: ['python-files-json', 'python-exceptions'],
      title: 'Lab 1.2.3 (Debug Buggy Code): Fix Silent File-Read Bug & Non-JSON Formatting',
      prompt:
        'A broken log summarizer tries to parse JSON lines from `raw_stream` (an `io.StringIO` file-like object) and return a strict JSON summary `{"ok": int, "failed": int}`. Currently: 1) it passes `raw_stream` to `json.loads()` directly instead of iterating lines, 2) bare `except:` silently ignores failed lines instead of incrementing `failed`, and 3) it returns `str(summary)` (single-quoted Python dict!) instead of `json.dumps(summary)`. Fix `summarize_jsonl(raw_stream)`!',
      starterCode: `import io
import json

def summarize_jsonl(raw_stream) -> str:
    ok, failed = 0, 0
    try:
        json.loads(raw_stream)
        ok += 1
    except:
        pass
    summary = {"ok": ok, "failed": failed}
    return str(summary)`,
      testCode: `import io, json
sample = io.StringIO('{"a": 1}\\n{bad}\\n\\n{"b": 2}\\n')
res_str = summarize_jsonl(sample)
parsed = json.loads(res_str)
assert parsed == {"ok": 2, "failed": 1}, f"Expected ok=2, failed=1, got {parsed}"
print("PASS: Lab 1.2.3 JSONL reader & strict JSON output fixed!")`,
      solutionCode: `import io
import json

def summarize_jsonl(raw_stream) -> str:
    ok, failed = 0, 0
    for line in raw_stream:
        text = line.strip()
        if not text:
            continue
        try:
            json.loads(text)
            ok += 1
        except json.JSONDecodeError:
            failed += 1
    return json.dumps({"ok": ok, "failed": failed}, sort_keys=True)`,
      hint: 'Iterate `for line in raw_stream:`, skip empty `text = line.strip()`, catch `json.JSONDecodeError` to increment `failed`, and return `json.dumps(...)`.',
      hints: [
        'Loop line-by-line over `raw_stream`, skipping empty lines (`if not text: continue`).',
        'Catch `json.JSONDecodeError` specifically and add `failed += 1`.',
        'Replace `str(summary)` with `json.dumps(summary, sort_keys=True)`.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q1-2-1',
      type: 'multiple-choice',
      question: 'Which statement explains why `str({"ok": True, "err": None})` breaks downstream JSON parsers?',
      options: [
        '`str()` truncates nested string payloads longer than 64 characters without warning',
        '`str()` automatically drops any key whose assigned value equals `None` or `False`',
        '`str()` uses single quotes and Python `True`/`None` instead of JSON double quotes and `true`/`null`',
        '`str()` re-sorts keys alphabetically, violating strict JSON RFC field ordering rules',
      ],
      correctIndex: 2,
      explanation: 'Python\'s `str(dict)` produces Python syntax (`\'ok\': True, \'err\': None`), whereas strict JSON requires double quotes and lowercase `true`/`false`/`null` produced by `json.dumps()`.',
    },
    {
      id: 'q1-2-2',
      type: 'spot-bug',
      code: `@dataclass
class AgentState:
    history: list[str] = []`,
      question: 'What happens when Python evaluates this `@dataclass` class definition?',
      options: [
        'It silently shares the `[]` list across every `AgentState` instance at runtime',
        'It converts `history` into an immutable tuple automatically at creation time',
        'It only raises an error if two instances append items on different worker threads',
        'Python raises `ValueError: mutable default <class \'list\'>` for `history`',
      ],
      correctIndex: 3,
      explanation: 'Python `@dataclass` intentionally blocks bare mutable defaults like `[]` or `{}` with `ValueError` to prevent shared-list bugs. Use `field(default_factory=list)` instead.',
    },
    {
      id: 'q1-2-3',
      type: 'predict-output',
      code: `import json
raw = '{"active": true, "note": null}'
obj = json.loads(raw)
print(type(obj["active"]).__name__, obj["note"] is None)`,
      question: 'What exact output is printed?',
      options: [
        '`bool True`',
        '`str False` after converting JSON tokens literally',
        '`bool False` since `null` maps to empty string `""`',
        'Raises `json.JSONDecodeError` on unquoted `true`',
      ],
      correctIndex: 0,
      explanation: '`json.loads()` translates JSON `true` into Python `bool` (`True`) and JSON `null` into Python `None`, so `type(obj["active"]).__name__` is `bool` and `obj["note"] is None` is `True`.',
    },
    {
      id: 'q1-2-4',
      type: 'multi-select',
      question: 'Which TWO practices make file reading and module imports safe in production Python?',
      options: [
        'Opening files with `with open(path, "r", encoding="utf-8") as f:`',
        'Wrapping CLI script demos inside `if __name__ == "__main__":`',
        'Catching all exceptions with bare `except: pass` so imports never raise errors',
        'Calling `f = open(path)` without `with` or `f.close()` so files stay cached',
      ],
      correctIndex: 0,
      correctIndices: [0, 1],
      explanation: 'Using `with open(..., encoding="utf-8")` guarantees deterministic closing and cross-OS UTF-8 decoding, and `if __name__ == "__main__":` stops demo scripts from running on import.',
    },
    {
      id: 'q1-2-5',
      type: 'multiple-choice',
      question: 'In a file `helpers.py` imported via `import helpers` inside `tests/test_app.py`, what is `__name__` inside `helpers.py` during test execution?',
      options: [
        '`"__main__"` across all imported modules',
        '`"pytest"` injected by the test runner',
        '`None` whenever imported outside root',
        '`"helpers"`',
      ],
      correctIndex: 3,
      explanation: 'Only the directly executed script gets `__name__ == "__main__"`. Any imported module receives its own module name (`"helpers"`), skipping the `__main__` block.',
    },
    {
      id: 'q1-2-6',
      type: 'numeric',
      question: 'How many keys are present in `json.loads(\'{"a": [1, 2], "b": {"c": 3}}\')` at the top level?',
      options: [],
      correctIndex: 0,
      correctNumber: 2,
      tolerance: 0,
      explanation: 'The top-level dictionary has two keys: `"a"` and `"b"` (`"c"` is nested inside `"b"`).',
    },
    {
      id: 'q1-2-7',
      type: 'ordering',
      question: 'Order these lines to safely read a UTF-8 JSON file into a Python dictionary:',
      options: [],
      items: [
        'from pathlib import Path; import json',
        'cfg_path = Path("config.json")',
        'with open(cfg_path, "r", encoding="utf-8") as f:',
        '    config = json.load(f)',
      ],
      correctIndex: 0,
      explanation: 'Import modules, construct the `Path`, open the file cleanly inside a `with` UTF-8 context manager, and parse using `json.load(f)`.',
    },
    {
      id: 'q1-2-8',
      type: 'multiple-choice',
      question: 'Why does `isinstance(True, int)` evaluate to `True` in Python?',
      options: [
        'Because `bool` subclasses `int` (`True == 1`, `False == 0`)',
        'It actually returns `False` unless `bool` is passed explicitly as the second type',
        'Because Python implicitly converts `True` into string `"1"` before type checking',
        'Only inside `@dataclass` fields does `bool` inherit numeric behavior from `int`',
      ],
      correctIndex: 0,
      explanation: 'Python\'s `bool` subclasses `int`, so when validating numeric inputs (`isinstance(val, (int, float))`), explicitly reject booleans (`and not isinstance(val, bool)`)!',
    },
    {
      id: 'q1-2-9',
      type: 'spot-bug',
      code: `def parse_port(raw: str) -> int:
    try:
        return int(raw)
    except Exception:
        return 0`,
      question: 'What subtle problem exists in returning `0` inside `except Exception:` when parsing configuration?',
      options: [
        '`int("8000")` unexpectedly raises `TypeError` on valid digit strings',
        'The `return 0` syntax is disallowed inside Python `except` handlers',
        'Bad config like `"eight-thousand"` silently returns `0` instead of failing loudly',
        '`except Exception:` catches syntax failures while ignoring `ValueError`',
      ],
      correctIndex: 2,
      explanation: 'Returning a fake `0` on broad `Exception` hides bad deployment config (`PORT="abc"`) until obscure network errors happen later. Catch `ValueError` specifically and raise a clear config error.',
    },
  ],
};
