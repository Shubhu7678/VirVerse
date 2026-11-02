import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JAVASCRIPT_CATEGORIES } from '../config/javascriptCategories.js';
import { JAVASCRIPT_QUESTIONS } from '../data/javascriptQuestions.js';

test('JavaScript curriculum has twenty guided questions for every topic', () => {
  assert.equal(JAVASCRIPT_CATEGORIES.length, 5);
  assert.equal(JAVASCRIPT_QUESTIONS.length, JAVASCRIPT_CATEGORIES.length * 20);
  assert.equal(new Set(JAVASCRIPT_CATEGORIES.map((category) => category.slug)).size, JAVASCRIPT_CATEGORIES.length);
  assert.equal(new Set(JAVASCRIPT_QUESTIONS.map((question) => question.slug)).size, JAVASCRIPT_QUESTIONS.length);

  for (const [index, category] of JAVASCRIPT_CATEGORIES.entries()) {
    const questions = JAVASCRIPT_QUESTIONS.filter((question) => question.category === category.slug);
    assert.equal(questions.length, 20, `${category.name} should have twenty questions`);
    assert.ok(questions.every((question) => question.language === 'javascript'));
    assert.ok(questions.every((question) => question.topicOrder === category.order));
    assert.deepEqual(questions.map((question) => question.questionOrder), Array.from({ length: 20 }, (_, i) => i + 1));
    assert.ok(questions.every((question) => question.hint?.trim()), `${category.name} tasks need hints`);
    assert.ok(questions.every((question) => question.solutionNotes?.trim()), `${category.name} tasks need explanations`);
    assert.equal(new Set(questions.map((question) => question.solutionNotes)).size, questions.length,
      `${category.name} needs task-specific solution walkthroughs`);
    assert.ok(questions.every((question) => question.solution?.trim()), `${category.name} needs code solutions on demand`);
    assert.ok(questions.every((question) => question.starterCode.includes('TODO')), `${category.name} must have unsolved starter code`);
    assert.ok(questions.every((question) => question.testCases.length >= 3));
    assert.ok(questions.every((question) => question.testCases.filter((testCase) => !testCase.isHidden).length >= 2));
    assert.ok(questions.every((question) => question.testCases.filter((testCase) => testCase.isHidden).length >= 1));
    assert.ok(questions.every((question) => question.exampleInput === question.testCases[0].input));
    assert.equal(category.order, index + 1);
  }
});
