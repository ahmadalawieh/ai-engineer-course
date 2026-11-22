import io
import json
import re
import sqlite3
import sys
import traceback
from contextlib import redirect_stdout, redirect_stderr

SEEDS = [42, 7, 123]

def build_sql_script(user_sql: str, setup_code: str, test_code: str) -> str:
    encoded_sql = json.dumps(user_sql)
    return f"""import sqlite3
conn = sqlite3.connect(":memory:")
{setup_code or ""}
user_sql = {encoded_sql}
cur = conn.cursor()
cur.execute(user_sql)
rows = cur.fetchall()
{test_code}
"""

def exec_snippet(code: str):
    stdout_buf = io.StringIO()
    stderr_buf = io.StringIO()
    ns = {"__name__": "__main__"}
    with redirect_stdout(stdout_buf), redirect_stderr(stderr_buf):
        exec(compile(code, "<audit_lab>", "exec"), ns, ns)
    return stdout_buf.getvalue(), stderr_buf.getvalue()

def with_seed(code: str, seed: int) -> str:
    return re.sub(r"default_rng\s*\(\s*\d+\s*\)", f"default_rng({seed})", code)

def main():
    raw = sys.stdin.read()
    labs = json.loads(raw)
    results = []

    for lab in labs:
        lab_id = lab["labId"]
        lang = lab.get("language") or "python"
        setup_code = lab.get("setupCode") or ""
        starter = lab["starterCode"]
        solution = lab["solutionCode"]
        tests = lab["testCode"]

        sol_ok = True
        sol_errors = []
        seeds_tested = [None]
        if lang != "sql" and re.search(r"default_rng\s*\(\s*\d+\s*\)", solution):
            seeds_tested = SEEDS

        for s in seeds_tested:
            sol_src = solution if s is None else with_seed(solution, s)
            full_sol = (
                build_sql_script(sol_src, setup_code, tests)
                if lang == "sql"
                else f"{sol_src}\n\n{tests}"
            )
            try:
                exec_snippet(full_sol)
            except Exception:
                sol_ok = False
                sol_errors.append(f"seed={s}: {traceback.format_exc(limit=4)}")

        starter_failed = False
        starter_full = (
            build_sql_script(starter, setup_code, tests)
            if lang == "sql"
            else f"{starter}\n\n{tests}"
        )
        try:
            exec_snippet(starter_full)
            starter_failed = False
        except Exception:
            starter_failed = True

        results.append({
            "labId": lab_id,
            "source": lab.get("source", ""),
            "language": lang,
            "seedsTested": len(seeds_tested),
            "solutionPassed": sol_ok,
            "starterFailedAsExpected": starter_failed,
            "errors": sol_errors,
        })

    print(json.dumps({"results": results}))

if __name__ == "__main__":
    main()
