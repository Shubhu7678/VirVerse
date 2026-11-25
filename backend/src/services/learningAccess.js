// Access rules, in one place:
//  - Admin (platformRole === 'super_admin') can open everything.
//  - Everyone else can open the first 10 questions of the first topic in each language.
//  - A student whose admin unlocked a language can open that whole language.
//  - Demo sessions are limited to the free questions of one language each.
export const LANGUAGES = ['c', 'javascript', 'python'];
export const FREE_QUESTION_LIMIT = 10;

export const FIRST_CATEGORY = { c: 'basics', javascript: 'js-basics', python: 'python-basics' };

export const isAdmin = (user) => user?.platformRole === 'super_admin';

export function hasLanguageLearningAccess(user, language) {
  if (user.isDemo) return false;
  if (isAdmin(user)) return true;
  return Boolean(user.unlockedLanguages?.includes(language));
}

export function isFreeTask(task) {
  const language = task.language ?? 'c';
  return task.category === FIRST_CATEGORY[language]
    && task.questionOrder >= 1
    && task.questionOrder <= FREE_QUESTION_LIMIT;
}

export function canAccessTask(user, task) {
  if (isFreeTask(task)) return true;
  return hasLanguageLearningAccess(user, task.language ?? 'c');
}
