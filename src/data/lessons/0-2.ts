import type { Lesson } from '@/types/course';

export const lesson0_2: Lesson = {
  id: '0-2',
  moduleId: 'mod-0',
  number: '0.2',
  title: 'Git, GitHub, Branches, Pull Requests & Merge Conflicts',
  subtitle: 'Version-control your AI code like a software team: commits, branches, clean diffs, Pull Requests, and conflict resolution.',
  durationMinutes: 60,
  track: 'core',
  prerequisites: ['0.1'],
  requires: ['terminal-paths', 'env-secrets'],
  teaches: [
    'git-commits',
    'git-branches',
    'git-diff',
    'merge-conflicts',
    'pull-requests',
  ],
  objectives: [
    'Use the core Git snapshot cycle (`git status`, `git add`, `git commit`, `git push`) safely without losing work.',
    'Develop features cleanly on separate branches (`git checkout -b`) and open reviewable Pull Requests.',
    'Read unified `git diff` patches line by line to review teammate code and spot regressions early.',
    'Resolve merge conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) calmly without breaking syntax.',
  ],
  checkWithoutNotes: [
    'Explain the three Git stages a modified file passes through: Working Directory, Staging Area, and Committed History.',
    'Why do engineering teams work on short-lived feature branches (`feat/rag-eval`) instead of committing straight to `main`?',
    'In a unified `git diff`, what is the difference between lines beginning with `+++` / `---` and lines beginning with single `+` / `-`?',
    'When a merge conflict happens, what do the `<<<<<<<`, `=======`, and `>>>>>>>` markers represent?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'On any engineering team, code lives in Git. Whether you are updating a RAG chunking script, adding a scikit-learn feature, tuning prompt templates, or adjusting an agent guardrail, nobody shares code via zip attachments named `final_v2_REALLY_FINAL.py`. Every single change travels through a dedicated **branch**, a line-by-line **diff**, and a **Pull Request (PR)** reviewed by teammates and verified by automated CI tests before merging into `main`.',
        'Knowing Git is equally critical as a surgical safety net. When an evaluation score drops at 4 PM on Friday, Git lets you inspect exact line changes since yesterday (`git diff`), examine recent history (`git log --oneline`), or discard a broken un-staged experiment cleanly (`git restore <file>`). Conversely, rushing through Git without checking `git status`—or panicking when encountering a merge conflict—leads to overwritten teammate fixes, bloated unreadable commits, or accidentally staging `.env` credentials.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Save Points, Parallel Draft Notebooks & Track Changes',
      paragraphs: [
        'Picture writing an important group report using a notebook system with permanent save points (**commits**). Every commit records a timestamped snapshot of your code along with a short message explaining *why* you changed it and a unique identifier hash (such as `a4f9c12`). Think of **`main`** as the published master edition that production servers and continuous integration expect to stay green at all times.',
        'Instead of scribbling half-finished experiments directly inside that published master copy, you branch off a clean parallel notebook (**feature branch** via `git checkout -b feat/hybrid-search` or `git switch -c feat/hybrid-search`). Inside your local workspace, files pass through three distinct zones: first your **Working Directory** (raw edited files on disk), next the **Staging Area** (a packing tray built with `git add <file>` containing only the exact changes belonging together), and finally **Repository History** (the permanent save point sealed with `git commit`). Why does that middle Staging Area exist? Because if you fixed a critical bug in `rag.py` while also adding personal scratch experiments in `notes.txt`, `git add rag.py` lets you ship only the clean bug fix without polluting team history.',
        'When your branch passes local tests, you push it to GitHub (`git push -u origin feat/hybrid-search`) and open a **Pull Request**. GitHub computes a side-by-side "Track Changes" **`git diff`** showing every modified line so reviewers can leave inline comments and automated CI workflows can execute tests before clicking Merge. If two teammates edited the exact same lines on separate branches before merging, Git pauses safely and marks both versions inside `<<<<<<<` / `=======` / `>>>>>>>` conflict markers so an engineer—never a blind coin toss—decides the combined logic.',
      ],
    },
    {
      type: 'table',
      title: 'Essential Everyday Git Commands (No Guesswork)',
      headers: ['Command', 'What It Does', 'When to Run It'],
      rows: [
        ['`git status`', 'Lists current branch, modified files, and staged files', 'Run before every `add`, `commit`, or `push`'],
        ['`git checkout -b feat/x`', 'Creates and switches onto a new isolated branch', 'Before starting any ticket or feature'],
        ['`git diff`', 'Shows exact added (`+`) and deleted (`-`) lines', 'Before staging files, to verify zero debug clutter'],
        ['`git add <file>`', 'Moves edited file(s) to the Staging Area tray', 'After checking `git status` and `git diff`'],
        ['`git commit -m "msg"`', 'Records a permanent snapshot from staged files', 'When a logical unit of work passes tests'],
        ['`git push -u origin feat/x`', 'Uploads branch commits to GitHub', 'To back up work or open a Pull Request'],
      ],
    },
    {
      type: 'prose',
      heading: 'Local-to-GitHub Pull Request Workflow: Step-by-Step Checklist',
      paragraphs: [
        'Follow this repeatable five-step team rhythm on every feature or bug fix you build throughout this course. First, make sure your local `main` is up to date (`git checkout main && git pull origin main`) before creating a short-lived branch (`git checkout -b feat/eval-gate`). Never branch off stale code from two weeks ago unless you enjoy giant merge conflicts.',
        'Second, write small, focused changes and verify tests locally (`pytest` or `npm test`) before staging files. Third, run `git status` and `git diff` to confirm zero debug `print()` leftovers, unused datasets, or `.env` files appear anywhere in your changeset. Fourth, stage and commit with a clear imperative subject (`feat: add citation recall check`) and push your branch. Fifth, open the Pull Request on GitHub, write a brief summary explaining *what changed* and *how you tested it*, wait for green CI checks and reviewer feedback, push follow-up commits onto the same branch if requested, and only delete the branch once merged.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Reading a Unified `git diff` Patch',
      paragraphs: [
        'When a teammate requests your review on a Pull Request—or when CI prints a failing patch check—you must read a unified diff effortlessly. File metadata headers always begin with `--- a/...` (the previous version) and `+++ b/...` (the new version), followed by hunk coordinates like `@@ -4,3 +4,4 @@` indicating line numbers and line counts before and after the edit.',
        'Inside each hunk, a single leading minus sign (`-`) shows a deleted line, a single leading plus sign (`+`) shows an added line, and a single leading space provides unchanged surrounding context lines so you can understand where the edit sits. Confusing three-character file headers (`+++` / `---`) with single-character line additions or deletions is a surprisingly common bug when building automated diff analyzers or pre-commit checks. Trace the Python diff analyzer and its explained output below:',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Parsing Added vs Removed Lines in a Git Diff',
      language: 'python',
      code: `diff_patch = """--- a/rag.py
+++ b/rag.py
@@ -4,3 +4,4 @@ def search(docs, tenant):
-    return sorted(docs)[:5]
+    allowed = [d for d in docs if d["tenant"] == tenant]
+    return sorted(allowed)[:5]"""

added, removed = [], []
for line in diff_patch.splitlines():
    if line.startswith("+++") or line.startswith("---") or line.startswith("@@"):
        continue
    if line.startswith("+"):
        added.append(line[1:].strip())
    elif line.startswith("-"):
        removed.append(line[1:].strip())

print("Removed:", removed)
print("Added  :", added)`,
      caption: 'Explained output: `Removed: [\'return sorted(docs)[:5]\']` and `Added: [\'allowed = [d for d in docs if d["tenant"] == tenant]\', \'return sorted(allowed)[:5]\']`. Skipping `+++`, `---`, and `@@` ensures filename headers and hunk ranges are never mistaken for edited code lines.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Resolving a Merge Conflict Calmly',
      paragraphs: [
        'Suppose you tuned `MAX_RETRIES = 3` in `config.py` on your feature branch while a teammate merged `ENABLE_ACL = True` at the very same spot on `main`. When you update your branch (`git merge main`), Git merges every non-overlapping file cleanly, pauses strictly on `config.py`, and writes both competing sections side by side inside the file.',
        'Every conflict follows one exact anatomy: lines from `<<<<<<< HEAD` down to `=======` reflect **your current branch** (`HEAD`), while lines from `=======` down to `>>>>>>> origin/main` reflect **the incoming branch**. Think deliberately about intent rather than blindly picking top or bottom: here, both configuration constants belong together! You keep both settings, **delete all three marker lines** (`<<<<<<< HEAD`, `=======`, `>>>>>>> origin/main`), re-run your test suite (`pytest`) to catch any subtle interaction or syntax errors, and seal the resolution with `git add config.py` followed by `git commit`.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 2: Anatomy of a Resolved Merge Conflict',
      language: 'python',
      code: `conflicted = """TIMEOUT_SEC = 10
<<<<<<< HEAD
MAX_RETRIES = 3
=======
ENABLE_ACL = True
>>>>>>> origin/main"""

# Clean resolution keeps BOTH non-conflicting config settings and removes markers:
cleaned = [
    line for line in conflicted.splitlines()
    if not line.startswith(("<<<<<<<", "=======", ">>>>>>>"))
]
print("\\n".join(cleaned))`,
      caption: 'Explained output prints three valid Python assignments (`TIMEOUT_SEC = 10`, `MAX_RETRIES = 3`, `ENABLE_ACL = True`) with zero syntax-breaking marker lines remaining.',
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Running `git add .` blindly without `git status`:** Blindly sweeping an entire directory often stages temporary `.csv` exports, `.ipynb_checkpoints`, large binary weights, or unignored API keys. Always run `git status` first, inspect modifications with `git diff`, and stage specific intended files.',
        '**Mistake 2 — Committing conflict markers into Python or JSON files:** Leaving `<<<<<<< HEAD` inside a `.py` file immediately triggers `SyntaxError: invalid syntax` in production or CI. Search for `"<<<<<<<"` across your repository (`git grep "<<<<<<<"`) and run your test command after every merge before committing.',
        '**Mistake 3 — Developing for days directly on `main`:** When local `main` diverges from team updates on `origin/main`, pulling later creates tangles and blocks clean Pull Requests. If you realize you started editing on `main` before committing, create a fresh branch immediately (`git checkout -b fix/my-ticket`)—Git carries uncommitted edits smoothly onto the new branch.',
        '**Mistake 4 — Vague commit messages like `"fix"` or `"wip2"`:** When tracing a model regression weeks later via `git log`, uninformative messages force engineers to read every line of every diff. Write crisp, action-oriented summaries describing *what* and *why* (for instance, `fix: enforce tenant pre-filter before top_k`).',
        '**Mistake 5 — Force-pushing shared team branches carelessly:** Commands like `git push --force` overwrite history on GitHub and break copies checked out by teammates. Stick to normal `git push` on shared branches, or ask before rewriting history on a personal PR branch.',
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Inspect before committing:** Check `git status` and `git diff` so only intended source changes are staged.',
        '2. **Isolate work in branches:** Never edit `main` directly; create a descriptive feature branch per task.',
        '3. **Stage intentionally:** Use `git add <file>` to group cohesive edits into clean, revertible commits.',
        '4. **Read diffs carefully:** Distinguish `+++`/`---` metadata headers from `+` additions and `-` deletions.',
        '5. **Resolve conflicts cleanly:** Combine valid code, remove all `<<<<<<<` / `=======` / `>>>>>>>` markers, and re-run tests before committing.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-0-2-1',
      difficulty: 'guided',
      requires: ['git-commits', 'git-branches'],
      title: 'Lab 0.2.1 (Guided): Pull Request Hygiene & Branch Gate',
      prompt:
        'Teams often add automated PR checks. Implement `validate_pr(branch_name, commits)` returning `True` ONLY when: 1) `branch_name` is NOT `"main"` and starts with `"feat/"` or `"fix/"`, AND 2) `commits` is non-empty and EVERY commit message starts with `"feat:"` or `"fix:"` (after stripping whitespace).',
      starterCode: `def validate_pr(branch_name: str, commits: list[str]) -> bool:
    # Check branch_name prefix and validate all commit messages
    pass

print(validate_pr("feat/rag-acl", ["feat: add tenant prefilter", "fix: edge case empty docs"]))`,
      testCode: `assert validate_pr("feat/rag-acl", ["feat: add tenant prefilter", "fix: edge case"]) is True
assert validate_pr("fix/sql-join", ["fix: preserve trial users"]) is True
assert validate_pr("main", ["feat: direct commit"]) is False, "Direct commits to main must fail!"
assert validate_pr("feat/test", []) is False, "Empty PR commits must fail!"
assert validate_pr("feat/test", ["wip"]) is False, "Non-conventional commit message must fail!"
print("PASS: Lab 0.2.1 PR & branch gate passed!")`,
      solutionCode: `def validate_pr(branch_name: str, commits: list[str]) -> bool:
    if branch_name == "main" or not branch_name.startswith(("feat/", "fix/")):
        return False
    if not commits:
        return False
    return all(c.strip().startswith(("feat:", "fix:")) for c in commits)`,
      hint: 'Check `branch_name.startswith(("feat/", "fix/"))`, guard `if not commits: return False`, and use `all(c.strip().startswith(("feat:", "fix:")) for c in commits)`.',
      hints: [
        'Use Python tuple prefixes cleanly: `branch_name.startswith(("feat/", "fix/"))`.',
        'Guard against empty commit lists with `if not commits: return False`.',
        'Verify every message with `all(c.strip().startswith(("feat:", "fix:")) for c in commits)`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-0-2-2',
      difficulty: 'spec',
      requires: ['git-diff'],
      title: 'Lab 0.2.2 (From Spec): Git Diff Added/Removed Counter',
      prompt:
        'Implement `summarize_diff(diff_text)` returning `{"added": int, "removed": int}` by counting lines in `diff_text` that represent added code (`+` not `+++`) and removed code (`-` not `---`). Also collect any added lines containing `"sk-"` into `"secret_warnings": list[str]`. Return `{"added": ..., "removed": ..., "secret_warnings": [...]}`.',
      starterCode: `def summarize_diff(diff_text: str) -> dict:
    # Count real + additions, - removals, and check added lines for "sk-"
    return {"added": 0, "removed": 0, "secret_warnings": []}`,
      testCode: `patch = """--- a/app.py
+++ b/app.py
@@ -1,2 +1,3 @@
 import os
-KEY = "old"
+KEY = os.getenv("API_KEY")
+BACKUP = "sk-leak99"
"""
out = summarize_diff(patch)
assert out["added"] == 2, f"Expected 2 added lines, got {out}"
assert out["removed"] == 1, f"Expected 1 removed line, got {out}"
assert out["secret_warnings"] == ['BACKUP = "sk-leak99"'], f"Expected secret warning, got {out}"
print("PASS: Lab 0.2.2 Unified diff analyzer passed!")`,
      solutionCode: `def summarize_diff(diff_text: str) -> dict:
    added, removed = 0, 0
    warnings = []
    for line in diff_text.splitlines():
        if line.startswith(("+++", "---", "@@")):
            continue
        if line.startswith("+"):
            added += 1
            body = line[1:].strip()
            if "sk-" in body:
                warnings.append(body)
        elif line.startswith("-"):
            removed += 1
    return {"added": added, "removed": removed, "secret_warnings": warnings}`,
      hint: 'Skip header lines starting with `"+++"`, `"---"`, or `"@@"`, then count `"+"` vs `"-"` and inspect `line[1:].strip()` for `"sk-"`.',
      hints: [
        'Always filter out `"+++"`, `"---"`, and `"@@"` before counting `+` and `-`.',
        'Use `body = line[1:].strip()` on added lines to get the clean code string.',
        'Track `added`, `removed`, and `warnings` cleanly inside one loop.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-0-2-3',
      difficulty: 'debug',
      requires: ['merge-conflicts'],
      title: 'Lab 0.2.3 (Debug Buggy Code): Resolve Conflict Markers Cleanly',
      prompt:
        'A broken conflict-resolver script tries to keep only the `ours` (`HEAD`) or `theirs` (`incoming`) block inside `resolve_conflict(text, choose="both")`, OR keeps both safely when `choose="both"`. Right now it leaves `<<<<<<<`, `=======`, `>>>>>>>` markers behind and breaks Python syntax! Fix `resolve_conflict(text, choose)` supporting `"ours"`, `"theirs"`, and `"both"` with zero markers left in the returned text.',
      starterCode: `def resolve_conflict(text: str, choose: str = "both") -> str:
    # BUG: currently returns raw conflicted text without picking/stripping markers!
    return text`,
      testCode: `sample = """x = 1
<<<<<<< HEAD
y = 2
=======
z = 3
>>>>>>> feat/b
print(x)"""
res_both = resolve_conflict(sample, "both")
assert "<<<<<<<" not in res_both and "=======" not in res_both and ">>>>>>>" not in res_both
assert "y = 2" in res_both and "z = 3" in res_both and "x = 1" in res_both
res_ours = resolve_conflict(sample, "ours")
assert "y = 2" in res_ours and "z = 3" not in res_ours
res_theirs = resolve_conflict(sample, "theirs")
assert "z = 3" in res_theirs and "y = 2" not in res_theirs
print("PASS: Lab 0.2.3 Merge conflict resolver passed!")`,
      solutionCode: `def resolve_conflict(text: str, choose: str = "both") -> str:
    out = []
    mode = "normal"
    for line in text.splitlines():
        if line.startswith("<<<<<<<"):
            mode = "ours"
        elif line.startswith("======="):
            mode = "theirs"
        elif line.startswith(">>>>>>>"):
            mode = "normal"
        else:
            if mode == "normal":
                out.append(line)
            elif mode == "ours" and choose in ("ours", "both"):
                out.append(line)
            elif mode == "theirs" and choose in ("theirs", "both"):
                out.append(line)
    return "\\n".join(out)`,
      hint: 'Track state (`mode = "normal" | "ours" | "theirs"`) as you read lines: switch on `<<<<<<<`, `=======`, `>>>>>>>`, and append lines matching `choose`.',
      hints: [
        'Use a simple `mode` state variable initialized to `"normal"`.',
        'Switch `mode` to `"ours"` on `<<<<<<<`, `"theirs"` on `=======`, and back to `"normal"` on `>>>>>>>`.',
        'Append content lines whenever `mode == "normal"`, or when `mode` matches `choose` (or `choose == "both"`).',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q0-2-1',
      type: 'multiple-choice',
      question: 'Which Git stage holds edited changes specifically chosen by `git add` right before creating a commit snapshot?',
      options: [
        'The Staging Area',
        'The Remote Origin Mirror',
        'The Python Virtual Cache',
        'The Conflict Marker Buffer',
      ],
      correctIndex: 0,
      explanation: '`git add` places chosen edits into the Staging Area so your next commit snapshots only intended files; remote origin is GitHub, `.venv`/`__pycache__` is Python cache, and conflict markers appear only during merges.',
    },
    {
      id: 'q0-2-2',
      type: 'multiple-choice',
      question: 'Why should new features be developed on a separate branch (`git checkout -b feat/eval`) rather than committing directly to `main`?',
      options: [
        'Because `main` cannot execute Python scripts locally',
        'To isolate incomplete work so PR checks review changes before merging',
        'Because Git only tracks file deletions inside feature branches',
        'To prevent `.gitignore` rules from hiding local secrets',
      ],
      correctIndex: 1,
      explanation: 'Branches isolate work in progress so Pull Requests and automated CI run before modifying `main`; `main` runs Python normally, tracks all changes, and follows `.gitignore`.',
    },
    {
      id: 'q0-2-3',
      type: 'predict-output',
      question: 'In the diff excerpt below, how many actual lines of code were ADDED (excluding metadata headers)?',
      code: `--- a/eval.py
+++ b/eval.py
@@ -2,2 +2,3 @@
 score = 0.8
+threshold = 0.85
+passed = score >= threshold`,
      options: [
        '3 lines',
        '1 line',
        '2 lines',
        '4 lines',
      ],
      correctIndex: 2,
      explanation: '`+++ b/eval.py` is the filename header, not code; only the two single-`+` lines (`threshold = 0.85` and `passed = score >= threshold`) are added code lines.',
    },
    {
      id: 'q0-2-4',
      type: 'spot-bug',
      question: 'After resolving a Git merge conflict, running `python app.py` fails with `SyntaxError: invalid syntax` on `=======`. What did the developer forget?',
      options: [
        'Re-creating a fresh virtual environment after `git pull`',
        'Converting double quotes inside `app.py` to single quotes',
        'Deleting the `<<<<<<<`, `=======`, and `>>>>>>>` conflict marker lines',
        'Renaming `HEAD` inside `.git/config` before executing Python',
      ],
      correctIndex: 2,
      explanation: 'Git inserts literal `<<<<<<<`, `=======`, and `>>>>>>>` lines during conflicts that are invalid Python syntax until removed; virtual envs, quote styles, and `.git/config` do not cause marker syntax errors.',
    },
    {
      id: 'q0-2-5',
      type: 'multiple-choice',
      question: 'What does running `git diff` with no arguments show by default?',
      options: [
        'All files pushed to every GitHub repository since last month',
        'Your `.env` passwords encrypted inside staging history',
        'Only empty directories that contain zero tracked source files',
        'Unstaged changes in your Working Directory compared to the Staging Area',
      ],
      correctIndex: 3,
      explanation: 'Plain `git diff` compares your modified Working Directory files against what is currently staged; it never pushes to GitHub, scans `.env` encryption, or lists empty untracked folders.',
    },
    {
      id: 'q0-2-6',
      type: 'predict-output',
      question: 'Given this Git conflict block, which lines represent the INCOMING branch (`feat/new`) rather than your current `HEAD`?',
      code: `<<<<<<< HEAD
BATCH_SIZE = 16
=======
BATCH_SIZE = 32
LOG_LEVEL = "INFO"
>>>>>>> feat/new`,
      options: [
        '`BATCH_SIZE = 32` and `LOG_LEVEL = "INFO"`',
        '`BATCH_SIZE = 16` only',
        '`<<<<<<< HEAD` and `BATCH_SIZE = 16`',
        'All five lines belong to `HEAD`',
      ],
      correctIndex: 0,
      explanation: 'Content between `=======` and `>>>>>>> feat/new` comes from the incoming branch (`BATCH_SIZE = 32` and `LOG_LEVEL = "INFO"`); content above `=======` is your `HEAD`.',
    },
    {
      id: 'q0-2-7',
      type: 'multi-select',
      question: 'Select ALL habits that make Pull Requests easy and safe for AI engineering teammates to review:',
      options: [
        'Running tests (`pytest`) cleanly before pushing',
        'Keeping each PR focused on one clear feature or bug fix',
        'Pasting `.venv/` packages directly into the commit diff',
        'Writing a short PR summary stating what changed and how it was tested',
      ],
      correctIndex: 0,
      correctIndices: [0, 1, 3],
      explanation: 'Passing tests, focused diffs, and clear test summaries speed up reviews; committing `.venv/` bloats the repo with thousands of third-party files.',
    },
    {
      id: 'q0-2-8',
      type: 'ordering',
      question: 'Order the standard Git team workflow from starting a task (top) to opening a Pull Request (bottom):',
      options: [],
      correctIndex: 0,
      items: [
        'Create feature branch (`git checkout -b fix/chunk-bug`)',
        'Edit Python code and run local tests',
        'Inspect changes (`git status` and `git diff`)',
        'Stage & commit (`git add` then `git commit`)',
        'Push branch to GitHub and open a Pull Request',
      ],
      explanation: 'Branch first, edit and verify tests locally, review `git status`/`diff` to confirm zero secrets or noise, stage and commit, then push to open the Pull Request.',
    },
    {
      id: 'q0-2-9',
      type: 'numeric',
      question: 'A developer stages 2 files with `git add` while leaving 3 modified scratch files unstaged. How many files will the next `git commit` record changes for?',
      options: [],
      correctIndex: 0,
      correctNumber: 2,
      tolerance: 0.01,
      unit: 'files',
      explanation: 'Git commits ONLY what was explicitly placed into the Staging Area—the 2 staged files—leaving the 3 unstaged files untouched in the working directory.',
    },
  ],
};
