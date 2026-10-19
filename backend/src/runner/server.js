import 'dotenv/config';
import { createServer } from 'node:http';
import express from 'express';
import helmet from 'helmet';
import { WebSocket, WebSocketServer } from 'ws';
import { executeProgram, ExecutorError, startInteractiveProgram } from '../services/executor/index.js';
import { MAX_CODE_LENGTH, MAX_STDIN_LENGTH } from '../services/executor/limits.js';
import { verifyRunnerRequest } from '../services/executor/runnerProtocol.js';
import { verifyInteractiveTicket } from '../services/executor/interactiveTickets.js';

const PORT = Number(process.env.PORT) || 5002;
const MAX_INPUTS = 100;
const MAX_REQUEST_BYTES = 1024 * 1024;
const MAX_USED_TICKETS = 20_000;
const usedTickets = new Map();

function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateExecutionRequest(body) {
  if (!body || typeof body.code !== 'string' || body.code.length < 1 || body.code.length > MAX_CODE_LENGTH) {
    throw fail(`Code must be between 1 and ${MAX_CODE_LENGTH} characters.`);
  }
  if (!Array.isArray(body.inputs) || body.inputs.length < 1 || body.inputs.length > MAX_INPUTS) {
    throw fail(`Inputs must contain between 1 and ${MAX_INPUTS} test cases.`);
  }
  let totalInputBytes = 0;
  for (const input of body.inputs) {
    if (typeof input !== 'string' || Buffer.byteLength(input) > MAX_STDIN_LENGTH) {
      throw fail(`Each input must be a string of at most ${MAX_STDIN_LENGTH} bytes.`);
    }
    totalInputBytes += Buffer.byteLength(input);
  }
  if (totalInputBytes > MAX_INPUTS * MAX_STDIN_LENGTH) {
    throw fail('Combined test input is too large.');
  }
}

function authenticateRequest(req, res, next) {
  const secret = process.env.RUNNER_SERVICE_SECRET;
  const valid = verifyRunnerRequest({
    secret,
    timestamp: req.get('x-runner-timestamp'),
    nonce: req.get('x-runner-nonce'),
    signature: req.get('x-runner-signature'),
    body: req.rawBody ?? Buffer.alloc(0),
  });
  if (!valid) return res.status(401).json({ message: 'Runner authentication failed.' });
  next();
}

function sendSocket(socket, message) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function consumeTicket(payload) {
  const now = Date.now();
  for (const [jti, expiresAt] of usedTickets) {
    if (expiresAt <= now) usedTickets.delete(jti);
  }
  if (
    !payload?.jti
    || !payload?.sub
    || !Number.isFinite(payload.exp)
    || payload.scope !== 'interactive:run'
  ) return false;
  if (usedTickets.has(payload.jti) || usedTickets.size >= MAX_USED_TICKETS) return false;
  usedTickets.set(payload.jti, payload.exp * 1000);
  return true;
}

