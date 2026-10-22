import fs from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as docker from './drivers/docker.js';
import * as macSandbox from './drivers/macSandbox.js';
import * as remote from './drivers/remote.js';
import { LIMITS } from './limits.js';
import { killProcessGroup, processMemoryMb } from './runProcess.js';

let driverPromise;

// EXECUTION_DRIVER=docker|local forces a driver. Without it, Docker is preferred and the
// macOS sandbox is only used outside production.
async function pickDriver() {
  const wanted = process.env.EXECUTION_DRIVER;
  const production = process.env.NODE_ENV === 'production';

  if (process.env.VERCEL && wanted !== 'remote') return null;
  if (wanted === 'remote') {
    if (await remote.isAvailable()) return { name: 'remote', ...remote };
    return null;
  }
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

function acquire(signal) {
  if (signal?.aborted) {
    return Promise.reject(new ExecutorError('Execution request was cancelled.', 499));
  }
  if (active < LIMITS.maxConcurrent) {
    active += 1;
    return Promise.resolve();
  }
  if (waiting.length >= LIMITS.maxQueued) {
    return Promise.reject(new ExecutorError('The code runner is busy. Please try again in a moment.'));
  }
  return new Promise((resolve, reject) => {
    const waiter = { resolve, reject, signal, abort: null };
    if (signal) {
      waiter.abort = () => {
        const index = waiting.indexOf(waiter);
        if (index !== -1) waiting.splice(index, 1);
        reject(new ExecutorError('Execution request was cancelled.', 499));
      };
      signal.addEventListener('abort', waiter.abort, { once: true });
    }
    waiting.push(waiter);
  });
}

function release() {
  while (waiting.length) {
    const next = waiting.shift();
    next.signal?.removeEventListener('abort', next.abort);
    if (next.signal?.aborted) {
      next.reject(new ExecutorError('Execution request was cancelled.', 499));
      continue;
    }
    next.resolve();
    return;
  }
  active -= 1;
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
export async function executeProgram({ code, inputs, signal }) {
  const driver = await getDriver();
  if (!driver) {
    throw new ExecutorError(
      'Code execution is not configured. Configure the remote runner or a local Docker runner.',
    );
  }

  if (driver.name === 'remote') {
    try {
      return await driver.executeProgram({ code, inputs });
    } catch (error) {
      console.error('Remote execution request failed:', error.message);
      throw new ExecutorError('The remote code runner is temporarily unavailable.', 503);
    }
  }

  await acquire(signal);
  const workRoot = process.env.EXECUTION_WORKDIR || os.tmpdir();
  let workDir;
  try {
    await fs.mkdir(workRoot, { recursive: true });
    workDir = await fs.mkdtemp(path.join(workRoot, 'virvese-'));
    await fs.chmod(workDir, 0o777);
    await fs.writeFile(path.join(workDir, 'main.c'), code);

    const compiled = await driver.compile(workDir, { signal });
    if (compiled.aborted) throw new ExecutorError('Execution request was cancelled.', 499);
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
      const run = await driver.run(workDir, input, { signal });
      if (run.aborted) throw new ExecutorError('Execution request was cancelled.', 499);
      runs.push(run);
      if (run.timedOut || run.outputExceeded || run.memoryExceeded) break;
    }
    return { compile: { ok: true, output }, runs };
  } finally {
    release();
    if (workDir) {
      try {
        await fs.rm(workDir, { recursive: true, force: true });
      } catch (error) {
        console.error('Code runner workspace cleanup failed:', error);
      }
    }
  }
}

export async function startInteractiveProgram({ code, onOutput, signal }) {
  const driver = await getDriver();
  if (!driver) {
    throw new ExecutorError(
      'Code execution is not configured. Configure the remote runner or a local Docker runner.',
    );
  }
  if (driver.name === 'remote') {
    throw new ExecutorError('Interactive runs must connect directly to the configured runner WebSocket.');
  }

  await acquire(signal);
  let workDir;
  let released = false;
  const releaseSlot = () => {
    if (released) return;
    released = true;
    release();
  };
  try {
    const workRoot = process.env.EXECUTION_WORKDIR || os.tmpdir();
    await fs.mkdir(workRoot, { recursive: true });
    workDir = await fs.mkdtemp(path.join(workRoot, 'virvese-'));
    await fs.chmod(workDir, 0o777);
    // Pipe-based terminals do not flush printf prompts without a trailing newline.
    await fs.writeFile(
      path.join(workDir, 'interactive.h'),
      '#include <stdio.h>\n__attribute__((constructor)) static void virvese_unbuffer_stdout(void) { setvbuf(stdout, NULL, _IONBF, 0); }\n',
    );
    await fs.writeFile(path.join(workDir, 'main.c'), code);

    const compiled = await driver.compile(workDir, { interactive: true, signal });
    if (compiled.aborted) throw new ExecutorError('Execution request was cancelled.', 499);
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
    const abort = () => stop();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
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
      signal?.removeEventListener('abort', abort);
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
