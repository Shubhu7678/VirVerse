import mongoose from 'mongoose';

export const ORG_TYPES = ['college', 'university', 'school', 'institute', 'other'];
export const ORG_STATUSES = ['pending', 'active', 'suspended'];

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      maxlength: 60,
    },
    type: { type: String, enum: ORG_TYPES, default: 'college' },
    logoUrl: { type: String, trim: true, maxlength: 500, default: '' },
    contactEmail: { type: String, lowercase: true, trim: true, default: '' },
    status: { type: String, enum: ORG_STATUSES, default: 'pending', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Organization', organizationSchema);
