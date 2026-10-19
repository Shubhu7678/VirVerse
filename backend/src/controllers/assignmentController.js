import mongoose from 'mongoose';
import Assignment from '../models/Assignment.js';
import AssignmentTask from '../models/AssignmentTask.js';
import ClassEnrollment from '../models/ClassEnrollment.js';
import ClassSection from '../models/ClassSection.js';
import Membership from '../models/OrganizationMembership.js';
import Submission from '../models/Submission.js';
import Task from '../models/Task.js';
import TeacherAssignment from '../models/TeacherAssignment.js';
import User from '../models/User.js';
import { audit } from '../services/audit.js';
import { hasFeatureAccess } from '../services/subscriptionAccess.js';

const fail = (res, status, message) => res.status(status).json({ message });
const validId = mongoose.isValidObjectId;
const scoped = (req, filter = {}) => ({ ...filter, organization: req.org._id });
const pageArgs = (query) => ({
  limit: Math.min(Math.max(Number(query.limit) || 25, 1), 100),
  page: Math.max(Number(query.page) || 1, 1),
});

async function canTeachClass(req, classId) {
  if (req.orgRole === 'org_admin') return true;
  return Boolean(await TeacherAssignment.exists(scoped(req, {
    class: classId,
    teacher: req.user._id,
  })));
}

async function hasAssignmentEntitlement(req) {
  return hasFeatureAccess(req.org._id, ['assignments', 'basic-assignments']);
}

async function validateTaskIds(req, taskIds) {
  if (!Array.isArray(taskIds) || taskIds.length < 1 || taskIds.length > 100) {
    return { error: 'Select between 1 and 100 questions' };
  }
  if (taskIds.some((id) => typeof id !== 'string' || !validId(id))) return { error: 'Invalid question selected' };
  const uniqueIds = [...new Set(taskIds.map(String))];
  if (uniqueIds.length !== taskIds.length) return { error: 'Questions cannot be duplicated' };
  const tasks = await Task.find({ _id: { $in: uniqueIds } }).select('_id category title slug difficulty').lean();
  if (tasks.length !== uniqueIds.length) return { error: 'One or more questions no longer exist' };
  return { tasks, orderedIds: uniqueIds };
}

async function tasksForAssignment(assignment) {
  return AssignmentTask.find({
    organization: assignment.organization,
    assignment: assignment._id,
  })
    .sort({ order: 1 })
    .populate('task', 'title slug category difficulty')
    .lean();
}

async function studentIdsForAssignment(assignment) {
  const students = await ClassEnrollment.find({
    organization: assignment.organization,
    class: assignment.class,
    status: 'active',
  }).select('student').lean();
  return students.map((item) => item.student);
}

async function assignmentProgress(assignment, taskRows, studentIds, currentUserId) {
  const taskIds = taskRows.map((row) => row.task?._id).filter(Boolean);
  if (!studentIds.length || !taskIds.length) {
    return {
      totalStudents: studentIds.length,
      started: 0,
      completed: 0,
      notStarted: studentIds.length,
      partial: 0,
      late: 0,
      completionPercent: 0,
      students: [],
    };
  }

  const accepted = await Submission.aggregate([
    {
      $match: {
        organization: assignment.organization,
        user: { $in: studentIds },
        task: { $in: taskIds },
        status: 'Accepted',
        createdAt: { $gte: assignment.startsAt },
      },
    },
    { $group: { _id: { student: '$user', task: '$task' }, acceptedAt: { $min: '$createdAt' } } },
  ]);
  const startedRows = await Submission.aggregate([
    {
      $match: {
        organization: assignment.organization,
        user: { $in: studentIds },
        task: { $in: taskIds },
        createdAt: { $gte: assignment.startsAt },
      },
    },
    { $group: { _id: '$user', lastActivity: { $max: '$createdAt' } } },
  ]);
  const startedByStudent = new Map(startedRows.map((row) => [String(row._id), row.lastActivity]));
  const solvedByStudent = new Map();
  for (const row of accepted) {
    const studentId = String(row._id.student);
    const solved = solvedByStudent.get(studentId) ?? new Map();
    solved.set(String(row._id.task), row.acceptedAt);
    solvedByStudent.set(studentId, solved);
  }

  const people = await User.find({ _id: { $in: studentIds } }).select('name email').lean();
  const peopleById = new Map(people.map((person) => [String(person._id), person]));
  const students = studentIds.map((studentId) => {
    const id = String(studentId);
    const solved = solvedByStudent.get(id) ?? new Map();
    const solvedCount = solved.size;
    const complete = solvedCount >= taskIds.length;
    const late = complete && [...solved.values()].some((acceptedAt) => acceptedAt > assignment.dueAt);
    const lastActivity = startedByStudent.get(id) ?? null;
    const started = startedByStudent.has(id);
    return {
      id,
      name: peopleById.get(id)?.name ?? 'Student',
      email: peopleById.get(id)?.email,
      solved: solvedCount,
      required: taskIds.length,
      percent: Math.round((solvedCount / taskIds.length) * 100),
      state: complete ? (late ? 'completed-late' : 'completed') : started ? 'in-progress' : 'not-started',
      lastActivity,
      ...(id === String(currentUserId) ? { solvedTaskIds: [...solved.keys()] } : {}),
    };
  });
  const completed = students.filter((student) => student.state === 'completed' || student.state === 'completed-late').length;
  return {
    totalStudents: students.length,
    started: students.filter((student) => student.state !== 'not-started').length,
    completed,
    notStarted: students.filter((student) => student.state === 'not-started').length,
    partial: students.filter((student) => student.state === 'in-progress').length,
    late: students.filter((student) => student.state === 'completed-late').length,
    completionPercent: students.length ? Math.round((completed / students.length) * 100) : 0,
    students,
  };
}

