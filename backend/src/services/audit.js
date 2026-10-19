import AuditLog from '../models/AuditLog.js';

export async function audit(req, action, { organization = null, targetType, targetId, metadata } = {}) {
  try {
    await AuditLog.create({
      actor: req.user._id,
      organization: organization ?? req.org?._id ?? null,
      action,
      targetType,
      targetId,
      metadata,
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
}
