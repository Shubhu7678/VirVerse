import { spawn } from 'node:child_process';

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
}) {
  return new Promise((resolve) => {
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

    const stop = () => {
      killProcessGroup(child);
      onTimeout?.();
    };

    const collect = (stream, append) => {
      stream.setEncoding('utf8');
      stream.on('data', (chunk) => {
        if (outputExceeded) return;
        const room = maxOutputBytes - (stdout.length + stderr.length);
        append(chunk.slice(0, Math.max(room, 0)));
        if (chunk.length > room) {
          outputExceeded = true;
          stop();
        }
      });
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
      clearTimeout(timer);
      if (poller) clearInterval(poller);
      resolve({
        stdout,
        stderr,
        outputExceeded,
        timedOut,
        memoryExceeded,
        timeMs: Date.now() - started,
        ...result,
      });
    };

    child.on('error', (err) => finish({ exitCode: null, signal: null, spawnError: err.message }));
    child.on('close', (exitCode, signal) => finish({ exitCode, signal }));
  });
}
