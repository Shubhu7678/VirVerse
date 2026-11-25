import { PYTHON_GUIDE } from './python.js';
import { PYTHON_GUIDE_MORE } from './python-more.js';

// One entry per language. Add a language here and it is served by /api/guides/:language.
export const GUIDES = { python: [...PYTHON_GUIDE, ...PYTHON_GUIDE_MORE] };

export const guideForQuestion = (language, questionSlug) => {
  const lesson = GUIDES[language]?.find((item) => item.question === questionSlug);
  return lesson ? { slug: lesson.slug, n: lesson.n, title: lesson.title } : null;
};
