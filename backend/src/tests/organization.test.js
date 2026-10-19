import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'organization-test-secret';
const uri = process.env.TEST_MONGO_URI_ORG || 'mongodb://127.0.0.1:27018/virvese-test-org';

const { default: authRoutes } = await import('../routes/authRoutes.js');
const { default: orgRoutes } = await import('../routes/orgRoutes.js');
const { default: taskRoutes } = await import('../routes/taskRoutes.js');
const { default: User } = await import('../models/User.js');
const { default: Organization } = await import('../models/Organization.js');
const { default: Membership } = await import('../models/OrganizationMembership.js');
const { default: Subscription } = await import('../models/OrganizationSubscription.js');
const { default: Department } = await import('../models/Department.js');
const { default: Course } = await import('../models/Course.js');
const { default: ClassSection } = await import('../models/ClassSection.js');
const { default: ClassEnrollment } = await import('../models/ClassEnrollment.js');
const { default: TeacherAssignment } = await import('../models/TeacherAssignment.js');
const { default: Task } = await import('../models/Task.js');
const { default: Assignment } = await import('../models/Assignment.js');
const { default: AssignmentTask } = await import('../models/AssignmentTask.js');
const { default: Submission } = await import('../models/Submission.js');

let server;
let base;
let org;
let secondOrg;
const users = {};
const cookies = {};

async function call(method, path, { user, organizationId, body } = {}) {
  const response = await fetch(base + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(user ? { cookie: cookies[user] } : {}),
      ...(organizationId ? { 'x-org-id': String(organizationId) } : {}),
    },
    body: body && method !== 'GET' ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

async function signup(name) {
  const result = await call('POST', '/api/auth/signup', {
    body: { name: name.toUpperCase(), email: `${name}@org.test`, password: 'password1' },
  });
  assert.equal(result.status, 201);
  cookies[name] = result.headers?.get?.('set-cookie');
}

before(async () => {
  await mongoose.connect(uri);
  await mongoose.connection.dropDatabase();
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRoutes);
  app.use('/api/orgs', orgRoutes);
  app.use('/api/tasks', taskRoutes);
  server = http.createServer(app).listen(0);
  base = `http://127.0.0.1:${server.address().port}`;

  for (const name of ['admin', 'teacher', 'student', 'other', 'standalone']) {
    const result = await fetch(base + '/api/auth/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: name.toUpperCase(), email: `${name}@org.test`, password: 'password1' }),
    });
    cookies[name] = result.headers.get('set-cookie').split(';')[0];
    users[name] = await User.findOne({ email: `${name}@org.test` });
  }

  org = await Organization.create({ name: 'North College', slug: 'north-college', status: 'active' });
  secondOrg = await Organization.create({ name: 'South College', slug: 'south-college', status: 'active' });
  await Subscription.create({
    organization: org._id, plan: 'standard', status: 'active', studentSeats: 10, teacherSeats: 5,
    features: ['c-programming', 'assignments'],
  });
  await Subscription.create({
    organization: secondOrg._id, plan: 'standard', status: 'active', studentSeats: 10, teacherSeats: 5,
    features: ['c-programming', 'assignments'],
  });
  await Membership.create([
    { user: users.admin._id, organization: org._id, role: 'org_admin' },
    { user: users.teacher._id, organization: org._id, role: 'teacher' },
    { user: users.student._id, organization: org._id, role: 'student' },
    { user: users.other._id, organization: secondOrg._id, role: 'org_admin' },
  ]);
  await Task.create([
    { slug: 'test-basics', title: 'Basics', category: 'basics', difficulty: 'Easy', description: 'Basics', exampleOutput: '0', starterCode: 'int main(void){}', testCases: [] },
    { slug: 'test-variables', title: 'Variables', category: 'variables', difficulty: 'Easy', description: 'Variables', exampleOutput: '0', starterCode: 'int main(void){}', testCases: [] },
  ]);
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.close();
});

test('standalone users can access only topic one; org members need their selected active org', async () => {
  let result = await call('GET', '/api/tasks', { user: 'standalone' });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.tasks.map((task) => task.category), ['basics']);
  assert.equal(result.body.categories.find((c) => c.slug === 'variables').locked, true);
  assert.equal((await call('GET', '/api/tasks/test-variables', { user: 'standalone' })).status, 403);
  assert.equal((await call('GET', '/api/tasks/test-basics', { user: 'standalone' })).status, 200);

  result = await call('GET', '/api/tasks', { user: 'student' });
  assert.deepEqual(result.body.tasks.map((task) => task.category), ['basics']);
  result = await call('GET', '/api/tasks', { user: 'student', organizationId: org._id });
  assert.deepEqual(result.body.tasks.map((task) => task.category).sort(), ['basics', 'variables']);
  assert.equal((await call('GET', '/api/tasks', { user: 'student', organizationId: secondOrg._id })).status, 403);
});

