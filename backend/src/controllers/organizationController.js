import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import ClassEnrollment from '../models/ClassEnrollment.js';
import ClassSection from '../models/ClassSection.js';
import Course from '../models/Course.js';
import Department from '../models/Department.js';
import Invitation from '../models/OrganizationInvitation.js';
import Membership from '../models/OrganizationMembership.js';
import OrganizationSubscription from '../models/OrganizationSubscription.js';
import Submission from '../models/Submission.js';
import Task from '../models/Task.js';
import TeacherAssignment from '../models/TeacherAssignment.js';
import User from '../models/User.js';
import { audit } from '../services/audit.js';
import { createInvitation } from '../services/invitation.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fail = (res, status, message) => res.status(status).json({ message });
const validId = mongoose.isValidObjectId;
const scoped = (req, filter = {}) => ({ ...filter, organization: req.org._id });
const limitPage = (query) => ({
  limit: Math.min(Math.max(Number(query.limit) || 50, 1), 100),
  page: Math.max(Number(query.page) || 1, 1),
});

async function activeTeacherClassIds(req) {
  const assignments = await TeacherAssignment.find(scoped(req, { teacher: req.user._id })).select('class').lean();
  return assignments.map((a) => a.class);
}

async function canAccessClass(req, classId) {
  if (req.orgRole === 'org_admin') return true;
  if (req.orgRole === 'teacher') {
    return Boolean(await TeacherAssignment.exists(scoped(req, { class: classId, teacher: req.user._id })));
  }
  return Boolean(await ClassEnrollment.exists(scoped(req, { class: classId, student: req.user._id, status: 'active' })));
}

async function getActiveSubscription(req) {
  const subscription = await OrganizationSubscription.findOne({ organization: req.org._id }).lean();
  if (!subscription) return null;
  if (subscription.status === 'trial') {
    return subscription.trialEndsAt && subscription.trialEndsAt > new Date() ? subscription : null;
  }
  if (subscription.status === 'active') {
    return !subscription.endsAt || subscription.endsAt > new Date() ? subscription : null;
  }
  return null;
}

async function ensureSeat(req, role) {
  const sub = await getActiveSubscription(req);
  if (!sub) return { ok: false, message: 'Organization subscription is inactive or expired' };
  const [used, pending] = await Promise.all([
    Membership.countDocuments(scoped(req, { role, status: 'active' })),
    Invitation.countDocuments(scoped(req, {
      role,
      acceptedAt: null,
      expiresAt: { $gt: new Date() },
    })),
  ]);
  const maximum = role === 'student' ? sub.studentSeats : sub.teacherSeats;
  return used + pending < maximum
    ? { ok: true }
    : { ok: false, message: `${role === 'student' ? 'Student' : 'Teacher'} seat limit reached` };
}

async function findActiveMembership(req, email, role) {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('name email createdAt');
  if (!user) return { user: null, membership: null };
  const membership = await Membership.findOne(scoped(req, {
    user: user._id,
    role,
    status: 'active',
  }));
  return { user, membership };
}

export async function getStructure(req, res) {
  let classIds;
  if (req.orgRole === 'teacher') {
    classIds = await activeTeacherClassIds(req);
  } else if (req.orgRole === 'student') {
    const enrollments = await ClassEnrollment.find(scoped(req, {
      student: req.user._id,
      status: 'active',
    })).select('class').lean();
    classIds = enrollments.map((e) => e.class);
  }

  const [departments, courses, classes, teachers, enrollments] = await Promise.all([
    Department.find(scoped(req)).sort({ name: 1 }).lean(),
    Course.find(scoped(req)).sort({ name: 1 }).lean(),
    ClassSection.find(scoped(req, classIds ? { _id: { $in: classIds } } : {}))
      .populate('course', 'name code department')
      .sort({ name: 1 })
      .lean(),
    TeacherAssignment.find(scoped(req, classIds ? { class: { $in: classIds } } : {}))
      .populate('teacher', 'name email')
      .lean(),
    ClassEnrollment.aggregate([
      { $match: scoped(req, { status: 'active' }) },
      { $group: { _id: '$class', count: { $sum: 1 } } },
    ]),
  ]);
  const enrollmentCount = new Map(enrollments.map((e) => [String(e._id), e.count]));
  res.json({
    departments,
    courses,
    classes: classes.map((item) => ({
      ...item,
      studentCount: enrollmentCount.get(String(item._id)) ?? 0,
      teachers: teachers.filter((t) => String(t.class) === String(item._id)).map((t) => t.teacher).filter(Boolean),
    })),
  });
}

