import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 4000, default: '' },
    language: { type: String, default: 'c' },
    startsAt: { type: Date, required: true },
    dueAt: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

assignmentSchema.index({ organization: 1, class: 1, status: 1, dueAt: 1 });
assignmentSchema.index({ organization: 1, teacher: 1, createdAt: -1 });

export default mongoose.model('Assignment', assignmentSchema);
