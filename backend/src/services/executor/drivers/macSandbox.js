import fs from 'node:fs';
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { runProcess } from '../runProcess.js';
import { LIMITS } from '../limits.js';

// Development-only driver for macOS: every process runs under Seatbelt (sandbox-exec)
// with networking denied, no writes outside the work dir, and no reads of /Users.
// It is NOT a replacement for the Docker driver in production.
const SANDBOX_EXEC = '/usr/bin/sandbox-exec';
let compilerPath;
let sdkPath;

export function isAvailable() {
  if (process.platform !== 'darwin' || !fs.existsSync(SANDBOX_EXEC) || !fs.existsSync('/usr/bin/xcrun')) {
    return false;
  }
  try {
    compilerPath = execFileSync('/usr/bin/xcrun', ['--no-cache', '--find', 'clang'], {
      encoding: 'utf8',
      env: { ...process.env, PATH: '/usr/bin:/bin' },
    }).trim();
    sdkPath = execFileSync('/usr/bin/xcrun', ['--no-cache', '--sdk', 'macosx', '--show-sdk-path'], {
      encoding: 'utf8',
      env: { ...process.env, PATH: '/usr/bin:/bin' },
    }).trim();
    return Boolean(compilerPath && sdkPath && fs.existsSync(compilerPath) && fs.existsSync(sdkPath));
  } catch {
    return false;
  }
}

function writeProfile(workDir, { allowFork, allowReadPaths = [] }) {
  const real = fs.realpathSync(workDir);
  const rules = [
    '(version 1)',
    '(allow default)',
    ...allowReadPaths.map((readPath) => `(allow file-read* (subpath "${readPath}"))`),
    '(deny network*)',
    '(deny file-read* (subpath "/Users"))',
    '(deny file-write*)',
    `(allow file-write* (subpath "${real}") (literal "/dev/null") (literal "/dev/dtracehelper"))`,
  ];
  if (!allowFork) rules.push('(deny process-fork)');
  const file = path.join(workDir, allowFork ? 'compile.sb' : 'run.sb');
  fs.writeFileSync(file, rules.join('\n'));
  return file;
}

const baseEnv = (workDir) => ({
  PATH: '/usr/bin:/bin',
  TMPDIR: path.join(workDir, 'tmp'),
  HOME: workDir,
  SDKROOT: sdkPath,
});

export function compile(workDir, { interactive = false, signal } = {}) {
  fs.mkdirSync(path.join(workDir, 'tmp'), { recursive: true });
  const profile = writeProfile(workDir, { allowFork: true });
  return runProcess({
    command: '/bin/sh',
    args: [
      '-c',
      `ulimit -f ${LIMITS.maxFileSizeKb * 4}; exec ${SANDBOX_EXEC} -f "${profile}" "$@"`,
      'virverse-compiler',
      compilerPath,
      '-std=c11',
      '-Wall',
      ...(interactive ? ['-include', 'interactive.h'] : []),
      '-o',
      'main',
      'main.c',
      '-lm',
    ],
    cwd: workDir,
    env: baseEnv(workDir),
    timeoutMs: LIMITS.compileTimeoutMs,
    maxOutputBytes: LIMITS.maxCompileOutputBytes,
    signal,
  });
}

export async function run(workDir, input, { signal } = {}) {
  const profile = writeProfile(workDir, { allowFork: false });
  const cpuSeconds = Math.ceil(LIMITS.runTimeoutMs / 1000) + 1;
  // Each run gets its own empty directory so files created by one test never leak into the next.
  const runDir = fs.mkdtempSync(path.join(workDir, 'run-'));
  try {
    return await runProcess({
      command: '/bin/sh',
      args: [
        '-c',
        `ulimit -t ${cpuSeconds}; ulimit -f ${LIMITS.maxFileSizeKb}; ulimit -n 64; exec ${SANDBOX_EXEC} -f "${profile}" ../main`,
      ],
      cwd: runDir,
      env: baseEnv(workDir),
      input,
      timeoutMs: LIMITS.runTimeoutMs,
      maxOutputBytes: LIMITS.maxOutputBytes,
      memoryMb: LIMITS.memoryMb,
      signal,
    });
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
}

export async function runJavaScript(workDir, code, input, { signal } = {}) {
  const nodePath = realpathSync(process.execPath);
  const nodeDirectory = path.dirname(nodePath);
  const profile = writeProfile(workDir, {
    allowFork: false,
    allowReadPaths: [nodeDirectory],
  });
  const cpuSeconds = Math.ceil(LIMITS.runTimeoutMs / 1000) + 1;
  const runDir = fs.mkdtempSync(path.join(workDir, 'run-'));
  try {
    return await runProcess({
      command: '/bin/sh',
      args: [
        '-c',
        `ulimit -t ${cpuSeconds}; ulimit -f ${LIMITS.maxFileSizeKb}; ulimit -n 64; exec "${SANDBOX_EXEC}" -f "${profile}" "$@"`,
        'virvese-javascript',
        nodePath,
        '--permission',
        `--max-old-space-size=${Math.max(32, LIMITS.memoryMb - 64)}`,
        '--disable-proto=throw',
        '-e',
        "eval(Buffer.from(process.argv[1], 'base64').toString('utf8'))",
        Buffer.from(code).toString('base64'),
      ],
      cwd: runDir,
      env: baseEnv(workDir),
      input,
      timeoutMs: LIMITS.runTimeoutMs,
      maxOutputBytes: LIMITS.maxOutputBytes,
      memoryMb: LIMITS.memoryMb,
      signal,
    });
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
}

export async function runPython(workDir, code, input, { signal } = {}) {
  const pythonPath = realpathSync('/usr/bin/python3');
  const profile = writeProfile(workDir, { allowFork: false });
  const cpuSeconds = Math.ceil(LIMITS.runTimeoutMs / 1000) + 1;
  const runDir = fs.mkdtempSync(path.join(workDir, 'run-'));
  try {
    return await runProcess({
      command: '/bin/sh',
      args: [
        '-c',
        `ulimit -t ${cpuSeconds}; ulimit -f ${LIMITS.maxFileSizeKb}; ulimit -n 64; exec "${SANDBOX_EXEC}" -f "${profile}" "$@"`,
        'virvese-python',
        pythonPath,
        '-I',
        '-S',
        '-B',
        '-c',
        code,
      ],
      cwd: runDir,
      env: baseEnv(workDir),
      input,
      timeoutMs: LIMITS.runTimeoutMs,
      maxOutputBytes: LIMITS.maxOutputBytes,
      memoryMb: LIMITS.memoryMb,
      signal,
    });
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
}

export function startInteractive(workDir) {
  const profile = writeProfile(workDir, { allowFork: false });
  const cpuSeconds = Math.ceil(30) + 1;
  const runDir = fs.mkdtempSync(path.join(workDir, 'run-'));
  const child = spawn('/bin/sh', [
    '-c',
    `ulimit -t ${cpuSeconds}; ulimit -f ${LIMITS.maxFileSizeKb}; ulimit -n 64; exec ${SANDBOX_EXEC} -f "${profile}" ../main`,
  ], {
    cwd: runDir,
    env: baseEnv(workDir),
    detached: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  return {
    child,
    cleanup: () => fs.rmSync(runDir, { recursive: true, force: true }),
  };
}
