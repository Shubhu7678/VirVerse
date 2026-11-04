import { JAVASCRIPT_QUESTIONS } from './javascriptQuestions.js'
import { pythonSolutionProgram } from './pythonSolutionPrograms.js'

const categoryMap = {
  'js-basics': 'python-basics',
  'js-numbers': 'python-numbers',
  'js-logic': 'python-logic',
  'js-loops-arrays': 'python-loops-lists',
  'js-strings-functions': 'python-strings-functions',
}

const pythonBasicsOrder = new Map([
  [1, 2],
  [2, 3],
  [3, 5],
  [4, 6],
  [5, 7],
  [6, 8],
  [7, 9],
  [8, 10],
  [9, 11],
  [10, 12],
  [11, 13],
  [12, 14],
  [13, 15],
  [14, 16],
  [15, 17],
  [18, 18],
  [19, 19],
  [20, 20],
])

const createIntroQuestion = ({
  questionOrder,
  title,
  description,
  hint,
  solutionNotes,
  solution,
  starterCode,
  cases,
}) => ({
  slug: `python-python-basics-${String(questionOrder).padStart(2, '0')}`,
  title,
  category: 'python-basics',
  language: 'python',
  topicOrder: 1,
  questionOrder,
  order: 100 + questionOrder,
  difficulty: 'Easy',
  description,
  exampleInput: cases[0].input,
  exampleOutput: cases[0].expectedOutput,
  constraints: [],
  hint,
  solutionNotes,
  solution,
  starterCode,
  testCases: cases.map((testCase, index) => ({ ...testCase, isHidden: index >= 2 })),
})

const introductoryQuestions = [
  createIntroQuestion({
    questionOrder: 1,
    title: 'Print Hello, World!',
    description: 'Write your first Python program: print `Hello, World!` on one line.\n\nInput\nNo input is provided.\n\nOutput\nPrint `Hello, World!` exactly.',
    hint: 'Use `print("Hello, World!")` to display the text.',
    solutionNotes: 'Call `print` with the exact greeting. Python adds the ending newline automatically.',
    solution: 'print("Hello, World!")\n',
    starterCode: '# TODO: Print Hello, World!\n',
    cases: [
      { input: '', expectedOutput: 'Hello, World!' },
      { input: '', expectedOutput: 'Hello, World!' },
      { input: '', expectedOutput: 'Hello, World!' },
    ],
  }),
  createIntroQuestion({
    questionOrder: 4,
    title: 'Print a Number',
    description: 'Read one whole number and print it back.\n\nInput\nOne integer.\n\nOutput\nThe same integer on one line.',
    hint: 'Convert the input text to an integer with `int(input())`, then pass the value to `print`.',
    solutionNotes: 'Read one line, convert it from text to an integer, and print the value.',
    solution: 'number = int(input())\nprint(number)\n',
    starterCode: 'number = int(input())\n# TODO: Print the number\n',
    cases: [
      { input: '7', expectedOutput: '7' },
      { input: '-3', expectedOutput: '-3' },
      { input: '0', expectedOutput: '0' },
    ],
  }),
]

const questionsFromSharedCurriculum = JAVASCRIPT_QUESTIONS.map((question) => {
  const category = categoryMap[question.category]
  const originalQuestionOrder = question.questionOrder
  const questionOrder = category === 'python-basics'
    ? pythonBasicsOrder.get(originalQuestionOrder)
    : originalQuestionOrder

  if (!questionOrder) return null

  return {
    ...question,
    slug: `python-${category}-${String(questionOrder).padStart(2, '0')}`,
    order: question.topicOrder * 100 + questionOrder,
    language: 'python',
    category,
    questionOrder,
    hint: `Use Python's standard input and output tools to parse the values. ${question.hint}`,
    solution: pythonSolutionProgram(category, originalQuestionOrder),
  }
}).filter(Boolean)

export const PYTHON_QUESTIONS = [...questionsFromSharedCurriculum, ...introductoryQuestions]
  .sort((a, b) => a.order - b.order)
  .map((question) => {
    if (question.category !== 'python-basics' || question.questionOrder > 5) {
      return { ...question, starterCode: `# TODO: ${question.title}\n` }
    }

    if (question.questionOrder === 2) {
      return {
        ...question,
        description: 'Read a name and print `Hello, <name>!`.\n\nInput\nA name on one line. It may contain spaces.\n\nOutput\nPrint the greeting on one line.',
        hint: 'Use `name = input()` to read the full line, then include `name` in the greeting.',
        solutionNotes: 'Read the full name with `input()` so spaces are preserved, then print it in the greeting.',
        solution: 'name = input()\nprint(f"Hello, {name}!")\n',
        starterCode: 'name = input()\n# TODO: Print a greeting for name\n',
      }
    }

    if (question.questionOrder === 3) {
      return {
        ...question,
        description: 'Read one message and print it exactly as it is given.\n\nInput\nOne line of text.\n\nOutput\nPrint the message unchanged.',
        hint: 'Read the line with `input()` and pass the result to `print` without changing it.',
        solutionNotes: 'Read the complete line with `input()` and print it without trimming or reformatting.',
        solution: 'message = input()\nprint(message)\n',
        starterCode: 'message = input()\n# TODO: Print the message unchanged\n',
      }
    }

    if (question.questionOrder === 5) {
      return {
        ...question,
        description: 'Read two integers and print their sum.\n\nInput\nTwo integers separated by a space.\n\nOutput\nTheir sum on one line.',
        hint: 'Use `map(int, input().split())` to read both integers, then add them.',
        solutionNotes: 'Split the input line into two values, convert both to integers, add them, and print the sum.',
        solution: 'first, second = map(int, input().split())\nprint(first + second)\n',
        starterCode: 'first, second = map(int, input().split())\n# TODO: Print their sum\n',
      }
    }

    return question
  })
