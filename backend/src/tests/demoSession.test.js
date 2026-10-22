import assert from 'node:assert/strict';
import { test } from 'node:test';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { startDemoSession } from '../controllers/authController.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'demo-session-test-secret-with-sufficient-length';

test('starting a demo creates an isolated 24-hour account and session', async () => {
  const originalCreate = User.create;
  const createdUsers = [];
  User.create = async (details) => {
    createdUsers.push(details);
    return {
      _id: `demo-user-${createdUsers.length}`,
      toSafeObject: () => ({
        isDemo: details.isDemo,
        demoExpiresAt: details.demoExpiresAt,
      }),
    };
  };

  const makeResponse = () => ({
    statusCode: 200,
    headers: {},
    cookieValue: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    cookie(name, value, options) {
      this.cookieValue = { name, value, options };
      return this;
    },
    set(name, value) {
      this.headers[name] = value;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  });

  try {
    const firstResponse = makeResponse();
    const secondResponse = makeResponse();
    await startDemoSession({}, firstResponse);
    await startDemoSession({}, secondResponse);

    assert.equal(createdUsers.length, 2);
    assert.notEqual(createdUsers[0].email, createdUsers[1].email);
    assert.equal(createdUsers[0].isDemo, true);
    assert.equal(firstResponse.statusCode, 201);
    assert.equal(firstResponse.headers['Cache-Control'], 'no-store');
    assert.equal(firstResponse.cookieValue.options.maxAge, 24 * 60 * 60 * 1000);
    assert.equal(firstResponse.body.user.isDemo, true);
    const claims = jwt.verify(firstResponse.cookieValue.value, process.env.JWT_SECRET);
    assert.equal(claims.id, 'demo-user-1');
    assert.ok(Math.abs(createdUsers[0].demoExpiresAt.getTime() - claims.exp * 1000) < 1000);
  } finally {
    User.create = originalCreate;
  }
});
