export const LIMITS = {
  compileTimeoutMs: 10_000,
  runTimeoutMs: 3_000,
  interactiveTimeoutMs: 30_000,
  memoryMb: 128,
  maxOutputBytes: 64 * 1024,
  maxCompileOutputBytes: 8 * 1024,
  maxPids: 32,
  maxFileSizeKb: 1024,
  maxConcurrent: 2,
  maxQueued: 10,
};

export const MAX_CODE_LENGTH = 20_000;
export const MAX_STDIN_LENGTH = 5_000;
