import { JAVASCRIPT_QUESTIONS } from './javascriptQuestions.js'
import { pythonSolutionProgram } from './pythonSolutionPrograms.js'
import { BASICS_11_20, NUMBERS_1_20 } from './pythonBeginnerQuestions.js'

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

// The first ten Python questions assume the learner has never seen Python.
// Each one introduces a single new idea, explains it in the statement, shows a
// worked example, and starts from a scaffolded program with guiding comments.
const beginnerLessons = {
  1: {
    solution: 'print("Hello, World!")\n',
    description: [
      'New idea: `print()`',
      '`print()` shows text on the screen. Put the text inside quotes (`"..."`) and inside the brackets. The quotes are not printed, only the words between them.',
      'Example: `print("Good morning")` shows `Good morning`.',
      'Task',
      'Write a program that prints `Hello, World!` exactly, including the comma, the capital letters and the exclamation mark.',
      'Input',
      'There is no input.',
      'Output',
      '`Hello, World!`',
    ].join('\n\n'),
    hint: 'Replace the TODO comment with one line: `print("Hello, World!")`. Check capital letters and punctuation, they must match exactly.',
    starterCode: '# Lines that start with # are comments. Python ignores them.\n# TODO: write one print(...) line below, then press Run.\n\n',
  },
  2: {
    solution: 'name = input()\nprint(f"Hello, {name}!")\n',
    description: [
      'New idea: `input()` and variables',
      '`input()` waits for the user to type a line and gives it back as text. A variable is a name that stores a value so you can use it later: `city = input()` stores the typed text in `city`.',
      'To mix a variable into printed text, put an `f` before the opening quote and wrap the variable in curly braces: `print(f"I live in {city}")`.',
      'Task',
      'Read a name and print `Hello, <name>!` using it.',
      'Input',
      'One line containing a name. It may contain spaces.',
      'Output',
      'A greeting on one line.',
      'Example',
      'If the input is `Asha`, print `Hello, Asha!`.',
    ].join('\n\n'),
    hint: 'The first line already stores the name in `name`. Then write `print(f"Hello, {name}!")`.',
    solutionNotes: 'Read the full line with `input()` so spaces are kept, then use an f-string to place it inside the greeting.',
    starterCode: '# input() reads one line the user types and stores it in the variable "name".\nname = input()\n\n# TODO: print the greeting. Hint: print(f"... {name} ...")\n',
  },
  3: {
    solution: 'message = input()\nprint(message)\n',
    description: [
      'New idea: printing a variable',
      'You do not always need an f-string. To show what a variable holds, pass it straight to `print()`: `print(city)`.',
      'Task',
      'Read one line of text and print it back exactly as it was typed.',
      'Input',
      'One line of text.',
      'Output',
      'The same line, unchanged.',
      'Example',
      'If the input is `Python is fun`, print `Python is fun`.',
    ].join('\n\n'),
    hint: 'The text is already stored in `message`. Pass it to `print()` with no quotes around it: `print(message)`.',
    solutionNotes: 'Read the complete line with `input()` and print the variable without changing it.',
    starterCode: 'message = input()\n\n# TODO: print the message. Do not put quotes around the variable name.\n',
  },
  4: {
    solution: 'number = int(input())\nprint(number)\n',
    description: [
      'New idea: text vs numbers',
      '`input()` always returns text, even when the user types digits. To get a real whole number you can calculate with, wrap it in `int()`: `age = int(input())`.',
      'Task',
      'Read one whole number and print it back.',
      'Input',
      'One integer. It can be negative or zero.',
      'Output',
      'The same integer.',
      'Example',
      'If the input is `-3`, print `-3`.',
    ].join('\n\n'),
    hint: '`number` already holds a real integer. Print it with `print(number)`.',
    solutionNotes: '`int(input())` reads a line and turns it into an integer. Print the variable.',
    starterCode: '# int(...) turns the typed text into a whole number.\nnumber = int(input())\n\n# TODO: print the number\n',
  },
  5: {
    solution: 'first, second = map(int, input().split())\nprint(first + second)\n',
    description: [
      'New idea: reading two values and doing math',
      'Python can do math with `+` (add), `-` (subtract), `*` (multiply) and `/` (divide).',
      '`input().split()` cuts a line at its spaces into pieces. `a, b = input().split()` stores the first piece in `a` and the second in `b`. Wrap it with `map(int, ...)` to turn every piece into a whole number: `a, b = map(int, input().split())`.',
      'Task',
      'Read two integers on one line and print their sum.',
      'Input',
      'Two integers separated by a space.',
      'Output',
      'Their sum.',
      'Example',
      'Input `4 6` gives `10`.',
    ].join('\n\n'),
    hint: 'Both numbers are ready in `first` and `second`. Print `first + second`.',
    solutionNotes: 'Split the line into two pieces, convert both to integers, add them, and print the result.',
    starterCode: '# Reads "4 6" and stores 4 in first and 6 in second.\nfirst, second = map(int, input().split())\n\n# TODO: print first + second\n',
  },
  6: {
    solution: 'width, height = map(int, input().split())\narea = width * height\nprint(area)\n',
    description: [
      'Practice: a formula with two inputs',
      'You already know how to read two integers. Now use them in a formula. The area of a rectangle is `width * height`.',
      'Task',
      'Read the width and height of a rectangle and print its area.',
      'Input',
      'Two integers on one line: the width, then the height.',
      'Output',
      'The area.',
      'Example',
      'Input `5 8` gives `40`.',
    ].join('\n\n'),
    hint: 'Store the result first if it helps: `area = width * height`, then `print(area)`.',
    solutionNotes: 'Read width and height as integers, multiply them, and print the product.',
    starterCode: 'width, height = map(int, input().split())\n\n# TODO: calculate the area (width * height) and print it\n',
  },
  7: {
    description: [
      'New idea: numbers with decimals',
      'A whole number is an `int`. A number with a decimal part is a `float`. Use `float(input())` to read one. Maths with a float gives a float, and Python prints it with a decimal, such as `212.0`.',
      'To print a float as a whole number, wrap it with `int()`: `print(int(212.0))` shows `212`. In this problem every answer is a whole number, so this is safe.',
      'Task',
      'Convert a temperature from Celsius to Fahrenheit with `F = C * 9 / 5 + 32`.',
      'Input',
      'One number: the temperature in Celsius.',
      'Output',
      'The temperature in Fahrenheit, printed as a whole number.',
      'Example',
      'Input `100` gives `212`. Input `-40` gives `-40`.',
    ].join('\n\n'),
    hint: 'Write `fahrenheit = celsius * 9 / 5 + 32`, then print it with `print(int(fahrenheit))` so you do not get `.0` at the end.',
    solutionNotes: 'Read the temperature as a float, apply the formula, and print the result as an integer because the expected answers are whole numbers.',
    solution: 'celsius = float(input())\nfahrenheit = celsius * 9 / 5 + 32\nprint(int(fahrenheit))\n',
    starterCode: '# float(...) reads a number that may have decimals.\ncelsius = float(input())\n\n# TODO: fahrenheit = celsius * 9 / 5 + 32\n# TODO: print it as a whole number with int(...)\n',
  },
  8: {
    description: [
      'Practice: three values',
      '`map(int, input().split())` can read any number of values. Just name as many variables as there are numbers: `a, b, c = map(int, input().split())`.',
      'Task',
      'Read three integers and print their sum.',
      'Input',
      'Three integers separated by spaces. They may be negative.',
      'Output',
      'Their sum.',
      'Example',
      'Input `5 -2 4` gives `7`.',
    ].join('\n\n'),
    hint: 'Name three variables on the left of `=`, then print `a + b + c`.',
    solutionNotes: 'Read three integers, add them, and print the total.',
    solution: 'a, b, c = map(int, input().split())\nprint(a + b + c)\n',
    starterCode: '# Three names on the left, because there are three numbers.\na, b, c = map(int, input().split())\n\n# TODO: print the sum of a, b and c\n',
  },
  9: {
    description: [
      'Practice: brackets in a formula',
      'Python follows normal math order, and brackets run first. `2 * (3 + 4)` is `14`.',
      'The perimeter of a rectangle is the distance around it: `2 * (width + height)`.',
      'Task',
      'Read the width and height of a rectangle and print its perimeter.',
      'Input',
      'Two integers on one line: the width, then the height.',
      'Output',
      'The perimeter.',
      'Example',
      'Input `4 7` gives `22`.',
    ].join('\n\n'),
    hint: 'Do not forget the brackets: `2 * (width + height)`. Without them you get the wrong answer.',
    solutionNotes: 'Add the two side lengths, then double the sum.',
    solution: 'width, height = map(int, input().split())\nprint(2 * (width + height))\n',
    starterCode: 'width, height = map(int, input().split())\n\n# TODO: print 2 * (width + height)\n',
  },
  10: {
    description: [
      'Practice: decimals and conversion',
      'One kilometer is 1000 meters, so you multiply by 1000. The distance can have decimals, like `2.5`, so read it with `float(...)`.',
      'Task',
      'Convert a distance in kilometers to meters.',
      'Input',
      'One number: the distance in kilometers. It may have a decimal part.',
      'Output',
      'The distance in meters, printed as a whole number.',
      'Example',
      'Input `2.5` gives `2500`.',
    ].join('\n\n'),
    hint: 'Multiply by 1000, then wrap the result with `int(...)` when printing so `2500.0` becomes `2500`.',
    solutionNotes: 'Read the distance as a float, multiply by 1000, and print it as an integer since every expected answer is a whole number of meters.',
    solution: 'km = float(input())\nmeters = km * 1000\nprint(int(meters))\n',
    starterCode: 'km = float(input())\n\n# TODO: meters = km * 1000\n# TODO: print meters as a whole number with int(...)\n',
  },
}

// Questions that have a hand-written beginner statement, hint, starter code and solution.
const lessonsByCategory = {
  'python-basics': { ...beginnerLessons, ...BASICS_11_20 },
  'python-numbers': NUMBERS_1_20,
};

export const PYTHON_QUESTIONS = [...questionsFromSharedCurriculum, ...introductoryQuestions]
  .sort((a, b) => a.order - b.order)
  .map((question) => {
    const lesson = lessonsByCategory[question.category]?.[question.questionOrder] ?? null
    if (lesson) {
      return {
        ...question,
        ...lesson,
        solution: lesson.solution ?? question.solution,
        solutionNotes: lesson.solutionNotes ?? question.solutionNotes,
        exampleInput: question.exampleInput,
      }
    }
    return { ...question, starterCode: `# TODO: ${question.title}\n` }
  })
