import { spawn } from 'node:child_process';
import { runProcess } from '../runProcess.js';
import { LIMITS } from '../limits.js';

export const IMAGE = process.env.RUNNER_IMAGE || 'virvese-c-runner';

const baseFlags = ['--rm', '--network', 'none', '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges'];
const env = { PATH: process.env.PATH };

const killContainer = (name) => () =>
  runProcess({ command: 'docker', args: ['kill', name], env, timeoutMs: 5000, maxOutputBytes: 1024 });

const uniqueName = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export async function isAvailable() {
  const r = await runProcess({
    command: 'docker',
    args: ['image', 'inspect', '--format', '{{.Id}}', IMAGE],
    env,
    timeoutMs: 5000,
    maxOutputBytes: 1024,
  });
  return r.exitCode === 0;
}

// The work dir is mounted into a throwaway container with no network.
export function compile(workDir, { interactive = false, signal } = {}) {
  const name = uniqueName('vv-c');
  return runProcess({
    command: 'docker',
    args: [
      'run', ...baseFlags, '--name', name,
      '--memory', '256m', '--memory-swap', '256m', '--cpus', '1',
      '--pids-limit', String(LIMITS.maxPids),
      '-v', `${workDir}:/work`, '-w', '/work',
      IMAGE, 'gcc', '-std=c11', '-Wall', ...(interactive ? ['-include', 'interactive.h'] : []), '-o', 'main', 'main.c', '-lm',
    ],
    env,
    timeoutMs: LIMITS.compileTimeoutMs,
    maxOutputBytes: LIMITS.maxCompileOutputBytes,
    onTimeout: killContainer(name),
    signal,
  });
}

// The program runs read-only, memory/CPU/pid limited, with no network.
export function run(workDir, input, { signal } = {}) {
  const name = uniqueName('vv-r');
  const mem = `${LIMITS.memoryMb}m`;
  return runProcess({
    command: 'docker',
    args: [
      'run', ...baseFlags, '-i', '--name', name,
      '--memory', mem, '--memory-swap', mem, '--cpus', '0.5',
      '--pids-limit', '16', '--read-only', '--tmpfs', '/tmp:size=8m',
      '--ulimit', `fsize=${LIMITS.maxFileSizeKb * 1024}`, '--ulimit', 'nofile=64',
      // The binary is read-only; the program's working dir is a small tmpfs so it can create files.
      '-v', `${workDir}:/work:ro`, '-w', '/tmp',
      IMAGE, '/work/main',
    ],
    env,
    input,
    timeoutMs: LIMITS.runTimeoutMs + 1500, // headroom for container start-up
    maxOutputBytes: LIMITS.maxOutputBytes,
    onTimeout: killContainer(name),
    signal,
  });
}

export function runJavaScript(workDir, code, input, { signal } = {}) {
  const name = uniqueName('vv-js');
  const mem = `${LIMITS.memoryMb}m`;
  return runProcess({
    command: 'docker',
    args: [
      'run', ...baseFlags, '-i', '--name', name,
      '--memory', mem, '--memory-swap', mem, '--cpus', '0.5',
      '--pids-limit', '16', '--read-only', '--tmpfs', '/tmp:size=8m',
      '--ulimit', `fsize=${LIMITS.maxFileSizeKb * 1024}`, '--ulimit', 'nofile=64',
      IMAGE, 'node', '--permission',
      `--max-old-space-size=${Math.max(32, LIMITS.memoryMb - 64)}`, '--disable-proto=throw',
      '-e', "eval(Buffer.from(process.argv[1], 'base64').toString('utf8'))",
      Buffer.from(code).toString('base64'),
    ],
    env: { ...env, NODE_OPTIONS: '' },
    input,
    timeoutMs: LIMITS.runTimeoutMs + 1500,
    maxOutputBytes: LIMITS.maxOutputBytes,
    onTimeout: killContainer(name),
    signal,
  });
}

export function runPython(workDir, code, input, { signal } = {}) {
  const name = uniqueName('vv-py');
  const mem = `${LIMITS.memoryMb}m`;
  return runProcess({
    command: 'docker',
    args: [
      'run', ...baseFlags, '-i', '--name', name,
      '--memory', mem, '--memory-swap', mem, '--cpus', '0.5',
      '--pids-limit', '16', '--read-only', '--tmpfs', '/tmp:size=8m',
      '--ulimit', `fsize=${LIMITS.maxFileSizeKb * 1024}`, '--ulimit', 'nofile=64',
      IMAGE, 'python3', '-I', '-S', '-B', '-c', code,
    ],
    env,
    input,
    timeoutMs: LIMITS.runTimeoutMs + 1500,
    maxOutputBytes: LIMITS.maxOutputBytes,
    onTimeout: killContainer(name),
    signal,
  });
}

export function startInteractive(workDir) {
  const name = uniqueName('vv-i');
  const mem = `${LIMITS.memoryMb}m`;
  const child = spawn('docker', [
    'run', ...baseFlags, '-i', '--name', name,
    '--memory', mem, '--memory-swap', mem, '--cpus', '0.5',
    '--pids-limit', '16', '--read-only', '--tmpfs', '/tmp:size=8m',
    '--ulimit', `fsize=${LIMITS.maxFileSizeKb * 1024}`, '--ulimit', 'nofile=64',
    '-v', `${workDir}:/work:ro`, '-w', '/tmp',
    IMAGE, '/work/main',
  ], { env, detached: true, stdio: ['pipe', 'pipe', 'pipe'] });

  return {
    child,
    cleanup: killContainer(name),
  };
}