function attachInteractiveRunner(server) {
  const sockets = new WebSocketServer({
    noServer: true,
    maxPayload: MAX_CODE_LENGTH * 6 + 1024,
  });
  const allowedOrigin = process.env.RUNNER_ALLOWED_ORIGIN;

  server.on('upgrade', (request, socket, head) => {
    let pathname;
    try {
      pathname = new URL(request.url, 'http://localhost').pathname;
    } catch {
      socket.destroy();
      return;
    }
    if (pathname !== '/interactive') {
      socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }
    if (!allowedOrigin || request.headers.origin !== allowedOrigin) {
      socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }
    if (sockets.clients.size >= 50) {
      socket.write('HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }
    sockets.handleUpgrade(request, socket, head, (webSocket) => {
      sockets.emit('connection', webSocket);
    });
  });

  sockets.on('connection', (socket) => {
    let authorized = false;
    let started = false;
    let session = null;
    const executionController = new AbortController();
    let totalInputBytes = 0;
    const authTimer = setTimeout(() => socket.close(1008, 'Authentication required'), 5_000);

    socket.on('message', async (raw) => {
      let message;
      try {
        message = JSON.parse(raw.toString());
      } catch {
        sendSocket(socket, { type: 'error', message: 'Invalid runner message.' });
        socket.close(1003, 'Invalid message');
        return;
      }

      if (!authorized) {
        if (message.type !== 'authenticate' || typeof message.ticket !== 'string') {
          sendSocket(socket, { type: 'error', message: 'Runner authentication required.' });
          socket.close(1008, 'Authentication required');
          return;
        }
        try {
          const claims = verifyInteractiveTicket(message.ticket);
          if (!consumeTicket(claims)) throw new Error('Invalid or reused ticket');
          authorized = true;
          clearTimeout(authTimer);
          sendSocket(socket, { type: 'authorized' });
        } catch {
          sendSocket(socket, { type: 'error', message: 'Runner ticket is invalid or expired.' });
          socket.close(1008, 'Invalid ticket');
        }
        return;
      }

      if (message.type === 'start') {
        if (started || typeof message.code !== 'string' || message.code.length < 1 || message.code.length > MAX_CODE_LENGTH) {
          sendSocket(socket, { type: 'error', message: 'Invalid or duplicate run request.' });
          socket.close(1008, 'Invalid run request');
          return;
        }
        started = true;
        try {
          const result = await startInteractiveProgram({
            code: message.code,
            signal: executionController.signal,
            onOutput: (stream, data) => sendSocket(socket, { type: 'output', stream, data }),
          });
          sendSocket(socket, { type: 'compile', ...result.compile });
          if (!result.compile.ok) {
            sendSocket(socket, {
              type: 'exit',
              status: 'Compilation Error',
              exitCode: null,
              timeMs: 0,
            });
            socket.close(1000, 'Compilation failed');
            return;
          }
          session = result.session;
          if (socket.readyState !== WebSocket.OPEN) {
            session.stop();
            return;
          }
          sendSocket(socket, { type: 'ready' });
          session.finished.then((run) => {
            const status = run.timedOut
              ? 'Time Limit Exceeded'
              : run.outputExceeded
                ? 'Output Limit Exceeded'
                : run.memoryExceeded
                  ? 'Memory Limit Exceeded'
                  : run.exitCode === 0
                    ? 'Success'
                    : 'Runtime Error';
            sendSocket(socket, {
              type: 'exit',
              status,
              exitCode: run.exitCode,
              signal: run.signal,
              timeMs: run.timeMs,
            });
            if (socket.readyState === WebSocket.OPEN) socket.close(1000, 'Run complete');
          });
        } catch (error) {
          if (!executionController.signal.aborted) {
            console.error('Interactive runner execution failed:', error);
            sendSocket(socket, { type: 'error', message: 'The code runner could not start.' });
            socket.close(1011, 'Runner error');
          }
        }
        return;
      }

      if (!session) {
        sendSocket(socket, { type: 'error', message: 'Start a program before sending input.' });
        return;
      }
      if (message.type === 'input' && typeof message.data === 'string') {
        const bytes = Buffer.byteLength(message.data) + 1;
        if (totalInputBytes + bytes > MAX_STDIN_LENGTH) {
          sendSocket(socket, { type: 'error', message: `Input is limited to ${MAX_STDIN_LENGTH} bytes per run.` });
          session.stop();
          socket.close(1009, 'Input limit exceeded');
          return;
        }
        totalInputBytes += bytes;
        session.write(`${message.data}\n`);
      } else if (message.type === 'stop') {
        session.stop();
        session.closeInput();
      } else {
        sendSocket(socket, { type: 'error', message: 'Unsupported runner message.' });
        socket.close(1008, 'Unsupported message');
      }
    });

    socket.on('close', () => {
      clearTimeout(authTimer);
      executionController.abort();
      session?.stop();
    });
    socket.on('error', (error) => {
      console.error('Runner WebSocket error:', error.message);
      executionController.abort();
      session?.stop();
    });
  });
}

if (process.env.NODE_ENV === 'production') {
  for (const key of ['RUNNER_SERVICE_SECRET', 'RUNNER_TICKET_SECRET', 'RUNNER_ALLOWED_ORIGIN']) {
    if (!process.env[key]) throw new Error(`${key} is required in production.`);
  }
  if (Buffer.byteLength(process.env.RUNNER_SERVICE_SECRET) < 32) {
    throw new Error('RUNNER_SERVICE_SECRET must contain at least 32 bytes.');
  }
  if (Buffer.byteLength(process.env.RUNNER_TICKET_SECRET) < 32) {
    throw new Error('RUNNER_TICKET_SECRET must contain at least 32 bytes.');
  }
  try {
    const origin = new URL(process.env.RUNNER_ALLOWED_ORIGIN);
    if (origin.protocol !== 'https:' || origin.origin !== process.env.RUNNER_ALLOWED_ORIGIN) {
      throw new Error();
    }
  } catch {
    throw new Error('RUNNER_ALLOWED_ORIGIN must be an HTTPS origin without a path.');
  }
}

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({
  limit: MAX_REQUEST_BYTES,
  verify: (req, _res, buffer) => {
    req.rawBody = Buffer.from(buffer);
  },
}));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.post('/internal/v1/execute', authenticateRequest, async (req, res, next) => {
  const controller = new AbortController();
  res.once('close', () => {
    if (!res.writableEnded) controller.abort();
  });
  try {
    validateExecutionRequest(req.body);
    const result = await executeProgram({ ...req.body, signal: controller.signal });
    if (!controller.signal.aborted) res.json(result);
  } catch (error) {
    if (controller.signal.aborted || error.status === 499) return;
    if (error instanceof ExecutorError || error.status) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error('Runner service request failed:', error);
  const status = error.status === 413 ? 413 : error.status === 400 ? 400 : 500;
  const message = status === 413
    ? 'Execution request is too large.'
    : status === 400
      ? 'Execution request JSON is invalid.'
      : 'The execution service failed.';
  res.status(status).json({ message });
});

const server = createServer(app);
attachInteractiveRunner(server);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`VirVerse execution service listening on port ${PORT}`);
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
