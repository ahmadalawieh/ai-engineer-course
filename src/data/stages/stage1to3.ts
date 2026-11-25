import type { JourneyLesson } from '@/types/journey';

export const STAGE_1_TO_3_LESSONS: JourneyLesson[] = [
  // =========================================================================
  // STAGE 1: COMPUTER SETUP & FIRST STEPS IN PYTHON (Lessons 1.1 – 1.4)
  // =========================================================================
  {
    id: '1-1',
    stageNumber: 1,
    lessonNumber: '1.1',
    title: 'Your Developer Toolkit (VS Code, Python & Terminal)',
    PlainSubtitle: 'Install the exact 3 free apps professionals use and run your very first line of Python.',
    minutes: 15,
    xp: 80,
    concept: {
      headline: 'Only 3 Free Tools—Nothing Complicated',
      paragraphs: [
        'To build real AI apps like a company engineer or freelancer, you only need three free programs on your computer: VS Code (where you write files), Python (the engine that runs your code), and Git (which saves your history and uploads to GitHub).',
        'Do not be intimidated by the "Terminal" (PowerShell on Windows). It is just a text version of Windows File Explorer—you only need 4 tiny commands (`pwd`, `ls`, `cd`, `mkdir`) for 95% of daily work.',
      ],
      analogy: {
        fromKnown: 'WordPress & HTML',
        explanation:
          'Just like a web browser reads `.html` files and displays a page, the `python` program reads `.py` text files from top to bottom and follows your instructions.',
      },
      visualFlow: ['Write hello.py in VS Code', 'Run python hello.py', 'See Output in Terminal'],
      proTerm: {
        term: 'CLI / Terminal',
        plainMeaning: 'A simple text box where you type `python myfile.py` instead of double-clicking icons.',
      },
    },
    pcSetup: {
      title: 'Install VS Code, Python 3.12+ & Git on Your PC',
      summary: 'Follow this one-time checklist on your computer, then test that Python responds.',
      checklist: [
        'Download & install VS Code from code.visualstudio.com (install the official "Python" extension inside VS Code).',
        'Download Python 3.12+ from python.org — IMPORTANT on Windows: check the box "Add python.exe to PATH" on the very first installer screen!',
        'Download & install Git from git-scm.com (click Next with default options).',
        'Open VS Code, press Ctrl + ` (backtick) to open the built-in Terminal at the bottom, and run the check below.',
      ],
      windows: {
        commands: [
          'python --version',
          'git --version',
          'mkdir C:\\ai-projects',
          'cd C:\\ai-projects',
        ],
        whatYouSee: 'Python 3.12.x (or 3.13.x) and git version 2.x.x printed cleanly.',
        commonFix:
          'If Windows says "python is not recognized" or opens the Microsoft Store: re-run the Python installer -> Modify -> check "Add Python to environment variables", then close and reopen VS Code.',
      },
      mac: {
        commands: [
          'python3 --version',
          'git --version',
          'mkdir -p ~/ai-projects && cd ~/ai-projects',
        ],
        whatYouSee: 'Python 3.12.x and git version 2.x.x.',
        commonFix: 'If macOS asks to install Command Line Developer Tools, click Install, or install Python from python.org.',
      },
    },
    practice: {
      taskPrompt:
        'In Python, `print(...)` shows text on screen. Change the `greeting` variable below so it says `"Hello AI Engineer"` and click Run Practice.',
      language: 'python',
      warmUpCode: `print("Python is working!")\nprint(10 + 5)`,
      warmUpNote: 'Notice there are no semicolons `;` or `<html>` tags—just one plain instruction per line.',
      starterCode: `# Change the text inside the quotes below:
greeting = "Change me"
print(greeting)`,
      hints: [
        'Keep the quotes `" "` around the words so Python knows it is text.',
        'Set `greeting = "Hello AI Engineer"` (exact capitalization).',
      ],
      solutionCode: `greeting = "Hello AI Engineer"
print(greeting)`,
      testCode: `assert "greeting" in dir(), "Keep the variable named greeting"
assert greeting == "Hello AI Engineer", f"Expected 'Hello AI Engineer', got '{greeting}'"
print("CHECK_PASS|Your first Python variable and print() worked!")`,
    },
    projectStep: {
      projectTitle: 'Project 1: Freelance Quote Calculator',
      fileName: 'C:\\ai-projects\\project-1-quote\\hello.py',
      summary: 'Create your first `.py` file inside VS Code and run it in the bottom terminal.',
      codeSnippet: `greeting = "Hello AI Engineer"\nprint(greeting)`,
      runCommandWin: 'python hello.py',
      runCommandMac: 'python3 hello.py',
    },
  },
  {
    id: '1-2',
    stageNumber: 1,
    lessonNumber: '1.2',
    title: 'Variables, Text & Math (Your First Calculations)',
    PlainSubtitle: 'Store client names, hourly rates, and totals—and plug numbers neatly into text.',
    minutes: 15,
    xp: 80,
    concept: {
      headline: 'Boxes With Labels + f-Strings',
      paragraphs: [
        'A variable is simply a named label holding a piece of information: text uses quotes (`client = "Acme"`), whole numbers have no quotes (`hours = 8`), and decimals use a dot (`rate = 75.5`).',
        'To mix variables inside a sentence, put the letter `f` right before the opening quote and wrap variable names in curly braces `{}`: `f"Quote for {client}: ${total}"`.',
      ],
      analogy: {
        fromKnown: 'Excel / SQL Columns',
        explanation:
          'Think of variables like named cells in Excel (`hours * rate`). When `hours` changes, `total` updates automatically.',
      },
      visualFlow: ['hours = 6, rate = 50', 'total = hours * rate', 'f"Total: ${total}" -> $300'],
      proTerm: {
        term: 'f-string (Formatted String)',
        plainMeaning: 'Putting `f"..."` in front of quotes so `{variable}` plugs its value straight into the text.',
      },
    },
    pcSetup: {
      title: 'Create quote_tool.py in VS Code',
      summary: 'In VS Code, click New File, name it `quote_tool.py`, and save it inside your project folder.',
      windows: {
        commands: ['cd C:\\ai-projects', 'code .'],
        whatYouSee: '`code .` opens your current folder directly inside VS Code.',
        commonFix: 'Always press Ctrl + S in VS Code before running `python quote_tool.py` so Python runs your latest changes!',
      },
      mac: {
        commands: ['cd ~/ai-projects', 'code .'],
        whatYouSee: 'Your project folder opens in VS Code’s left file explorer.',
        commonFix: 'Press Cmd + S to save before running `python3 quote_tool.py`.',
      },
    },
    practice: {
      taskPrompt:
        'Calculate `subtotal` by multiplying `hours * hourly_rate`, then set `summary` using an `f"..."` string so it equals `"Client Sara owes $450"`.',
      language: 'python',
      warmUpCode: `item = "Chatbot Setup"\nprice = 300\nprint(f"{item} costs \${price}")`,
      warmUpNote: 'In Python, `*` multiplies, `+` adds, `-` subtracts, and `/` divides.',
      starterCode: `client_name = "Sara"
hours = 6
hourly_rate = 75

# 1. Multiply hours by hourly_rate:
subtotal = 0

# 2. Build the text "Client Sara owes $450" using f"...":
summary = ""
print(summary)`,
      hints: [
        'Write `subtotal = hours * hourly_rate` on the first blank.',
        'Write `summary = f"Client {client_name} owes ${subtotal}"` on the second blank.',
      ],
      solutionCode: `client_name = "Sara"
hours = 6
hourly_rate = 75

subtotal = hours * hourly_rate
summary = f"Client {client_name} owes \${subtotal}"
print(summary)`,
      testCode: `assert subtotal == 450, f"Expected subtotal 450, got {subtotal}"
assert summary == "Client Sara owes $450", f"Expected 'Client Sara owes $450', got '{summary}'"
print("CHECK_PASS|Math and f-string formatting verified ($450)!")`,
    },
    projectStep: {
      projectTitle: 'Project 1: Freelance Quote Calculator',
      fileName: 'quote_tool.py',
      summary: 'Add client, hours, rate, and formatted quote output to `quote_tool.py`.',
      codeSnippet: `client_name = "Sara"\nhours = 6\nhourly_rate = 75\nsubtotal = hours * hourly_rate\nprint(f"Client {client_name} owes \${subtotal}")`,
      runCommandWin: 'python quote_tool.py',
      runCommandMac: 'python3 quote_tool.py',
    },
  },
  {
    id: '1-3',
    stageNumber: 1,
    lessonNumber: '1.3',
    title: 'Making Decisions (if / elif / else)',
    PlainSubtitle: 'Teach Python to follow business rules—like automatic discounts on large projects.',
    minutes: 15,
    xp: 90,
    concept: {
      headline: 'Colon + 4 Spaces = A Rule Block',
      paragraphs: [
        'Real software makes decisions: *if* an invoice is $500 or more, apply a 10% discount; *otherwise* keep full price. Python writes this with `if`, `elif` ("else if"), and `else`, ending the condition line with a colon `:`.',
        'How does Python know which lines belong inside the `if`? By **4 spaces of indentation** (pressing `Tab` in VS Code). No curly braces `{}` needed!',
      ],
      analogy: {
        fromKnown: 'HTML Nested Tags & SQL WHERE',
        explanation:
          'Just like you indent `<p>` inside `<div>` to show it belongs inside, Python uses that indent to group lines inside an `if:` block.',
      },
      visualFlow: ['Check subtotal >= 500:', 'True -> 10% off (* 0.90)', 'False -> Keep subtotal'],
    },
    pcSetup: {
      title: 'Interactive Terminal Input (`input()`)',
      summary: 'On your PC, `input("Hours? ")` lets you type live answers in PowerShell! (Always wrap numbers with `float(...)` because `input()` gives text.)',
      windows: {
        commands: ['python -c "h = float(input(\'Hours: \')); print(h * 50)"'],
        whatYouSee: 'PowerShell pauses and waits for you to type a number like `10` and press Enter, then prints `500.0`.',
        commonFix: 'If you ever get stuck in a prompt in PowerShell, press Ctrl + C to cancel cleanly.',
      },
      mac: {
        commands: ['python3 -c "h = float(input(\'Hours: \')); print(h * 50)"'],
        whatYouSee: 'Terminal asks `Hours: ` and multiplies your answer by 50.',
        commonFix: 'Press Ctrl + C anytime to cancel a waiting input prompt.',
      },
    },
    practice: {
      taskPrompt:
        'Write an `if / else` rule: if `subtotal >= 500`, set `final_total = subtotal * 0.9` (10% discount) and `badge = "VIP"`. Otherwise (`else:`), set `final_total = subtotal` and `badge = "Standard"`.',
      language: 'python',
      warmUpCode: `age = 20\nif age >= 18:\n    status = "Allowed"\nelse:\n    status = "Blocked"\nprint(status)`,
      warmUpNote: 'Remember the colon `:` at the end of `if ...:` and `else:`, plus 4 spaces on the lines underneath!',
      starterCode: `subtotal = 600

# Add your if / else rule below:
if subtotal >= 500:
    final_total = 0
    badge = ""
else:
    final_total = subtotal
    badge = "Standard"

print(badge, final_total)`,
      hints: [
        'Inside the `if subtotal >= 500:` block, set `final_total = subtotal * 0.9`.',
        ' right underneath it (with the same 4-space indent), set `badge = "VIP"`.',
      ],
      solutionCode: `subtotal = 600

if subtotal >= 500:
    final_total = subtotal * 0.9
    badge = "VIP"
else:
    final_total = subtotal
    badge = "Standard"

print(badge, final_total)`,
      testCode: `assert final_total == 540.0, f"Expected 540.0 after 10% discount on 600, got {final_total}"
assert badge == "VIP", f"Expected badge 'VIP', got '{badge}'"
print("CHECK_PASS|Decision logic verified: $600 order discounted to $540.0 (VIP)!")`,
    },
    projectStep: {
      projectTitle: 'Project 1: Freelance Quote Calculator',
      fileName: 'quote_tool.py',
      summary: 'Add VIP discount rules to `quote_tool.py` on your PC.',
      codeSnippet: `if subtotal >= 500:\n    final_total = subtotal * 0.9\n    print("10% VIP Discount Applied!")\nelse:\n    final_total = subtotal`,
      runCommandWin: 'python quote_tool.py',
      runCommandMac: 'python3 quote_tool.py',
    },
  },
  {
    id: '1-4',
    stageNumber: 1,
    lessonNumber: '1.4',
    title: 'Project 1 Finish: Complete Quote & Tax Calculator',
    PlainSubtitle: 'Combine variables, discounts, rush fees, and clean rounding to finish Stage 1.',
    minutes: 20,
    xp: 110,
    concept: {
      headline: 'Putting Your First Real Script Together',
      paragraphs: [
        'When calculating money in Python, decimals sometimes look like `583.1999999999`. Wrapping a number in `round(value, 2)` rounds it cleanly to 2 decimal cents (`583.2`).',
        'In Python, `True` and `False` (capitalized!) represent yes/no switches—called booleans—perfect for checking `if is_rush:`!',
      ],
      analogy: {
        fromKnown: 'WordPress Checkboxes',
        explanation:
          'A checkbox like "Rush Delivery" on a WordPress form arrives in code as `is_rush = True` or `is_rush = False`.',
      },
      visualFlow: ['Hours * Rate', 'Apply Rush +$100 if True', 'Add 8% Tax & round(..., 2)'],
    },
    pcSetup: {
      title: 'Download or Run Project 1 Starter Folder',
      summary: 'You can grab the ready-made `project-1-quote-cli.zip` in Tab `3. My 7 Projects`, unzip it into `C:\\ai-projects`, and run it in VS Code.',
      windows: {
        commands: ['cd C:\\ai-projects\\project-1-quote-cli', 'python quote_tool.py'],
        whatYouSee: 'A formatted invoice quote printed in your PowerShell window.',
        commonFix: 'Make sure your terminal is inside the `project-1-quote-cli` folder (`ls` should show `quote_tool.py`).',
      },
      mac: {
        commands: ['cd ~/ai-projects/project-1-quote-cli', 'python3 quote_tool.py'],
        whatYouSee: 'A formatted invoice quote printed in Terminal.',
        commonFix: 'Run `ls` to confirm `quote_tool.py` is in the current folder.',
      },
    },
    practice: {
      taskPrompt:
        'Complete the quote calculation: 1) start with `base = hours * rate`, 2) if `is_rush` is `True`, add `100` to `base`, and 3) compute `grand_total = round(base * 1.08, 2)` (adds 8% tax).',
      language: 'python',
      warmUpCode: `amount = 199.956\nclean = round(amount, 2)\nprint(clean)  # 199.96`,
      warmUpNote: '`base = base + 100` (or `base += 100`) increases `base` by 100.',
      starterCode: `hours = 10
rate = 60
is_rush = True

base = hours * rate
if is_rush:
    # Add 100 rush fee to base:
    base = base

# Multiply base by 1.08 and round to 2 decimals:
grand_total = 0
print(f"Grand Total: \${grand_total}")`,
      hints: [
        'Inside `if is_rush:`, write `base = base + 100` (so 600 becomes 700).',
        'Set `grand_total = round(base * 1.08, 2)` (700 * 1.08 = 756.0).',
      ],
      solutionCode: `hours = 10
rate = 60
is_rush = True

base = hours * rate
if is_rush:
    base = base + 100

grand_total = round(base * 1.08, 2)
print(f"Grand Total: \${grand_total}")`,
      testCode: `assert base == 700, f"Expected base 700 with rush fee, got {base}"
assert grand_total == 756.0, f"Expected grand_total 756.0, got {grand_total}"
print("CHECK_PASS|Stage 1 Complete! You built your first working Python quote calculator.")`,
    },
    projectStep: {
      projectTitle: 'Project 1: Freelance Quote Calculator',
      fileName: 'quote_tool.py',
      summary: 'Save your finished calculator and test different hours and rush settings in VS Code!',
      codeSnippet: `hours = float(input("Hours needed: "))\nrate = 60\nbase = hours * rate\ngrand_total = round(base * 1.08, 2)\nprint(f"Grand Total (with tax): \${grand_total}")`,
      runCommandWin: 'python quote_tool.py',
      runCommandMac: 'python3 quote_tool.py',
    },
  },

  // =========================================================================
  // STAGE 2: PYTHON FOR REAL BUSINESS DATA (Lessons 2.1 – 2.4)
  // =========================================================================
  {
    id: '2-1',
    stageNumber: 2,
    lessonNumber: '2.1',
    title: 'Lists & Loops (Processing 100 Items in 3 Lines)',
    PlainSubtitle: 'Clean messy customer emails and sum lists of orders automatically with `for` loops.',
    minutes: 15,
    xp: 90,
    concept: {
      headline: 'Square Brackets `[ ]` + `for item in list:`',
      paragraphs: [
        'A **list** holds multiple items in order inside square brackets: `emails = [" SARA@a.com ", "bob@b.com "]`.',
        'A **`for` loop** visits each item one by one. Combined with `.strip()` (removes extra spaces) and `.lower()` (makes lowercase), you can clean 10,000 messy form submissions in 4 lines of Python!',
      ],
      analogy: {
        fromKnown: 'WordPress Posts Loop',
        explanation:
          'Just like WordPress loops through every blog post to display cards on a page, `for raw in raw_emails:` runs your indented lines once for each email.',
      },
      visualFlow: ['raw_emails List', 'for e in raw_emails:', 'clean_emails.append(...)'],
    },
    pcSetup: {
      title: 'Start Folder for Project 2 (Lead Cleaner)',
      summary: 'Create a fresh folder `project-2-lead-cleaner` so each project stays neat.',
      windows: {
        commands: ['mkdir C:\\ai-projects\\project-2-lead-cleaner', 'cd C:\\ai-projects\\project-2-lead-cleaner'],
        whatYouSee: 'A clean empty folder ready for Stage 2.',
        commonFix: 'Use `cd ..` anytime you want to go up one folder level.',
      },
      mac: {
        commands: ['mkdir -p ~/ai-projects/project-2-lead-cleaner && cd ~/ai-projects/project-2-lead-cleaner'],
        whatYouSee: 'Switched into `project-2-lead-cleaner`.',
        commonFix: 'Run `pwd` anytime to see which folder you are currently inside.',
      },
    },
    practice: {
      taskPrompt:
        'Loop over `raw_emails`, clean each email using `e.strip().lower()`, and add it to `clean_emails` using `clean_emails.append(...)`.',
      language: 'python',
      warmUpCode: `prices = [10, 20, 30]\ndoubled = []\nfor p in prices:\n    doubled.append(p * 2)\nprint(doubled)  # [20, 40, 60]`,
      warmUpNote: '`.append(x)` adds `x` onto the end of a list.',
      starterCode: `raw_emails = ["  SARA@Acme.com ", "BOB@Test.io  ", "  ali@dev.org"]
clean_emails = []

for e in raw_emails:
    # Clean spaces + lowercase, then append to clean_emails:
    cleaned = e
    clean_emails.append(cleaned)

print(clean_emails)`,
      hints: [
        'Change `cleaned = e` to `cleaned = e.strip().lower()`.',
        'Keep `clean_emails.append(cleaned)` indented with 4 spaces inside the `for` loop.',
      ],
      solutionCode: `raw_emails = ["  SARA@Acme.com ", "BOB@Test.io  ", "  ali@dev.org"]
clean_emails = []

for e in raw_emails:
    cleaned = e.strip().lower()
    clean_emails.append(cleaned)

print(clean_emails)`,
      testCode: `assert clean_emails == ["sara@acme.com", "bob@test.io", "ali@dev.org"], f"Got {clean_emails}"
print("CHECK_PASS|Cleaned all 3 messy customer emails in one loop!")`,
    },
    projectStep: {
      projectTitle: 'Project 2: Automated Lead Cleaner',
      fileName: 'cleaner.py',
      summary: 'Test looping and `.strip().lower()` in `cleaner.py` on your machine.',
      codeSnippet: `raw_emails = ["  SARA@Acme.com ", "BOB@Test.io  "]\nfor e in raw_emails:\n    print(e.strip().lower())`,
      runCommandWin: 'python cleaner.py',
      runCommandMac: 'python3 cleaner.py',
    },
  },
  {
    id: '2-2',
    stageNumber: 2,
    lessonNumber: '2.2',
    title: 'Dictionaries & JSON (How Websites & AI Share Data)',
    PlainSubtitle: 'Read and update labeled key-value records without crashing when fields are missing.',
    minutes: 15,
    xp: 100,
    concept: {
      headline: 'Curly Braces `{ "key": value }` = A Single Record',
      paragraphs: [
        'While a list stores items by position, a **dictionary** stores labeled fields using curly braces: `lead = {"name": "Sara", "plan": "pro", "spend": 600}`. Every AI API in the world sends and receives data in this exact shape (called **JSON**)!',
        'Pro tip: If a web form forgets to send `"plan"`, writing `lead["plan"]` crashes your app! Writing `lead.get("plan", "free")` safely returns `"free"` instead of crashing.',
      ],
      analogy: {
        fromKnown: 'SQL Row / WordPress Custom Fields',
        explanation:
          'One SQL row (`name="Sara", spend=600`) becomes one Python dictionary (`{"name": "Sara", "spend": 600}`). A whole SQL table is simply a **list of dictionaries**!',
      },
      visualFlow: ['Messy Form Dict', 'lead.get("plan", "free")', 'Crash-Proof Record'],
    },
    pcSetup: {
      title: 'Inspect JSON in VS Code',
      summary: 'In VS Code, pressing `Shift + Alt + F` (Windows) automatically formats messy JSON files so they are easy to read.',
      windows: {
        commands: ['python -c "d = {\'user\': \'Sara\'}; print(d.get(\'plan\', \'free\'))"'],
        whatYouSee: 'Prints `free` without any error even though `plan` was missing!',
        commonFix: 'Dictionary keys are strings, so always wrap key names in quotes: `d.get("plan")`.',
      },
      mac: {
        commands: ['python3 -c "d = {\'user\': \'Sara\'}; print(d.get(\'plan\', \'free\'))"'],
        whatYouSee: 'Prints `free` cleanly.',
        commonFix: 'Press `Shift + Option + F` in VS Code on Mac to auto-format JSON.',
      },
    },
    practice: {
      taskPrompt:
        '`incoming_lead` is missing `"plan"`. Safely read `email` (lowercased & stripped) and read `plan` using `.get("plan", "starter")` into `clean_lead`.',
      language: 'python',
      warmUpCode: `order = {"id": "ORD-1", "total": 99}\nprint(order["id"])                 # ORD-1\nprint(order.get("coupon", "NONE")) # NONE`,
      warmUpNote: '`.get("key", "fallback")` is one of the most used lines in real backend jobs.',
      starterCode: `incoming_lead = {"email": "  INFO@Client.com "}

clean_lead = {
    "email": incoming_lead["email"].strip().lower(),
    # Safely read "plan" with default "starter":
    "plan": "",
}
print(clean_lead)`,
      hints: [
        'Use `incoming_lead.get("plan", "starter")` for the `"plan"` value.',
        'Do not use `incoming_lead["plan"]` with square brackets, because `"plan"` is missing and would raise a KeyError!',
      ],
      solutionCode: `incoming_lead = {"email": "  INFO@Client.com "}

clean_lead = {
    "email": incoming_lead["email"].strip().lower(),
    "plan": incoming_lead.get("plan", "starter"),
}
print(clean_lead)`,
      testCode: `assert clean_lead == {"email": "info@client.com", "plan": "starter"}, f"Got {clean_lead}"
print("CHECK_PASS|Safe dictionary lookup (.get) mastered!")`,
    },
    projectStep: {
      projectTitle: 'Project 2: Automated Lead Cleaner',
      fileName: 'cleaner.py',
      summary: 'Upgrade `cleaner.py` from plain strings to rich lead dictionaries.',
      codeSnippet: `leads = [{"email": " SARA@a.com "}, {"email": "bob@b.com", "plan": "pro"}]\nfor item in leads:\n    print(item["email"].strip().lower(), item.get("plan", "starter"))`,
      runCommandWin: 'python cleaner.py',
      runCommandMac: 'python3 cleaner.py',
    },
  },
  {
    id: '2-3',
    stageNumber: 2,
    lessonNumber: '2.3',
    title: 'Reusable Functions (def) & Catching Bad Data (try/except)',
    PlainSubtitle: 'Package your logic into a reusable command and stop typos like "N/A" from crashing your app.',
    minutes: 18,
    xp: 110,
    concept: {
      headline: 'What `def` and `return` Actually Mean',
      paragraphs: [
        '`def clean_one_lead(raw):` simply creates your own reusable command named `clean_one_lead` that accepts an input (`raw`), runs the indented lines inside, and hands back the finished result with `return`.',
        'What if a customer types `"unknown"` inside a numeric `"budget"` box? `float("unknown")` crashes! Wrapping risky lines in `try:` and `except ValueError:` catches the mistake gracefully and sets `budget = 0.0` instead.',
      ],
      analogy: {
        fromKnown: 'WordPress Shortcodes',
        explanation:
          'Creating a function with `def` is just like creating a WordPress shortcode `[clean_lead]` once so you can reuse it on 1,000 pages without rewriting the code.',
      },
      visualFlow: ['def parse_budget(val):', 'try: float(val)', 'except: return 0.0'],
    },
    pcSetup: {
      title: 'Test Functions & Error Handling Locally',
      summary: 'Notice that defining `def my_func():` does nothing until you *call* it with `my_func()` below!',
      windows: {
        commands: ['python -c "def double(x): return x * 2\nprint(double(21))"'],
        whatYouSee: 'Prints `42`.',
        commonFix: 'If your function prints `None`, check that you wrote `return result` at the end of the function!',
      },
      mac: {
        commands: ['python3 -c "def double(x): return x * 2\nprint(double(21))"'],
        whatYouSee: 'Prints `42`.',
        commonFix: 'Always include `return` inside `def` when you want the calculated value back.',
      },
    },
    practice: {
      taskPrompt:
        'Finish the function `safe_budget(raw_value)`: inside `try:`, `return float(raw_value)`. Inside `except (ValueError, TypeError):`, `return 0.0` so bad text like `"TBD"` never crashes!',
      language: 'python',
      warmUpCode: `def greet(name):\n    return f"Welcome, {name}!"\n\nprint(greet("Ahmad"))`,
      warmUpNote: 'Everything indented 4 spaces under `def` belongs to that function.',
      starterCode: `def safe_budget(raw_value):
    try:
        return float(raw_value)
    except (ValueError, TypeError):
        # Return 0.0 safely when raw_value is "TBD" or None:
        return -1

print(safe_budget("250"))
print(safe_budget("TBD"))`,
      hints: [
        'Change `return -1` under `except (ValueError, TypeError):` to `return 0.0`.',
        'Keep the 8-space indentation under `except`.',
      ],
      solutionCode: `def safe_budget(raw_value):
    try:
        return float(raw_value)
    except (ValueError, TypeError):
        return 0.0

print(safe_budget("250"))
print(safe_budget("TBD"))`,
      testCode: `assert safe_budget("250") == 250.0
assert safe_budget("TBD") == 0.0
assert safe_budget(None) == 0.0
print("CHECK_PASS|You wrote a crash-proof Python function with def and try/except!")`,
    },
    projectStep: {
      projectTitle: 'Project 2: Automated Lead Cleaner',
      fileName: 'cleaner.py',
      summary: 'Add `safe_budget` and `clean_lead` functions into `cleaner.py`.',
      codeSnippet: `def safe_budget(val):\n    try:\n        return float(val)\n    except (ValueError, TypeError):\n        return 0.0`,
      runCommandWin: 'python cleaner.py',
      runCommandMac: 'python3 cleaner.py',
    },
  },
  {
    id: '2-4',
    stageNumber: 2,
    lessonNumber: '2.4',
    title: 'Files & Project 2 Finish: Batch JSON Lead Cleaner',
    PlainSubtitle: 'Read messy JSON files from disk, filter out invalid leads, and save clean output.',
    minutes: 20,
    xp: 120,
    concept: {
      headline: 'Reading & Writing `.json` Files With `json`',
      paragraphs: [
        'Python comes with a built-in `import json` module. `json.loads(text)` turns JSON text into Python lists/dicts, and `json.dumps(data, indent=2)` turns Python dicts back into pretty JSON text to save to a file!',
        'On your PC, `with open("leads.json", "r") as f:` opens a file safely and closes it automatically when finished.',
      ],
      analogy: {
        fromKnown: 'WordPress Import / Export Tool',
        explanation:
          'You just built your own custom Import/Clean/Export tool—something agencies and freelancers routinely charge $500–$1,500 to automate for businesses.',
      },
      visualFlow: ['Read raw_leads.json', 'Clean + Skip Blank Emails', 'Save clean_leads.json'],
    },
    pcSetup: {
      title: 'Run Project 2 (`project-2-lead-cleaner`) on Your PC',
      summary: 'Download `project-2-lead-cleaner.zip` from Tab `3. My 7 Projects` and run `python clean_leads.py` to generate `clean_leads.json` on your disk!',
      windows: {
        commands: ['cd C:\\ai-projects\\project-2-lead-cleaner', 'python clean_leads.py', 'type clean_leads.json'],
        whatYouSee: '`Cleaned 3 valid leads -> saved to clean_leads.json` and the formatted JSON printed in PowerShell.',
        commonFix: 'On Windows PowerShell, `type filename.json` (or `cat filename.json`) prints a file’s contents.',
      },
      mac: {
        commands: ['cd ~/ai-projects/project-2-lead-cleaner', 'python3 clean_leads.py', 'cat clean_leads.json'],
        whatYouSee: '`clean_leads.json` created and printed cleanly.',
        commonFix: 'Make sure `raw_leads.json` is in the same folder as `clean_leads.py`.',
      },
    },
    practice: {
      taskPrompt:
        'Complete `clean_batch(records)`: loop through `records`, clean `email` with `.strip().lower()`, skip any record where `email` is empty (`""`) or missing `"@"`, and append `{"email": email, "vip": float(r.get("spend") or 0) >= 500}` to `valid`.',
      language: 'python',
      warmUpCode: `email = "bad-email"\nif "@" in email:\n    print("Valid!")\nelse:\n    print("Skip!")`,
      warmUpNote: '`if "@" not in email: continue` skips bad items in a loop immediately.',
      starterCode: `def clean_batch(records):
    valid = []
    for r in records:
        email = str(r.get("email") or "").strip().lower()
        # Skip if "@" is not in email:
        if "@" not in email:
            continue
        spend = float(r.get("spend") or 0)
        # Append {"email": email, "vip": spend >= 500} to valid:
        
    return valid`,
      hints: [
        'Inside the loop at the bottom, write `valid.append({"email": email, "vip": spend >= 500})`.',
        'Make sure `valid.append(...)` is indented 8 spaces (inside the `for` loop) while `return valid` stays at 4 spaces!',
      ],
      solutionCode: `def clean_batch(records):
    valid = []
    for r in records:
        email = str(r.get("email") or "").strip().lower()
        if "@" not in email:
            continue
        spend = float(r.get("spend") or 0)
        valid.append({"email": email, "vip": spend >= 500})
    return valid`,
      testCode: `sample = [{"email": " SARA@a.io ", "spend": 700}, {"email": "not-an-email", "spend": 100}, {"email": "", "spend": 50}]
res = clean_batch(sample)
assert res == [{"email": "sara@a.io", "vip": True}], f"Unexpected: {res}"
print("CHECK_PASS|Stage 2 Complete! You can now clean, filter, and transform real JSON datasets.")`,
    },
    projectStep: {
      projectTitle: 'Project 2: Automated Lead Cleaner',
      fileName: 'clean_leads.py',
      summary: 'Save cleaned JSON to disk with `json.dump(..., indent=2)`.',
      codeSnippet: `import json\nwith open("raw_leads.json") as f:\n    raw = json.load(f)\nclean = clean_batch(raw)\nwith open("clean_leads.json", "w") as f:\n    json.dump(clean, f, indent=2)`,
      runCommandWin: 'python clean_leads.py',
      runCommandMac: 'python3 clean_leads.py',
    },
  },

  // =========================================================================
  // STAGE 3: VIRTUAL ENVS, APIS & YOUR FIRST AI MODEL (Lessons 3.1 – 3.4)
  // =========================================================================
  {
    id: '3-1',
    stageNumber: 3,
    lessonNumber: '3.1',
    title: 'Clean Project Setup: venv, pip install & Secret .env Keys',
    PlainSubtitle: 'Install third-party AI packages cleanly on Windows and keep API keys private.',
    minutes: 18,
    xp: 110,
    concept: {
      headline: 'Why Every Real Python Repo Has `.venv` and `.env`',
      paragraphs: [
        '1) **`.venv` (Virtual Environment):** Instead of installing packages globally where Project A breaks Project B, `python -m venv .venv` creates an isolated plugin folder just for this project, and `pip install` downloads libraries into it.',
        '2) **`.env` (Environment Secrets):** Never paste private AI API keys directly inside `.py` code! Store keys in a local `.env` file (`GEMINI_API_KEY=AIza...`) and read them in Python with `os.getenv("GEMINI_API_KEY")`.',
      ],
      analogy: {
        fromKnown: 'WordPress Plugins & wp-config.php',
        explanation:
          '`.venv` is your site’s private `wp-content/plugins` folder, `pip install` is clicking "Install Plugin", and `.env` is `wp-config.php` where database/API passwords live safely.',
      },
      visualFlow: ['python -m venv .venv', 'pip install google-genai python-dotenv', 'Load Key From .env'],
    },
    pcSetup: {
      title: 'Create & Activate `.venv` on Windows PowerShell',
      summary: 'Run these 4 commands inside `C:\\ai-projects\\project-3-ai-extractor`. Once activated, you will see `(.venv)` in green at the start of your PowerShell line!',
      windows: {
        commands: [
          'mkdir C:\\ai-projects\\project-3-ai-extractor',
          'cd C:\\ai-projects\\project-3-ai-extractor',
          'python -m venv .venv',
          '.venv\\Scripts\\activate',
          'pip install google-genai openai python-dotenv httpx',
        ],
        whatYouSee: '`(.venv) PS C:\\ai-projects\\project-3-ai-extractor>` at the start of your terminal prompt.',
        commonFix:
          'Very common Windows PowerShell message: if `.venv\\Scripts\\activate` says "running scripts is disabled on this system", run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, press Y, and run `.venv\\Scripts\\activate` again!',
      },
      mac: {
        commands: [
          'mkdir -p ~/ai-projects/project-3-ai-extractor && cd ~/ai-projects/project-3-ai-extractor',
          'python3 -m venv .venv',
          'source .venv/bin/activate',
          'pip install google-genai openai python-dotenv httpx',
        ],
        whatYouSee: '`(.venv)` appears at the front of your Terminal prompt.',
        commonFix: 'Make sure `.venv` is activated whenever you install packages or run `python`.',
      },
    },
    practice: {
      taskPrompt:
        'Write `load_api_key(env_dict)` so it checks `env_dict.get("GEMINI_API_KEY")` cleanly: if the key is missing or shorter than 10 characters, return `{"ready": False, "error": "Missing GEMINI_API_KEY in .env"}`. Otherwise return `{"ready": True, "masked": key[:4] + "..."}`.',
      language: 'python',
      warmUpCode: `secret = "AIzaSy123456789"\nprint(secret[:4] + "...")  # AIza... (safe to log!)`,
      warmUpNote: '`text[:4]` slices just the first 4 characters so you can confirm a key loaded without printing the whole secret.',
      starterCode: `def load_api_key(env_dict):
    key = (env_dict.get("GEMINI_API_KEY") or "").strip()
    if len(key) < 10:
        return {"ready": False, "error": "Missing GEMINI_API_KEY in .env"}
    # Return {"ready": True, "masked": key[:4] + "..."}:
    return {"ready": False}`,
      hints: [
        'Replace the last line with `return {"ready": True, "masked": key[:4] + "..."}`.',
        'Notice how `len(key) < 10` catches both empty `""` and placeholder `"TODO"` strings!',
      ],
      solutionCode: `def load_api_key(env_dict):
    key = (env_dict.get("GEMINI_API_KEY") or "").strip()
    if len(key) < 10:
        return {"ready": False, "error": "Missing GEMINI_API_KEY in .env"}
    return {"ready": True, "masked": key[:4] + "..."}`,
      testCode: `assert load_api_key({}) == {"ready": False, "error": "Missing GEMINI_API_KEY in .env"}
assert load_api_key({"GEMINI_API_KEY": "AIzaSy987654321"}) == {"ready": True, "masked": "AIza..."}
print("CHECK_PASS|Environment key loader verified without leaking full secrets!")`,
    },
    projectStep: {
      projectTitle: 'Project 3: AI Email & Invoice Extractor',
      fileName: '.env',
      summary: 'Create a `.env` file in VS Code and paste your free Gemini API key (from aistudio.google.com) or OpenAI key.',
      codeSnippet: `GEMINI_API_KEY=your_real_key_here`,
      runCommandWin: 'python -c "import os; from dotenv import load_dotenv; load_dotenv(); print(bool(os.getenv(\'GEMINI_API_KEY\')))"',
      runCommandMac: 'python3 -c "import os; from dotenv import load_dotenv; load_dotenv(); print(bool(os.getenv(\'GEMINI_API_KEY\')))"',
    },
  },
  {
    id: '3-2',
    stageNumber: 3,
    lessonNumber: '3.2',
    title: 'Talking to Internet APIs From Python',
    PlainSubtitle: 'Understand HTTP status codes (200, 401, 429, 500) and fetch live JSON from web services.',
    minutes: 15,
    xp: 110,
    concept: {
      headline: 'Every AI & SaaS Integration Is Just an HTTP Request',
      paragraphs: [
        'When your Python script talks to Stripe, Slack, Shopify, or Gemini, it sends an **HTTP Request** (a URL + headers + JSON body) and receives a **Status Code** + **JSON Response**:',
        '• `200` = Success! • `400 / 422` = Your input JSON had a mistake • `401` = Bad/missing API key • `429` = Slow down (rate limit—wait & retry) • `500 / 503` = Their server hiccuped (safe to retry).',
      ],
      analogy: {
        fromKnown: 'Browser 404 Page',
        explanation:
          'You already know `404 Not Found` in a web browser! Backend APIs use the exact same 3-digit status codes.',
      },
      visualFlow: ['httpx.get(url, timeout=10)', 'Check status_code == 200', 'resp.json() -> Python Dict'],
    },
    pcSetup: {
      title: 'Fetch Live Data From a Public API on Your PC',
      summary: 'Run this 1-liner inside your activated `(.venv)` to fetch real JSON over the internet with `httpx`!',
      windows: {
        commands: ['python -c "import httpx; r = httpx.get(\'https://httpbin.org/json\', timeout=10); print(r.status_code, list(r.json().keys()))"'],
        whatYouSee: '`200 [\'slideshow\']` — your Python script just talked to a live server and parsed JSON!',
        commonFix: 'Always pass `timeout=10` when calling external URLs so a slow website never freezes your server forever.',
      },
      mac: {
        commands: ['python3 -c "import httpx; r = httpx.get(\'https://httpbin.org/json\', timeout=10); print(r.status_code, list(r.json().keys()))"'],
        whatYouSee: '`200 [\'slideshow\']`.',
        commonFix: 'If `No module named httpx` appears, run `source .venv/bin/activate` first.',
      },
    },
    practice: {
      taskPrompt:
        'Complete `handle_api_reply(status_code, body)`: return `"success"` on `200`, `"check_api_key"` on `401`, `"wait_and_retry"` on `429` or `status_code >= 500`, and `"bad_request"` otherwise.',
      language: 'python',
      warmUpCode: `code = 429\nif code == 429 or code >= 500:\n    print("Temporary issue—retry in 2 seconds")`,
      warmUpNote: 'Knowing whether to retry (`429`/`503`) vs stop immediately (`401` bad key) is a core mid-level skill.',
      starterCode: `def handle_api_reply(status_code, body):
    if status_code == 200:
        return "success"
    if status_code == 401:
        return "check_api_key"
    # Handle 429 or >= 500 as "wait_and_retry":
    
    return "bad_request"`,
      hints: [
        'Add `if status_code == 429 or status_code >= 500:` and `return "wait_and_retry"`.',
        'Keep indentation aligned at 4 spaces for `if` and 8 spaces for `return`.',
      ],
      solutionCode: `def handle_api_reply(status_code, body):
    if status_code == 200:
        return "success"
    if status_code == 401:
        return "check_api_key"
    if status_code == 429 or status_code >= 500:
        return "wait_and_retry"
    return "bad_request"`,
      testCode: `assert handle_api_reply(200, {}) == "success"
assert handle_api_reply(401, {}) == "check_api_key"
assert handle_api_reply(429, {}) == "wait_and_retry"
assert handle_api_reply(503, {}) == "wait_and_retry"
assert handle_api_reply(400, {}) == "bad_request"
print("CHECK_PASS|HTTP status handling verified across 200, 401, 429, 503, and 400!")`,
    },
    projectStep: {
      projectTitle: 'Project 3: AI Email & Invoice Extractor',
      fileName: 'extractor.py',
      summary: 'Now you understand what happens under the hood whenever the Gemini or OpenAI SDK talks to the cloud.',
      codeSnippet: `# Always configure timeouts & clean error messages when calling external APIs`,
      runCommandWin: 'python extractor.py',
      runCommandMac: 'python3 extractor.py',
    },
  },
  {
    id: '3-3',
    stageNumber: 3,
    lessonNumber: '3.3',
    title: 'Your First AI Call & Getting Guaranteed JSON Back',
    PlainSubtitle: 'Turn messy customer emails into clean, predictable fields your database can actually save.',
    minutes: 20,
    xp: 130,
    concept: {
      headline: 'Chatbots Return Paragraphs—Software Needs JSON!',
      paragraphs: [
        'If you ask an AI *"Extract the invoice total"*, a normal chat reply says *"Sure! The total appears to be $240."* You cannot save chatty sentences into a SQL `amount` column!',
        'In real AI engineering, we give the AI a **System Instruction + JSON Schema** (using `response_mime_type="application/json"`) so the AI is forced to return pure JSON like `{"vendor": "CloudHost", "total": 240.0, "urgent": true}` every single time.',
      ],
      analogy: {
        fromKnown: 'WordPress Contact Form vs Freeform Email',
        explanation:
          'Freeform text is like a messy email; Structured JSON Output forces the AI to fill out a strict form with exact named boxes.',
      },
      visualFlow: ['Messy Customer Email', 'Gemini / OpenAI Structured JSON', 'Validated Python Dict'],
      proTerm: {
        term: 'Structured Outputs',
        plainMeaning: 'Forcing the AI model to reply strictly in your exact JSON fields instead of freeform paragraphs.',
      },
    },
    pcSetup: {
      title: 'Run Your First Real Gemini AI Extraction on Your PC',
      summary: 'Get a free API key at `aistudio.google.com`, put `GEMINI_API_KEY=...` in `.env`, and run `extractor.py`!',
      windows: {
        commands: [
          'cd C:\\ai-projects\\project-3-ai-extractor',
          '.venv\\Scripts\\activate',
          'python extractor.py',
        ],
        whatYouSee: '`{"vendor": "Acme Hosting", "invoice_no": "INV-204", "total": 189.0}` extracted directly from a messy email!',
        commonFix: 'No API key yet? `project-3-ai-extractor` includes an offline mock mode so you can test right away and plug in your free key anytime.',
      },
      mac: {
        commands: [
          'cd ~/ai-projects/project-3-ai-extractor && source .venv/bin/activate',
          'python3 extractor.py',
        ],
        whatYouSee: 'Structured JSON printed cleanly.',
        commonFix: 'Check `.env` is saved in the same folder where you run `python3 extractor.py`.',
      },
    },
    practice: {
      taskPrompt:
        'After the AI returns JSON text `raw_json`, parse it with `json.loads(raw_json)` and verify both `"vendor"` and `"total"` exist. Return `{"ok": True, "vendor": data["vendor"], "total": float(data["total"])}` or `{"ok": False}` if broken.',
      language: 'python',
      warmUpCode: `import json\nreply = '{"vendor": "Stripe", "total": 49.0}'\ndata = json.loads(reply)\nprint(data["vendor"], data["total"])`,
      warmUpNote: 'Always wrap `json.loads` in `try / except` just in case a network glitch truncates the response.',
      starterCode: `import json

def parse_ai_extraction(raw_json):
    try:
        data = json.loads(raw_json)
        if "vendor" not in data or "total" not in data:
            return {"ok": False}
        # Return {"ok": True, "vendor": data["vendor"], "total": float(data["total"])}:
        return {"ok": False}
    except Exception:
        return {"ok": False}`,
      hints: [
        'Replace the second `return {"ok": False}` with `return {"ok": True, "vendor": data["vendor"], "total": float(data["total"])}`.',
        'Keep `except Exception:` returning `{"ok": False}` for invalid JSON.',
      ],
      solutionCode: `import json

def parse_ai_extraction(raw_json):
    try:
        data = json.loads(raw_json)
        if "vendor" not in data or "total" not in data:
            return {"ok": False}
        return {"ok": True, "vendor": data["vendor"], "total": float(data["total"])}
    except Exception:
        return {"ok": False}`,
      testCode: `assert parse_ai_extraction('{"vendor": "AWS", "total": "125.5"}') == {"ok": True, "vendor": "AWS", "total": 125.5}
assert parse_ai_extraction('{"vendor": "AWS"}') == {"ok": False}
assert parse_ai_extraction('Not JSON') == {"ok": False}
print("CHECK_PASS|Structured AI JSON extraction & validation mastered!")`,
    },
    projectStep: {
      projectTitle: 'Project 3: AI Email & Invoice Extractor',
      fileName: 'extractor.py',
      summary: 'Real Gemini SDK snippet inside `extractor.py` using `response_mime_type="application/json"`.',
      codeSnippet: `from google import genai\nfrom dotenv import load_dotenv\nload_dotenv()\nclient = genai.Client()\nresp = client.models.generate_content(\n    model="gemini-2.5-flash",\n    contents="Extract vendor and total as JSON: Invoice from AWS for $125.50",\n    config={"response_mime_type": "application/json"},\n)\nprint(resp.text)`,
      runCommandWin: 'python extractor.py',
      runCommandMac: 'python3 extractor.py',
    },
  },
  {
    id: '3-4',
    stageNumber: 3,
    lessonNumber: '3.4',
    title: 'Git & GitHub From Zero: Publish Project 3 Safely',
    PlainSubtitle: 'Save checkpoints of your code, protect `.env` with `.gitignore`, and push your first AI repo.',
    minutes: 20,
    xp: 130,
    concept: {
      headline: 'Rule #1 of GitHub: Never Upload `.env` or `.venv`!',
      paragraphs: [
        'Git saves snapshots ("commits") of your project history, and GitHub hosts your portfolio online so employers and clients can see your real work.',
        'Before running `git add .`, you **always** create a tiny file named `.gitignore` listing `.env` and `.venv/`. Why? If you accidentally push `.env` to a public GitHub repo, bots steal your API key in under 60 seconds!',
      ],
      analogy: {
        fromKnown: 'WordPress Revisions + Public Portfolio',
        explanation:
          '`git commit` is like WordPress Post Revisions (you can undo mistakes anytime), and `.gitignore` tells Git which private files stay strictly on your laptop.',
      },
      visualFlow: ['Create .gitignore (.env, .venv/)', 'git add . && git commit', 'git push -> Live on GitHub'],
    },
    pcSetup: {
      title: 'Push Project 3 to Your GitHub Account',
      summary: 'Create a new empty repository on github.com named `ai-invoice-extractor`, then run these commands in VS Code:',
      windows: {
        commands: [
          'cd C:\\ai-projects\\project-3-ai-extractor',
          'git init',
          'git status',
          'git add .',
          'git commit -m "feat: build AI email and invoice JSON extractor"',
          'git branch -M main',
          'git remote add origin https://github.com/YOUR_USERNAME/ai-invoice-extractor.git',
          'git push -u origin main',
        ],
        whatYouSee: 'Refresh your GitHub repo page—your Python code and README are live, while `.env` is safely absent!',
        commonFix: 'Run `git status` BEFORE `git commit` to visually verify `.env` is NOT in the green staged list.',
      },
      mac: {
        commands: [
          'cd ~/ai-projects/project-3-ai-extractor',
          'git init && git add .',
          'git commit -m "feat: build AI email and invoice JSON extractor"',
          'git branch -M main && git push -u origin main',
        ],
        whatYouSee: 'Your first AI Engineering repository published cleanly on GitHub.',
        commonFix: 'If Git asks for your name/email the first time, run `git config --global user.name "Your Name"` and `git config --global user.email "you@example.com"`.',
      },
    },
    practice: {
      taskPrompt:
        'Write a pre-commit safety check `check_safe_to_push(staged_files)`: if `".env"` or any file starting with `".venv/"` is in `staged_files`, return `{"safe": False, "reason": "Blocked secret or venv file!"}`. Otherwise return `{"safe": True}`.',
      language: 'python',
      warmUpCode: `path = ".venv/pyvenv.cfg"\nprint(path.startswith(".venv/"))  # True`,
      warmUpNote: 'Real companies run secret-check scripts like this automatically before every Git commit.',
      starterCode: `def check_safe_to_push(staged_files):
    for f in staged_files:
        if f == ".env" or f.startswith(".venv/"):
            # Block the push!
            return {"safe": True}
    return {"safe": True}`,
      hints: [
        'Inside the `if` block, return `{"safe": False, "reason": "Blocked secret or venv file!"}`.',
        'Leave the outer `return {"safe": True}` at the end when all files are clean.',
      ],
      solutionCode: `def check_safe_to_push(staged_files):
    for f in staged_files:
        if f == ".env" or f.startswith(".venv/"):
            return {"safe": False, "reason": "Blocked secret or venv file!"}
    return {"safe": True}`,
      testCode: `assert check_safe_to_push(["README.md", "extractor.py", ".gitignore"]) == {"safe": True}
assert check_safe_to_push(["extractor.py", ".env"])["safe"] is False
assert check_safe_to_push([".venv/lib/site.py"])["safe"] is False
print("CHECK_PASS|Stage 3 Complete! You can now build AI scripts with .venv/.env and publish safely to GitHub.")`,
    },
    projectStep: {
      projectTitle: 'Project 3: AI Email & Invoice Extractor',
      fileName: '.gitignore',
      summary: 'Always place these 3 lines inside `.gitignore` in every Python project you ever create.',
      codeSnippet: `.env\n.venv/\n__pycache__/`,
      runCommandWin: 'git status',
      runCommandMac: 'git status',
    },
  },
];
