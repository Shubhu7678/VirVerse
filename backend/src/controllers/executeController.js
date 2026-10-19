import { executeProgram, classifyRun, ExecutorError } from '../services/executor/index.js';
import { createInteractiveTicket } from '../services/executor/interactiveTickets.js';

export async function execute(req, res) {
  const { code, stdin = '' } = req.body;

  try {
    const { compile, runs } = await executeProgram({ code, inputs: [stdin] });

    if (!compile.ok) {
      return res.json({ status: 'Compilation Error', compileOutput: compile.output, stdout: '', stderr: '' });
    }

    const run = runs[0];
    res.json({
      status: classifyRun(run),
      compileOutput: compile.output, // warnings, if any
      stdout: run.stdout,
      stderr: run.stderr,
      exitCode: run.exitCode,
      signal: run.signal,
      timeMs: run.timeMs,
    });
  } catch (err) {
    if (err instanceof ExecutorError) return res.status(err.status).json({ message: err.message });
    throw err;
  }
}

export function createInteractiveRunnerTicket(req, res) {
  try {
    res.json(createInteractiveTicket(req.user._id));
  } catch (error) {
    console.error('Could not create interactive runner ticket:', error.message);
    res.status(503).json({ message: 'Interactive code execution is not configured on this server.' });
  }
}
