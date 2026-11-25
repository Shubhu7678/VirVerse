import mongoose from 'mongoose';

// A sign-up that has not proved ownership of its email yet. No User exists until the
// 6-digit code is entered, so mistyped or made-up addresses never become accounts.
// MongoDB removes expired rows by itself (TTL index on expiresAt).
const pendingSignupSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    passwordHash: { type: String, required: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, required: true },
    sentCount: { type: Number, default: 1 },
  },
  { timestamps: true },
);

pendingSignupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('PendingSignup', pendingSignupSchema);
