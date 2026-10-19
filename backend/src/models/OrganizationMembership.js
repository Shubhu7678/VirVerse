import mongoose from 'mongoose';

export const ORG_ROLES = ['org_admin', 'teacher', 'student'];

const membershipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    role: { type: String, enum: ORG_ROLES, required: true },
    status: { type: String, enum: ['active', 'removed'], default: 'active' },
  },
  { timestamps: true }
);

// One membership (and one role) per user per organization.
membershipSchema.index({ user: 1, organization: 1 }, { unique: true });
membershipSchema.index({ organization: 1, role: 1, status: 1 });

export default mongoose.model('OrganizationMembership', membershipSchema);
