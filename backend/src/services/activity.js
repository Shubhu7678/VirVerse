import ActivityLog from '../models/ActivityLog.js';

// Logging must never break the request that triggered it.
export async function logActivity(entry) {
  try {
    await ActivityLog.create(entry);
  } catch (err) {
    console.error('Could not write activity log:', err.message);
  }
}
