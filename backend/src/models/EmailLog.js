import mongoose from 'mongoose';

export const EMAIL_TYPES = ['signup-code', 'password-reset', 'admin-reset', 'other'];

// One row per email the app tried to send, so an admin can see volume and failures.
// The message body (which holds codes and links) is never stored.
const emailLogSchema = new mongoose.Schema(
  {
    type: { type: String, enum: EMAIL_TYPES, default: 'other' },
    to: { type: String, required: true },
    subject: { type: String, default: '', maxlength: 200 },
    // sent: the provider accepted it. failed: the provider refused. skipped: email is not set up.
    status: { type: String, enum: ['sent', 'failed', 'skipped'], required: true },
    error: { type: String, default: '', maxlength: 300 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

emailLogSchema.index({ createdAt: -1 });
// Keep three months of history.
emailLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model('EmailLog', emailLogSchema);