async function assignmentView(req, assignment, { includeStudents = false } = {}) {
  const taskRows = await tasksForAssignment(assignment);
  const classInfo = await ClassSection.findOne({
    _id: assignment.class,
    organization: req.org._id,
  }).select('name code').lean();
  const students = await studentIdsForAssignment(assignment);
  const progress = await assignmentProgress(assignment, taskRows, students, req.user._id);
  const ownProgress = progress.students.find((student) => student.id === String(req.user._id));
  return {
    id: assignment._id,
    title: assignment.title,
    description: assignment.description,
    language: assignment.language,
    status: assignment.status,
    startsAt: assignment.startsAt,
    dueAt: assignment.dueAt,
    publishedAt: assignment.publishedAt,
    class: classInfo,
    teacher: req.orgRole === 'student' ? undefined : await User.findById(assignment.teacher).select('name email').lean(),
    tasks: taskRows.map((row) => ({
      id: row.task?._id,
      slug: row.task?.slug,
      title: row.task?.title,
      category: row.task?.category,
      difficulty: row.task?.difficulty,
      order: row.order,
      completed: ownProgress?.solvedTaskIds?.includes(String(row.task?._id)) ?? false,
    })),
    progress: req.orgRole === 'student' ? ownProgress ?? {
      id: String(req.user._id), solved: 0, required: taskRows.length, percent: 0, state: 'not-started',
    } : {
      totalStudents: progress.totalStudents,
      started: progress.started,
      completed: progress.completed,
      notStarted: progress.notStarted,
      partial: progress.partial,
      late: progress.late,
      completionPercent: progress.completionPercent,
      ...(includeStudents ? { students: progress.students } : {}),
    },
  };
}

export async function questionBank(req, res) {
  const filter = {};
  if (typeof req.query.category === 'string' && req.query.category) filter.category = req.query.category;
  if (typeof req.query.search === 'string' && req.query.search.trim()) {
    const escaped = req.query.search.trim().slice(0, 60).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.title = new RegExp(escaped, 'i');
  }
  const { limit, page } = pageArgs(req.query);
  const [items, total] = await Promise.all([
    Task.find(filter).select('title slug category difficulty').sort({ category: 1, questionOrder: 1, order: 1 })
      .skip((page - 1) * limit).limit(limit).lean(),
    Task.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit });
}

export async function createAssignment(req, res) {
  const { classId, title, description = '', taskIds, startsAt, dueAt, status = 'draft' } = req.body;
  if (!validId(classId)) return fail(res, 400, 'Select a valid class');
  if (typeof title !== 'string' || !title.trim() || title.length > 160) return fail(res, 400, 'Title is required');
  if (typeof description !== 'string' || description.length > 4000) return fail(res, 400, 'Description is too long');
  if (!['draft', 'published'].includes(status)) return fail(res, 400, 'Status must be draft or published');
  const start = new Date(startsAt);
  const due = new Date(dueAt);
  if (!startsAt || !dueAt || Number.isNaN(start.valueOf()) || Number.isNaN(due.valueOf()) || start >= due) {
    return fail(res, 400, 'Choose valid start and due dates; due date must be after the start date');
  }
  if (!await hasAssignmentEntitlement(req)) return fail(res, 403, 'Your organization plan does not currently allow assignment creation');
  const section = await ClassSection.findOne(scoped(req, { _id: classId }));
  if (!section) return fail(res, 404, 'Class not found');
  if (!await canTeachClass(req, section._id)) return fail(res, 403, 'You are not assigned to this class');
  const validated = await validateTaskIds(req, taskIds);
  if (validated.error) return fail(res, 400, validated.error);
  const assignment = await Assignment.create({
    ...scoped(req),
    class: section._id,
    teacher: req.user._id,
    title: title.trim(),
    description: description.trim(),
    language: 'c',
    startsAt: start,
    dueAt: due,
    status,
    publishedAt: status === 'published' ? new Date() : null,
  });
  try {
    await AssignmentTask.insertMany(validated.orderedIds.map((taskId, order) => ({
      organization: req.org._id,
      assignment: assignment._id,
      task: taskId,
      order,
    })));
  } catch (err) {
    await AssignmentTask.deleteMany({ assignment: assignment._id, organization: req.org._id });
    await Assignment.deleteOne({ _id: assignment._id, organization: req.org._id });
    throw err;
  }
  await audit(req, 'assignment.create', { targetType: 'Assignment', targetId: assignment._id });
  res.status(201).json({ assignment: await assignmentView(req, assignment) });
}

