import mongoose from 'mongoose';

const classSectionSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    code: { type: String, required: true, trim: true, uppercase: true, maxlength: 30 },
    academicYear: { type: String, trim: true, maxlength: 20, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

classSectionSchema.index({ organization: 1, course: 1, code: 1 }, { unique: true });

export default mongoose.model('ClassSection', classSectionSchema);
