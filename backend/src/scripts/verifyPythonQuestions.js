import { spawnSync } from 'node:child_process';
import { PYTHON_QUESTIONS } from '../data/pythonQuestions.js';

// Runs each Python question's worked solution against every test case (hidden ones too)
// and checks the starter code is valid Python. Usage: npm run python:verify
let failures = 0;
let runs = 0;
const normalize = (s) => s.replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/[ \t]+$/, '')).join('\n').replace(/\n+$/, '');

for (const q of PYTHON_QUESTIONS) {
  const syntax = spawnSync('python3', ['-I', '-c', `import ast,sys; ast.parse(sys.stdin.read())`], { input: q.starterCode, encoding: 'utf8' });
  if (syntax.status !== 0) {
    failures += 1;
    console.log(`${q.slug}: starter code is not valid Python`);
  }
  for (const [i, tc] of q.testCases.entries()) {
    const run = spawnSync('python3', ['-I', '-c', q.solution], { input: `${tc.input}\n`, encoding: 'utf8', timeout: 5000 });
    runs += 1;
    if (run.status !== 0 || normalize(run.stdout) !== normalize(tc.expectedOutput)) {
      failures += 1;
      console.log(`${q.slug} case ${i + 1}: input ${JSON.stringify(tc.input)} expected ${JSON.stringify(tc.expectedOutput)} got ${JSON.stringify(run.stdout)} ${run.stderr.trim().split('\n').pop()}`);
    }
  }
}
console.log(`${PYTHON_QUESTIONS.length} questions, ${runs} runs, ${failures} problem${failures === 1 ? '' : 's'}`);
process.exit(failures ? 1 : 0);
