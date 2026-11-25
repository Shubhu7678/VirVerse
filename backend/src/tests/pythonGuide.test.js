import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GUIDES } from '../data/guides/index.js';
import { PYTHON_QUESTIONS } from '../data/pythonQuestions.js';
import { isLessonLocked } from '../controllers/guideController.js';

const lessons = GUIDES.python;

test('the Python guide has 40 lessons, one per question, in order', () => {
  assert.equal(lessons.length, 40);
  assert.deepEqual(lessons.map((l) => l.n), Array.from({ length: 40 }, (_, i) => i + 1));
  assert.equal(new Set(lessons.map((l) => l.slug)).size, 40, 'slugs must be unique');
  const questionSlugs = new Set(PYTHON_QUESTIONS.map((q) => q.slug));
  for (const lesson of lessons) {
    assert.ok(questionSlugs.has(lesson.question), `lesson ${lesson.n} points at a missing question ${lesson.question}`);
  }
});

test('every lesson is complete and has a valid quick check', () => {
  for (const lesson of lessons) {
    assert.ok(lesson.title && lesson.summary && lesson.intro && lesson.section, `lesson ${lesson.n} text`);
    assert.ok(lesson.steps.length >= 2, `lesson ${lesson.n} needs steps`);
    assert.ok(lesson.steps.every((s) => s.title && s.text && s.code && typeof s.output === 'string'), `lesson ${lesson.n} steps`);
    assert.ok(lesson.mistakes.length >= 2 && lesson.recap.length >= 2);
    assert.ok(lesson.check.options.length >= 2 && lesson.check.answer < lesson.check.options.length, `lesson ${lesson.n} quiz`);
  }
});

test('only the first ten lessons are open without an unlock', () => {
  const student = { unlockedLanguages: [] };
  assert.equal(isLessonLocked(student, 'python', lessons[9]), false);
  assert.equal(isLessonLocked(student, 'python', lessons[10]), true);
  assert.equal(isLessonLocked({ unlockedLanguages: ['python'] }, 'python', lessons[39]), false);
  assert.equal(isLessonLocked({ platformRole: 'super_admin' }, 'python', lessons[39]), false);
});
