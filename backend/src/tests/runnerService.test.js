import assert from 'node:assert/strict';
import { once } from 'node:events';
import { existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { test } from 'node:test';
import WebSocket from 'ws';
import { signRunnerRequest, verifyRunnerRequest } from '../services/executor/runnerProtocol.js';
import { createInteractiveTicket, verifyInteractiveTicket } from '../services/executor/interactiveTickets.js';

const backendRoot = fileURLToPath(new URL('../../', import.meta.url));
const serviceSecret = 'runner-service-test-secret-with-more-than-32-bytes';
const ticketSecret = 'runner-ticket-test-secret-with-more-than-32-bytes';
const allowedOrigin = 'https://virvese-test.example';
const canExecuteLocally = process.platform === 'darwin'
  && existsSync('/usr/bin/sandbox-exec')
  && existsSync('/usr/bin/cc');

async function getFreePort() {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  return port;
}

async function waitForRunner(url, child) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (child.exitCode !== null) throw new Error('Runner service exited before it became healthy.');
    try {
      const response = await fetch(`${url}/health`);
      if (response.ok) return;
    } catch {
      await delay(100);
    }
  }
  throw new Error('Runner service did not become healthy.');
}

async function authorizedRequest(url, body, signal) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = randomUUID();
  return fetch(`${url}/internal/v1/execute`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-runner-timestamp': timestamp,
      'x-runner-nonce': nonce,
      'x-runner-signature': signRunnerRequest(serviceSecret, timestamp, nonce, body),
    },
    body,
    signal,
  });
}

