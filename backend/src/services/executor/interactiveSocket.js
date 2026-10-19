import jwt from 'jsonwebtoken';
import { WebSocketServer, WebSocket } from 'ws';
import User from '../../models/User.js';
import { COOKIE_NAME } from '../../utils/token.js';
import { MAX_CODE_LENGTH, MAX_STDIN_LENGTH } from './limits.js';
import { ExecutorError, startInteractiveProgram } from './index.js';

const SOCKET_PATH = '/api/execute/interactive';
const RUNS_PER_MINUTE = 20;
const recentRuns = new Map();

function rejectUpgrade(socket, status, message) {
  socket.write(`HTTP/1.1 ${status} ${message}\r\nConnection: close\r\n\r\n`);
  socket.destroy();
}

function getCookie(request, name) {
  return request.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function allowRun(userId) {
  const now = Date.now();
  const timestamps = (recentRuns.get(userId) || []).filter((time) => now - time < 60_000);
  if (timestamps.length >= RUNS_PER_MINUTE) {
    recentRuns.set(userId, timestamps);
    return false;
  }
  timestamps.push(now);
  recentRuns.set(userId, timestamps);
  for (const [id, runs] of recentRuns) {
    if (runs.every((time) => now - time >= 60_000)) recentRuns.delete(id);
  }
  return true;
}

function send(socket, message) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

export function attachInteractiveExecution(server) {
  const sockets = new WebSocketServer({ noServer: true, maxPayload: MAX_CODE_LENGTH * 4 + 1024 });

  server.on('upgrade', async (request, socket, head) => {
    let pathname;
    try {
      pathname = new URL(request.url, 'http://localhost').pathname;
    } catch {
      rejectUpgrade(socket, '400 Bad Request', 'Bad Request');
      return;
    }
    if (pathname !== SOCKET_PATH) {
      rejectUpgrade(socket, '404 Not Found', 'Not Found');
      return;
    }
    if (!process.env.CLIENT_URL || request.headers.origin !== process.env.CLIENT_URL) {
      rejectUpgrade(socket, '403 Forbidden', 'Forbidden');
      return;
    }

    try {
      const token = getCookie(request, COOKIE_NAME);
      if (!token) {
        rejectUpgrade(socket, '401 Unauthorized', 'Unauthorized');
        return;
      }
      const { id } = jwt.verify(decodeURIComponent(token), process.env.JWT_SECRET);
      const user = await User.findById(id).select('_id');
      if (!user) {
        rejectUpgrade(socket, '401 Unauthorized', 'Unauthorized');
        return;
      }
      if (!allowRun(String(user._id))) {
        rejectUpgrade(socket, '429 Too Many Requests', 'Too Many Requests');
        return;
      }

      request.virveseUserId = String(user._id);
      sockets.handleUpgrade(request, socket, head, (webSocket) => {
        sockets.emit('connection', webSocket, request);
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error instanceof URIError) {
        rejectUpgrade(socket, '401 Unauthorized', 'Unauthorized');
        return;
      }
      console.error('Interactive runner authentication failed:', error);
      rejectUpgrade(socket, '500 Internal Server Error', 'Internal Server Error');
    }
  });

  sockets.on('connection', (socket) => {
    let started = false;
    let session = null;
    let totalInput = 0;
    const idleTimer = setTimeout(() => {
      if (!started) socket.close(1008, 'No run started');
    }, 15_000);

    socket.on('message', async (raw) => {
      let message;
      try {
        message = JSON.parse(raw.toString());
      } catch {
        send(socket, { type: 'error', message: 'Invalid runner message.' });
        socket.close(1003, 'Invalid message');
        return;
      }

      if (message.type === 'start') {
        if (started || typeof message.code !== 'string' || message.code.length < 1 || message.code.length > MAX_CODE_LENGTH) {
          send(socket, { type: 'error', message: 'Invalid or duplicate run request.' });
          socket.close(1008, 'Invalid run request');
          return;
        }
        started = true;
        clearTimeout(idleTimer);
        try {
          const result = await startInteractiveProgram({
            code: message.code,
            onOutput: (stream, data) => send(socket, { type: 'output', stream, data }),
          });
          send(socket, { type: 'compile', ...result.compile });
          if (!result.compile.ok) {
            send(socket, { type: 'exit', status: 'Compilation Error' });
            socket.close(1000, 'Compilation failed');
            return;
          }
          session = result.session;
          if (socket.readyState !== WebSocket.OPEN) {
            session.stop();
            return;
          }
          send(socket, { type: 'ready' });
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
            send(socket, {
              type: 'exit',
              status,
              exitCode: run.exitCode,
              signal: run.signal,
              timeMs: run.timeMs,
            });
            if (socket.readyState === WebSocket.OPEN) socket.close(1000, 'Run complete');
          });
        } catch (error) {
          const messageText = error instanceof ExecutorError ? error.message : 'The code runner could not start.';
          if (!(error instanceof ExecutorError)) console.error('Interactive code execution failed:', error);
          send(socket, { type: 'error', message: messageText });
          socket.close(1011, 'Runner error');
        }
        return;
      }

      if (!session) {
        send(socket, { type: 'error', message: 'Start a program before sending input.' });
        return;
      }
      if (message.type === 'input' && typeof message.data === 'string') {
        const inputBytes = Buffer.byteLength(message.data);
        if (totalInput + inputBytes > MAX_STDIN_LENGTH) {
          send(socket, { type: 'error', message: `Input is limited to ${MAX_STDIN_LENGTH} bytes per run.` });
          return;
        }
        totalInput += inputBytes;
        session.write(`${message.data}\n`);
      } else if (message.type === 'end') {
        session.closeInput();
      } else if (message.type === 'stop') {
        session.stop();
        session.closeInput();
      } else {
        send(socket, { type: 'error', message: 'Unsupported runner message.' });
      }
    });

    socket.on('close', () => {
      clearTimeout(idleTimer);
      session?.stop();
    });
    socket.on('error', (error) => {
      console.error('Interactive runner socket error:', error.message);
      session?.stop();
    });
  });
}
