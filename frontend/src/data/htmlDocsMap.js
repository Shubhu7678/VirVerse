import { HTML_DOCUMENTATION } from './htmlBasics'

// Which reference entries explain each lesson's topic. The first one is the lesson's own topic.
const TOPICS_BY_TASK = {
  'html-01-first-page': ['What HTML is', 'Document structure'],
  'html-02-headings': ['Headings and paragraphs'],
  'html-03-paragraphs-breaks': ['Headings and paragraphs'],
  'html-04-text-formatting': ['Text formatting'],
  'html-05-hyperlinks': ['Links'],
  'html-06-images': ['Images'],
  'html-07-lists': ['Ordered and unordered lists'],
  'html-08-tables': ['Tables'],
  'html-09-forms': ['Forms'],
  'html-10-profile-page': ['Semantic elements', 'Links', 'Images', 'Ordered and unordered lists'],
  'html-11-attributes': ['Attributes'],
  'html-12-comments-entities': ['Comments and character references'],
  'html-13-div-span': ['Grouping with div and span'],
  'html-14-semantic-elements': ['Semantic elements'],
  'html-15-figure-caption': ['Figures and captions'],
  'html-16-audio-video': ['Audio and video'],
  'html-17-details-summary': ['Expandable details'],
  'html-18-form-controls': ['More form controls', 'Forms'],
  'html-19-page-metadata': ['Page metadata'],
  'html-20-accessibility': ['Accessible HTML basics'],
  'html-21-code-and-quotes': ['Code and quotations'],
  'html-22-page-navigation': ['Page navigation and email links', 'Links'],
  'html-project-portfolio': ['Semantic elements', 'Links', 'Images', 'Forms'],
  'html-project-recipe': ['Figures and captions', 'Ordered and unordered lists', 'Tables'],
  'html-project-event': ['Semantic elements', 'Tables', 'Forms'],
}

const byTitle = new Map(HTML_DOCUMENTATION.map((concept) => [concept.title, concept]))

// The reference entries for a lesson, split into its own topic and everything else.
export function docsForTask(taskId) {
  const own = (TOPICS_BY_TASK[taskId] ?? ['What HTML is']).map((title) => byTitle.get(title)).filter(Boolean)
  const ownTitles = new Set(own.map((concept) => concept.title))
  return { own, other: HTML_DOCUMENTATION.filter((concept) => !ownTitles.has(concept.title)) }
}
