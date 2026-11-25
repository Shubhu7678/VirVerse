import { spawnSync } from 'node:child_process';
import { GUIDES } from '../data/guides/index.js';

// Runs every code example in every guide lesson and checks it prints what the lesson says.
// Usage: npm run guide:verify
let failures = 0;
let checked = 0;
for (const [language, lessons] of Object.entries(GUIDES)) {
  if (language !== 'python') continue;
  for (const lesson of lessons) {
    if (!lesson.check || lesson.check.answer >= lesson.check.options.length) {
      console.log(`Lesson ${lesson.n}: quiz is missing or its answer is out of range`);
      failures += 1;
    }
    for (const step of lesson.steps) {
      const run = spawnSync('python3', ['-I', '-c', step.code], {
        input: `${step.input ?? ''}\n`,
        encoding: 'utf8',
        timeout: 5000,
      });
      checked += 1;
      const got = run.stdout.replace(/\r\n/g, '\n').replace(/\n+$/, '');
      if (run.status !== 0 || got !== step.output) {
        failures += 1;
        console.log(`Lesson ${lesson.n} "${step.title}": expected ${JSON.stringify(step.output)}, got ${JSON.stringify(got)} ${run.stderr.trim().split('\n').pop() ?? ''}`);
      }
    }
  }
}
console.log(`${checked} examples checked, ${failures} problem${failures === 1 ? '' : 's'}`);
process.exit(failures ? 1 : 0);
