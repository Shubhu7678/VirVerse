import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { executeProgram, classifyRun } from '../services/executor/index.js';

/**
 * End-to-end check: every reference solution is run through the REAL sandboxed executor
 * against every built test case and must reproduce the stored expected output.
 *
 *   node src/scripts/verifyQuestions.js [topic-substring ...]
 */
const base = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/questions');
const normalize = (s) =>
  s.replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/[ \t]+$/, '')).join('\n').replace(/\n+$/, '');
const withNewline = (s) => (s && !s.endsWith('\n') ? `${s}\n` : s);

const filters = process.argv.slice(2);
const files = fs
  .readdirSync(path.join(base, 'built'))
  .filter((f) => f.endsWith('.json'))
  .filter((f) => filters.length === 0 || filters.some((x) => f.includes(x)))
  .sort();

let bad = 0;
let checked = 0;
for (const file of files) {
  const built = JSON.parse(fs.readFileSync(path.join(base, 'built', file), 'utf8'));
  const source = (await import(pathToFileURL(path.join(base, 'src', file.replace('.json', '.js'))).href)).default;

  for (const q of built) {
    const solution = source.find((s) => s.slug === q.slug).solution;
    const outcome = await executeProgram({ code: solution, inputs: q.testCases.map((t) => withNewline(t.input)) });
    if (!outcome.compile.ok) {
      bad += 1;
      console.log(`FAIL ${q.slug}: compile error\n${outcome.compile.output}`);
      continue;
    }
    q.testCases.forEach((t, i) => {
      const run = outcome.runs[i];
      checked += 1;
      const status = classifyRun(run);
      if (status !== 'Success' || normalize(run.stdout) !== normalize(t.expectedOutput)) {
        bad += 1;
        console.log(`FAIL ${q.slug} test ${i + 1}: ${status}`);
      }
    });
  }
  console.log(`done ${file}`);
}

console.log(bad === 0 ? `ALL OK (${checked} test cases)` : `${bad} problems found`);
process.exit(bad === 0 ? 0 : 1);
