import type { Lesson } from '@/types/course';

export const lesson0_1: Lesson = {
  id: '0-1',
  moduleId: 'mod-0',
  number: '0.1',
  title: 'Terminal, File System & Setting Up Python Safely',
  subtitle: 'Never touched a command line? Learn folders, paths, virtual environments (.venv), pip, VS Code, and API secret safety from scratch.',
  durationMinutes: 60,
  track: 'core',
  prerequisites: ['No prior coding or terminal experience required'],
  requires: [],
  teaches: [
    'terminal-paths',
    'python-install',
    'venv-isolation',
    'pip-packages',
    'env-secrets',
  ],
  objectives: [
    'Navigate directories, inspect files, and understand absolute vs relative file paths in the terminal.',
    'Verify Python 3.11+ installation and launch VS Code cleanly from your workspace folder.',
    'Create isolated `.venv` virtual environments and pin dependencies with `pip` and `requirements.txt`.',
    'Protect passwords and LLM API keys using `.env` files and `.gitignore` before running `git add`.',
  ],
  checkWithoutNotes: [
    'What is the difference between an absolute path (`/home/ada/app/main.py`) and a relative path (`./main.py`)?',
    'Why do AI engineers create a fresh `.venv` folder inside every project instead of installing all packages globally?',
    'Why should `requirements.txt` list exact versions like `numpy==1.26.4` instead of bare package names?',
    'If you accidentally paste an API key inside `app.py`, why is simply deleting it in your next commit NOT enough once pushed?',
    'Which four commands verify your Python version, create a `.venv`, activate it, and install libraries on your OS?',
  ],
  blocks: [
    {
      type: 'prose',
      heading: 'Why This Matters on the Job',
      paragraphs: [
        'Every time a new AI engineer starts a job, their very first task happens before they touch a single neural network: cloning the company codebase, opening a terminal, creating an isolated Python environment, installing exact library versions, and configuring secret API keys safely. Beginners who skip environment basics hit mysterious errors on Day 1—such as `"ModuleNotFoundError"` when a library was installed into the wrong Python copy, or `"Permission denied"` because they accidentally tried writing inside protected system directories.',
        'Worse still, leaking an API key or database password into a public repository is one of the fastest ways to trigger a security incident. Automated bots scan newly pushed public commits continuously and can exhaust spending limits within minutes of a secret appearing in Git history. Mastering your file system, virtual environments, pinned packages, VS Code workflow, and `.env` hygiene turns confusing setup blockers into routine two-minute habits that every team expects from day one.',
      ],
    },
    {
      type: 'prose',
      heading: 'The Mental Model: Kitchen Prep Stations, Street Addresses & Locked Pantries',
      paragraphs: [
        'Think of your computer like a busy restaurant building with separate prep kitchens (**projects**). If all chefs share one single spice rack (**global system Python**), Recipe A needing `pandas` version `1.5` breaks the moment Chef B upgrades the shared jar to `pandas` `2.2`. A **virtual environment (`.venv`)** gives every project its own private mini-kitchen inside its own folder—complete with its own Python executable, its own `pip`, and its own isolated site-packages shelf.',
        'Meanwhile, your **file system** is simply a tree of nested folders anchored at a root directory (`/` on macOS and Linux, or `C:\\` on Windows). A terminal command like `pwd` (*print working directory*) tells you which exact folder you are currently standing inside, `ls` (or `dir` in Windows Command Prompt) lists what files and sub-folders sit right in front of you, and `cd` (*change directory*) steps into a child folder (`cd data`) or up one level (`cd ..`). Instead of clicking through five Finder or File Explorer windows, one typed command opens the exact script, test suite, or dataset you need.',
        'Notice also how every terminal command works like a short sentence: **`command  --flag  argument`**. For example, in `python3 -m venv .venv`, `python3` is the program, `-m venv` is a flag telling Python to run its built-in virtual-environment module, and `.venv` is the destination folder name. Every command also silently returns an **exit code**: `0` means complete success, while any non-zero integer (`1`, `2`, `127`) means an error occurred—a convention you will rely on later in automated GitHub Actions CI pipelines.',
        'Finally, treat your **`.env` file** like the locked safe behind the counter. Your shared recipe cards (`train.py`, `rag.py`) never write down the real vault combination; instead they ask the operating system for the secret by name (`os.getenv("OPENAI_API_KEY")`). Teams pair a secret `.env` (which stays local and untracked) with a non-secret template called **`.env.example`** containing placeholder descriptions (`OPENAI_API_KEY=your-key-here`) so new teammates know which variables to fill in without ever sharing real credentials.',
      ],
    },
    {
      type: 'table',
      title: 'Run This on Your Own Machine: First-Time Setup Verification Table',
      headers: ['Step', 'macOS / Linux Command', 'Windows PowerShell Command', 'Expected Output Check'],
      rows: [
        ['1. Check Python 3.11+', '`python3 --version`', '`python --version`', 'Prints `Python 3.11.x` or `3.12.x` (not 2.7 or Command not found)'],
        ['2. Open workspace & inspect', '`mkdir ai-lab && cd ai-lab && pwd`', '`mkdir ai-lab; cd ai-lab; pwd`', 'Prints path ending in `/ai-lab` or `\\ai-lab`'],
        ['3. Create `.venv`', '`python3 -m venv .venv`', '`python -m venv .venv`', 'Creates hidden `.venv` directory (`ls -a` / `dir -Force`)'],
        ['4. Activate `.venv`', '`source .venv/bin/activate`', '`.venv\\Scripts\\Activate.ps1`', 'Terminal prompt prefix changes to `(.venv)`'],
        ['5. Pin packages & check', '`pip install numpy==1.26.4 && python -c "import numpy; print(numpy.__version__)"`', '`pip install numpy==1.26.4; python -c "import numpy; print(numpy.__version__)"`', 'Prints `1.26.4` using the isolated `.venv` copy'],
        ['6. Launch VS Code', '`code .`', '`code .`', 'Opens VS Code rooted directly inside `ai-lab`'],
      ],
    },
    {
      type: 'prose',
      heading: 'Inside VS Code: Connecting Editor, Interpreter & Integrated Terminal',
      paragraphs: [
        'Opening VS Code from the project folder using `code .` matters more than beginners realize: VS Code automatically resolves relative paths, discovers `.venv`, and loads project settings relative to that opened root folder. If you accidentally open a parent folder containing five unrelated repositories, Python linters and relative file paths frequently point to the wrong place.',
        'Once VS Code opens, press **Ctrl+`** (or open *Terminal -> New Terminal* from the menu) to open the integrated terminal directly inside your workspace, and open the Command Palette (**Ctrl+Shift+P** on Windows/Linux or **Cmd+Shift+P** on macOS) and select **Python: Select Interpreter** pointing to `./.venv/bin/python` (or `.venv\\Scripts\\python.exe` on Windows). Matching both the editor interpreter and the terminal environment ensures red squiggly import warnings disappear and your debugger runs against the exact pinned libraries you installed.',
      ],
    },
    {
      type: 'prose',
      heading: 'Worked Example 1: Absolute Paths, Relative Paths & Navigating Folders',
      paragraphs: [
        'Suppose your company project lives at `/home/ada/projects/rag-bot`. Inside it sit two folders: `src/` (containing `app.py`) and `data/` (containing `faq.csv`). If your terminal working directory (`pwd`) is `/home/ada/projects/rag-bot`, then the **relative path** `data/faq.csv` points to the exact same file as the **absolute path** `/home/ada/projects/rag-bot/data/faq.csv`. However, if you run `cd src` and then execute `python app.py` referencing `"data/faq.csv"`, Python looks for `/home/ada/projects/rag-bot/src/data/faq.csv` and crashes with `FileNotFoundError`!',
        'That distinction explains why professional codebases avoid brittle relative strings like `"../data/" + name`. Instead, Python\'s built-in `pathlib.Path` represents paths as cross-platform objects. Using `Path(__file__).resolve().parent.parent / "data" / "faq.csv"` anchors paths directly to the script\'s location or an explicit workspace root, while the `/` operator joins directory names automatically on macOS, Linux, and Windows without manual slash bugs. Trace the example below carefully:',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 1: Cross-Platform Paths with pathlib + Explained Output',
      language: 'python',
      code: `from pathlib import Path

project_root = Path("/home/ada/projects/rag-bot")
data_file = project_root / "data" / "faq.csv"
print("Full path:", data_file.as_posix())
print("Folder   :", data_file.parent.as_posix())
print("Filename :", data_file.name, "| Extension:", data_file.suffix)`,
      caption: 'Explained output: `Full path: /home/ada/projects/rag-bot/data/faq.csv`, `Folder: /home/ada/projects/rag-bot/data`, `Filename: faq.csv | Extension: .csv`. Notice how `/` with `Path` safely joins segments on every OS without double-slash bugs, and `.parent`, `.name`, and `.suffix` extract structured pieces cleanly.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 2: Inspecting `.venv` & Parsing Pinned `requirements.txt`',
      paragraphs: [
        'Once you install libraries with `pip install`, verify what actually landed inside your virtual environment by running `pip list` or exporting a frozen snapshot with `pip freeze > requirements.txt`. Writing an unpinned dependency such as bare `scikit-learn` tells teammates and deployment servers "install whatever version happens to be newest whenever this runs." Six months later, a major release may rename a parameter or change default output behavior, silently breaking a model pipeline that passed earlier.',
        'A pinned line like `scikit-learn==1.4.2` locks down the exact tested release across your laptop, teammate laptops, GitHub Actions CI, and production containers. Real `requirements.txt` files also contain blank spacer lines and `#` explanatory comments. Any deployment check or configuration parser you write must strip leading and trailing whitespace, skip empty lines, skip `#` comment lines, and report whether every library carries an explicit `==` pin.',
      ],
    },
    {
      type: 'code',
      title: 'Worked Example 2: Validating Pinned Dependencies + Explained Output',
      language: 'python',
      code: `req_text = """
# Core numerical + ML stack
numpy==1.26.4
pandas==2.2.0

# Unpinned package (risky in production!)
requests
"""

pinned, unpinned = [], []
for raw_line in req_text.splitlines():
    line = raw_line.strip()
    if not line or line.startswith("#"):
        continue
    if "==" in line:
        pinned.append(line)
    else:
        unpinned.append(line)

print("Pinned  :", pinned)
print("Unpinned:", unpinned)`,
      caption: 'Explained output: `Pinned: [\'numpy==1.26.4\', \'pandas==2.2.0\']` and `Unpinned: [\'requests\']`. Stripping lines first prevents trailing spaces from breaking checks, and skipping blank or `#` lines avoids false alarms on documentation comments.',
    },
    {
      type: 'prose',
      heading: 'Worked Example 3: Secret Hygiene (`.env`, `.env.example` & `.gitignore`)',
      paragraphs: [
        'Never paste live secrets (`sk-...`, database connection strings, OAuth client secrets, or cloud access keys) inside Python source code or Jupyter notebooks. Place local credentials inside a `.env` file (`OPENAI_API_KEY=your_local_key`), read them at runtime via `os.environ` or `os.getenv("OPENAI_API_KEY")` after loading `.env` with `python-dotenv`, and document expected keys safely inside a committed `.env.example` file with fake placeholder values.',
        'Most importantly, add `.env`, `.venv/`, `__pycache__/`, and local SQLite or vector-index build artifacts to `.gitignore` **before** creating your first commit. Git permanently stores every committed snapshot in history: even if you delete a leaked `.env` file in a later commit, anyone checking out the earlier commit hash can read the exposed secret. If a secret ever slips into a pushed commit, rotate or revoke that key in your provider dashboard immediately before cleaning repository history.',
      ],
    },
    {
      type: 'prose',
      heading: 'Common Mistakes & How to Debug Them',
      paragraphs: [
        '**Mistake 1 — Running `pip install` outside `.venv`:** You run `pip install numpy`, then VS Code executes with `.venv` Python and raises `ModuleNotFoundError: No module named \'numpy\'`. Fix: run `which python` (macOS/Linux) or `where.exe python` (Windows) and confirm the path points inside `.venv/`, or run `python -m pip install ...` so `pip` strictly matches the active interpreter.',
        '**Mistake 2 — Terminal says `"python: command not found"` on macOS/Linux:** Modern distributions often install Python 3 strictly under the `python3` binary name. Use `python3 -m venv .venv`; once inside an activated `.venv`, both `python` and `python3` map cleanly to the isolated interpreter.',
        '**Mistake 3 — Windows PowerShell blocks `Activate.ps1`:** If PowerShell prints `"running scripts is disabled on this system"`, run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once for your user account, then re-run `.venv\\Scripts\\Activate.ps1`.',
        '**Mistake 4 — Forgetting to activate `.venv` in a new terminal tab:** Opening a second terminal tab resets PATH to system defaults. Look for the `(.venv)` prefix in your prompt before executing tests or scripts.',
        '**Mistake 5 — Committing the entire `.venv/` directory to Git:** Virtual environments hold tens of thousands of binary files and vary by operating system. Always verify `.venv/` sits inside `.gitignore` so only compact source files and `requirements.txt` enter version control.',
      ],
    },
    {
      type: 'prose',
      heading: 'Key Takeaways & Recap',
      paragraphs: [
        '1. **Know where you stand:** Always check `pwd` before running scripts or using relative paths like `data/file.csv`.',
        '2. **Isolate every project:** Create `python3 -m venv .venv` per repository so dependencies never collide.',
        '3. **Pin exact versions:** Record `package==x.y.z` in `requirements.txt` for reproducible builds across machines.',
        '4. **Use `pathlib.Path`:** Join paths cleanly instead of hardcoding OS-specific slashes.',
        '5. **Lock away secrets:** Keep keys in `.env`, add `.env` and `.venv/` to `.gitignore` first, and read via `os.getenv`.',
      ],
    },
    {
      type: 'python-lab',
      labId: 'lab-0-1-1',
      difficulty: 'guided',
      requires: ['terminal-paths', 'venv-isolation'],
      title: 'Lab 0.1.1 (Guided): Workspace Path Joiner & `.venv` Guard',
      prompt:
        'Using `pathlib.Path`, complete two helpers: 1) `build_data_path(root, filename)` returning `(Path(root) / "data" / filename).as_posix()`. 2) `is_venv_active(python_exe)` returning `True` if `".venv"` (or `"venv"`) appears in `python_exe.lower()` (normalizing `\\` to `/`), else `False`.',
      starterCode: `from pathlib import Path

def build_data_path(root: str, filename: str) -> str:
    # Return POSIX path string joining root, "data", and filename
    pass

def is_venv_active(python_exe: str) -> bool:
    # Normalize backslashes and verify ".venv" or "/venv/" is in path
    pass

print(build_data_path("/home/ada/ai-app", "train.csv"))
print(is_venv_active("/home/ada/ai-app/.venv/bin/python"))`,
      testCode: `assert build_data_path("/home/ada/ai-app", "train.csv") == "/home/ada/ai-app/data/train.csv"
assert build_data_path("/tmp/demo/", "q.json") == "/tmp/demo/data/q.json"
assert is_venv_active("/home/ada/app/.venv/bin/python") is True
assert is_venv_active(r"C:\\Users\\ada\\app\\.venv\\Scripts\\python.exe") is True
assert is_venv_active("/usr/bin/python3") is False
print("PASS: Lab 0.1.1 Path & venv guard passed!")`,
      solutionCode: `from pathlib import Path

def build_data_path(root: str, filename: str) -> str:
    return (Path(root) / "data" / filename).as_posix()

def is_venv_active(python_exe: str) -> bool:
    norm = python_exe.replace("\\\\", "/").lower()
    return "/.venv/" in norm or "/venv/" in norm or norm.endswith("/.venv")`,
      hint: 'Use `(Path(root) / "data" / filename).as_posix()` and check `"/.venv/" in norm or "/venv/" in norm` after replacing `\\\\` with `/`.',
      hints: [
        'In `build_data_path`, combine `Path(root) / "data" / filename` and call `.as_posix()`.',
        'In `is_venv_active`, normalize Windows backslashes with `.replace("\\\\", "/").lower()`.',
        'Return `"/.venv/" in norm or "/venv/" in norm or norm.endswith("/.venv")`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-0-1-2',
      difficulty: 'spec',
      requires: ['pip-packages'],
      title: 'Lab 0.1.2 (From Spec): Dependency Pin Auditor',
      prompt:
        'Write `audit_requirements(req_text)` returning a dict `{"pinned": [...], "unpinned": [...]}`. Split lines, strip outer whitespace, skip empty lines and lines starting with `#`. Put lines containing `"=="` into `"pinned"` and all other non-comment package lines into `"unpinned"`.',
      starterCode: `def audit_requirements(req_text: str) -> dict[str, list[str]]:
    # Return {"pinned": [...], "unpinned": [...]}
    return {"pinned": [], "unpinned": []}`,
      testCode: `sample = """
# ML libraries
  numpy==1.26.4  

pandas==2.2.0
scikit-learn
"""
res = audit_requirements(sample)
assert res == {"pinned": ["numpy==1.26.4", "pandas==2.2.0"], "unpinned": ["scikit-learn"]}, f"Got {res}"
assert audit_requirements("# empty\\n   ") == {"pinned": [], "unpinned": []}
print("PASS: Lab 0.1.2 Requirements auditor passed!")`,
      solutionCode: `def audit_requirements(req_text: str) -> dict[str, list[str]]:
    pinned, unpinned = [], []
    for raw in req_text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if "==" in line:
            pinned.append(line)
        else:
            unpinned.append(line)
    return {"pinned": pinned, "unpinned": unpinned}`,
      hint: 'Loop over `req_text.splitlines()`, `line = raw.strip()`, skip `if not line or line.startswith("#"):`, then branch on `"==" in line`.',
      hints: [
        'Remember `.strip()` removes accidental leading/trailing spaces around package lines.',
        'Skip blank or comment lines using `if not line or line.startswith("#"): continue`.',
        'Append to `pinned` if `"==" in line`, otherwise append to `unpinned`.',
      ],
      packages: [],
    },
    {
      type: 'python-lab',
      labId: 'lab-0-1-3',
      difficulty: 'debug',
      requires: ['env-secrets'],
      title: 'Lab 0.1.3 (Debug Buggy Code): Fix Broken Pre-Commit Secret Scanner',
      prompt:
        'A teammate wrote `check_repo_safety(gitignore_text, source_code)` to catch exposed secrets before `git push`, but it has two bugs: 1) it accepts `".environment"` as matching `".env"` (loose substring bug!), and 2) it forgets to scan `source_code` for hardcoded `"sk-"` or `"ghp_"` secret prefixes! Fix the function to return `True` ONLY when exact `".env"` is an entry in `gitignore_text` lines AND neither `"sk-"` nor `"ghp_"` appears in `source_code`.',
      starterCode: `def check_repo_safety(gitignore_text: str, source_code: str) -> bool:
    # BUG 1: loose substring ".env" in gitignore_text matches ".environment"!
    # BUG 2: never checks source_code for "sk-" or "ghp_" secrets!
    return ".env" in gitignore_text`,
      testCode: `assert check_repo_safety(".venv/\\n.env\\n", "key = os.getenv('API_KEY')") is True
assert check_repo_safety(".environment\\n.venv/\\n", "key = os.getenv('API_KEY')") is False, "Must require exact .env line!"
assert check_repo_safety(".env\\n", 'OPENAI_KEY = "sk-live12345"') is False, "Must flag hardcoded sk- key!"
assert check_repo_safety(".env\\n", 'TOKEN = "ghp_secret999"') is False, "Must flag hardcoded ghp_ token!"
print("PASS: Lab 0.1.3 Pre-commit secret & .gitignore check passed!")`,
      solutionCode: `def check_repo_safety(gitignore_text: str, source_code: str) -> bool:
    entries = {line.strip() for line in gitignore_text.splitlines() if line.strip()}
    has_env_ignored = ".env" in entries
    has_secret = ("sk-" in source_code) or ("ghp_" in source_code)
    return has_env_ignored and not has_secret`,
      hint: 'Split `gitignore_text` by lines into a stripped set `entries` checking `".env" in entries`, and reject if `"sk-" in source_code or "ghp_" in source_code`.',
      hints: [
        'Build a set of stripped non-empty lines: `entries = {line.strip() for line in gitignore_text.splitlines() if line.strip()}`.',
        'Check exact membership `".env" in entries` so `".environment"` returns `False`.',
        'Check `("sk-" in source_code) or ("ghp_" in source_code)` and require both conditions clean.',
      ],
      packages: [],
    },
  ],
  quiz: [
    {
      id: 'q0-1-1',
      type: 'multiple-choice',
      question: 'What does running `pwd` inside a Linux or macOS terminal print?',
      options: [
        'Every password saved in environment files',
        'The full path of your current folder',
        'All Python packages installed inside pip',
        'A list of deleted temporary files',
      ],
      correctIndex: 1,
      explanation: '`pwd` stands for "print working directory" and displays the current folder path; it never prints passwords, pip packages, or deleted files.',
    },
    {
      id: 'q0-1-2',
      type: 'multiple-choice',
      question: 'Why do developers create a `.venv` folder inside each Python project instead of installing all libraries globally?',
      options: [
        'So Python executes bytecode twice as fast',
        'Because global Python forbids reading CSV files',
        'To isolate package versions per project without conflicts',
        'To convert Python scripts directly into standalone Docker images',
      ],
      correctIndex: 2,
      explanation: 'Virtual environments isolate dependency versions so upgrading a package in one project cannot break another; they do not double execution speed, restrict CSV reads, or build Docker images.',
    },
    {
      id: 'q0-1-3',
      type: 'predict-output',
      question: 'What does this `pathlib.Path` expression print?',
      code: `from pathlib import Path
p = Path("/srv/app") / "datasets" / "users.csv"
print(p.name, p.suffix)`,
      options: [
        'datasets .csv',
        'users.csv .csv',
        '/srv/app/datasets users',
        'users .datasets',
      ],
      correctIndex: 1,
      explanation: '`.name` returns the final filename component (`users.csv`) and `.suffix` returns the file extension including the dot (`.csv`); the other choices mix up parent directory and stem.',
    },
    {
      id: 'q0-1-4',
      type: 'spot-bug',
      question: 'You installed `pandas` via `pip install pandas`, yet running `python train.py` raises `ModuleNotFoundError`. What likely caused this?',
      options: [
        'You installed `pandas` globally while `python` uses a different `.venv` copy',
        'The `import pandas` statement only works inside `.txt` files',
        'Python deletes newly installed packages whenever `pwd` changes',
        'Virtual environments automatically block `pandas` unless renamed `pd`',
      ],
      correctIndex: 0,
      explanation: 'Installing via one Python environment and executing with another causes `ModuleNotFoundError`; Python works in `.py` files, `pwd` never removes packages, and renaming modules happens inside `import` only.',
    },
    {
      id: 'q0-1-5',
      type: 'multiple-choice',
      question: 'A junior engineer accidentally committed `.env` containing an OpenAI API key and pushed to GitHub. Deleting `.env` in a new commit is NOT safe—why?',
      options: [
        'Git automatically encrypts `.env` only after three commits',
        'Deleted files remain unreadable inside Windows PowerShell terminals',
        'GitHub refuses commits that remove hidden configuration files',
        'Git keeps prior commits in history, so anyone can read the key',
      ],
      correctIndex: 3,
      explanation: 'Git stores complete historical snapshots, so removing a file in a later commit leaves the secret readable in earlier history—you must revoke/rotate the leaked key immediately.',
    },
    {
      id: 'q0-1-6',
      type: 'predict-output',
      question: 'How many packages end up classified as `"pinned"` by this snippet?',
      code: `lines = ["# tools", "numpy==1.26.4", "pandas", "pytest==8.0.0", ""]
pinned = [x for x in lines if "==" in x and not x.startswith("#")]
print(len(pinned))`,
      options: [
        '2',
        '3',
        '4',
        '1',
      ],
      correctIndex: 0,
      explanation: 'Only `"numpy==1.26.4"` and `"pytest==8.0.0"` contain `"=="` and do not start with `"#"`, giving length `2`.',
    },
    {
      id: 'q0-1-7',
      type: 'multi-select',
      question: 'Select ALL entries that belong inside `.gitignore` before running `git add .` on a Python AI project:',
      options: [
        '.venv/',
        '.env',
        'train.py',
        '__pycache__/',
      ],
      correctIndex: 0,
      correctIndices: [0, 1, 3],
      explanation: '`.venv/`, `.env` secrets, and Python `__pycache__/` bytecode artifacts should never be committed; `train.py` is your source code and MUST be committed.',
    },
    {
      id: 'q0-1-8',
      type: 'ordering',
      question: 'Order these 5 commands cleanly from first (top) to last (bottom) when setting up a brand-new Python project on macOS/Linux:',
      options: [],
      correctIndex: 0,
      items: [
        'mkdir churn-project && cd churn-project',
        'python3 -m venv .venv',
        'source .venv/bin/activate',
        'python -m pip install numpy==1.26.4',
        'python -c "import numpy; print(numpy.__version__)"',
      ],
      explanation: 'Create and enter the folder first, build `.venv`, activate it so `python`/`pip` point inside `.venv`, install your pinned package, and run a verification import.',
    },
    {
      id: 'q0-1-9',
      type: 'numeric',
      question: 'Suppose a repo contains 4 pinned lines in `requirements.txt`, 1 comment line starting with `#`, and 2 blank lines. How many real Python packages are listed?',
      options: [],
      correctIndex: 0,
      correctNumber: 4,
      tolerance: 0.01,
      unit: 'packages',
      explanation: 'Comments (`#`) and blank lines are skipped by `pip`; only the 4 pinned package lines install libraries.',
    },
  ],
};
