import mongoose from 'mongoose';

const teacherAssignmentSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

teacherAssignmentSchema.index({ organization: 1, class: 1, teacher: 1 }, { unique: true });
teacherAssignmentSchema.index({ organization: 1, teacher: 1 });

export default mongoose.model('TeacherAssignment', teacherAssignmentSchema);