export async function listAssignments(req, res) {
  const now = new Date();
  const { limit, page } = pageArgs(req.query);
  let filter = scoped(req);
  if (req.orgRole === 'teacher') {
    const teacherClasses = await TeacherAssignment.find(scoped(req, { teacher: req.user._id })).distinct('class');
    filter.class = { $in: teacherClasses };
  } else if (req.orgRole === 'student') {
    const enrolledClasses = await ClassEnrollment.find(scoped(req, {
      student: req.user._id,
      status: 'active',
    })).distinct('class');
    filter = scoped(req, {
      class: { $in: enrolledClasses },
      status: 'published',
      startsAt: { $lte: now },
    });
  }
  if (req.query.status && req.orgRole !== 'student') {
    if (!['draft', 'published'].includes(req.query.status)) return fail(res, 400, 'status must be draft or published');
    filter.status = req.query.status;
  }
  const [items, total] = await Promise.all([
    Assignment.find(filter).sort({ dueAt: 1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Assignment.countDocuments(filter),
  ]);
  const result = await Promise.all(items.map((item) => assignmentView(req, item)));
  res.json({ items: result, total, page, limit });
}

export async function getAssignment(req, res) {
  if (!validId(req.params.id)) return fail(res, 404, 'Assignment not found');
  const assignment = await Assignment.findOne(scoped(req, { _id: req.params.id })).lean();
  if (!assignment) return fail(res, 404, 'Assignment not found');
  if (req.orgRole === 'teacher' && !await canTeachClass(req, assignment.class)) return fail(res, 403, 'Access denied');
  if (req.orgRole === 'student') {
    const enrolled = await ClassEnrollment.exists(scoped(req, {
      class: assignment.class,
      student: req.user._id,
      status: 'active',
    }));
    if (!enrolled || assignment.status !== 'published' || assignment.startsAt > new Date()) {
      return fail(res, 404, 'Assignment not found');
    }
  }
  const result = await assignmentView(req, assignment, { includeStudents: req.orgRole !== 'student' });
  res.json({ assignment: result });
}

export async function publishAssignment(req, res) {
  if (!validId(req.params.id)) return fail(res, 404, 'Assignment not found');
  const assignment = await Assignment.findOne(scoped(req, { _id: req.params.id }));
  if (!assignment) return fail(res, 404, 'Assignment not found');
  if (!await hasAssignmentEntitlement(req)) return fail(res, 403, 'Your organization subscription does not currently allow assignments');
  if (req.orgRole === 'teacher' && (!await canTeachClass(req, assignment.class) || String(assignment.teacher) !== String(req.user._id))) {
    return fail(res, 403, 'Access denied');
  }
  if (assignment.status === 'published') return res.json({ assignment: await assignmentView(req, assignment) });
  assignment.status = 'published';
  assignment.publishedAt = new Date();
  await assignment.save();
  await audit(req, 'assignment.publish', { targetType: 'Assignment', targetId: assignment._id });
  res.json({ assignment: await assignmentView(req, assignment) });
}

export async function updateDraft(req, res) {
  if (!validId(req.params.id)) return fail(res, 404, 'Assignment not found');
  const assignment = await Assignment.findOne(scoped(req, { _id: req.params.id }));
  if (!assignment) return fail(res, 404, 'Assignment not found');
  if (assignment.status !== 'draft') return fail(res, 409, 'Published assignments cannot be edited');
  if (req.orgRole === 'teacher' && (!await canTeachClass(req, assignment.class) || String(assignment.teacher) !== String(req.user._id))) {
    return fail(res, 403, 'Access denied');
  }
  const { title, description, taskIds, startsAt, dueAt } = req.body;
  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim() || title.length > 160) return fail(res, 400, 'Title is required');
    assignment.title = title.trim();
  }
  if (description !== undefined) {
    if (typeof description !== 'string' || description.length > 4000) return fail(res, 400, 'Description is too long');
    assignment.description = description.trim();
  }
  if (startsAt !== undefined) assignment.startsAt = new Date(startsAt);
  if (dueAt !== undefined) assignment.dueAt = new Date(dueAt);
  if (Number.isNaN(assignment.startsAt.valueOf()) || Number.isNaN(assignment.dueAt.valueOf()) || assignment.startsAt >= assignment.dueAt) {
    return fail(res, 400, 'Choose valid start and due dates; due date must be after the start date');
  }
  let validated;
  if (taskIds !== undefined) {
    validated = await validateTaskIds(req, taskIds);
    if (validated.error) return fail(res, 400, validated.error);
  }
  await assignment.save();
  if (validated) {
    await AssignmentTask.deleteMany({ organization: req.org._id, assignment: assignment._id });
    await AssignmentTask.insertMany(validated.orderedIds.map((taskId, order) => ({
      organization: req.org._id,
      assignment: assignment._id,
      task: taskId,
      order,
    })));
  }
  await audit(req, 'assignment.update', { targetType: 'Assignment', targetId: assignment._id });
  res.json({ assignment: await assignmentView(req, assignment) });
}
