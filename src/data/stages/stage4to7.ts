import type { JourneyLesson } from '@/types/journey';

export const STAGE_4_TO_7_LESSONS: JourneyLesson[] = [
  // =========================================================================
  // STAGE 4: WEB BACKENDS — PYTHON + SQL + YOUR HTML/CSS (Lessons 4.1 – 4.4)
  // =========================================================================
  {
    id: '4-1',
    stageNumber: 4,
    lessonNumber: '4.1',
    title: 'Turn Python Into a Web API (FastAPI in 12 Lines)',
    PlainSubtitle: 'Put a real http://localhost:8000 URL in front of your Python functions.',
    minutes: 18,
    xp: 120,
    concept: {
      headline: 'How a Website Talks to Your Python Script',
      paragraphs: [
        'Right now your `.py` files only run inside your terminal. How does a real website button call your Python AI code? With **FastAPI**!',
        'Adding `@app.get("/health")` or `@app.post("/ask")` right above a normal Python `def` function turns that function into a live web URL—and FastAPI automatically generates a clickable test webpage at `http://localhost:8000/docs`!',
      ],
      analogy: {
        fromKnown: 'WordPress REST API (/wp-json/)',
        explanation:
          'Just like `/wp-json/wp/v2/posts` returns JSON when a browser visits it, FastAPI lets you create your own `/ask` URL in 5 lines of Python.',
      },
      visualFlow: ['Browser / Frontend', 'POST http://localhost:8000/ask', 'FastAPI Runs def ask()'],
    },
    pcSetup: {
      title: 'Start Your First Live FastAPI Server on Windows',
      summary: 'Install `fastapi` and `uvicorn`, start the server, and open `http://localhost:8000/docs` in Chrome/Edge!',
      windows: {
        commands: [
          'mkdir C:\\ai-projects\\project-4-support-webapp',
          'cd C:\\ai-projects\\project-4-support-webapp',
          'python -m venv .venv',
          '.venv\\Scripts\\activate',
          'pip install fastapi uvicorn pydantic',
          'uvicorn main:app --reload',
        ],
        whatYouSee: '`Uvicorn running on http://127.0.0.1:8000` — open `http://localhost:8000/docs` in your browser to click "Try it out"!',
        commonFix: 'Keep that terminal tab running while using your server; press Ctrl + C when you want to stop the server.',
      },
      mac: {
        commands: [
          'mkdir -p ~/ai-projects/project-4-support-webapp && cd ~/ai-projects/project-4-support-webapp',
          'python3 -m venv .venv && source .venv/bin/activate',
          'pip install fastapi uvicorn pydantic',
          'uvicorn main:app --reload',
        ],
        whatYouSee: 'Interactive Swagger UI live at `http://localhost:8000/docs`.',
        commonFix: '`--reload` automatically restarts your server every time you save `main.py`.',
      },
    },
    practice: {
      taskPrompt:
        'Write the endpoint handler `ask_endpoint(payload)`: clean `question = (payload.get("question") or "").strip()`. If `question` is empty, return `{"status": 400, "error": "Please type a question"}`. Otherwise return `{"status": 200, "reply": f"Received: {question}"}`.',
      language: 'python',
      warmUpCode: `q = "  Where is my order?  ".strip()\nprint({"status": 200, "reply": f"Received: {q}"})`,
      warmUpNote: 'FastAPI automatically converts any Python dictionary you `return` into JSON for the browser!',
      starterCode: `def ask_endpoint(payload):
    question = (payload.get("question") or "").strip()
    if not question:
        return {"status": 400, "error": "Please type a question"}
    # Return status 200 and "Received: {question}":
    return {"status": 200, "reply": ""}`,
      hints: [
        'Change `"reply": ""` to `"reply": f"Received: {question}"`.',
        'Remember the `f` right before the quote in `f"Received: {question}"`.',
      ],
      solutionCode: `def ask_endpoint(payload):
    question = (payload.get("question") or "").strip()
    if not question:
        return {"status": 400, "error": "Please type a question"}
    return {"status": 200, "reply": f"Received: {question}"}`,
      testCode: `assert ask_endpoint({"question": "   "}) == {"status": 400, "error": "Please type a question"}
assert ask_endpoint({"question": "Where is ORD-1?"}) == {"status": 200, "reply": "Received: Where is ORD-1?"}
print("CHECK_PASS|Your first FastAPI route handler logic is ready!")`,
    },
    projectStep: {
      projectTitle: 'Project 4: Full-Stack AI Support Web App',
      fileName: 'main.py',
      summary: 'Save these 10 lines as `main.py` and visit `http://localhost:8000/docs` in your browser!',
      codeSnippet: `from fastapi import FastAPI\napp = FastAPI()\n\n@app.get("/health")\ndef health():\n    return {"ok": True}\n\n@app.post("/ask")\ndef ask(payload: dict):\n    return {"reply": f"You asked: {payload.get('question', '')}"}`,
      runCommandWin: 'uvicorn main:app --reload',
      runCommandMac: 'uvicorn main:app --reload',
    },
  },
  {
    id: '4-2',
    stageNumber: 4,
    lessonNumber: '4.2',
    title: 'Connect Python to SQL Tables (Your SQL Superpower!)',
    PlainSubtitle: 'Look up real customer orders from a SQL database before asking the AI to answer.',
    minutes: 18,
    xp: 120,
    concept: {
      headline: 'AI Doesn’t Know Your Orders—SQL Does!',
      paragraphs: [
        'Since you already know basic SQL, you have a huge advantage! Python includes `sqlite3` out of the box (no extra server needed while developing, and the exact same SQL upgrades to cloud **Postgres** later).',
        'Security rule: Never glue user text directly into SQL strings (`f"WHERE id = \'{id}\'"`). Always use a `?` placeholder (`conn.execute("SELECT ... WHERE order_id = ?", (order_id,))`) so hackers can never inject malicious SQL.',
      ],
      analogy: {
        fromKnown: 'WordPress wp_posts / WooCommerce Orders Table',
        explanation:
          'When a customer asks "Where is order ORD-200?", Python runs a 1-millisecond `SELECT` on your `orders` table, then hands that exact row to the AI to write a friendly answer.',
      },
      visualFlow: ['Customer Order ID', 'SELECT status, eta FROM orders', 'Give Row to AI Prompt'],
    },
    pcSetup: {
      title: 'Create & Query a Local `orders.db` File',
      summary: 'Run this 1-liner in your terminal—Python creates a real SQLite database file right in your folder!',
      windows: {
        commands: [
          'python -c "import sqlite3; c = sqlite3.connect(\'orders.db\'); c.execute(\'CREATE TABLE IF NOT EXISTS orders (id TEXT, status TEXT)\'); print(\'orders.db ready!\')"',
        ],
        whatYouSee: '`orders.db ready!` and a new `orders.db` file appears in VS Code.',
        commonFix: 'Install the free "SQLite Viewer" extension in VS Code to click `orders.db` and view tables visually like phpMyAdmin!',
      },
      mac: {
        commands: [
          'python3 -c "import sqlite3; c = sqlite3.connect(\'orders.db\'); c.execute(\'CREATE TABLE IF NOT EXISTS orders (id TEXT, status TEXT)\'); print(\'orders.db ready!\')"',
        ],
        whatYouSee: '`orders.db` created cleanly.',
        commonFix: 'Use VS Code’s "SQLite Viewer" extension to browse tables visually.',
      },
    },
    practice: {
      taskPrompt:
        'Write a SQL query selecting `order_id, customer, status` from `orders` where `status = \'shipped\'` ordered by `order_id ASC`.',
      language: 'sql',
      setupCode: `conn.execute("CREATE TABLE orders (order_id TEXT, customer TEXT, status TEXT)")
conn.executemany("INSERT INTO orders VALUES (?, ?, ?)", [
    ("ORD-102", "Sara", "shipped"),
    ("ORD-101", "Ali", "shipped"),
    ("ORD-103", "Bob", "processing"),
])`,
      warmUpCode: `SELECT order_id, status FROM orders;`,
      warmUpNote: 'Put single quotes around text values in SQL: `WHERE status = \'shipped\'`.',
      starterCode: `SELECT order_id, customer, status
FROM orders;`,
      hints: [
        'Add `WHERE status = \'shipped\'` on a new line before the semicolon.',
        'Add `ORDER BY order_id ASC` right after the `WHERE` line.',
      ],
      solutionCode: `SELECT order_id, customer, status
FROM orders
WHERE status = 'shipped'
ORDER BY order_id ASC;`,
      testCode: `assert len(rows) == 2, f"Expected 2 shipped orders, got {len(rows)}"
assert rows[0][0] == "ORD-101" and rows[1][0] == "ORD-102", f"Expected ORD-101 then ORD-102, got {rows}"
print("CHECK_PASS|SQL lookup verified—ready to feed real order rows into Python & AI!")`,
    },
    projectStep: {
      projectTitle: 'Project 4: Full-Stack AI Support Web App',
      fileName: 'db.py',
      summary: 'Safe parameterized SQL lookup function in Python (`?` placeholder).',
      codeSnippet: `import sqlite3\ndef get_order(order_id: str):\n    with sqlite3.connect("orders.db") as conn:\n        row = conn.execute("SELECT status, eta FROM orders WHERE order_id = ?", (order_id,)).fetchone()\n        return {"status": row[0], "eta": row[1]} if row else None`,
      runCommandWin: 'python db.py',
      runCommandMac: 'python3 db.py',
    },
  },
  {
    id: '4-3',
    stageNumber: 4,
    lessonNumber: '4.3',
    title: 'Connect Your HTML/CSS Page to Python (fetch + CORS)',
    PlainSubtitle: 'Use your HTML/CSS skills to build a clean chat box that talks to your FastAPI server.',
    minutes: 18,
    xp: 120,
    concept: {
      headline: 'Bridging Your HTML/CSS Frontend to Python',
      paragraphs: [
        'You already know HTML & CSS! To connect an `<input>` box and `<button>` on your webpage to your Python FastAPI server, you only need 6 lines of browser `fetch("http://localhost:8000/ask", { method: "POST", ... })`.',
        'One crucial browser rule: if you open `index.html` separately from `localhost:8000`, browsers block requests unless FastAPI enables **CORS** (`CORSMiddleware`)—which is a 4-line copy-paste setting telling the browser *"Yes, my HTML page is allowed to talk to my Python server!"*',
      ],
      analogy: {
        fromKnown: 'HTML Form Action',
        explanation:
          'Instead of an old `<form action="submit.php">` that reloads the whole page, `fetch()` sends JSON in the background so your AI reply pops into the chat smoothly.',
      },
      visualFlow: ['HTML Input + CSS Card', 'JS fetch("/ask", JSON)', 'FastAPI + SQL + AI Reply'],
    },
    pcSetup: {
      title: 'Serve `index.html` Directly From FastAPI',
      summary: 'Even simpler than CORS: FastAPI’s `StaticFiles` can serve your `public/index.html` and CSS at `http://localhost:8000` on the exact same port!',
      windows: {
        commands: [
          'cd C:\\ai-projects\\project-4-support-webapp',
          '.venv\\Scripts\\activate',
          'uvicorn main:app --reload',
        ],
        whatYouSee: 'Open `http://localhost:8000`—your custom HTML/CSS support widget talks live to Python & SQLite!',
        commonFix: 'Open Browser DevTools (`F12` -> Network tab) anytime to inspect the exact JSON sent and received.',
      },
      mac: {
        commands: ['cd ~/ai-projects/project-4-support-webapp && uvicorn main:app --reload'],
        whatYouSee: 'Your full-stack web app running locally at `http://localhost:8000`.',
        commonFix: 'Press `Cmd + Option + I` -> Network tab in Chrome to debug API requests.',
      },
    },
    practice: {
      taskPrompt:
        'Build the JSON response dictionary inside `format_support_card(order_row, ai_note)` that your HTML/CSS frontend expects: if `order_row` is `None`, return `{"found": False, "badge_color": "red", "message": "Order not found"}`. Otherwise return `{"found": True, "badge_color": "green", "message": f"{order_row[\'status\']}: {ai_note}"}`.',
      language: 'python',
      warmUpCode: `row = {"status": "Shipped"}\nprint(f"{row['status']}: Arriving Tuesday")`,
      warmUpNote: 'Returning clean fields like `badge_color` makes styling status pills in your HTML/CSS effortless.',
      starterCode: `def format_support_card(order_row, ai_note):
    if order_row is None:
        return {"found": False, "badge_color": "red", "message": "Order not found"}
    # Return found=True, badge_color="green", and "{status}: {ai_note}":
    return {"found": True, "badge_color": "green", "message": ""}`,
      hints: [
        'Set `"message": f"{order_row[\'status\']}: {ai_note}"`.',
        'Notice single quotes `\'status\'` inside double-quoted `f"..."`!',
      ],
      solutionCode: `def format_support_card(order_row, ai_note):
    if order_row is None:
        return {"found": False, "badge_color": "red", "message": "Order not found"}
    return {"found": True, "badge_color": "green", "message": f"{order_row['status']}: {ai_note}"}`,
      testCode: `assert format_support_card(None, "")["found"] is False
assert format_support_card({"status": "Shipped"}, "On time") == {"found": True, "badge_color": "green", "message": "Shipped: On time"}
print("CHECK_PASS|Frontend <-> FastAPI JSON contract ready!")`,
    },
    projectStep: {
      projectTitle: 'Project 4: Full-Stack AI Support Web App',
      fileName: 'public/index.html',
      summary: '6-line `fetch()` snippet inside your HTML page connecting a button to FastAPI.',
      codeSnippet: `const res = await fetch("/ask", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ order_id: "ORD-101", question: "Where is my package?" })\n});\nconst data = await res.json();`,
      runCommandWin: 'uvicorn main:app --reload',
      runCommandMac: 'uvicorn main:app --reload',
    },
  },
  {
    id: '4-4',
    stageNumber: 4,
    lessonNumber: '4.4',
    title: 'Project 4 Finish: Full-Stack AI Order Support App',
    PlainSubtitle: 'Extract the order ID from a customer message, query SQL, and build a grounded AI prompt.',
    minutes: 20,
    xp: 140,
    concept: {
      headline: 'Your First Complete Full-Stack AI Feature!',
      paragraphs: [
        'Look at the real company pipeline you can now build end-to-end: 1) Customer types *"Hi, any update on ORD-105?"* in your HTML/CSS page -> 2) Python finds `ORD-105` -> 3) SQLite fetches the real shipping status -> 4) AI writes a polite, accurate answer using ONLY that SQL row!',
        'This pattern—**Lookup Real Data First, Let AI Summarize Second**—eliminates 90% of AI hallucinations.',
      ],
      analogy: {
        fromKnown: 'Support Rep Checking Admin Panel',
        explanation:
          'A human support rep looks up the order in WooCommerce *before* replying to the customer. Your Python backend does the exact same thing in 200ms.',
      },
      visualFlow: ['Find ORD-XXX in Text', 'Query SQL Row', 'Build Grounded AI Prompt'],
    },
    pcSetup: {
      title: 'Run Full-Stack Project 4 (`project-4-support-webapp`)',
      summary: 'Download `project-4-support-webapp.zip` in Tab `3. My 7 Projects`, start `uvicorn`, and chat with your app in Chrome!',
      windows: {
        commands: [
          'cd C:\\ai-projects\\project-4-support-webapp',
          '.venv\\Scripts\\activate',
          'uvicorn main:app --reload',
        ],
        whatYouSee: 'Full HTML/CSS customer support portal live at `http://localhost:8000` backed by FastAPI + SQLite!',
        commonFix: 'Push `project-4-support-webapp` to GitHub too—you now have a real Full-Stack Python + SQL + Web repo!',
      },
      mac: {
        commands: ['cd ~/ai-projects/project-4-support-webapp && source .venv/bin/activate && uvicorn main:app --reload'],
        whatYouSee: 'Live local web app at `http://localhost:8000`.',
        commonFix: 'Remember `.gitignore` before pushing to GitHub.',
      },
    },
    practice: {
      taskPrompt:
        'Complete `find_order_and_prompt(message, orders_db)`: scan words in `message.split()` to find a word starting with `"ORD-"`. Look it up in `orders_db` dict; if found, return `f"Order {word} status is {orders_db[word]}. Reply politely."`, otherwise return `"Ask customer for their ORD- number."`.',
      language: 'python',
      warmUpCode: `msg = "Check ORD-105 please"\nfor w in msg.split():\n    if w.startswith("ORD-"):\n        print("Found:", w)`,
      warmUpNote: '`.split()` breaks a sentence into a list of individual words.',
      starterCode: `def find_order_and_prompt(message, orders_db):
    for raw_word in message.split():
        word = raw_word.strip(".,?!")
        if word.startswith("ORD-") and word in orders_db:
            # Return grounded prompt string:
            return ""
    return "Ask customer for their ORD- number."`,
      hints: [
        'Inside the `if`, write `return f"Order {word} status is {orders_db[word]}. Reply politely."`.',
        'Notice `raw_word.strip(".,?!")` removes punctuation like `"ORD-105?"` -> `"ORD-105"`!',
      ],
      solutionCode: `def find_order_and_prompt(message, orders_db):
    for raw_word in message.split():
        word = raw_word.strip(".,?!")
        if word.startswith("ORD-") and word in orders_db:
            return f"Order {word} status is {orders_db[word]}. Reply politely."
    return "Ask customer for their ORD- number."`,
      testCode: `db = {"ORD-105": "Delivered"}
assert find_order_and_prompt("Where is ORD-105?", db) == "Order ORD-105 status is Delivered. Reply politely."
assert find_order_and_prompt("Where is my stuff?", db) == "Ask customer for their ORD- number."
print("CHECK_PASS|Stage 4 Complete! You can now connect HTML/CSS, FastAPI, SQL, and AI into a real web app.")`,
    },
    projectStep: {
      projectTitle: 'Project 4: Full-Stack AI Support Web App',
      fileName: 'main.py',
      summary: 'Your `/ask` endpoint now combines SQL facts + AI fluency.',
      codeSnippet: `prompt = find_order_and_prompt(user_msg, ORDERS_DB)\n# Send prompt to Gemini / OpenAI and return {"reply": ai_text}`,
      runCommandWin: 'uvicorn main:app --reload',
      runCommandMac: 'uvicorn main:app --reload',
    },
  },

  // =========================================================================
  // STAGE 5: TEACHING AI PRIVATE COMPANY DATA — RAG (Lessons 5.1 – 5.4)
  // =========================================================================
  {
    id: '5-1',
    stageNumber: 5,
    lessonNumber: '5.1',
    title: 'How AI Search ("RAG") Works in Plain English + Chunking',
    PlainSubtitle: 'Teach AI to answer from 500-page company handbooks without training a model.',
    minutes: 18,
    xp: 130,
    concept: {
      headline: 'Open-Book Exam Instead of Memorization (RAG)',
      paragraphs: [
        'Beginners often think they must "train" a model on company PDFs. In real companies, 95% of the time we do **RAG (Retrieval-Augmented Generation)**—which just means: **1) Search** your company docs for the 3 most relevant paragraphs, and **2) Paste** those 3 paragraphs into the prompt saying *"Answer using ONLY these paragraphs."*',
        'And what is an **Embedding**? Simply an AI API call that turns a paragraph’s *meaning* into a list of numbers so `"request money back"` matches `"refund policy"` even when they share zero exact words!',
      ],
      analogy: {
        fromKnown: 'Open-Book Test With Sticky Notes',
        explanation:
          'Instead of memorizing a 300-page manual, you flip to the 2 right pages using the index, read them, and write the answer.',
      },
      visualFlow: ['Split Handbook Into Chunks', 'Find Top-3 Matching Chunks', 'Send Top-3 + Question to AI'],
      proTerm: {
        term: 'RAG & Embeddings',
        plainMeaning: 'RAG = search your docs first, then ask AI. Embedding = a meaning-fingerprint so similar ideas match.',
      },
    },
    pcSetup: {
      title: 'Set Up Project 5 (`project-5-rag-copilot`)',
      summary: 'Split long company Markdown/PDF documents by section headings (`##`) or paragraph chunks so each piece is focused (~300–600 words).',
      windows: {
        commands: [
          'mkdir C:\\ai-projects\\project-5-rag-copilot',
          'cd C:\\ai-projects\\project-5-rag-copilot',
          'python -m venv .venv && .venv\\Scripts\\activate',
        ],
        whatYouSee: 'Ready for building your private company knowledge search engine.',
        commonFix: 'Keep chunks around 1–3 paragraphs each: too tiny loses context; too huge wastes tokens.',
      },
      mac: {
        commands: ['mkdir -p ~/ai-projects/project-5-rag-copilot && cd ~/ai-projects/project-5-rag-copilot'],
        whatYouSee: 'Project 5 directory ready.',
        commonFix: 'Splitting on Markdown headings (`\\n## `) keeps whole policy sections intact!',
      },
    },
    practice: {
      taskPrompt:
        'Split a company Markdown handbook `doc_text` on `"\\n## "` into clean non-empty sections, returning a list of dicts `[{"chunk_id": i, "text": part.strip()}]` starting `i` at `1`.',
      language: 'python',
      warmUpCode: `md = "## Refunds\\n30 days.\\n## Shipping\\nFree over $50."\nfor part in md.split("## "):\n    if part.strip():\n        print("SECTION:", part.strip())`,
      warmUpNote: 'Splitting by headings keeps headings together with their policy rules!',
      starterCode: `def chunk_handbook(doc_text):
    raw_parts = doc_text.split("## ")
    chunks = []
    for part in raw_parts:
        clean = part.strip()
        if not clean:
            continue
        # Append {"chunk_id": len(chunks) + 1, "text": clean}:
        
    return chunks`,
      hints: [
        'Write `chunks.append({"chunk_id": len(chunks) + 1, "text": clean})` inside the loop.',
        '`len(chunks) + 1` numbers the chunks `1, 2, 3...` cleanly!',
      ],
      solutionCode: `def chunk_handbook(doc_text):
    raw_parts = doc_text.split("## ")
    chunks = []
    for part in raw_parts:
        clean = part.strip()
        if not clean:
            continue
        chunks.append({"chunk_id": len(chunks) + 1, "text": clean})
    return chunks`,
      testCode: `res = chunk_handbook("## Refunds\\n30 days.\\n## Shipping\\n2-day air.")
assert res == [{"chunk_id": 1, "text": "Refunds\\n30 days."}, {"chunk_id": 2, "text": "Shipping\\n2-day air."}]
print("CHECK_PASS|Document heading chunker verified!")`,
    },
    projectStep: {
      projectTitle: 'Project 5: Company Knowledge Copilot',
      fileName: 'ingest.py',
      summary: 'Chunk company `.md` or `.txt` files cleanly with source filenames attached.',
      codeSnippet: `chunks = chunk_handbook(open("handbook.md").read())\nprint(f"Indexed {len(chunks)} policy sections")`,
      runCommandWin: 'python ingest.py',
      runCommandMac: 'python3 ingest.py',
    },
  },
  {
    id: '5-2',
    stageNumber: 5,
    lessonNumber: '5.2',
    title: 'Combine Exact Keyword Search + Meaning Search',
    PlainSubtitle: 'Why pure AI vector search misses exact SKU/error codes—and the 6-line fix.',
    minutes: 18,
    xp: 140,
    concept: {
      headline: 'Hybrid Search = Best of Both Worlds',
      paragraphs: [
        'Meaning search (embeddings) is great when a user asks *"How do I get reimbursed?"*, matching *"Expense Policy"*.',
        'But if a user searches exact model number `"SKU-8842"` or error `"ERR_SSL_99"`, keyword search wins! Combining both rankings (**Hybrid Search**) is one of the highest-value upgrades companies hire AI engineers to build.',
      ],
      analogy: {
        fromKnown: 'Ctrl+F + Smart Topic Assistant',
        explanation:
          'Keyword search is exact `Ctrl+F`; vector search understands synonyms. Adding their rank scores together surfaces chunks that win on either or both!',
      },
      visualFlow: ['Keyword Matches + Meaning Matches', 'Add Rank Points Together', 'Top-3 Best Chunks'],
      proTerm: {
        term: 'Hybrid RAG',
        plainMeaning: 'Combining traditional keyword search with AI embedding search so exact IDs and broad questions both work.',
      },
    },
    pcSetup: {
      title: 'Where Companies Store Embeddings (`pgvector`)',
      summary: 'Good news: you don’t even need a separate expensive "vector database"—standard Postgres has a free plugin called `pgvector` that stores embeddings right alongside your normal SQL tables!',
      windows: {
        commands: ['pip install rank-bm25 numpy'],
        whatYouSee: 'Lightweight keyword search (`rank-bm25`) installed in 2 seconds for local testing.',
        commonFix: 'Start locally with Python/SQLite, then point `DATABASE_URL` to Supabase or Neon Postgres (`pgvector`) when deploying.',
      },
      mac: {
        commands: ['pip install rank-bm25 numpy'],
        whatYouSee: 'Installed cleanly in `.venv`.',
        commonFix: 'Keep `.venv` active.',
      },
    },
    practice: {
      taskPrompt:
        'Combine `keyword_hits` and `meaning_hits` (lists of doc IDs ordered best-first): give each doc `1 / (10 + rank)` points (where `rank` starts at `1`), sum points across both lists, and return the top 2 doc IDs.',
      language: 'python',
      warmUpCode: `scores = {}\nscores["doc-a"] = scores.get("doc-a", 0) + 0.5\nscores["doc-a"] = scores.get("doc-a", 0) + 0.4\nprint(scores)  # {'doc-a': 0.9}`,
      warmUpNote: 'Documents appearing near the top of BOTH lists get boosted to #1!',
      starterCode: `def hybrid_top_two(keyword_hits, meaning_hits):
    scores = {}
    for rank, doc_id in enumerate(keyword_hits, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (10 + rank)
    for rank, doc_id in enumerate(meaning_hits, start=1):
        # Add 1.0 / (10 + rank) for meaning_hits too:
        pass
    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    return [doc_id for doc_id, _ in ranked[:2]]`,
      hints: [
        'Replace `pass` inside the second loop with `scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (10 + rank)`.',
        'Both loops use the exact same scoring formula!',
      ],
      solutionCode: `def hybrid_top_two(keyword_hits, meaning_hits):
    scores = {}
    for rank, doc_id in enumerate(keyword_hits, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (10 + rank)
    for rank, doc_id in enumerate(meaning_hits, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (10 + rank)
    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    return [doc_id for doc_id, _ in ranked[:2]]`,
      testCode: `top = hybrid_top_two(["sku-8842", "faq"], ["returns", "sku-8842"])
assert top == ["sku-8842", "returns"], f"Expected ['sku-8842', 'returns'], got {top}"
print("CHECK_PASS|Hybrid keyword + meaning ranker verified!")`,
    },
    projectStep: {
      projectTitle: 'Project 5: Company Knowledge Copilot',
      fileName: 'search.py',
      summary: 'Plug `hybrid_top_two` into `search.py` so exact codes and natural questions both succeed.',
      codeSnippet: `best_ids = hybrid_top_two(bm25_search(query), vector_search(query))`,
      runCommandWin: 'python search.py',
      runCommandMac: 'python3 search.py',
    },
  },
  {
    id: '5-3',
    stageNumber: 5,
    lessonNumber: '5.3',
    title: 'Citations & Saying "I Don’t Have That Info"',
    PlainSubtitle: 'Stop AI from making up fake company rules and show clickable source badges.',
    minutes: 16,
    xp: 130,
    concept: {
      headline: 'Business AI Must Cite Sources or Stay Quiet',
      paragraphs: [
        'In consumer chat, guessing is annoying; in company software, inventing a fake "90-day refund guarantee" costs real legal money!',
        'Two simple guardrails solve this: 1) If the best search match score is weak (`< 0.65`), don’t even guess—reply *"I couldn’t find that in company docs."* 2) Require the AI JSON reply to list `cited_ids` and check in Python that those IDs actually came from your search results!',
      ],
      analogy: {
        fromKnown: 'Wikipedia Footnotes [1]',
        explanation:
          'Every answer shows `[handbook.md #2]` so employees or customers trust the answer and can click to read the original policy.',
      },
      visualFlow: ['Check Match Score >= 0.65', 'Verify cited_ids Exist', 'Show Answer + Source Badge'],
    },
    pcSetup: {
      title: 'Test Grounded Refusals Locally',
      summary: 'Ask your copilot an off-topic question like *"What is the weather in Mars?"* to confirm it refuses politely instead of hallucinating.',
      windows: {
        commands: ['python copilot.py --question "Do we offer free helicopters?"'],
        whatYouSee: '`I could not find an answer in the verified company documents.`',
        commonFix: 'Always include `"If the answer is not in CONTEXT, set abstain=true"` in your system prompt.',
      },
      mac: {
        commands: ['python3 copilot.py --question "Do we offer free helicopters?"'],
        whatYouSee: 'Clean abstention response.',
        commonFix: 'Keep temperature low (`0.0` or `0.1`) for factual RAG.',
      },
    },
    practice: {
      taskPrompt:
        'Check `verify_reply(retrieved_ids, ai_reply)`: if `not retrieved_ids`, return `"No matching documents found."`. Check that `ai_reply["source_id"]` is inside `retrieved_ids`; if not, return `"Unverified citation blocked."`, otherwise return `f"{ai_reply[\'answer\']} [{ai_reply[\'source_id\']}]"`.',
      language: 'python',
      warmUpCode: `allowed = ["doc-1", "doc-2"]\nprint("doc-1" in allowed)   # True\nprint("doc-99" in allowed)  # False`,
      warmUpNote: '`x in my_list` checks membership in plain English!',
      starterCode: `def verify_reply(retrieved_ids, ai_reply):
    if not retrieved_ids:
        return "No matching documents found."
    src = ai_reply.get("source_id", "")
    if src not in retrieved_ids:
        return "Unverified citation blocked."
    # Return "{answer} [{source_id}]":
    return ""`,
      hints: [
        'Write `return f"{ai_reply[\'answer\']} [{src}]"` on the final line.',
        'Notice `src` already holds `ai_reply.get("source_id", "")`!',
      ],
      solutionCode: `def verify_reply(retrieved_ids, ai_reply):
    if not retrieved_ids:
        return "No matching documents found."
    src = ai_reply.get("source_id", "")
    if src not in retrieved_ids:
        return "Unverified citation blocked."
    return f"{ai_reply['answer']} [{src}]"`,
      testCode: `assert verify_reply([], {"answer": "Yes", "source_id": "doc-1"}) == "No matching documents found."
assert verify_reply(["doc-1"], {"answer": "Fake", "source_id": "doc-99"}) == "Unverified citation blocked."
assert verify_reply(["doc-1"], {"answer": "30-day refunds.", "source_id": "doc-1"}) == "30-day refunds. [doc-1]"
print("CHECK_PASS|Hallucination & citation verifier working!")`,
    },
    projectStep: {
      projectTitle: 'Project 5: Company Knowledge Copilot',
      fileName: 'copilot.py',
      summary: 'Attach verified `[source_id]` citations to every copilot answer.',
      codeSnippet: `safe_text = verify_reply([c["id"] for c in top_chunks], ai_json)`,
      runCommandWin: 'python copilot.py',
      runCommandMac: 'python3 copilot.py',
    },
  },
  {
    id: '5-4',
    stageNumber: 5,
    lessonNumber: '5.4',
    title: 'Customer Privacy Rules + Project 5 Finish',
    PlainSubtitle: 'Guarantee Company A can never search Company B’s private files.',
    minutes: 20,
    xp: 150,
    concept: {
      headline: 'Filter Permissions BEFORE Searching!',
      paragraphs: [
        'Imagine building a SaaS app used by 50 companies. If all their PDFs sit in one database table, you MUST filter `WHERE company_id = current_user.company_id` **before** picking top search matches!',
        'Also check user roles (`"employee"` vs `"manager"`): a normal employee asking *"What is the CEO’s salary?"* should never even retrieve executive HR chunks.',
      ],
      analogy: {
        fromKnown: 'WordPress Private / Password-Protected Pages',
        explanation:
          'WordPress checks if you are logged in as an Editor before showing Draft posts in search results. Your AI search must enforce the exact same check!',
      },
      visualFlow: ['Logged-In User (company + role)', 'Filter Docs by company & role', 'Search Only Allowed Docs'],
      proTerm: {
        term: 'Multi-Tenant RBAC',
        plainMeaning: 'Multi-Tenant = separating Company A from Company B. RBAC = Role-Based Access Control (Admin vs Member).',
      },
    },
    pcSetup: {
      title: 'Run & Test Project 5 (`project-5-rag-copilot`)',
      summary: 'Download `project-5-rag-copilot.zip` in Tab `3. My 7 Projects` and run `pytest` to see your cross-company security tests pass!',
      windows: {
        commands: [
          'cd C:\\ai-projects\\project-5-rag-copilot',
          '.venv\\Scripts\\activate',
          'pip install -r requirements.txt',
          'pytest -q',
        ],
        whatYouSee: '`4 passed` — proving rival company docs and admin-only docs never leak!',
        commonFix: 'Push Project 5 to GitHub—hiring managers love seeing permission-aware RAG in a portfolio!',
      },
      mac: {
        commands: ['cd ~/ai-projects/project-5-rag-copilot && source .venv/bin/activate && pytest -q'],
        whatYouSee: '`4 passed` cleanly.',
        commonFix: 'Include a short README section explaining how you isolate `company_id` before ranking.',
      },
    },
    practice: {
      taskPrompt:
        'Filter `all_docs` inside `allowed_docs_for_user(all_docs, user_company, user_role)` so it returns ONLY docs where `d["company"] == user_company` AND `user_role in d["roles"]`.',
      language: 'python',
      warmUpCode: `doc = {"company": "acme", "roles": ["staff", "admin"]}\nprint(doc["company"] == "acme" and "staff" in doc["roles"])  # True`,
      warmUpNote: 'Use `and` to require BOTH company match and role permission.',
      starterCode: `def allowed_docs_for_user(all_docs, user_company, user_role):
    safe = []
    for d in all_docs:
        # Check d["company"] == user_company and user_role in d["roles"]:
        if False:
            safe.append(d)
    return safe`,
      hints: [
        'Replace `if False:` with `if d["company"] == user_company and user_role in d["roles"]:`.',
        'Keep `safe.append(d)` indented underneath the `if`.',
      ],
      solutionCode: `def allowed_docs_for_user(all_docs, user_company, user_role):
    safe = []
    for d in all_docs:
        if d["company"] == user_company and user_role in d["roles"]:
            safe.append(d)
    return safe`,
      testCode: `docs = [
    {"id": "1", "company": "acme", "roles": ["staff", "admin"]},
    {"id": "2", "company": "acme", "roles": ["admin"]},
    {"id": "3", "company": "rival", "roles": ["staff"]},
]
out = allowed_docs_for_user(docs, "acme", "staff")
assert [d["id"] for d in out] == ["1"], f"Leaked unauthorized docs: {out}"
print("CHECK_PASS|Stage 5 Complete! You built a permission-aware Company Knowledge Copilot.")`,
    },
    projectStep: {
      projectTitle: 'Project 5: Company Knowledge Copilot',
      fileName: 'copilot.py',
      summary: 'Always run `allowed_docs_for_user(...)` as Step 1 of every RAG endpoint.',
      codeSnippet: `pool = allowed_docs_for_user(DOCS, current_user.company, current_user.role)\n# Now run hybrid search strictly inside pool!`,
      runCommandWin: 'pytest -q',
      runCommandMac: 'pytest -q',
    },
  },

  // =========================================================================
  // STAGE 6: AI AGENTS THAT TAKE SAFE ACTIONS (Lessons 6.1 – 6.4)
  // =========================================================================
  {
    id: '6-1',
    stageNumber: 6,
    lessonNumber: '6.1',
    title: 'What an "AI Agent" Really Is: Giving AI Python Tools',
    PlainSubtitle: 'Demystify agents—it’s just an AI choosing which of your Python functions to call!',
    minutes: 18,
    xp: 140,
    concept: {
      headline: 'Chatbot Talks; Agent Calls Functions!',
      paragraphs: [
        'People make "AI Agents" sound like magic sci-fi. Under the hood, an agent is surprisingly simple: you give the AI a menu of your Python functions (`check_order`, `check_stock`), and when a user asks *"Is ORD-50 delivered and is item SKU-9 in stock?"*, the AI replies *"Please run `check_order(\'ORD-50\')`"*!',
        'Your Python code runs that function, hands the result back to the AI, and the AI writes the final helpful answer.',
      ],
      analogy: {
        fromKnown: 'Restaurant Waiter & Kitchen',
        explanation:
          'The AI is the waiter taking the customer’s request; your Python functions are the kitchen tools that actually check the fridge or ring up the bill.',
      },
      visualFlow: ['User Request', 'AI Picks Python Tool Name + Args', 'Python Runs Tool & Returns Result'],
      proTerm: {
        term: 'Tool Calling / Function Calling',
        plainMeaning: 'Letting the AI request to run specific approved Python functions from an allowlist.',
      },
    },
    pcSetup: {
      title: 'Start Project 6 (`project-6-ops-agent`)',
      summary: 'In Gemini and OpenAI SDKs, you literally pass normal Python functions inside `tools=[check_order, check_stock]`!',
      windows: {
        commands: [
          'mkdir C:\\ai-projects\\project-6-ops-agent',
          'cd C:\\ai-projects\\project-6-ops-agent',
          'python -m venv .venv && .venv\\Scripts\\activate',
        ],
        whatYouSee: 'Workspace ready for your tool-calling Operations Agent.',
        commonFix: 'Write a clear 1-line docstring `"""Look up shipping status by order_id."""` inside each tool function—the AI reads that docstring to know when to use it!',
      },
      mac: {
        commands: ['mkdir -p ~/ai-projects/project-6-ops-agent && cd ~/ai-projects/project-6-ops-agent'],
        whatYouSee: 'Project 6 folder ready.',
        commonFix: 'Clear function names + clear docstrings = accurate AI tool selection.',
      },
    },
    practice: {
      taskPrompt:
        'Write `run_safe_tool(tool_name, arg, tools_map)`: check if `tool_name` is inside `tools_map`. If not, return `{"ok": False, "error": "Tool not allowed"}`. Otherwise call `tools_map[tool_name](arg)` and return `{"ok": True, "data": result}`.',
      language: 'python',
      warmUpCode: `def greet(name):\n    return f"Hi {name}"\n\ntools = {"greet": greet}\nprint(tools["greet"]("Sara"))`,
      warmUpNote: 'Storing allowed functions in a dictionary `tools_map` guarantees the AI can NEVER call any function you didn’t approve!',
      starterCode: `def run_safe_tool(tool_name, arg, tools_map):
    if tool_name not in tools_map:
        return {"ok": False, "error": "Tool not allowed"}
    # Call tools_map[tool_name](arg) and return {"ok": True, "data": result}:
    return {"ok": False}`,
      hints: [
        'Write `result = tools_map[tool_name](arg)` then `return {"ok": True, "data": result}`.',
        'Keep both lines at 4 spaces of indentation.',
      ],
      solutionCode: `def run_safe_tool(tool_name, arg, tools_map):
    if tool_name not in tools_map:
        return {"ok": False, "error": "Tool not allowed"}
    result = tools_map[tool_name](arg)
    return {"ok": True, "data": result}`,
      testCode: `my_tools = {"check_stock": lambda sku: 14}
assert run_safe_tool("check_stock", "SKU-1", my_tools) == {"ok": True, "data": 14}
assert run_safe_tool("delete_server", "all", my_tools) == {"ok": False, "error": "Tool not allowed"}
print("CHECK_PASS|Safe allowlisted tool runner verified!")`,
    },
    projectStep: {
      projectTitle: 'Project 6: Operations Agent with Approval UI',
      fileName: 'tools.py',
      summary: 'Define clean, well-documented Python functions for your agent.',
      codeSnippet: `def check_order_status(order_id: str) -> dict:\n    """Look up current delivery status for an ORD- order ID."""\n    return ORDERS.get(order_id, {"status": "not_found"})`,
      runCommandWin: 'python agent.py',
      runCommandMac: 'python3 agent.py',
    },
  },
  {
    id: '6-2',
    stageNumber: 6,
    lessonNumber: '6.2',
    title: 'MCP (Model Context Protocol) Explained Simply',
    PlainSubtitle: 'How modern AI apps plug into Slack, GitHub, Postgres, and Google Drive cleanly.',
    minutes: 15,
    xp: 130,
    concept: {
      headline: 'MCP = The "USB-C Cable" for AI Tools',
      paragraphs: [
        'Before **MCP (Model Context Protocol)**, connecting your AI to Slack, GitHub, and Postgres meant writing custom glue code for each AI model.',
        'MCP is simply a standard JSON menu format: an **MCP Server** lists its `tools` (`[{"name": "search_tickets", "description": "..."}]`) so *any* AI app (Claude, Cursor, Antigravity, or your own Python agent!) can plug into it immediately—while filtering which tools a user’s role is allowed to see.',
      ],
      analogy: {
        fromKnown: 'WordPress Plugin API / USB-C Port',
        explanation:
          'Just like any USB-C monitor plugs into any laptop without soldering wires, any MCP tool server plugs into any AI client.',
      },
      visualFlow: ['MCP Tool Server', 'Filter Tools by User Role', 'Expose Standard JSON Menu'],
    },
    pcSetup: {
      title: 'Build a 15-Line Python MCP Server (`mcp` SDK)',
      summary: 'Python’s official `mcp` package (`FastMCP`) works almost identically to `FastAPI`—you just write `@mcp.tool()` above a function!',
      windows: {
        commands: ['pip install mcp'],
        whatYouSee: 'Official `mcp` library installed in your `.venv`.',
        commonFix: 'Only expose read/safe tools to general users; restrict admin tools by role!',
      },
      mac: {
        commands: ['pip install mcp'],
        whatYouSee: '`mcp` installed cleanly.',
        commonFix: 'Keep each MCP tool focused on one clear job.',
      },
    },
    practice: {
      taskPrompt:
        'Filter `mcp_catalog` inside `visible_mcp_tools(mcp_catalog, user_role)` so it returns a list of tool `"name"` strings where `user_role in tool["allowed_roles"]`.',
      language: 'python',
      warmUpCode: `t = {"name": "read_logs", "allowed_roles": ["support", "admin"]}\nprint("support" in t["allowed_roles"])  # True`,
      warmUpNote: 'Hiding admin tools from basic users prevents the AI from even attempting unauthorized actions.',
      starterCode: `def visible_mcp_tools(mcp_catalog, user_role):
    names = []
    for tool in mcp_catalog:
        if user_role in tool["allowed_roles"]:
            # Append tool["name"] to names:
            pass
    return names`,
      hints: [
        'Replace `pass` with `names.append(tool["name"])`.',
        'Keep `names.append(...)` indented inside the `if` block.',
      ],
      solutionCode: `def visible_mcp_tools(mcp_catalog, user_role):
    names = []
    for tool in mcp_catalog:
        if user_role in tool["allowed_roles"]:
            names.append(tool["name"])
    return names`,
      testCode: `cat = [
    {"name": "lookup_order", "allowed_roles": ["support", "manager"]},
    {"name": "issue_refund", "allowed_roles": ["manager"]},
]
assert visible_mcp_tools(cat, "support") == ["lookup_order"]
assert visible_mcp_tools(cat, "manager") == ["lookup_order", "issue_refund"]
print("CHECK_PASS|Role-scoped MCP tool discovery verified!")`,
    },
    projectStep: {
      projectTitle: 'Project 6: Operations Agent with Approval UI',
      fileName: 'mcp_server.py',
      summary: 'Create your own MCP server in 8 lines with `FastMCP`!',
      codeSnippet: `from mcp.server.fastmcp import FastMCP\nmcp = FastMCP("OpsTools")\n\n@mcp.tool()\ndef lookup_order(order_id: str) -> str:\n    """Get live shipping status for an order."""\n    return f"Order {order_id}: In Transit"`,
      runCommandWin: 'python mcp_server.py',
      runCommandMac: 'python3 mcp_server.py',
    },
  },
  {
    id: '6-3',
    stageNumber: 6,
    lessonNumber: '6.3',
    title: 'Safety Brakes: Stop Infinite Loops & Double Charges',
    PlainSubtitle: 'Two tiny checks that save companies from $5,000 overnight agent accidents.',
    minutes: 16,
    xp: 140,
    concept: {
      headline: 'Never Let an Agent Loop Forever or Run Twice',
      paragraphs: [
        'When an AI can call tools in a loop, two real-world bugs happen if you aren’t careful: 1) **Infinite Loop:** A tool fails and the AI retries 200 times while you sleep—burning $50+ of API credits. Fix: enforce `if step > 5: stop!`',
        '2) **Double Action:** A network hiccup makes the agent retry `refund("ORD-9")` twice. Fix: save `"ORD-9"` in a `completed_actions` set (`idempotency`) so the second call says *"Already refunded!"* instead of sending money twice.',
      ],
      analogy: {
        fromKnown: '"Do Not Refresh Checkout Page" Protection',
        explanation:
          'Just like Stripe makes sure double-clicking "Pay Now" only charges your card once, your agent checks `if action_key in done_keys:` before acting.',
      },
      visualFlow: ['Check step <= 5', 'Check key not in done_keys', 'Run Once & Record Key'],
      proTerm: {
        term: 'Idempotency Key',
        plainMeaning: 'A unique receipt ID (`refund:ORD-9`) ensuring an action only happens once even if retried.',
      },
    },
    pcSetup: {
      title: 'Inspect Agent Step Logs in Terminal',
      summary: 'Print `[Step 1/5] Calling lookup_order...` in your terminal so you can always watch what your agent is doing.',
      windows: {
        commands: ['python agent.py --test-loop-guard'],
        whatYouSee: '`[Step 6/5] Halted safely: max_steps reached.`',
        commonFix: 'Keep `max_steps` between `4` and `8` for almost all business agents.',
      },
      mac: {
        commands: ['python3 agent.py --test-loop-guard'],
        whatYouSee: 'Loop halted cleanly at step limit.',
        commonFix: 'Log every tool call with its arguments and duration.',
      },
    },
    practice: {
      taskPrompt:
        'Complete `safe_refund_step(step, order_id, already_refunded)`: 1) if `step > 5`, return `"stopped_max_steps"`. 2) If `order_id in already_refunded`, return `"already_done"`. 3) Otherwise add `order_id` to `already_refunded` (`already_refunded.add(order_id)`) and return `"refund_sent"`.',
      language: 'python',
      warmUpCode: `done = set()\ndone.add("ORD-1")\nprint("ORD-1" in done)  # True`,
      warmUpNote: 'A Python `set()` is like a list of unique receipts—fast for checking `x in done`!',
      starterCode: `def safe_refund_step(step, order_id, already_refunded):
    if step > 5:
        return "stopped_max_steps"
    if order_id in already_refunded:
        return "already_done"
    # Record order_id in already_refunded and return "refund_sent":
    return ""`,
      hints: [
        'Write `already_refunded.add(order_id)` and on the next line `return "refund_sent"`.',
        'Make sure both lines use 4 spaces of indentation.',
      ],
      solutionCode: `def safe_refund_step(step, order_id, already_refunded):
    if step > 5:
        return "stopped_max_steps"
    if order_id in already_refunded:
        return "already_done"
    already_refunded.add(order_id)
    return "refund_sent"`,
      testCode: `seen = set()
assert safe_refund_step(1, "ORD-7", seen) == "refund_sent"
assert safe_refund_step(2, "ORD-7", seen) == "already_done"
assert safe_refund_step(6, "ORD-8", seen) == "stopped_max_steps"
print("CHECK_PASS|Loop brake and duplicate-refund protection verified!")`,
    },
    projectStep: {
      projectTitle: 'Project 6: Operations Agent with Approval UI',
      fileName: 'agent.py',
      summary: 'Wrap write actions with `safe_refund_step` inside your agent loop.',
      codeSnippet: `status = safe_refund_step(current_step, order_id, SEEN_REFUNDS)`,
      runCommandWin: 'python agent.py',
      runCommandMac: 'python3 agent.py',
    },
  },
  {
    id: '6-4',
    stageNumber: 6,
    lessonNumber: '6.4',
    title: 'Human "Approve / Reject" Buttons + Project 6 Finish',
    PlainSubtitle: 'Let AI handle $20 refunds automatically, while pausing >$50 refunds for a manager click.',
    minutes: 20,
    xp: 150,
    concept: {
      headline: 'Human-in-the-Loop (HITL) = How Real Companies Trust Agents',
      paragraphs: [
        'No smart company lets an AI send $5,000 wire transfers or delete accounts unattended. Instead, companies love **Human-in-the-Loop**: the AI investigates the ticket, prepares the action, and if `amount > 50`, saves it as `"pending_approval"` in SQL!',
        'A manager sees a clean card in your HTML/CSS dashboard (*"AI recommends $120 refund for damaged item — [Approve] [Reject]"*), clicks **Approve**, and FastAPI finishes the action in 1 click!',
      ],
      analogy: {
        fromKnown: 'WordPress Comment Moderation Queue',
        explanation:
          'Trusted comments publish automatically; risky ones wait in "Pending" until you click Approve. Exact same UX!',
      },
      visualFlow: ['Agent Proposes Refund', '<= $50 Auto | > $50 Pending Queue', 'Manager Clicks Approve'],
      proTerm: {
        term: 'HITL (Human-in-the-Loop)',
        plainMeaning: 'Pausing high-stakes AI actions in a "Pending Approval" queue until a human clicks Approve.',
      },
    },
    pcSetup: {
      title: 'Run Project 6 (`project-6-ops-agent`) Locally',
      summary: 'Download `project-6-ops-agent.zip` in Tab `3. My 7 Projects`, run `pytest -q`, and start the FastAPI approval server!',
      windows: {
        commands: [
          'cd C:\\ai-projects\\project-6-ops-agent',
          '.venv\\Scripts\\activate',
          'pip install -r requirements.txt',
          'pytest -q',
        ],
        whatYouSee: '`4 passed` — low-risk actions auto-execute while high-risk actions pause cleanly for approval!',
        commonFix: 'Upload Project 6 to GitHub—HITL approval workflows are a massive interview standout!',
      },
      mac: {
        commands: ['cd ~/ai-projects/project-6-ops-agent && source .venv/bin/activate && pytest -q'],
        whatYouSee: '`4 passed`.',
        commonFix: 'Try testing `/docs` in your browser to approve a pending refund!',
      },
    },
    practice: {
      taskPrompt:
        'Write `decide_refund_flow(order_id, amount)`: if `amount <= 50`, return `{"status": "auto_approved", "order_id": order_id}`. Otherwise return `{"status": "pending_manager", "order_id": order_id}`.',
      language: 'python',
      warmUpCode: `amt = 120\nprint("pending_manager" if amt > 50 else "auto_approved")`,
      warmUpNote: 'Clear dollar thresholds make business stakeholders immediately comfortable adopting your AI tools.',
      starterCode: `def decide_refund_flow(order_id, amount):
    if amount <= 50:
        return {"status": "auto_approved", "order_id": order_id}
    # Pause amounts over $50 as "pending_manager":
    return {"status": "", "order_id": order_id}`,
      hints: [
        'Set `"status": "pending_manager"` in the final return dictionary.',
        'Keep `"order_id": order_id` unchanged.',
      ],
      solutionCode: `def decide_refund_flow(order_id, amount):
    if amount <= 50:
        return {"status": "auto_approved", "order_id": order_id}
    return {"status": "pending_manager", "order_id": order_id}`,
      testCode: `assert decide_refund_flow("ORD-1", 35) == {"status": "auto_approved", "order_id": "ORD-1"}
assert decide_refund_flow("ORD-2", 140) == {"status": "pending_manager", "order_id": "ORD-2"}
print("CHECK_PASS|Stage 6 Complete! You can now build safe, tool-using Operations Agents with Human Approval.")`,
    },
    projectStep: {
      projectTitle: 'Project 6: Operations Agent with Approval UI',
      fileName: 'app/main.py',
      summary: 'Add `/approve/{order_id}` in FastAPI so your dashboard button completes the paused refund.',
      codeSnippet: `@app.post("/approve/{order_id}")\ndef approve_pending(order_id: str):\n    PENDING.pop(order_id, None)\n    return {"status": "approved_and_sent", "order_id": order_id}`,
      runCommandWin: 'uvicorn app.main:app --reload',
      runCommandMac: 'uvicorn app.main:app --reload',
    },
  },

  // =========================================================================
  // STAGE 7: GOING LIVE, MID-LEVEL QUALITY & GETTING HIRED (Lessons 7.1 – 7.4)
  // =========================================================================
  {
    id: '7-1',
    stageNumber: 7,
    lessonNumber: '7.1',
    title: 'Word-by-Word Streaming & Hiding Private Customer Emails',
    PlainSubtitle: 'Make your app feel instant like ChatGPT and protect private customer PII.',
    minutes: 18,
    xp: 150,
    concept: {
      headline: 'Fast UX + Privacy Compliance',
      paragraphs: [
        '1) **Streaming (`StreamingResponse`):** Waiting 8 seconds staring at a blank screen feels broken. Sending words as they arrive (`data: word\\n\\n`) makes the first word appear in ~0.4 seconds!',
        '2) **Privacy Scrubbing (PII):** Before sending customer support messages to external AI APIs, replace private email addresses or card numbers with `[EMAIL_HIDDEN]` so sensitive customer data stays private.',
      ],
      analogy: {
        fromKnown: 'YouTube Streaming vs Downloading a Whole Movie',
        explanation:
          'YouTube plays the first second immediately while loading the rest—streaming text works the exact same way.',
      },
      visualFlow: ['Hide Private Emails', 'Stream Words Live (SSE)', 'Instant User Experience'],
    },
    pcSetup: {
      title: 'Start Final Capstone (`project-7-live-capstone`)',
      summary: 'FastAPI’s `StreamingResponse(..., media_type="text/event-stream")` streams chunks live to any browser!',
      windows: {
        commands: [
          'mkdir C:\\ai-projects\\project-7-live-capstone',
          'cd C:\\ai-projects\\project-7-live-capstone',
          'python -m venv .venv && .venv\\Scripts\\activate',
        ],
        whatYouSee: 'Capstone folder initialized.',
        commonFix: 'End each streamed message chunk with two newlines `\\n\\n` so Chrome displays it right away.',
      },
      mac: {
        commands: ['mkdir -p ~/ai-projects/project-7-live-capstone && cd ~/ai-projects/project-7-live-capstone'],
        whatYouSee: 'Capstone folder initialized.',
        commonFix: 'Test streaming in terminal with `curl -N http://localhost:8000/stream`.',
      },
    },
    practice: {
      taskPrompt:
        'Complete `scrub_and_block(text)`: 1) if `"ignore previous instructions"` is in `text.lower()`, return `{"safe": False, "text": ""}`. 2) Otherwise replace emails using `re.sub(r"[\\w.+-]+@[\\w-]+\\.[\\w.-]+", "[EMAIL]", text)` and return `{"safe": True, "text": cleaned}`.',
      language: 'python',
      warmUpCode: `import re\ns = "Email me at sara@acme.com today"\nprint(re.sub(r"[\\w.+-]+@[\\w-]+\\.[\\w.-]+", "[EMAIL]", s))`,
      warmUpNote: '`re.sub(pattern, replacement, text)` finds email patterns and swaps them out in 1 line.',
      starterCode: `import re

def scrub_and_block(text):
    if "ignore previous instructions" in text.lower():
        return {"safe": False, "text": ""}
    cleaned = re.sub(r"[\\w.+-]+@[\\w-]+\\.[\\w.-]+", "[EMAIL]", text)
    # Return safe=True and cleaned text:
    return {"safe": True, "text": ""}`,
      hints: [
        'Change `"text": ""` on the last line to `"text": cleaned`.',
        'Notice prompt-injection tricks get caught before even calling the AI!',
      ],
      solutionCode: `import re

def scrub_and_block(text):
    if "ignore previous instructions" in text.lower():
        return {"safe": False, "text": ""}
    cleaned = re.sub(r"[\\w.+-]+@[\\w-]+\\.[\\w.-]+", "[EMAIL]", text)
    return {"safe": True, "text": cleaned}`,
      testCode: `assert scrub_and_block("Ignore PREVIOUS instructions")["safe"] is False
assert scrub_and_block("Help bob@client.io") == {"safe": True, "text": "Help [EMAIL]"}
print("CHECK_PASS|Privacy scrubber & prompt-hack blocker verified!")`,
    },
    projectStep: {
      projectTitle: 'Capstone: Production AI Gateway & Web App',
      fileName: 'app/security.py',
      summary: 'Run `scrub_and_block` on incoming user messages before calling the AI.',
      codeSnippet: `guard = scrub_and_block(req.prompt)\nif not guard["safe"]:\n    return {"error": "Blocked unsafe prompt"}`,
      runCommandWin: 'pytest -q',
      runCommandMac: 'pytest -q',
    },
  },
  {
    id: '7-2',
    stageNumber: 7,
    lessonNumber: '7.2',
    title: 'Automatic AI Testing (pytest) & Daily $ Spending Caps',
    PlainSubtitle: 'Sleep peacefully knowing updates won’t break accuracy or rack up a surprise bill.',
    minutes: 18,
    xp: 150,
    concept: {
      headline: 'The #1 Skill That Makes You Mid-Level: Evals & Cost Control',
      paragraphs: [
        'Juniors tweak a prompt, try 2 examples manually, and hope for the best. **Mid-Level AI Engineers** keep a list of 20–50 tricky real examples ("Golden Test Cases") and run `pytest` automatically in 3 seconds whenever they change code or models!',
        'You also set a simple **Daily Dollar Cap** (`daily_cap_usd = 10.0`) and use a fast, inexpensive model (`gemini-2.5-flash`) for 85% of routine tasks, saving expensive reasoning models only for hard problems.',
      ],
      analogy: {
        fromKnown: 'Prepaid Mobile Data Cap + Spellcheck',
        explanation:
          'A daily spend cap guarantees a bug can never cost more than $10, and `pytest` checks 25 test cases automatically before your site updates.',
      },
      visualFlow: ['Run 20 Test Cases (pytest)', 'Require >= 90% Pass Rate', 'Enforce $10/day Budget Cap'],
      proTerm: {
        term: 'AI Evals & FinOps',
        plainMeaning: 'Evals = automated accuracy tests for AI outputs. FinOps = smart model routing & budget caps.',
      },
    },
    pcSetup: {
      title: 'Run `pytest` in 1 Command on Your PC',
      summary: 'Any file named `test_*.py` with functions named `def test_something():` runs automatically when you type `pytest`!',
      windows: {
        commands: ['pip install pytest', 'pytest -q'],
        whatYouSee: '`.... 4 passed in 0.18s` in green!',
        commonFix: 'Add `.github/workflows/ci.yml` so GitHub runs `pytest` automatically on every push!',
      },
      mac: {
        commands: ['pip install pytest && pytest -q'],
        whatYouSee: '`4 passed` in green.',
        commonFix: 'If `pytest` isn’t found, run `python3 -m pytest -q`.',
      },
    },
    practice: {
      taskPrompt:
        'Complete `choose_model_within_budget(spent_today, daily_limit, is_hard_task)`: if `spent_today >= daily_limit`, return `"budget_paused"`. Otherwise return `"pro-reasoning"` when `is_hard_task` is `True`, else `"fast-flash"`.',
      language: 'python',
      warmUpCode: `hard = False\nmodel = "pro-reasoning" if hard else "fast-flash"\nprint(model)  # fast-flash`,
      warmUpNote: '`fast-flash` models cost ~10–20x less and respond 3x faster for everyday extraction and support!',
      starterCode: `def choose_model_within_budget(spent_today, daily_limit, is_hard_task):
    if spent_today >= daily_limit:
        return "budget_paused"
    # Return "pro-reasoning" if is_hard_task else "fast-flash":
    return ""`,
      hints: [
        'Write `return "pro-reasoning" if is_hard_task else "fast-flash"`.',
        'Or write a normal `if is_hard_task: return "pro-reasoning"` followed by `return "fast-flash"`.',
      ],
      solutionCode: `def choose_model_within_budget(spent_today, daily_limit, is_hard_task):
    if spent_today >= daily_limit:
        return "budget_paused"
    if is_hard_task:
        return "pro-reasoning"
    return "fast-flash"`,
      testCode: `assert choose_model_within_budget(12.0, 10.0, False) == "budget_paused"
assert choose_model_within_budget(3.0, 10.0, False) == "fast-flash"
assert choose_model_within_budget(3.0, 10.0, True) == "pro-reasoning"
print("CHECK_PASS|Cost budget guard & smart model tier routing verified!")`,
    },
    projectStep: {
      projectTitle: 'Capstone: Production AI Gateway & Web App',
      fileName: 'tests/test_app.py',
      summary: 'Run `python validator.py` in your Capstone folder to run `pytest` and generate `evidence.json`.',
      codeSnippet: `def test_budget_guard():\n    assert choose_model_within_budget(15.0, 10.0, False) == "budget_paused"`,
      runCommandWin: 'python validator.py',
      runCommandMac: 'python3 validator.py',
    },
  },
  {
    id: '7-3',
    stageNumber: 7,
    lessonNumber: '7.3',
    title: 'Put Your AI App Live on the Internet (Deploy Guide)',
    PlainSubtitle: 'Take your app from localhost:8000 to a real https:// link anyone can use.',
    minutes: 20,
    xp: 160,
    concept: {
      headline: 'How Deployment Works Without Server Headaches',
      paragraphs: [
        'How do you share your app with a hiring manager or paying client so they don’t have to install Python? You connect your **GitHub repo** to a cloud host like **Railway**, **Render**, or **Fly.io** (and **Vercel** if you have a separate frontend).',
        'You include a tiny 6-line `Dockerfile` (or `requirements.txt` + start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`), paste your `GEMINI_API_KEY` into the cloud dashboard’s **Environment Variables** box, and within 2 minutes your app has a live `https://...` URL!',
      ],
      analogy: {
        fromKnown: 'Moving Local WordPress to Live Hosting',
        explanation:
          'Even easier than FTPing WordPress files: every time you `git push` to GitHub, Railway/Render updates your live site automatically!',
      },
      visualFlow: ['Push Code + Dockerfile to GitHub', 'Connect Repo on Railway / Render', 'Add .env Keys -> Live https:// URL!'],
    },
    pcSetup: {
      title: '3-Minute Live Deployment Checklist (Render / Railway)',
      summary: 'Follow these steps with `project-7-live-capstone` pushed to your GitHub:',
      checklist: [
        'Push your project (with `requirements.txt` and `Dockerfile`, WITHOUT `.env`) to a GitHub repo.',
        'Sign in free with GitHub on render.com or railway.app -> click "New Web Service" -> pick your repo.',
        'Open the "Environment Variables" tab in the dashboard and add `GEMINI_API_KEY` = your key.',
        'Click Deploy — open your new `https://your-app.onrender.com/docs` link from your phone or browser!',
      ],
      windows: {
        commands: [
          'git add .',
          'git commit -m "chore: add Dockerfile and production start command"',
          'git push origin main',
        ],
        whatYouSee: 'Cloud build finishes in ~90 seconds and gives you a public `https://` URL.',
        commonFix: 'Always bind `--host 0.0.0.0` (not `127.0.0.1`) in cloud start commands so external traffic can reach your container.',
      },
      mac: {
        commands: ['git add . && git commit -m "chore: ready for cloud deploy" && git push origin main'],
        whatYouSee: 'Live `https://` deployment online.',
        commonFix: 'Check the Deploy Logs tab on Render/Railway if a package version is missing from `requirements.txt`.',
      },
    },
    practice: {
      taskPrompt:
        'Build a production `/health` readiness check `build_health_status(db_ok, api_key_present, port)`: return `{"healthy": db_ok and api_key_present, "host": "0.0.0.0", "port": int(port)}`.',
      language: 'python',
      warmUpCode: `print(int("8080"))  # Cloud hosts pass PORT as text like "8080"`,
      warmUpNote: 'Cloud platforms ping your `/health` URL every 30 seconds to verify your app is alive!',
      starterCode: `def build_health_status(db_ok, api_key_present, port):
    # Return healthy (both True), host "0.0.0.0", and int(port):
    return {"healthy": False, "host": "127.0.0.1", "port": 0}`,
      hints: [
        'Set `"healthy": bool(db_ok and api_key_present)`.',
        'Set `"host": "0.0.0.0"` and `"port": int(port)`.',
      ],
      solutionCode: `def build_health_status(db_ok, api_key_present, port):
    return {
        "healthy": bool(db_ok and api_key_present),
        "host": "0.0.0.0",
        "port": int(port),
    }`,
      testCode: `assert build_health_status(True, True, "8080") == {"healthy": True, "host": "0.0.0.0", "port": 8080}
assert build_health_status(True, False, "8080")["healthy"] is False
print("CHECK_PASS|Cloud health check & container port binding verified!")`,
    },
    projectStep: {
      projectTitle: 'Capstone: Production AI Gateway & Web App',
      fileName: 'Dockerfile',
      summary: 'A clean 6-line `Dockerfile` that runs anywhere (Railway, Render, Fly.io, AWS, Google Cloud).',
      codeSnippet: `FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nCMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`,
      runCommandWin: 'python validator.py',
      runCommandMac: 'python3 validator.py',
    },
  },
  {
    id: '7-4',
    stageNumber: 7,
    lessonNumber: '7.4',
    title: 'Getting Hired & Winning Freelance Clients (Mid-Level Playbook)',
    PlainSubtitle: 'Turn your projects into interviews, freelance contracts, and confident architecture answers.',
    minutes: 20,
    xp: 200,
    concept: {
      headline: 'How Hiring Managers & Clients Actually Judge You',
      paragraphs: [
        '**For Full-Time Mid-Level AI Engineer Roles:** Don’t list "Watched an AI course" on your CV. Showcase your **4 GitHub Systems** (Structured Extractor, Permission-Aware RAG Copilot, HITL Operations Agent, Production AI Gateway) with live links, architecture diagrams, `pytest` badges, and numbers (*"0 cross-tenant leaks, <800ms streaming, $10/day budget guard"*).',
        '**For Freelance Clients:** Clients don’t buy "RAG" or "FastAPI"—they buy **hours saved and errors prevented** (*"Automate 500 vendor invoices/week into SQL with a human review queue for blurry scans"*). Scope a 2-week paid discovery/MVP first, calculate monthly API cost (usually <$20/mo!), and charge for business value.',
      ],
      analogy: {
        fromKnown: 'Showing Live Websites vs Talking About HTML Tags',
        explanation:
          'When pitching a WordPress client, showing 3 fast live business sites wins the deal immediately. Showing 3 live, tested AI apps with security & cost guards does the exact same thing.',
      },
      visualFlow: ['4 Tested GitHub Repos + Live URLs', 'Clear README Metrics & Diagrams', 'Apply to Applied AI / Backend / FDE Roles'],
    },
    pcSetup: {
      title: 'Generate Your Portfolio Proof in Tab `3. My 7 Projects`',
      summary: 'Run `python validator.py` inside your Capstone folder, paste `evidence.json` in `3. My 7 Projects`, and click **Copy Portfolio Markdown** for your GitHub Profile README!',
      windows: {
        commands: [
          'cd C:\\ai-projects\\project-7-live-capstone',
          '.venv\\Scripts\\activate',
          'python validator.py',
        ],
        whatYouSee: '`SUCCESS: Wrote evidence.json` — ready to verify your capstone!',
        commonFix: 'Pin your top 4 AI repositories at the very top of your GitHub profile page.',
      },
      mac: {
        commands: ['cd ~/ai-projects/project-7-live-capstone && python3 validator.py'],
        whatYouSee: '`evidence.json` generated cleanly.',
        commonFix: 'Add a 30-second GIF or screenshot at the top of each repo’s README!',
      },
    },
    practice: {
      taskPrompt:
        'Final ROI calculator for client & interview discussions! Complete `estimate_monthly_roi(hours_saved_per_week, hourly_wage, monthly_api_cost)`: compute `monthly_savings = (hours_saved_per_week * 4) * hourly_wage` and return `{"net_monthly_gain": round(monthly_savings - monthly_api_cost, 2), "worth_building": monthly_savings > monthly_api_cost * 3}`.',
      language: 'python',
      warmUpCode: `saved = (15 * 4) * 25  # 60 hrs/mo * $25/hr = $1500/mo\nprint("Monthly value:", saved - 18)  # $1482 net gain!`,
      warmUpNote: 'Speaking in ROI ($ saved vs $18 API cost) instantly sets you apart in both interviews and freelance calls!',
      starterCode: `def estimate_monthly_roi(hours_saved_per_week, hourly_wage, monthly_api_cost):
    monthly_savings = (hours_saved_per_week * 4) * hourly_wage
    net_gain = round(monthly_savings - monthly_api_cost, 2)
    # Return net_monthly_gain and worth_building (monthly_savings > monthly_api_cost * 3):
    return {"net_monthly_gain": net_gain, "worth_building": False}`,
      hints: [
        'Change `"worth_building": False` to `"worth_building": monthly_savings > monthly_api_cost * 3`.',
        'Keep `net_monthly_gain` set to `net_gain`.',
      ],
      solutionCode: `def estimate_monthly_roi(hours_saved_per_week, hourly_wage, monthly_api_cost):
    monthly_savings = (hours_saved_per_week * 4) * hourly_wage
    net_gain = round(monthly_savings - monthly_api_cost, 2)
    return {
        "net_monthly_gain": net_gain,
        "worth_building": monthly_savings > monthly_api_cost * 3,
    }`,
      testCode: `res = estimate_monthly_roi(12, 30, 25.0)
assert res == {"net_monthly_gain": 1415.0, "worth_building": True}, f"Got {res}"
assert estimate_monthly_roi(1, 10, 50.0)["worth_building"] is False
print("CHECK_PASS|Congratulations! All 7 Stages complete—now ship your Capstone in Tab 3!")`,
    },
    projectStep: {
      projectTitle: 'Capstone: Production AI Gateway & Web App',
      fileName: 'README.md',
      summary: 'Put these 4 bullet points at the top of every portfolio repo README.',
      codeSnippet: `# Production AI Support & Ops Gateway\n- **Problem Solved:** Automates invoice & order triage while blocking cross-tenant leaks.\n- **Architecture:** FastAPI + SQLite/Postgres + Hybrid RAG + HITL Approval Queue.\n- **Safety & Quality:** Automated pytest suite, PII email scrubbing, $10/day spend cap.\n- **Live Demo:** https://your-live-url.onrender.com/docs`,
      runCommandWin: 'python validator.py',
      runCommandMac: 'python3 validator.py',
    },
  },
];
