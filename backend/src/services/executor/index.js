import fs from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as docker from './drivers/docker.js';
import * as macSandbox from './drivers/macSandbox.js';
import { LIMITS } from './limits.js';
import { killProcessGroup, processMemoryMb } from './runProcess.js';

let driverPromise;

// EXECUTION_DRIVER=docker|local forces a driver. Without it, Docker is preferred and the
// macOS sandbox is only used outside production.
async function pickDriver() {
  const wanted = process.env.EXECUTION_DRIVER;
  const production = process.env.NODE_ENV === 'production';

  if (wanted !== 'local' && (await docker.isAvailable())) return { name: 'docker', ...docker };
  if (wanted !== 'docker' && !production && macSandbox.isAvailable()) return { name: 'local', ...macSandbox };
  return null;
}

function getDriver() {
  driverPromise ??= pickDriver().then((d) => {
    console.log(`Code execution driver: ${d ? d.name : 'NONE (execution disabled)'}`);
    return d;
  });
  return driverPromise;
}

export class ExecutorError extends Error {
  constructor(message, status = 503) {
    super(message);
    this.status = status;
  }
}

// Limits how many programs run at once so one user cannot starve the host.
let active = 0;
const waiting = [];

function acquire() {
  if (active < LIMITS.maxConcurrent) {
    active += 1;
    return Promise.resolve();
  }
  if (waiting.length >= LIMITS.maxQueued) {
    return Promise.reject(new ExecutorError('The code runner is busy. Please try again in a moment.'));
  }
  return new Promise((resolve) => waiting.push(resolve));
}

function release() {
  const next = waiting.shift();
  if (next) next();
  else active -= 1;
}

export function classifyRun(run) {
  if (run.timedOut) return 'Time Limit Exceeded';
  if (run.outputExceeded) return 'Output Limit Exceeded';
  if (run.memoryExceeded) return 'Memory Limit Exceeded';
  if (run.exitCode !== 0) return 'Runtime Error';
  return 'Success';
}

// Hide the server's temp directory from compiler diagnostics.
function cleanCompileOutput(raw, workDir) {
  return raw.split(`${realpathSync(workDir)}/`).join('').split(`${workDir}/`).join('').trim();
}

/**
 * Compiles `code` and runs it once for every entry of `inputs` (stdin).
 * Returns { compile: { ok, output }, runs: [...] }; `runs` is empty if compilation fails.
 */
export async function executeProgram({ code, inputs }) {
  const driver = await getDriver();
  if (!driver) {
    throw new ExecutorError(
      'Code execution is not configured on this server. Build the Docker runner image (see backend/runner/Dockerfile).',
    );
  }

  await acquire();
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'virvese-'));
  try {
    await fs.chmod(workDir, 0o777);
    await fs.writeFile(path.join(workDir, 'main.c'), code);

    const compiled = await driver.compile(workDir);
    if (compiled.spawnError) throw new ExecutorError('Could not start the compiler.');
    const output = cleanCompileOutput(compiled.stdout + compiled.stderr, workDir);
    const ok = compiled.exitCode === 0 && !compiled.timedOut;

    if (!ok) {
      const message = compiled.timedOut ? 'Compilation timed out.' : output;
      return { compile: { ok: false, output: message }, runs: [] };
    }

    await fs.chmod(path.join(workDir, 'main'), 0o755);
    const runs = [];
    for (const input of inputs) {
      runs.push(await driver.run(workDir, input));
    }
    return { compile: { ok: true, output }, runs };
  } finally {
    release();
    await fs.rm(workDir, { recursive: true, force: true });
  }
}

