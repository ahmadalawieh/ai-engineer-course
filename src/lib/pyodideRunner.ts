export interface PyodideRunResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  passedTests?: boolean;
}

interface PyodideInstance {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (packages: string | string[]) => Promise<void>;
  setStdout: (options: { batched: (text: string) => void }) => void;
  setStderr: (options: { batched: (text: string) => void }) => void;
}

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInstance>;
  }
}

const PYODIDE_INDEX = '/pyodide/v0.26.4/';
let pyodidePromise: Promise<PyodideInstance> | null = null;
const loadedPackages = new Set<string>();

function loadScriptOnce(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (window.loadPyodide) {
        resolve();
      } else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load Pyodide script')));
      }
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Pyodide WebAssembly runtime'));
    document.head.appendChild(script);
  });
}

export async function getPyodide(
  packages: string[] = ['numpy'],
  onStatus?: (msg: string) => void
): Promise<PyodideInstance> {
  if (!pyodidePromise) {
    onStatus?.('Loading local Python 3.12 WebAssembly runtime (cached in browser)...');
    pyodidePromise = (async () => {
      await loadScriptOnce(`${PYODIDE_INDEX}pyodide.js`);
      if (!window.loadPyodide) {
        throw new Error('Pyodide failed to initialize on window');
      }
      onStatus?.('Initializing Python interpreter...');
      return window.loadPyodide({ indexURL: PYODIDE_INDEX });
    })();
  }

  let py: PyodideInstance;
  try {
    py = await pyodidePromise;
  } catch (err) {
    pyodidePromise = null;
    throw err;
  }

  const missing = packages.filter((pkg) => !loadedPackages.has(pkg));
  if (missing.length > 0) {
    onStatus?.(`Loading packages (${missing.join(', ')})...`);
    await py.loadPackage(missing);
    missing.forEach((pkg) => loadedPackages.add(pkg));
  }

  return py;
}

export async function runPythonCode(
  userCode: string,
  testCode?: string,
  packages: string[] = ['numpy'],
  onStatus?: (msg: string) => void
): Promise<PyodideRunResult> {
  try {
    const py = await getPyodide(packages, onStatus);
    const outLines: string[] = [];
    const errLines: string[] = [];

    py.setStdout({ batched: (text) => outLines.push(text) });
    py.setStderr({ batched: (text) => errLines.push(text) });

    onStatus?.('Running code...');
    await py.runPythonAsync(userCode);

    if (testCode) {
      await py.runPythonAsync(testCode);
      return {
        ok: true,
        stdout: outLines.join('\n'),
        stderr: errLines.join('\n'),
        passedTests: true,
      };
    }

    return {
      ok: true,
      stdout: outLines.join('\n'),
      stderr: errLines.join('\n'),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      stdout: '',
      stderr: message,
      passedTests: testCode ? false : undefined,
    };
  }
}
