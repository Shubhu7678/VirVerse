import { randomUUID } from 'node:crypto';
import { signRunnerRequest } from '../runnerProtocol.js';
import { LIMITS } from '../limits.js';

const requestTimeoutMs = 60_000;

function getRunnerUrl() {
  if (!process.env.RUNNER_URL) return null;
  try {
    const url = new URL(process.env.RUNNER_URL);
    if (
      !['https:', 'http:'].includes(url.protocol)
      || url.username
      || url.password
      || url.search
      || url.hash
      || (process.env.NODE_ENV === 'production' && url.protocol !== 'https:')
    ) return null;
    return url.toString().replace(/\/+$/, '');
  } catch {
    return null;
  }
}

export function isAvailable() {
  return Boolean(getRunnerUrl() && Buffer.byteLength(process.env.RUNNER_SERVICE_SECRET || '') >= 32);
}

export async function executeProgram({ code, inputs }) {
  const base = getRunnerUrl();
  const secret = process.env.RUNNER_SERVICE_SECRET;
  if (!base || Buffer.byteLength(secret || '') < 32) {
    throw new Error('Remote execution requires a valid RUNNER_URL and a 32-byte RUNNER_SERVICE_SECRET.');
  }

  const body = JSON.stringify({ code, inputs });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = randomUUID();
  const signature = signRunnerRequest(secret, timestamp, nonce, body);
  let response;
  try {
    response = await fetch(`${base}/internal/v1/execute`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-runner-timestamp': timestamp,
        'x-runner-nonce': nonce,
        'x-runner-signature': signature,
      },
      body,
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
  } catch (error) {
    throw new Error(`Execution service request failed: ${error.message}`);
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('Execution service returned an invalid response.');
  }
  if (!response.ok) {
    const error = new Error(result.message || 'Execution service rejected the request.');
    error.status = response.status >= 500 ? 503 : response.status;
    throw error;
  }
  const expectedRuns = result.compile?.ok ? inputs.length : 0;
  if (
    typeof result.compile?.ok !== 'boolean'
    || typeof result.compile?.output !== 'string'
    || Buffer.byteLength(result.compile.output) > LIMITS.maxCompileOutputBytes + 128
    || !Array.isArray(result.runs)
    || result.runs.length !== expectedRuns
    || result.runs.some((run) => (
      typeof run?.stdout !== 'string'
      || typeof run?.stderr !== 'string'
      || Buffer.byteLength(run.stdout) + Buffer.byteLength(run.stderr) > LIMITS.maxOutputBytes + 128
      || !(typeof run.exitCode === 'number' || run.exitCode === null)
      || !(typeof run.signal === 'string' || run.signal === null)
      || !Number.isFinite(run.timeMs)
      || typeof run.timedOut !== 'boolean'
      || typeof run.outputExceeded !== 'boolean'
      || typeof run.memoryExceeded !== 'boolean'
    ))
  ) {
    throw new Error('Execution service returned an unexpected response shape.');
  }
  return result;
}