export async function startInteractiveProgram({ code, onOutput }) {
  const driver = await getDriver();
  if (!driver) {
    throw new ExecutorError(
      'Code execution is not configured on this server. Build the Docker runner image (see backend/runner/Dockerfile).',
    );
  }

  await acquire();
  let workDir;
  let released = false;
  const releaseSlot = () => {
    if (released) return;
    released = true;
    release();
  };
  try {
    workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'virvese-'));
    await fs.chmod(workDir, 0o777);
    // Pipe-based terminals do not flush printf prompts without a trailing newline.
    await fs.writeFile(
      path.join(workDir, 'interactive.h'),
      '#include <stdio.h>\n__attribute__((constructor)) static void virvese_unbuffer_stdout(void) { setvbuf(stdout, NULL, _IONBF, 0); }\n',
    );
    await fs.writeFile(path.join(workDir, 'main.c'), code);

    const compiled = await driver.compile(workDir, { interactive: true });
    if (compiled.spawnError) throw new ExecutorError('Could not start the compiler.');
    const output = cleanCompileOutput(compiled.stdout + compiled.stderr, workDir);
    if (compiled.exitCode !== 0 || compiled.timedOut) {
      await fs.rm(workDir, { recursive: true, force: true });
      releaseSlot();
      return { compile: { ok: false, output: compiled.timedOut ? 'Compilation timed out.' : output } };
    }

    await fs.chmod(path.join(workDir, 'main'), 0o755);
    const { child, cleanup } = driver.startInteractive(workDir);
    const startedAt = Date.now();
    let outputBytes = 0;
    let outputExceeded = false;
    let timedOut = false;
    let memoryExceeded = false;
    let settled = false;
    let stopStarted = false;
    let pollingMemory = false;
    let resolveFinished;
    let cleanupPromise;
    const finished = new Promise((resolve) => { resolveFinished = resolve; });

    const cleanupDriver = () => {
      cleanupPromise ??= Promise.resolve()
        .then(cleanup)
        .catch((error) => console.error('Interactive runner cleanup failed:', error));
      return cleanupPromise;
    };
    const stop = () => {
      if (stopStarted) return;
      stopStarted = true;
      killProcessGroup(child);
      void cleanupDriver();
    };
    const emit = (stream, data) => {
      const chunk = Buffer.isBuffer(data) ? data : Buffer.from(data);
      const available = Math.max(LIMITS.maxOutputBytes - outputBytes, 0);
      const accepted = chunk.subarray(0, available);
      outputBytes += accepted.length;
      if (accepted.length) onOutput(stream, accepted.toString('utf8'));
      if (accepted.length < chunk.length && !outputExceeded) {
        outputExceeded = true;
        stop();
      }
    };

    child.stdout.on('data', (chunk) => emit('stdout', chunk));
    child.stderr.on('data', (chunk) => emit('stderr', chunk));
    child.stdin.on('error', () => {});

    const timer = setTimeout(() => {
      timedOut = true;
      stop();
    }, LIMITS.interactiveTimeoutMs);
    const poller = driver.name === 'local'
      ? setInterval(async () => {
          if (pollingMemory || settled) return;
          pollingMemory = true;
          try {
            if (await processMemoryMb(child.pid) > LIMITS.memoryMb) {
              memoryExceeded = true;
              stop();
            }
          } finally {
            pollingMemory = false;
          }
        }, 100)
      : null;

    const finish = async ({ exitCode, signal, spawnError = null }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (poller) clearInterval(poller);
      try {
        await cleanupDriver();
        try {
          await fs.rm(workDir, { recursive: true, force: true });
        } catch (error) {
          console.error('Interactive runner workspace cleanup failed:', error);
        }
      } finally {
        releaseSlot();
      }
      resolveFinished({
        exitCode,
        signal,
        spawnError,
        outputExceeded,
        timedOut,
        memoryExceeded,
        timeMs: Date.now() - startedAt,
      });
    };

    child.once('error', (error) => finish({ exitCode: null, signal: null, spawnError: error.message }));
    child.once('close', (exitCode, signal) => finish({ exitCode, signal }));

    return {
      compile: { ok: true, output },
      session: {
        finished,
        write: (input) => child.stdin.write(input),
        closeInput: () => child.stdin.end(),
        stop,
      },
    };
  } catch (error) {
    try {
      if (workDir) await fs.rm(workDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Interactive runner workspace cleanup failed:', cleanupError);
    } finally {
      releaseSlot();
    }
    throw error;
  }
}
