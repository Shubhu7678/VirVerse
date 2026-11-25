import { isAdmin } from '../services/learningAccess.js';

// Use after `protect`. The admin role is granted only by the create-superadmin script.
export default function requireAdmin(req, res, next) {
  if (!isAdmin(req.user)) return res.status(403).json({ message: 'Admin access required' });
  next();
}
