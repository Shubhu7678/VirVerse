import { JAVASCRIPT_QUESTIONS } from './javascriptQuestions.js'
import { pythonSolutionProgram } from './pythonSolutionPrograms.js'

const categoryMap = {
  'js-basics': 'python-basics',
  'js-numbers': 'python-numbers',
  'js-logic': 'python-logic',
  'js-loops-arrays': 'python-loops-lists',
  'js-strings-functions': 'python-strings-functions',
}

export const PYTHON_QUESTIONS = JAVASCRIPT_QUESTIONS.map((question) => {
  const category = categoryMap[question.category]
  return {
    ...question,
    slug: `python-${category}-${String(question.questionOrder).padStart(2, '0')}`,
    language: 'python',
    category,
    starterCode: `# TODO: ${question.title}\n`,
    hint: `Use Python's standard input and output tools to parse the values. ${question.hint}`,
    solution: pythonSolutionProgram(category, question.questionOrder),
  }
})
