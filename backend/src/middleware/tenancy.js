import mongoose from 'mongoose';
import Organization from '../models/Organization.js';
import Membership from '../models/OrganizationMembership.js';
import { can, PERMISSIONS } from '../config/permissions.js';

export const ORG_HEADER = 'x-org-id';

// Resolves the active organization. The header is only a selector: access is
// granted solely by an active membership stored in the database.
export async function requireOrg(req, res, next) {
  try {
    const orgId = req.get(ORG_HEADER);
    if (!orgId || !mongoose.isValidObjectId(orgId)) {
      return res.status(400).json({ message: 'Active organization is required' });
    }

    const membership = await Membership.findOne({
      user: req.user._id,
      organization: orgId,
      status: 'active',
    });
    // Same response for "no such org" and "not a member" to avoid leaking existence.
    if (!membership) return res.status(403).json({ message: 'Access denied' });

    const org = await Organization.findById(orgId);
    if (!org) return res.status(403).json({ message: 'Access denied' });
    if (org.status !== 'active') {
      return res.status(403).json({ message: `Organization is ${org.status}` });
    }

    req.org = org;
    req.membership = membership;
    req.orgRole = membership.role;
    next();
  } catch (err) {
    next(err);
  }
}

export const requirePermission = (permission) => (req, res, next) =>
  can(req.orgRole, permission) ? next() : res.status(403).json({ message: 'Access denied' });

export function requireSuperAdmin(req, res, next) {
  if (req.user?.platformRole !== 'super_admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}

// Always build tenant queries through this so the organization filter cannot be
// forgotten or overridden by client-supplied values.
export const orgFilter = (req, filter = {}) => ({ ...filter, organization: req.org._id });

export const permissionsFor = (role) => PERMISSIONS[role] ?? [];