test('organization admins can build departments, courses and classes', async () => {
  const organizationId = org._id;
  let result = await call('POST', '/api/orgs/departments', {
    user: 'admin', organizationId, body: { name: 'Computer Science', code: 'CS' },
  });
  assert.equal(result.status, 201);
  const departmentId = result.body.department._id;
  result = await call('POST', '/api/orgs/courses', {
    user: 'admin', organizationId, body: { name: 'BCA', code: 'BCA', departmentId },
  });
  assert.equal(result.status, 201);
  const courseId = result.body.course._id;
  result = await call('POST', '/api/orgs/classes', {
    user: 'admin', organizationId, body: { name: 'Section A', code: 'A', courseId },
  });
  assert.equal(result.status, 201);
  assert.equal((await call('POST', '/api/orgs/departments', {
    user: 'teacher', organizationId, body: { name: 'Blocked', code: 'NO' },
  })).status, 403);
  assert.equal((await call('POST', '/api/orgs/courses', {
    user: 'admin', organizationId: secondOrg._id, body: { name: 'Cross org', code: 'X', departmentId },
  })).status, 403);
});

test('only authorized teachers see assigned students; admins see teacher performance counts', async () => {
  const department = await Department.findOne({ organization: org._id });
  const course = await Course.findOne({ organization: org._id, department: department._id });
  const section = await ClassSection.findOne({ organization: org._id, course: course._id });
  await TeacherAssignment.create({ organization: org._id, class: section._id, teacher: users.teacher._id, assignedBy: users.admin._id });
  await ClassEnrollment.create({ organization: org._id, class: section._id, student: users.student._id, enrolledBy: users.admin._id });

  let result = await call('GET', '/api/orgs/people?role=student', { user: 'teacher', organizationId: org._id });
  assert.equal(result.status, 200);
  assert.equal(result.body.total, 1);
  result = await call('GET', '/api/orgs/people?role=teacher', { user: 'admin', organizationId: org._id });
  assert.equal(result.status, 200);
  assert.equal(result.body.items[0].studentsAssigned, 1);
  result = await call('GET', '/api/orgs/summary', { user: 'admin', organizationId: org._id });
  assert.equal(result.status, 200);
  assert.equal(result.body.teacherPerformance[0].studentsAssigned, 1);
  assert.equal((await call('GET', '/api/orgs/people?role=student', { user: 'teacher', organizationId: secondOrg._id })).status, 403);
  assert.equal((await call('GET', `/api/orgs/people/${users.student._id}`, { user: 'teacher', organizationId: org._id })).status, 200);
  assert.equal((await call('GET', `/api/orgs/people/${users.admin._id}`, { user: 'teacher', organizationId: org._id })).status, 403);
  assert.equal((await call('GET', `/api/orgs/classes/${section._id}/members`, { user: 'teacher', organizationId: org._id })).status, 200);
  assert.equal((await call('GET', `/api/orgs/classes/${section._id}/members`, { user: 'other', organizationId: secondOrg._id })).status, 403);
});

test('organization invitations reserve seats and users can be enrolled by email', async () => {
  const orgId = org._id;
  const noSeatOrg = await Organization.create({ name: 'Small College', slug: 'small-college', status: 'active' });
  await Subscription.create({
    organization: noSeatOrg._id, plan: 'standard', status: 'active', studentSeats: 1, teacherSeats: 1,
    features: ['c-programming'],
  });
  await Membership.create({ user: users.admin._id, organization: noSeatOrg._id, role: 'org_admin' });
  assert.equal((await call('POST', '/api/orgs/invitations', {
    user: 'admin', organizationId: noSeatOrg._id, body: { email: 'first@org.test', role: 'student' },
  })).status, 201);
  assert.equal((await call('POST', '/api/orgs/invitations', {
    user: 'admin', organizationId: noSeatOrg._id, body: { email: 'second@org.test', role: 'student' },
  })).status, 409);

  const section = await ClassSection.findOne({ organization: orgId });
  const enrolled = await call('POST', `/api/orgs/classes/${section._id}/students`, {
    user: 'admin', organizationId: orgId, body: { email: users.student.email },
  });
  assert.equal(enrolled.status, 201);
  assert.equal(await ClassEnrollment.countDocuments({ organization: orgId, class: section._id, student: users.student._id, status: 'active' }), 1);
  assert.equal((await call('POST', `/api/orgs/classes/${section._id}/students`, {
    user: 'admin', organizationId: orgId, body: { email: users.standalone.email },
  })).status, 404);
  assert.equal((await call('DELETE', `/api/orgs/people/${users.student._id}`, { user: 'admin', organizationId: orgId })).status, 200);
  assert.equal(await Membership.exists({ organization: orgId, user: users.student._id, status: 'active' }), false);
});

