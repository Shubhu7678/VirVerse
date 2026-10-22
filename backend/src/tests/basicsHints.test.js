import { test } from 'node:test';
import assert from 'node:assert/strict';
import basics from '../data/questions/src/01-basics.js';

test('the 20 Basics questions each provide a separate hint without exposing it in the description', () => {
  assert.equal(basics.length, 20);
  for (const question of basics) {
    assert.ok(question.hint?.trim(), `${question.slug} should have a hint`);
    assert.ok(question.solution?.trim(), `${question.slug} should have a worked answer`);
    assert.ok(question.solution.includes('\n'), `${question.slug} worked answer should be formatted on multiple lines`);
    assert.ok(question.solutionNotes?.trim(), `${question.slug} should have walkthrough notes`);
    assert.doesNotMatch(question.description, /\n\nHint:/, `${question.slug} should keep its hint hidden`);
  }
});
