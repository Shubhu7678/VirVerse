import mongoose from 'mongoose';

const assignmentTaskSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    order: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

assignmentTaskSchema.index({ organization: 1, assignment: 1, task: 1 }, { unique: true });
assignmentTaskSchema.index({ organization: 1, assignment: 1, order: 1 });

export default mongoose.model('AssignmentTask', assignmentTaskSchema);
