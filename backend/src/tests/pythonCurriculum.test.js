import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PYTHON_CATEGORIES } from '../config/pythonCategories.js';
import { PYTHON_QUESTIONS } from '../data/pythonQuestions.js';

test('Python curriculum has twenty guided questions for every topic', () => {
  assert.equal(PYTHON_CATEGORIES.length, 5);
  assert.equal(PYTHON_QUESTIONS.length, 100);
  assert.equal(new Set(PYTHON_QUESTIONS.map((question) => question.slug)).size, 100);

  for (const [index, category] of PYTHON_CATEGORIES.entries()) {
    const questions = PYTHON_QUESTIONS.filter((question) => question.category === category.slug);
    assert.equal(questions.length, 20, `${category.name} should have twenty questions`);
    assert.ok(questions.every((question) => question.language === 'python'));
    assert.ok(questions.every((question) => question.topicOrder === category.order));
    assert.deepEqual(questions.map((question) => question.questionOrder), Array.from({ length: 20 }, (_, i) => i + 1));
    assert.ok(questions.every((question) => question.hint?.trim()));
    assert.ok(questions.every((question) => question.solutionNotes?.trim()));
    assert.equal(new Set(questions.map((question) => question.solutionNotes)).size, questions.length,
      `${category.name} needs task-specific solution walkthroughs`);
    assert.ok(questions.every((question) => question.solution?.trim()));
    assert.ok(questions.every((question) => question.starterCode.includes('TODO')));
    assert.ok(questions.every((question) => question.testCases.length >= 3));
    assert.ok(questions.every((question) => question.testCases.filter((testCase) => !testCase.isHidden).length >= 2));
    assert.ok(questions.every((question) => question.testCases.some((testCase) => testCase.isHidden)));
    assert.ok(questions.every((question) => question.exampleInput === question.testCases[0].input));
    assert.equal(category.order, index + 1);
  }
});

test('Python Basics introduces printing and input in small steps', () => {
  const basics = PYTHON_QUESTIONS.filter((question) => question.category === 'python-basics');

  assert.deepEqual(
    basics.slice(0, 5).map((question) => question.title),
    ['Print Hello, World!', 'Greet the Learner', 'Echo a Message', 'Print a Number', 'Add Two Integers'],
  );
  assert.match(basics[0].description, /No input is provided/);
  assert.match(basics[1].starterCode, /^name = input\(\)/);
  assert.match(basics[2].starterCode, /^message = input\(\)/);
  assert.match(basics[3].starterCode, /^number = int\(input\(\)\)/);
  assert.match(basics[4].starterCode, /^first, second = map\(int, input\(\)\.split\(\)\)/);
});
