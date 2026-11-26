import assert from 'node:assert/strict';
import { test } from 'node:test';
import mongoose from 'mongoose';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { login } from '../controllers/authController.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'sign-in-log-test-secret-with-sufficient-length';

const makeResponse = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this },
  cookie() { return this },
  json(body) { this.body = body; return this },
});

function stubStudent(overrides = {}) {
  const user = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Mohit',
    platformRole: null,
    isDemo: false,
    disabled: false,
    comparePassword: async () => true,
    toSafeObject: () => ({ name: 'Mohit' }),
    ...overrides,
  };
  User.findOne = () => ({ select: async () => user });
  return user;
}

test('a student sign-in is logged, but only once an hour', async () => {
  const original = { findOne: User.findOne, exists: ActivityLog.exists, create: ActivityLog.create };
  const logged = [];
  let recentlyLogged = false;
  ActivityLog.exists = async () => recentlyLogged;
  ActivityLog.create = async (entry) => { logged.push(entry) };

  try {
    const user = stubStudent();
    await login({ body: { email: 'mohit@example.com', password: 'secret' } }, makeResponse());
    await new Promise((resolve) => setImmediate(resolve)); // the log is written after the response
    assert.equal(logged.length, 1);
    assert.equal(logged[0].type, 'student.login');
    assert.equal(logged[0].message, 'Mohit signed in');
    assert.equal(logged[0].target, user._id);

    recentlyLogged = true;
    await login({ body: { email: 'mohit@example.com', password: 'secret' } }, makeResponse());
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(logged.length, 1, 'a second sign-in within the hour adds nothing');
  } finally {
    User.findOne = original.findOne;
    ActivityLog.exists = original.exists;
    ActivityLog.create = original.create;
  }
})

test('an admin sign-in is not logged, and a failed sign-in never is', async () => {
  const original = { findOne: User.findOne, exists: ActivityLog.exists, create: ActivityLog.create };
  const logged = [];
  ActivityLog.exists = async () => false;
  ActivityLog.create = async (entry) => { logged.push(entry) };

  try {
    stubStudent({ platformRole: 'super_admin' });
    await login({ body: { email: 'admin@example.com', password: 'secret' } }, makeResponse());
    stubStudent({ comparePassword: async () => false });
    const failed = makeResponse();
    await login({ body: { email: 'mohit@example.com', password: 'wrong' } }, failed);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(failed.statusCode, 401);
    assert.equal(logged.length, 0);
  } finally {
    User.findOne = original.findOne;
    ActivityLog.exists = original.exists;
    ActivityLog.create = original.create;
  }
})