export async function getSummary(req, res) {
  const teacherClassIds = req.orgRole === 'teacher' ? await activeTeacherClassIds(req) : null;
  const classFilter = teacherClassIds ? { class: { $in: teacherClassIds } } : {};
  const [studentMemberships, teachers, departments, courses, classCount, teacherAssignments, enrollments] = await Promise.all([
    Membership.find(scoped(req, { role: 'student', status: 'active' })).select('user').lean(),
    Membership.countDocuments(scoped(req, { role: 'teacher', status: 'active' })),
    req.orgRole === 'org_admin' ? Department.countDocuments(scoped(req)) : Promise.resolve(0),
    req.orgRole === 'org_admin' ? Course.countDocuments(scoped(req)) : Promise.resolve(0),
    ClassSection.countDocuments(scoped(req, teacherClassIds ? { _id: { $in: teacherClassIds } } : {})),
    TeacherAssignment.find(scoped(req, { ...classFilter, ...(teacherClassIds ? { teacher: req.user._id } : {}) })).select('teacher class').lean(),
    ClassEnrollment.find(scoped(req, { ...classFilter, status: 'active' })).select('student class').lean(),
  ]);
  const studentIds = studentMemberships.map((membership) => membership.user);
  const [acceptedByStudent, activeStudentRows] = studentIds.length
    ? await Promise.all([
        Submission.aggregate([
          { $match: { organization: req.org._id, user: { $in: studentIds }, status: 'Accepted' } },
          { $group: { _id: { user: '$user', task: '$task' } } },
          { $group: { _id: '$_id.user', solved: { $sum: 1 } } },
        ]),
        Submission.aggregate([
          { $match: { organization: req.org._id, user: { $in: studentIds }, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
          { $group: { _id: '$user' } },
        ]),
      ])
    : [[], []];
  const students = studentMemberships.length;
  const classStudents = new Map();
  for (const enrollment of enrollments) {
    const key = String(enrollment.class);
    const set = classStudents.get(key) ?? new Set();
    set.add(String(enrollment.student));
    classStudents.set(key, set);
  }
  const solvedMap = new Map(acceptedByStudent.map((row) => [String(row._id), row.solved]));
  const activeStudents = new Set(activeStudentRows.map((row) => String(row._id)));
  const studentsByTeacher = new Map();
  const classesByTeacher = new Map();
  for (const assignment of teacherAssignments) {
    const teacherId = String(assignment.teacher);
    const studentsForTeacher = studentsByTeacher.get(teacherId) ?? new Set();
    for (const studentId of classStudents.get(String(assignment.class)) ?? []) studentsForTeacher.add(studentId);
    studentsByTeacher.set(teacherId, studentsForTeacher);
    const teacherClasses = classesByTeacher.get(teacherId) ?? new Set();
    teacherClasses.add(String(assignment.class));
    classesByTeacher.set(teacherId, teacherClasses);
  }
  let teacherProfiles = [];
  if (req.orgRole === 'org_admin' || req.orgRole === 'teacher') {
    const teacherMemberships = await Membership.find(scoped(req, {
      role: 'teacher',
      status: 'active',
      ...(req.orgRole === 'teacher' ? { user: req.user._id } : {}),
    })).select('user').lean();
    const teacherIds = teacherMemberships.map((membership) => membership.user);
    const teacherUsers = await User.find({ _id: { $in: teacherIds } }).select('name email').lean();
    teacherProfiles = teacherUsers.map((teacher) => {
      const learnerIds = studentsByTeacher.get(String(teacher._id)) ?? new Set();
      const values = [...learnerIds].map((id) => solvedMap.get(id) ?? 0);
      return {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        classes: classesByTeacher.get(String(teacher._id))?.size ?? 0,
        studentsAssigned: learnerIds.size,
        studentsWithAcceptedWork: [...learnerIds].filter((id) => (solvedMap.get(id) ?? 0) > 0).length,
        activeStudentsLast30Days: [...learnerIds].filter((id) => activeStudents.has(id)).length,
        averageQuestionsSolved: values.length
          ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
          : 0,
      };
    }).sort((a, b) => b.studentsAssigned - a.studentsAssigned);
  }

  const teacherVisibleStudents = req.orgRole === 'teacher'
    ? studentsByTeacher.get(String(req.user._id)) ?? new Set()
    : null;
  res.json({
    organization: { id: req.org._id, name: req.org.name, role: req.orgRole },
    counts: {
      students: teacherVisibleStudents ? teacherVisibleStudents.size : students,
      teachers: req.orgRole === 'teacher' ? 1 : teachers,
      departments,
      courses,
      classes: classCount,
    },
    activeStudentsLast30Days: teacherVisibleStudents
      ? [...teacherVisibleStudents].filter((id) => activeStudents.has(id)).length
      : [...activeStudents].filter((id) => studentIds.some((studentId) => String(studentId) === id)).length,
    teacherPerformance: teacherProfiles,
  });
}

export async function createDepartment(req, res) {
  const { name, code, description = '' } = req.body;
  if (typeof name !== 'string' || !name.trim() || name.length > 100) return fail(res, 400, 'Department name is required');
  if (typeof code !== 'string' || !/^[A-Za-z0-9_-]{2,30}$/.test(code)) return fail(res, 400, 'Department code must be 2-30 letters, numbers, hyphens or underscores');
  const department = await Department.create({ ...scoped(req), name: name.trim(), code, description, });
  await audit(req, 'department.create', { targetType: 'Department', targetId: department._id });
  res.status(201).json({ department });
}

export async function createCourse(req, res) {
  const { name, code, departmentId, description = '' } = req.body;
  if (!validId(departmentId)) return fail(res, 400, 'Valid departmentId is required');
  const department = await Department.findOne(scoped(req, { _id: departmentId }));
  if (!department) return fail(res, 404, 'Department not found');
  if (typeof name !== 'string' || !name.trim() || name.length > 120) return fail(res, 400, 'Course name is required');
  if (typeof code !== 'string' || !/^[A-Za-z0-9_-]{2,30}$/.test(code)) return fail(res, 400, 'Course code must be 2-30 letters, numbers, hyphens or underscores');
  const course = await Course.create({ ...scoped(req), department: department._id, name: name.trim(), code, description });
  await audit(req, 'course.create', { targetType: 'Course', targetId: course._id });
  res.status(201).json({ course });
}

export async function createClass(req, res) {
  const { name, code, courseId, academicYear = '' } = req.body;
  if (!validId(courseId)) return fail(res, 400, 'Valid courseId is required');
  const course = await Course.findOne(scoped(req, { _id: courseId }));
  if (!course) return fail(res, 404, 'Course not found');
  if (typeof name !== 'string' || !name.trim() || name.length > 100) return fail(res, 400, 'Class name is required');
  if (typeof code !== 'string' || !/^[A-Za-z0-9_-]{2,30}$/.test(code)) return fail(res, 400, 'Class code must be 2-30 letters, numbers, hyphens or underscores');
  const section = await ClassSection.create({
    ...scoped(req), course: course._id, name: name.trim(), code, academicYear, createdBy: req.user._id,
  });
  await audit(req, 'class.create', { targetType: 'ClassSection', targetId: section._id });
  res.status(201).json({ class: section });
}

export async function inviteMember(req, res) {
  const { email, role } = req.body;
  if (!['teacher', 'student'].includes(role)) return fail(res, 400, 'Only teachers and students can be invited here');
  if (typeof email !== 'string' || !EMAIL.test(email)) return fail(res, 400, 'A valid email is required');
  const normalizedEmail = email.toLowerCase().trim();
  if (await Invitation.exists(scoped(req, {
    email: normalizedEmail,
    role,
    acceptedAt: null,
    expiresAt: { $gt: new Date() },
  }))) {
    return fail(res, 409, 'A pending invitation already exists for this email');
  }
  const existingUser = await User.findOne({ email: normalizedEmail }).select('_id');
  if (existingUser && await Membership.exists(scoped(req, { user: existingUser._id, status: 'active' }))) {
    return fail(res, 409, 'This user is already a member of the organization');
  }
  const reservation = await ensureSeat(req, role);
  if (!reservation.ok) return fail(res, 409, reservation.message);
  const invitation = await createInvitation({
    organization: req.org._id,
    email: normalizedEmail,
    role,
    invitedBy: req.user._id,
  });
  await audit(req, 'invitation.create', {
    targetType: 'OrganizationInvitation',
    metadata: { role, email: normalizedEmail },
  });
  res.status(201).json({ invitation });
}

export async function listPeople(req, res) {
  const role = req.query.role;
  if (role && !['teacher', 'student'].includes(role)) return fail(res, 400, 'role must be teacher or student');
  const { limit, page } = limitPage(req.query);
  const filter = scoped(req, { status: 'active', ...(role ? { role } : {}) });
  if (req.orgRole === 'teacher') {
    const classIds = await activeTeacherClassIds(req);
    const studentRows = await ClassEnrollment.find(scoped(req, {
      class: { $in: classIds },
      status: 'active',
    })).select('student').lean();
    const studentIds = [...new Set(studentRows.map((r) => String(r.student)))];
    filter.$or = [
      { user: req.user._id, role: 'teacher' },
      { user: { $in: studentIds }, role: 'student' },
    ];
  }

  const [memberships, total, classes, assignedClasses] = await Promise.all([
    Membership.find(filter)
      .populate('user', 'name email createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Membership.countDocuments(filter),
    ClassEnrollment.aggregate([
      { $match: scoped(req, { status: 'active' }) },
      { $group: { _id: '$student', count: { $sum: 1 } } },
    ]),
    TeacherAssignment.aggregate([
      { $match: scoped(req) },
      { $group: { _id: '$teacher', classes: { $addToSet: '$class' } } },
    ]),
  ]);
  const userIds = memberships.map((m) => m.user?._id).filter(Boolean);
  const classCounts = new Map(classes.map((r) => [String(r._id), r.count]));
  const assignedMap = new Map(assignedClasses.map((r) => [String(r._id), r.classes.length]));
  const [submissionStats, acceptedCounts, studentsByTeacher] = await Promise.all([
    Submission.aggregate([
      { $match: { organization: req.org._id, user: { $in: userIds } } },
      { $group: { _id: '$user', submissions: { $sum: 1 }, lastActivity: { $max: '$createdAt' } } },
    ]),
    Submission.aggregate([
      { $match: { organization: req.org._id, user: { $in: userIds }, status: 'Accepted' } },
      { $group: { _id: { user: '$user', task: '$task' } } },
      { $group: { _id: '$_id.user', solved: { $sum: 1 } } },
    ]),
    req.orgRole === 'org_admin'
      ? Promise.all([
          TeacherAssignment.find(scoped(req)).select('teacher class').lean(),
          ClassEnrollment.find(scoped(req, { status: 'active' })).select('student class').lean(),
        ])
      : Promise.resolve([[], []]),
  ]);
  const activityMap = new Map(submissionStats.map((r) => [String(r._id), r]));
  const solvedMap = new Map(acceptedCounts.map((r) => [String(r._id), r.solved]));
  const [teacherAssignmentsForCounts, enrollmentsForCounts] = studentsByTeacher;
  const studentIdsByClass = new Map();
  for (const enrollment of enrollmentsForCounts) {
    const key = String(enrollment.class);
    const studentSet = studentIdsByClass.get(key) ?? new Set();
    studentSet.add(String(enrollment.student));
    studentIdsByClass.set(key, studentSet);
  }
  const studentIdsByTeacher = new Map();
  for (const assignment of teacherAssignmentsForCounts) {
    const studentSet = studentIdsByTeacher.get(String(assignment.teacher)) ?? new Set();
    for (const studentId of studentIdsByClass.get(String(assignment.class)) ?? []) studentSet.add(studentId);
    studentIdsByTeacher.set(String(assignment.teacher), studentSet);
  }

  res.json({
    total,
    page,
    limit,
    items: memberships.filter((m) => m.user).map((m) => {
      const id = String(m.user._id);
      const activity = activityMap.get(id);
      return {
        id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        joinedAt: m.createdAt,
        lastActivity: activity?.lastActivity ?? null,
        submissions: activity?.submissions ?? 0,
        questionsSolved: solvedMap.get(id) ?? 0,
        classes: m.role === 'student' ? classCounts.get(id) ?? 0 : assignedMap.get(id) ?? 0,
        studentsAssigned: m.role === 'teacher' ? studentIdsByTeacher.get(id)?.size ?? 0 : undefined,
      };
    }),
  });
}

export async function getPersonProfile(req, res) {
  if (!validId(req.params.userId)) return fail(res, 404, 'User not found');
  const membership = await Membership.findOne(scoped(req, {
    user: req.params.userId,
    status: 'active',
  })).populate('user', 'name email createdAt');
  if (!membership?.user) return fail(res, 404, 'User not found');

  if (req.orgRole === 'teacher' && String(membership.user._id) !== String(req.user._id)) {
    const ownClasses = await activeTeacherClassIds(req);
    const enrolledInOwnClass = await ClassEnrollment.exists(scoped(req, {
      student: membership.user._id,
      class: { $in: ownClasses },
      status: 'active',
    }));
    if (!enrolledInOwnClass) return fail(res, 403, 'Access denied');
  }
  if (membership.role === 'org_admin' && req.orgRole !== 'org_admin') return fail(res, 403, 'Access denied');

  const [activity, solved, classNames, topicTotals] = await Promise.all([
    Submission.aggregate([
      { $match: { user: membership.user._id, organization: req.org._id } },
      { $group: { _id: null, submissions: { $sum: 1 }, lastActivity: { $max: '$createdAt' } } },
    ]),
    Submission.aggregate([
      { $match: { user: membership.user._id, organization: req.org._id, status: 'Accepted' } },
      { $group: { _id: '$task' } },
      { $lookup: { from: Task.collection.name, localField: '_id', foreignField: '_id', as: 'task' } },
      { $unwind: '$task' },
      { $group: { _id: '$task.category', solved: { $sum: 1 } } },
    ]),
    membership.role === 'student'
      ? ClassEnrollment.find(scoped(req, { student: membership.user._id, status: 'active' }))
          .populate({ path: 'class', select: 'name code', populate: { path: 'course', select: 'name code' } })
          .lean()
      : TeacherAssignment.find(scoped(req, { teacher: membership.user._id }))
          .populate('class', 'name code')
          .lean(),
    Task.aggregate([{ $group: { _id: '$category', total: { $sum: 1 } } }]),
  ]);
  const totals = new Map(topicTotals.map((item) => [item._id, item.total]));
  const progress = solved.map((item) => ({
    ...item,
    total: totals.get(item._id) ?? 0,
    percent: totals.get(item._id) ? Math.round((item.solved / totals.get(item._id)) * 100) : 0,
  }));
  res.json({
    profile: {
      id: membership.user._id,
      name: membership.user.name,
      email: membership.user.email,
      role: membership.role,
      joinedAt: membership.user.createdAt,
      submissions: activity[0]?.submissions ?? 0,
      lastActivity: activity[0]?.lastActivity ?? null,
      questionsSolved: solved.reduce((sum, row) => sum + row.solved, 0),
      topicProgress: progress,
      classes: classNames.map((item) => item.class).filter(Boolean),
    },
  });
}

export async function assignTeacher(req, res) {
  const { classId } = req.params;
  const { email } = req.body;
  if (!validId(classId)) return fail(res, 404, 'Class not found');
  if (typeof email !== 'string' || !EMAIL.test(email)) return fail(res, 400, 'A valid teacher email is required');
  const section = await ClassSection.findOne(scoped(req, { _id: classId }));
  if (!section) return fail(res, 404, 'Class not found');
  const { user, membership } = await findActiveMembership(req, email, 'teacher');
  if (!user || !membership) return fail(res, 404, 'Invite this teacher and have them accept before assigning them');
  await TeacherAssignment.updateOne(
    scoped(req, { class: section._id, teacher: user._id }),
    { $setOnInsert: { assignedBy: req.user._id } },
    { upsert: true }
  );
  await audit(req, 'class.teacher.assign', { targetType: 'ClassSection', targetId: section._id, metadata: { teacherId: user._id } });
  res.status(201).json({ message: 'Teacher assigned', teacher: { id: user._id, name: user.name, email: user.email } });
}

export async function enrollStudent(req, res) {
  const { classId } = req.params;
  const { email } = req.body;
  if (!validId(classId)) return fail(res, 404, 'Class not found');
  if (typeof email !== 'string' || !EMAIL.test(email)) return fail(res, 400, 'A valid student email is required');
  const section = await ClassSection.findOne(scoped(req, { _id: classId }));
  if (!section) return fail(res, 404, 'Class not found');
  const { user, membership } = await findActiveMembership(req, email, 'student');
  if (!user || !membership) return fail(res, 404, 'Invite this student and have them accept before enrolling them');
  const existing = await ClassEnrollment.exists(scoped(req, { class: section._id, student: user._id, status: 'active' }));
  if (!existing) {
    const reservation = await ensureSeat(req, 'student');
    if (!reservation.ok) return fail(res, 409, reservation.message);
  }
  await ClassEnrollment.updateOne(
    scoped(req, { class: section._id, student: user._id }),
    { $set: { status: 'active', enrolledBy: req.user._id } },
    { upsert: true }
  );
  await audit(req, 'class.student.enroll', { targetType: 'ClassSection', targetId: section._id, metadata: { studentId: user._id } });
  res.status(201).json({ message: 'Student enrolled', student: { id: user._id, name: user.name, email: user.email } });
}

export async function listClassMembers(req, res) {
  const { classId } = req.params;
  if (!validId(classId)) return fail(res, 404, 'Class not found');
  if (!await canAccessClass(req, classId)) return fail(res, 403, 'Access denied');
  const [students, teachers] = await Promise.all([
    ClassEnrollment.find(scoped(req, { class: classId, status: 'active' }))
      .populate('student', 'name email createdAt')
      .lean(),
    TeacherAssignment.find(scoped(req, { class: classId }))
      .populate('teacher', 'name email')
      .lean(),
  ]);
  res.json({
    students: students.filter((e) => e.student).map((e) => ({
      id: e.student._id, name: e.student.name, email: e.student.email, enrolledAt: e.createdAt,
    })),
    teachers: teachers.filter((a) => a.teacher).map((a) => ({
      id: a.teacher._id, name: a.teacher.name, email: a.teacher.email,
    })),
  });
}

export async function removePerson(req, res) {
  if (!validId(req.params.userId)) return fail(res, 404, 'Member not found');
  if (String(req.params.userId) === String(req.user._id)) return fail(res, 400, 'You cannot remove your own organization membership');
  const membership = await Membership.findOne(scoped(req, {
    user: req.params.userId,
    status: 'active',
  }));
  if (!membership) return fail(res, 404, 'Member not found');
  if (membership.role === 'org_admin') return fail(res, 403, 'Organization admin memberships cannot be removed here');

  membership.status = 'removed';
  await membership.save();
  const related = { organization: req.org._id };
  if (membership.role === 'teacher') {
    await TeacherAssignment.deleteMany({ ...related, teacher: membership.user });
  } else if (membership.role === 'student') {
    await ClassEnrollment.updateMany(
      { ...related, student: membership.user, status: 'active' },
      { $set: { status: 'removed' } }
    );
  }
  await audit(req, 'organization.member.remove', {
    targetType: 'User',
    targetId: membership.user,
    metadata: { role: membership.role },
  });
  res.json({ message: 'Member removed from organization' });
}
