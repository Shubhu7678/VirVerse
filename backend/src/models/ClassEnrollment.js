import mongoose from 'mongoose';

const classEnrollmentSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    enrolledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'removed'], default: 'active' },
  },
  { timestamps: true }
);

classEnrollmentSchema.index({ organization: 1, class: 1, student: 1 }, { unique: true });
classEnrollmentSchema.index({ organization: 1, student: 1, status: 1 });

export default mongoose.model('ClassEnrollment', classEnrollmentSchema);
