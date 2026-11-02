import mongoose from 'mongoose';
import { CATEGORY_SLUGS } from '../config/categories.js';
import { JAVASCRIPT_CATEGORIES } from '../config/javascriptCategories.js';
import { PYTHON_CATEGORIES } from '../config/pythonCategories.js';

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, default: '' },
    expectedOutput: { type: String, required: true },
    // Hidden cases are only used when judging a submission, never sent to the client.
    isHidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    language: { type: String, enum: ['c', 'javascript', 'python'], default: 'c', index: true },
    category: {
      type: String,
      required: true,
      enum: [
        ...CATEGORY_SLUGS,
        ...JAVASCRIPT_CATEGORIES.map((category) => category.slug),
        ...PYTHON_CATEGORIES.map((category) => category.slug),
      ],
    },
    difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
    description: { type: String, required: true },
    hint: { type: String, default: '' },
    solution: { type: String, default: '', select: false },
    solutionNotes: { type: String, default: '', select: false },
    exampleInput: { type: String, default: '' },
    exampleOutput: { type: String, required: true },
    constraints: { type: [String], default: [] },
    starterCode: { type: String, required: true },
    testCases: { type: [testCaseSchema], default: [] },
    order: { type: Number, default: 0 },
    topicOrder: { type: Number, default: 0 },
    questionOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

taskSchema.index({ language: 1, category: 1, order: 1 });

export default mongoose.model('Task', taskSchema);
