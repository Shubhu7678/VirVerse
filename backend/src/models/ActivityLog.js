import mongoose from 'mongoose';

export const ACTIVITY_TYPES = ['student.signup', 'access.updated', 'question.completed'];

// Append-only record of things worth an admin's attention. Names are copied in
// so an entry still reads correctly if the account is later deleted.
const activityLogSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    target: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    message: { type: String, required: true, maxlength: 300 },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

activityLogSchema.index({ createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