test('teachers create and publish class assignments; students see accurate unique completion and late status', async () => {
  await Membership.updateOne(
    { user: users.student._id, organization: org._id },
    { $set: { role: 'student', status: 'active' } },
    { upsert: true }
  );
  const classSection = await ClassSection.findOne({ organization: org._id });
  const taskRows = await Task.find({ slug: { $in: ['test-basics', 'test-variables'] } }).sort({ category: 1 }).lean();
  assert.equal(taskRows.length, 2);

  const created = await call('POST', '/api/orgs/assignments', {
    user: 'teacher',
    organizationId: org._id,
    body: {
      classId: classSection._id,
      title: 'C fundamentals - week one',
      description: 'Complete both questions.',
      taskIds: taskRows.map((task) => task._id),
      startsAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      dueAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'draft',
    },
  });
  assert.equal(created.status, 201);
  const assignmentId = created.body.assignment.id;
  assert.equal(created.body.assignment.status, 'draft');

  assert.equal((await call('POST', '/api/orgs/assignments', {
    user: 'teacher',
    organizationId: secondOrg._id,
    body: { classId: classSection._id, title: 'Cross tenant', taskIds: taskRows.map((t) => t._id), startsAt: new Date().toISOString(), dueAt: new Date(Date.now() + 86400000).toISOString() },
  })).status, 403);

  const published = await call('POST', `/api/orgs/assignments/${assignmentId}/publish`, {
    user: 'teacher', organizationId: org._id,
  });
  assert.equal(published.status, 200);
  assert.equal(published.body.assignment.status, 'published');

  await Submission.create([
    {
      organization: org._id, user: users.student._id, task: taskRows[0]._id, assignment: assignmentId,
      code: 'x', status: 'Accepted', passedCount: 1, totalCount: 1,
      createdAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      organization: org._id, user: users.student._id, task: taskRows[0]._id, assignment: assignmentId,
      code: 'x', status: 'Accepted', passedCount: 1, totalCount: 1,
      createdAt: new Date(Date.now() - 2 * 86400000 + 1000),
    },
    {
      organization: org._id, user: users.student._id, task: taskRows[1]._id, assignment: assignmentId,
      code: 'x', status: 'Accepted', passedCount: 1, totalCount: 1,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  ]);
  const studentView = await call('GET', `/api/orgs/assignments/${assignmentId}`, {
    user: 'student', organizationId: org._id,
  });
  assert.equal(studentView.status, 200);
  assert.equal(studentView.body.assignment.progress.solved, 2);
  assert.equal(studentView.body.assignment.progress.state, 'completed-late');
  assert.equal(studentView.body.assignment.tasks.filter((t) => t.completed).length, 2);

  const teacherView = await call('GET', `/api/orgs/assignments/${assignmentId}`, {
    user: 'teacher', organizationId: org._id,
  });
  assert.equal(teacherView.body.assignment.progress.completed, 1);
  assert.equal(teacherView.body.assignment.progress.late, 1);
  assert.equal(teacherView.body.assignment.progress.students[0].solved, 2);
  const studentList = await call('GET', '/api/orgs/assignments', { user: 'student', organizationId: org._id });
  assert.equal(studentList.body.items.length, 1);
  assert.equal((await call('GET', `/api/orgs/assignments/${assignmentId}`, {
    user: 'other', organizationId: secondOrg._id,
  })).status, 404);
  assert.equal((await call('GET', '/api/orgs/question-bank', {
    user: 'student', organizationId: org._id,
  })).status, 403);
  assert.ok(await Assignment.exists({ _id: assignmentId, organization: org._id }));
  assert.equal(await AssignmentTask.countDocuments({ assignment: assignmentId }), 2);
});
