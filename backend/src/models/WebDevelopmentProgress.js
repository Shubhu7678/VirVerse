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

// Names used in the admin activity log. A test keeps these in step with the frontend course data.
export const HTML_TASK_TITLES = {
  'html-01-first-page': 'Create Your First HTML Page',
  'html-02-headings': 'HTML Headings',
  'html-03-paragraphs-breaks': 'Paragraphs and Line Breaks',
  'html-04-text-formatting': 'Text Formatting',
  'html-05-hyperlinks': 'Hyperlinks',
  'html-06-images': 'Images',
  'html-07-lists': 'Lists',
  'html-08-tables': 'HTML Tables',
  'html-09-forms': 'HTML Forms',
  'html-10-profile-page': 'Personal Profile Page',
  'html-11-attributes': 'HTML Attributes',
  'html-12-comments-entities': 'Comments and Special Characters',
  'html-13-div-span': 'Grouping with div and span',
  'html-14-semantic-elements': 'Semantic Page Layout',
  'html-15-figure-caption': 'Figures and Captions',
  'html-16-audio-video': 'Audio and Video',
  'html-17-details-summary': 'Expandable Details',
  'html-18-form-controls': 'More Form Controls',
  'html-19-page-metadata': 'Page Metadata',
  'html-20-accessibility': 'Accessible HTML Basics',
  'html-21-code-and-quotes': 'Code and Quotations',
  'html-22-page-navigation': 'Page Navigation and Email Links',
  'html-project-portfolio': 'Project: Personal Portfolio',
  'html-project-recipe': 'Project: Recipe Page',
  'html-project-event': 'Project: Community Event Page',
};

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: String, required: true, enum: HTML_TASK_IDS },
    code: { type: String, default: '', maxlength: 20000 },
    completed: { type: Boolean, default: false },
    // Set once the 20 points for this task were paid, so reopening and finishing again cannot pay twice.
    pointsAwarded: { type: Boolean, default: false },
    // When the task was first marked done; shown in the submissions list.
    completedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

progressSchema.index({ user: 1, taskId: 1 }, { unique: true });
progressSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('WebDevelopmentProgress', progressSchema);
