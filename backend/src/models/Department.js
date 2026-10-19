import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    code: { type: String, required: true, trim: true, uppercase: true, maxlength: 30 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

departmentSchema.index({ organization: 1, code: 1 }, { unique: true });

export default mongoose.model('Department', departmentSchema);
