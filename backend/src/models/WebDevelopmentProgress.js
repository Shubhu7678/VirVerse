import mongoose from 'mongoose';

export const HTML_TASK_IDS = [
  'html-01-first-page',
  'html-02-headings',
  'html-03-paragraphs-breaks',
  'html-04-text-formatting',
  'html-05-hyperlinks',
  'html-06-images',
  'html-07-lists',
  'html-08-tables',
  'html-09-forms',
  'html-10-profile-page',
  'html-11-attributes',
  'html-12-comments-entities',
  'html-13-div-span',
  'html-14-semantic-elements',
  'html-15-figure-caption',
  'html-16-audio-video',
  'html-17-details-summary',
  'html-18-form-controls',
  'html-19-page-metadata',
  'html-20-accessibility',
  'html-21-code-and-quotes',
  'html-22-page-navigation',
  'html-project-portfolio',
  'html-project-recipe',
  'html-project-event',
];

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: String, required: true, enum: HTML_TASK_IDS },
    code: { type: String, default: '', maxlength: 20000 },
    completed: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

progressSchema.index({ user: 1, taskId: 1 }, { unique: true });
progressSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('WebDevelopmentProgress', progressSchema);