test('remote runner authenticates requests and executes batch and interactive C programs', async (t) => {
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const previous = {
    NODE_ENV: process.env.NODE_ENV,
    RUNNER_URL: process.env.RUNNER_URL,
    RUNNER_SERVICE_SECRET: process.env.RUNNER_SERVICE_SECRET,
    RUNNER_TICKET_SECRET: process.env.RUNNER_TICKET_SECRET,
  };
  Object.assign(process.env, {
    NODE_ENV: 'test',
    RUNNER_URL: url,
    RUNNER_SERVICE_SECRET: serviceSecret,
    RUNNER_TICKET_SECRET: ticketSecret,
  });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = randomUUID();
  const signedBody = JSON.stringify({ test: true });
  const signature = signRunnerRequest(serviceSecret, timestamp, nonce, signedBody);
  assert.equal(verifyRunnerRequest({
    secret: serviceSecret,
    timestamp,
    nonce,
    body: signedBody,
    signature,
  }), true);
  assert.equal(verifyRunnerRequest({
    secret: serviceSecret,
    timestamp,
    nonce,
    body: signedBody,
    signature,
  }), false);

  const child = spawn(process.execPath, ['src/runner/server.js'], {
    cwd: backendRoot,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      VERCEL: '',
      EXECUTION_DRIVER: 'local',
      PORT: String(port),
      RUNNER_SERVICE_SECRET: serviceSecret,
      RUNNER_TICKET_SECRET: ticketSecret,
      RUNNER_ALLOWED_ORIGIN: allowedOrigin,
    },
    stdio: 'ignore',
  });
  t.after(async () => {
    if (child.exitCode === null) {
      child.kill('SIGTERM');
      await Promise.race([once(child, 'exit'), delay(2_000)]);
    }
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  await waitForRunner(url, child);

  const unauthenticated = await fetch(`${url}/internal/v1/execute`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code: 'int main(void) { return 0; }', inputs: [''] }),
  });
  assert.equal(unauthenticated.status, 401);

  if (!canExecuteLocally) {
    t.skip('C execution integration requires macOS sandbox-exec or a Docker runner.');
    return;
  }

  const remote = await import('../services/executor/drivers/remote.js');
  const execution = await remote.executeProgram({
    code: '#include <stdio.h>\nint main(void) { int value; if (scanf("%d", &value) != 1) return 1; printf("value=%d\\n", value); return 0; }',
    inputs: ['42\n', '-7\n'],
  });
  assert.equal(execution.compile.ok, true);
  assert.equal(execution.runs.length, 2);
  assert.equal(execution.runs[0].stdout.trim(), 'value=42');
  assert.equal(execution.runs[1].stdout.trim(), 'value=-7');

  const compileError = await remote.executeProgram({
    code: 'int main( {',
    inputs: [''],
  });
  assert.equal(compileError.compile.ok, false);
  assert.match(compileError.compile.output, /error/i);
  assert.equal(compileError.runs.length, 0);

  const abortController = new AbortController();
  const abandonedExecution = authorizedRequest(
    url,
    JSON.stringify({ code: 'int main(void) { for (;;) {} return 0; }', inputs: [''] }),
    abortController.signal,
  );
  const abortTimer = setTimeout(() => abortController.abort(), 300);
  await assert.rejects(abandonedExecution, { name: 'AbortError' });
  clearTimeout(abortTimer);
  await delay(300);

  const ticket = createInteractiveTicket('test-user').ticket;
  const ws = new WebSocket(`ws://127.0.0.1:${port}/interactive`, {
    headers: { origin: allowedOrigin },
  });
  const interactive = await new Promise((resolve, reject) => {
    let stdout = '';
    let inputOneSent = false;
    let inputTwoSent = false;
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Interactive runner test timed out.'));
    }, 15_000);

    ws.on('open', () => ws.send(JSON.stringify({ type: 'authenticate', ticket })));
    ws.on('message', (raw) => {
      const message = JSON.parse(raw.toString());
      if (message.type === 'authorized') {
        ws.send(JSON.stringify({
          type: 'start',
          code: '#include <stdio.h>\nint main(void) { int a, b; printf("First?"); if (scanf("%d", &a) != 1) return 1; printf("Second?"); if (scanf("%d", &b) != 1) return 1; printf("Sum=%d\\n", a + b); return 0; }',
        }));
      } else if (message.type === 'output' && message.stream === 'stdout') {
        stdout += message.data;
        if (!inputOneSent && stdout.includes('First?')) {
          inputOneSent = true;
          ws.send(JSON.stringify({ type: 'input', data: '4' }));
        }
        if (!inputTwoSent && stdout.includes('Second?')) {
          inputTwoSent = true;
          ws.send(JSON.stringify({ type: 'input', data: '6' }));
        }
      } else if (message.type === 'exit') {
        clearTimeout(timeout);
        ws.close();
        resolve({ ...message, stdout });
      } else if (message.type === 'error') {
        clearTimeout(timeout);
        ws.close();
        reject(new Error(message.message));
      }
    });
    ws.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
  assert.equal(interactive.status, 'Success');
  assert.match(interactive.stdout, /Sum=10/);
  assert.equal(verifyInteractiveTicket(ticket).sub, 'test-user');

  const replaySocket = new WebSocket(`ws://127.0.0.1:${port}/interactive`, {
    headers: { origin: allowedOrigin },
  });
  const replayMessage = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      replaySocket.close();
      reject(new Error('Interactive ticket replay test timed out.'));
    }, 3_000);
    replaySocket.on('open', () => replaySocket.send(JSON.stringify({ type: 'authenticate', ticket })));
    replaySocket.on('message', (raw) => {
      clearTimeout(timeout);
      resolve(JSON.parse(raw.toString()));
      replaySocket.close();
    });
    replaySocket.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
  assert.equal(replayMessage.type, 'error');
});

test('Vercel execution fails closed unless the remote runner is configured', async () => {
  const previous = {
    VERCEL: process.env.VERCEL,
    NODE_ENV: process.env.NODE_ENV,
    EXECUTION_DRIVER: process.env.EXECUTION_DRIVER,
    RUNNER_URL: process.env.RUNNER_URL,
    RUNNER_SERVICE_SECRET: process.env.RUNNER_SERVICE_SECRET,
  };
  Object.assign(process.env, {
    VERCEL: '1',
    NODE_ENV: 'production',
    EXECUTION_DRIVER: 'docker',
  });
  delete process.env.RUNNER_URL;
  delete process.env.RUNNER_SERVICE_SECRET;
  try {
    const executor = await import(`../services/executor/index.js?vercel-test=${randomUUID()}`);
    await assert.rejects(
      executor.executeProgram({ code: 'int main(void) { return 0; }', inputs: [''] }),
      (error) => error instanceof executor.ExecutorError && error.status === 503,
    );
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
