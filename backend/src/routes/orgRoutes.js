import { Router } from 'express';
import protect from '../middleware/auth.js';
import { requireOrg, requirePermission, orgFilter, permissionsFor } from '../middleware/tenancy.js';
import Membership from '../models/OrganizationMembership.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import { createDepartment, createCourse, createClass, inviteMember, listPeople, getPersonProfile, assignTeacher, enrollStudent, listClassMembers, getStructure, getSummary, removePerson } from '../controllers/organizationController.js';
import { questionBank, createAssignment, listAssignments, getAssignment, publishAssignment, updateDraft } from '../controllers/assignmentController.js';

const router = Router();
router.use(protect);

// Organizations the current user can switch between (selector source).
router.get('/mine', async (req, res) => {
  const memberships = await Membership.find({ user: req.user._id, status: 'active' })
    .populate('organization', 'name slug status logoUrl')
    .lean();
  res.json({
    memberships: memberships
      .filter((m) => m.organization)
      .map((m) => ({ organization: m.organization, role: m.role })),
  });
});

// Validates the X-Org-Id selection server-side and returns role + permissions.
router.get('/active', requireOrg, (req, res) => {
  res.json({
    organization: { id: req.org._id, name: req.org.name, slug: req.org.slug },
    role: req.orgRole,
    permissions: permissionsFor(req.orgRole),
  });
});

router.get('/leaderboard', requireOrg, async (req, res) => {
  const memberships = await Membership.find({ organization: req.org._id, status: 'active' })
    .select('user')
    .lean();
  const users = await User.find({ _id: { $in: memberships.map(({ user }) => user) } })
    .select('name points level')
    .sort({ points: -1, level: -1, name: 1 })
    .lean();
  const currentRank = users.findIndex(({ _id }) => String(_id) === String(req.user._id)) + 1;

  res.json({
    total: users.length,
    currentRank: currentRank || null,
    entries: users.slice(0, 10).map((user, index) => ({
      id: user._id,
      name: user.name,
      points: user.points ?? 0,
      level: user.level ?? 1,
      rank: index + 1,
    })),
  });
});

router.get('/structure', requireOrg, requirePermission('classes:read'), getStructure);
router.get('/summary', requireOrg, requirePermission('analytics:read'), getSummary);
router.post('/departments', requireOrg, requirePermission('structure:manage'), createDepartment);
router.post('/courses', requireOrg, requirePermission('structure:manage'), createCourse);
router.post('/classes', requireOrg, requirePermission('structure:manage'), createClass);
router.post('/invitations', requireOrg, requirePermission('members:manage'), inviteMember);
router.get('/people', requireOrg, requirePermission('members:read'), listPeople);
router.get('/people/:userId', requireOrg, requirePermission('members:read'), getPersonProfile);
router.delete('/people/:userId', requireOrg, requirePermission('members:manage'), removePerson);
router.post('/classes/:classId/teachers', requireOrg, requirePermission('classes:manage'), assignTeacher);
router.post('/classes/:classId/students', requireOrg, requirePermission('classes:manage'), enrollStudent);
router.get('/classes/:classId/members', requireOrg, requirePermission('classes:read'), listClassMembers);
router.get('/question-bank', requireOrg, requirePermission('assignment:create'), questionBank);
router.get('/assignments', requireOrg, requirePermission('assignment:read'), listAssignments);
router.post('/assignments', requireOrg, requirePermission('assignment:create'), createAssignment);
router.get('/assignments/:id', requireOrg, requirePermission('assignment:read'), getAssignment);
router.put('/assignments/:id', requireOrg, requirePermission('assignment:create'), updateDraft);
router.post('/assignments/:id/publish', requireOrg, requirePermission('assignment:publish'), publishAssignment);

router.get('/audit-logs', requireOrg, requirePermission('audit:read'), async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 25, 100);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const filter = orgFilter(req);
  const [items, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit });
});

export default router;
