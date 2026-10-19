import { spawn } from 'node:child_process';
import { StringDecoder } from 'node:string_decoder';

export function killProcessGroup(child) {
  try {
    process.kill(-child.pid, 'SIGKILL');
  } catch {
    child.kill('SIGKILL');
  }
}

export function processMemoryMb(pid) {
  return new Promise((resolve) => {
    const ps = spawn('ps', ['-o', 'rss=', '-p', String(pid)]);
    let out = '';
    ps.stdout.on('data', (d) => (out += d));
    ps.on('close', () => resolve((parseInt(out, 10) || 0) / 1024));
    ps.on('error', () => resolve(0));
  });
}

/**
 * Runs a command as a separate OS process with a wall-clock timeout and an output cap.
 * Optional: `memoryMb` (polled RSS, for drivers without native memory limits) and
 * `onTimeout` (extra cleanup, e.g. `docker kill`).
 */
export function runProcess({
  command,
  args = [],
  cwd,
  env = {},
  input = '',
  timeoutMs,
  maxOutputBytes,
  memoryMb,
  onTimeout,
  signal,
}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Execution request was cancelled.'));
      return;
    }
    const started = Date.now();
    const child = spawn(command, args, {
      cwd,
      env,
      detached: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let outputExceeded = false;
    let timedOut = false;
    let memoryExceeded = false;
    let settled = false;
    let aborted = false;
    let stopped = false;
    let outputBytes = 0;

    const stop = () => {
      if (stopped) return;
      stopped = true;
      killProcessGroup(child);
      onTimeout?.();
    };
    const abort = () => {
      aborted = true;
      stop();
    };
    signal?.addEventListener('abort', abort, { once: true });

    const collect = (stream, append) => {
      const decoder = new StringDecoder('utf8');
      stream.on('data', (chunk) => {
        if (outputExceeded) return;
        const room = Math.max(maxOutputBytes - outputBytes, 0);
        const accepted = chunk.subarray(0, room);
        outputBytes += accepted.length;
        append(decoder.write(accepted));
        if (chunk.length > room) {
          outputExceeded = true;
          stop();
        }
      });
      stream.on('end', () => append(decoder.end()));
    };
    collect(child.stdout, (c) => (stdout += c));
    collect(child.stderr, (c) => (stderr += c));

    child.stdin.on('error', () => {});
    child.stdin.end(input);

    const timer = setTimeout(() => {
      timedOut = true;
      stop();
    }, timeoutMs);

    const poller = memoryMb
      ? setInterval(async () => {
          if ((await processMemoryMb(child.pid)) > memoryMb) {
            memoryExceeded = true;
            stop();
          }
        }, 100)
      : null;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', abort);
      clearTimeout(timer);
      if (poller) clearInterval(poller);
      resolve({
        stdout,
        stderr,
        outputExceeded,
        timedOut,
        memoryExceeded,
        aborted,
        timeMs: Date.now() - started,
        ...result,
      });
    };

    child.on('error', (err) => finish({ exitCode: null, signal: null, spawnError: err.message }));
    child.on('close', (exitCode, signal) => finish({ exitCode, signal }));
  });
}
