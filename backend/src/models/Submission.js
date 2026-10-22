import mongoose from 'mongoose';

export const SUBMISSION_STATUSES = [
  'Accepted',
  'Wrong Answer',
  'Compilation Error',
  'Runtime Error',
  'Time Limit Exceeded',
];

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null, index: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', default: null, index: true },
    code: { type: String, required: true, maxlength: 20000 },
    status: { type: String, required: true, enum: SUBMISSION_STATUSES },
    passedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

submissionSchema.index({ user: 1, task: 1, status: 1 });
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ organization: 1, user: 1, createdAt: -1 });
submissionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Submission', submissionSchema);
