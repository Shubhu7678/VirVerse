import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';

const ISSUER = 'virvese-api';
const AUDIENCE = 'virvese-runner';
const TICKET_TTL_SECONDS = 30;

function ticketSecret() {
  const secret = process.env.RUNNER_TICKET_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('RUNNER_TICKET_SECRET must contain at least 32 bytes.');
  }
  return secret;
}

export function createInteractiveTicket(userId) {
  const ticket = jwt.sign(
    { scope: 'interactive:run', jti: randomUUID() },
    ticketSecret(),
    {
      subject: String(userId),
      issuer: ISSUER,
      audience: AUDIENCE,
      expiresIn: TICKET_TTL_SECONDS,
      algorithm: 'HS256',
    },
  );
  return { ticket, expiresInSeconds: TICKET_TTL_SECONDS };
}

export function verifyInteractiveTicket(ticket, now) {
  return jwt.verify(ticket, ticketSecret(), {
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithms: ['HS256'],
    clockTimestamp: now ? Math.floor(now / 1000) : undefined,
  });
}
