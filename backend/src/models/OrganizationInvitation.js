import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ['org_admin', 'teacher', 'student'], required: true },
    // SHA-256 of the token; the raw token is never stored.
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    acceptedAt: { type: Date, default: null },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

invitationSchema.index({ organization: 1, email: 1 });

export default mongoose.model('OrganizationInvitation', invitationSchema);
