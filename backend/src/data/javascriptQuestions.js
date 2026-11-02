import { JAVASCRIPT_SOLUTION_GUIDES } from './javascriptSolutionGuides.js'
import { javascriptSolutionProgram } from './javascriptSolutionPrograms.js'

const inputCode = `const fs = require('node:fs')
const input = fs.readFileSync(0, 'utf8').trim()
`

const defineTask = (topicOrder, questionOrder, category, title, difficulty, description, starterCode, cases, constraints = []) => {
  const visibleCases = cases.slice(0, 2)
  return {
    slug: `javascript-${category}-${String(questionOrder).padStart(2, '0')}`,
    language: 'javascript',
    title,
    category,
    difficulty,
    description: `${description}\n\nInput\nRead the values from standard input.\n\nOutput\nPrint the requested result.`,
    exampleInput: cases[0].input,
    exampleOutput: cases[0].expectedOutput,
    constraints,
    hint: category === 'js-loops-arrays'
      ? 'Consider how to visit each value once, and keep only the information needed for the final result.'
      : category === 'js-strings-functions'
        ? 'Break the text into the parts you need, transform them, then combine the result in the required order.'
        : category === 'js-logic'
          ? 'List the possible cases and check boundary values before choosing the condition order.'
          : category === 'js-numbers'
            ? 'Translate the requested calculation into arithmetic operations and check how negative or decimal values behave.'
            : 'Parse the input carefully, perform the requested operation, and print only the required result.',
    solutionNotes: JAVASCRIPT_SOLUTION_GUIDES[category]?.[questionOrder - 1] || '',
    solution: javascriptSolutionProgram(category, questionOrder, starterCode),
    starterCode: `${inputCode}// TODO: ${title}\n`,
    testCases: cases.map((testCase, index) => ({ ...testCase, isHidden: index >= visibleCases.length })),
    order: topicOrder * 100 + questionOrder,
    topicOrder,
    questionOrder,
  }
}

const task = (topicOrder, order, category, title, difficulty, description, code, cases, constraints) =>
  defineTask(topicOrder, order, category, title, difficulty, description, code, cases, constraints)

const introductoryQuestions = [
  task(1, 1, 'js-basics', 'Greet the Learner', 'Easy', 'Read a name and print `Hello, <name>!`.', `const name = input.split(/\\s+/).join(' ')
console.log(\`Hello, \${name}!\`)`, [
    { input: 'Ada Lovelace', expectedOutput: 'Hello, Ada Lovelace!' },
    { input: 'Grace Hopper', expectedOutput: 'Hello, Grace Hopper!' },
    { input: 'Linus', expectedOutput: 'Hello, Linus!' },
  ], ['The name contains one or more words.']),
  task(1, 2, 'js-basics', 'Echo a Message', 'Easy', 'Print the input message exactly as it is given.', `console.log(input)`, [
    { input: 'Welcome to JavaScript!', expectedOutput: 'Welcome to JavaScript!' },
    { input: 'Practice every day', expectedOutput: 'Practice every day' },
    { input: '42', expectedOutput: '42' },
  ]),
  task(1, 3, 'js-basics', 'Add Two Integers', 'Easy', 'Read two integers and print their sum.', `const [a, b] = input.split(/\\s+/).map(Number)
console.log(a + b)`, [
    { input: '12 30', expectedOutput: '42' },
    { input: '-8 3', expectedOutput: '-5' },
    { input: '0 0', expectedOutput: '0' },
  ]),
  task(1, 4, 'js-basics', 'Rectangle Area', 'Easy', 'Read the width and height of a rectangle. Print its area.', `const [width, height] = input.split(/\\s+/).map(Number)
console.log(width * height)`, [
    { input: '5 8', expectedOutput: '40' },
    { input: '3 3', expectedOutput: '9' },
    { input: '12 1', expectedOutput: '12' },
  ]),
  task(1, 5, 'js-basics', 'Celsius to Fahrenheit', 'Easy', 'Convert a temperature in Celsius to Fahrenheit using F = C × 9 / 5 + 32.', `const celsius = Number(input)
console.log(celsius * 9 / 5 + 32)`, [
    { input: '0', expectedOutput: '32' },
    { input: '100', expectedOutput: '212' },
    { input: '-40', expectedOutput: '-40' },
  ]),
  task(2, 1, 'js-numbers', 'Absolute Difference', 'Easy', 'Read two integers and print the absolute difference between them.', `const [a, b] = input.split(/\\s+/).map(Number)
console.log(Math.abs(a - b))`, [
    { input: '17 5', expectedOutput: '12' },
    { input: '3 11', expectedOutput: '8' },
    { input: '-4 4', expectedOutput: '8' },
  ]),
  task(2, 2, 'js-numbers', 'Minutes to Seconds', 'Easy', 'Convert a non-negative number of minutes to seconds.', `const minutes = Number(input)
console.log(minutes * 60)`, [
    { input: '3', expectedOutput: '180' },
    { input: '0', expectedOutput: '0' },
    { input: '12', expectedOutput: '720' },
  ]),
  task(2, 3, 'js-numbers', 'Average of Three Numbers', 'Easy', 'Read three numbers and print their average.', `const [a, b, c] = input.split(/\\s+/).map(Number)
console.log((a + b + c) / 3)`, [
    { input: '3 6 9', expectedOutput: '6' },
    { input: '1 2 4', expectedOutput: '2.3333333333333335' },
    { input: '0 0 0', expectedOutput: '0' },
  ]),
  task(2, 4, 'js-numbers', 'Circle Circumference', 'Easy', 'Read a circle radius and print its circumference using 3.14 for π. Print exactly two digits after the decimal point.', `const radius = Number(input)
console.log((2 * 3.14 * radius).toFixed(2))`, [
    { input: '1', expectedOutput: '6.28' },
    { input: '2.5', expectedOutput: '15.70' },
    { input: '0', expectedOutput: '0.00' },
  ]),
  task(2, 5, 'js-numbers', 'Even or Odd', 'Easy', 'Read an integer and print `Even` if it is divisible by 2, otherwise print `Odd`.', `const number = Number(input)
console.log(number % 2 === 0 ? 'Even' : 'Odd')`, [
    { input: '14', expectedOutput: 'Even' },
    { input: '-3', expectedOutput: 'Odd' },
    { input: '0', expectedOutput: 'Even' },
  ]),
  task(3, 1, 'js-logic', 'Largest of Three', 'Easy', 'Read three integers and print the largest.', `const values = input.split(/\\s+/).map(Number)
console.log(Math.max(...values))`, [
    { input: '3 12 7', expectedOutput: '12' },
    { input: '-1 -9 -4', expectedOutput: '-1' },
    { input: '5 5 2', expectedOutput: '5' },
  ]),
  task(3, 2, 'js-logic', 'Classify a Number', 'Easy', 'Print `Positive`, `Negative`, or `Zero` according to the input number.', `const number = Number(input)
console.log(number > 0 ? 'Positive' : number < 0 ? 'Negative' : 'Zero')`, [
    { input: '8', expectedOutput: 'Positive' },
    { input: '-2', expectedOutput: 'Negative' },
    { input: '0', expectedOutput: 'Zero' },
  ]),
  task(3, 3, 'js-logic', 'Pass or Retry', 'Easy', 'Read a score from 0 to 100. Print `Pass` for a score of at least 50, otherwise print `Retry`.', `const score = Number(input)
console.log(score >= 50 ? 'Pass' : 'Retry')`, [
    { input: '50', expectedOutput: 'Pass' },
    { input: '49', expectedOutput: 'Retry' },
    { input: '100', expectedOutput: 'Pass' },
  ]),
  task(3, 4, 'js-logic', 'Leap Year Check', 'Medium', 'Print `Leap` if the given year is a leap year in the Gregorian calendar, otherwise print `Common`.', `const year = Number(input)
const leap = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)
console.log(leap ? 'Leap' : 'Common')`, [
    { input: '2024', expectedOutput: 'Leap' },
    { input: '1900', expectedOutput: 'Common' },
    { input: '2000', expectedOutput: 'Leap' },
  ]),
  task(3, 5, 'js-logic', 'Vowel or Consonant', 'Easy', 'Read one English letter and print `Vowel` or `Consonant`.', `const letter = input.toLowerCase()
console.log('aeiou'.includes(letter) ? 'Vowel' : 'Consonant')`, [
    { input: 'A', expectedOutput: 'Vowel' },
    { input: 'z', expectedOutput: 'Consonant' },
    { input: 'e', expectedOutput: 'Vowel' },
  ]),
  task(4, 1, 'js-loops-arrays', 'Sum an Array', 'Easy', 'The first input value is the array length, followed by its integers. Print the sum.', `const values = input.split(/\\s+/).map(Number)
const length = values[0]
console.log(values.slice(1, length + 1).reduce((sum, value) => sum + value, 0))`, [
    { input: '4 2 4 6 8', expectedOutput: '20' },
    { input: '3 -2 5 1', expectedOutput: '4' },
    { input: '1 7', expectedOutput: '7' },
  ]),
  task(4, 2, 'js-loops-arrays', 'Count Even Values', 'Easy', 'The first input value is the array length, followed by its integers. Print how many values are even.', `const values = input.split(/\\s+/).map(Number)
const length = values[0]
console.log(values.slice(1, length + 1).filter((value) => value % 2 === 0).length)`, [
    { input: '5 1 2 3 4 6', expectedOutput: '3' },
    { input: '4 1 3 5 7', expectedOutput: '0' },
    { input: '3 0 -2 9', expectedOutput: '2' },
  ]),
  task(4, 3, 'js-loops-arrays', 'Reverse a Word', 'Easy', 'Read one word and print its characters in reverse order.', `console.log([...input].reverse().join(''))`, [
    { input: 'hello', expectedOutput: 'olleh' },
    { input: 'JavaScript', expectedOutput: 'tpircSavaJ' },
    { input: 'a', expectedOutput: 'a' },
  ]),
  task(4, 4, 'js-loops-arrays', 'Factorial', 'Medium', 'Read a non-negative integer n and print n factorial. Define 0! as 1.', `const n = Number(input)
let result = 1
for (let value = 2; value <= n; value += 1) result *= value
console.log(result)`, [
    { input: '5', expectedOutput: '120' },
    { input: '0', expectedOutput: '1' },
    { input: '7', expectedOutput: '5040' },
  ], ['0 ≤ n ≤ 18.']),
  task(4, 5, 'js-loops-arrays', 'Multiplication Table', 'Easy', 'Read an integer n and print its multiplication table from 1 through 5, one result per line.', `const n = Number(input)
for (let multiplier = 1; multiplier <= 5; multiplier += 1) {
  console.log(\`\${n} x \${multiplier} = \${n * multiplier}\`)
}`, [
    { input: '3', expectedOutput: '3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15' },
    { input: '0', expectedOutput: '0 x 1 = 0\n0 x 2 = 0\n0 x 3 = 0\n0 x 4 = 0\n0 x 5 = 0' },
    { input: '7', expectedOutput: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35' },
  ]),
]

const addedQuestion = (topicOrder, questionOrder, category, title, description, cases, difficulty = 'Easy') =>
  task(topicOrder, questionOrder, category, title, difficulty, description, '', cases)

const addedTopics = [
  {
    topicOrder: 1,
    category: 'js-basics',
    firstQuestion: 6,
    questions: [
      ['Add Three Integers', 'Read three integers and print their sum.', [['1 2 3', '6'], ['-1 0 1', '0'], ['10 20 30', '60'], ['5 -2 4', '7']]],
      ['Rectangle Perimeter', 'Read width and height and print the rectangle perimeter.', [['4 7', '22'], ['1 1', '4'], ['0 5', '10'], ['12 3', '30']]],
      ['Kilometers to Meters', 'Convert a distance in kilometers to meters.', [['1', '1000'], ['2.5', '2500'], ['0', '0'], ['0.75', '750']]],
      ['Swap Two Values', 'Read two values and print them in reverse order, separated by one space.', [['red blue', 'blue red'], ['1 2', '2 1'], ['left right', 'right left'], ['first last', 'last first']]],
      ['Integer Quotient', 'Read two non-negative integers and print the integer quotient of the first divided by the second.', [['17 5', '3'], ['20 4', '5'], ['9 2', '4'], ['0 3', '0']]],
      ['Remainder', 'Read two integers and print the remainder when the first is divided by the second.', [['17 5', '2'], ['20 4', '0'], ['9 2', '1'], ['14 3', '2']]],
      ['Simple Interest', 'Read principal, annual rate, and years. Print simple interest as principal × rate × years / 100.', [['1000 5 2', '100'], ['500 4 3', '60'], ['250 0 5', '0'], ['1200 2.5 4', '120']]],
      ['Price After Discount', 'Read a price and discount percentage. Print the price after applying the discount.', [['100 20', '80'], ['50 10', '45'], ['80 0', '80'], ['200 25', '150']]],
      ['Uppercase a Word', 'Read a word and print it in uppercase.', [['hello', 'HELLO'], ['JavaScript', 'JAVASCRIPT'], ['a', 'A'], ['world123', 'WORLD123']]],
      ['First and Last Character', 'Read a non-empty word and print its first and last characters separated by a space.', [['hello', 'h o'], ['a', 'a a'], ['code', 'c e'], ['JavaScript', 'J t']]],
      ['Repeat a Word', 'Read a word and a positive count. Print the word that many times, separated by spaces.', [['go 3', 'go go go'], ['x 1', 'x'], ['hi 2', 'hi hi'], ['ok 4', 'ok ok ok ok']]],
      ['Fahrenheit to Celsius', 'Convert Fahrenheit to Celsius using C = (F - 32) × 5 / 9. Print the numeric result.', [['32', '0'], ['212', '100'], ['-40', '-40'], ['68', '20']]],
      ['Absolute Last Digit', 'Read an integer and print the absolute value of its last decimal digit.', [['-123', '3'], ['40', '0'], ['7', '7'], ['-98', '8']]],
      ['Minutes as Hours and Minutes', 'Convert a non-negative number of minutes to whole hours and remaining minutes, formatted as H:M.', [['135', '2:15'], ['60', '1:0'], ['9', '0:9'], ['240', '4:0']]],
      ['Average of Two Numbers', 'Read two numbers and print their average with exactly two digits after the decimal point.', [['2 3', '2.50'], ['0 1', '0.50'], ['10 10', '10.00'], ['-2 5', '1.50']]],
    ],
  },
  {
    topicOrder: 2,
    category: 'js-numbers',
    firstQuestion: 6,
    questions: [
      ['Larger of Two', 'Read two integers and print the larger value.', [['4 9', '9'], ['-3 -8', '-3'], ['7 7', '7'], ['0 -1', '0']]],
      ['Integer Power', 'Read a non-negative integer base and exponent and print the power.', [['2 5', '32'], ['3 0', '1'], ['7 2', '49'], ['0 4', '0']]],
      ['Sum of Digits', 'Read a non-negative integer and print the sum of its digits.', [['1234', '10'], ['0', '0'], ['908', '17'], ['55', '10']]],
      ['Reverse Digits', 'Read a non-negative integer and print its digits in reverse order without leading zeroes.', [['1230', '321'], ['7', '7'], ['900', '9'], ['508', '805']]],
      ['Prime Check', 'Print `Prime` if the input integer is prime, otherwise print `Not prime`.', [['2', 'Prime'], ['9', 'Not prime'], ['1', 'Not prime'], ['17', 'Prime']], 'Medium'],
      ['Greatest Common Divisor', 'Read two non-negative integers and print their greatest common divisor.', [['12 18', '6'], ['7 5', '1'], ['0 9', '9'], ['24 16', '8']]],
      ['Least Common Multiple', 'Read two positive integers and print their least common multiple.', [['4 6', '12'], ['3 7', '21'], ['5 10', '10'], ['8 12', '24']]],
      ['Count Divisors', 'Read a positive integer and print how many positive divisors it has.', [['1', '1'], ['6', '4'], ['12', '6'], ['13', '2']]],
      ['Round to Two Decimals', 'Read a decimal number and print it rounded to exactly two decimal places.', [['3.14159', '3.14'], ['2', '2.00'], ['1.236', '1.24'], ['-4.555', '-4.55']]],
      ['Percentage of a Total', 'Read a part and a total, then print what percentage the part is of the total.', [['25 100', '25'], ['1 4', '25'], ['3 6', '50'], ['0 10', '0']]],
      ['Triangle Area', 'Read a triangle base and height and print base × height / 2.', [['10 4', '20'], ['3 3', '4.5'], ['1 8', '4'], ['0 5', '0']]],
      ['Distance Between Integers', 'Read two positions on a number line and print the distance between them.', [['2 9', '7'], ['-4 3', '7'], ['5 5', '0'], ['-8 -2', '6']]],
      ['Product of Digits', 'Read a non-negative integer and print the product of its digits.', [['234', '24'], ['105', '0'], ['7', '7'], ['11', '1']]],
      ['Is a Perfect Square', 'Print `Yes` if the non-negative input is a perfect square, otherwise print `No`.', [['49', 'Yes'], ['50', 'No'], ['0', 'Yes'], ['1', 'Yes']]],
      ['Number of Trailing Zeroes', 'Read a non-negative integer and print how many zeroes appear at the end of its decimal representation.', [['1200', '2'], ['7', '0'], ['100000', '5'], ['1010', '1']]],
    ],
  },
  {
    topicOrder: 3,
    category: 'js-logic',
    firstQuestion: 6,
    questions: [
      ['Divisible by Three', 'Print `Yes` if the integer is divisible by 3, otherwise print `No`.', [['9', 'Yes'], ['10', 'No'], ['0', 'Yes'], ['-6', 'Yes']]],
      ['Divisible by Three and Five', 'Print `Yes` if the integer is divisible by both 3 and 5, otherwise print `No`.', [['15', 'Yes'], ['30', 'Yes'], ['9', 'No'], ['0', 'Yes']]],
      ['Letter Grade', 'Print A for scores 90–100, B for 80–89, C for 70–79, D for 60–69, and F otherwise.', [['95', 'A'], ['80', 'B'], ['70', 'C'], ['59', 'F']]],
      ['Valid Triangle', 'Read three side lengths and print `Valid` if they can form a triangle, otherwise print `Invalid`.', [['3 4 5', 'Valid'], ['1 2 3', 'Invalid'], ['5 5 5', 'Valid'], ['2 3 4', 'Valid']]],
      ['Triangle Type', 'Given three valid side lengths, print `Equilateral`, `Isosceles`, or `Scalene`.', [['3 3 3', 'Equilateral'], ['4 4 5', 'Isosceles'], ['3 4 5', 'Scalene'], ['8 6 8', 'Isosceles']]],
      ['Basic Calculator', 'Read two numbers and an operator (+, -, *, /), then print the operation result.', [['8 + 3', '11'], ['8 - 3', '5'], ['4 * 5', '20'], ['9 / 3', '3']]],
      ['Inside an Inclusive Range', 'Read a value and range endpoints. Print `Yes` if the value is within the inclusive range, otherwise `No`.', [['5 1 9', 'Yes'], ['1 1 9', 'Yes'], ['10 1 9', 'No'], ['4 4 4', 'Yes']]],
      ['Age Group', 'Print `Child` for ages below 13, `Teen` for 13–19, and `Adult` for 20 or older.', [['12', 'Child'], ['13', 'Teen'], ['19', 'Teen'], ['20', 'Adult']]],
      ['Weekday Name', 'Read a number from 1 to 7 and print its weekday name, with 1 representing Monday.', [['1', 'Monday'], ['5', 'Friday'], ['7', 'Sunday'], ['3', 'Wednesday']]],
      ['Compare Two Values', 'Print `Equal`, `First`, or `Second` depending on whether the values match or which is larger.', [['4 4', 'Equal'], ['9 2', 'First'], ['1 7', 'Second'], ['-2 -5', 'First']]],
      ['Largest of Four', 'Read four integers and print the largest.', [['1 8 3 4', '8'], ['-1 -8 -3 -4', '-1'], ['5 5 2 1', '5'], ['0 0 0 0', '0']]],
      ['Coordinate Quadrant', 'Read non-zero x and y coordinates and print the quadrant number (1 through 4).', [['2 3', '1'], ['-2 3', '2'], ['-2 -3', '3'], ['2 -3', '4']]],
      ['Character Category', 'Read one character and print `Digit`, `Uppercase`, or `Lowercase`.', [['7', 'Digit'], ['A', 'Uppercase'], ['z', 'Lowercase'], ['0', 'Digit']]],
      ['Shipping Cost', 'Read an order total. Shipping costs 5 when the total is below 50 and is free otherwise. Print the final amount.', [['40', '45'], ['50', '50'], ['0', '5'], ['75', '75']]],
      ['Electricity Bill', 'Read units used. Charge 1 per unit for the first 100, 2 per unit for the next 100, and 3 per unit above 200.', [['50', '50'], ['100', '100'], ['150', '200'], ['250', '450']]],
    ],
  },
  {
    topicOrder: 4,
    category: 'js-loops-arrays',
    firstQuestion: 6,
    questions: [
      ['Maximum in an Array', 'Read n followed by n integers and print the maximum.', [['4 1 9 2 5', '9'], ['3 -4 -1 -9', '-1'], ['1 7', '7'], ['5 0 0 0 0 0', '0']]],
      ['Minimum in an Array', 'Read n followed by n integers and print the minimum.', [['4 1 9 2 5', '1'], ['3 -4 -1 -9', '-9'], ['1 7', '7'], ['5 0 0 0 0 0', '0']]],
      ['Array Average', 'Read n followed by n numbers and print their average with two decimal places.', [['3 2 4 6', '4.00'], ['2 1 2', '1.50'], ['4 0 0 0 8', '2.00'], ['1 -3', '-3.00']]],
      ['Count a Target', 'Read n, n integers, and a target. Print how many times the target occurs.', [['5 1 2 1 3 1 1', '3'], ['3 4 5 6 9', '0'], ['1 7 7', '1'], ['4 2 2 2 2 2', '4']]],
      ['Remove Duplicates', 'Read n and n integers. Print each distinct value once, preserving its first-occurrence order.', [['5 1 2 1 3 2', '1 2 3'], ['4 7 7 7 7', '7'], ['3 4 5 6', '4 5 6'], ['1 9', '9']]],
      ['Rotate Array Right', 'Read n and n integers. Print the array after rotating it right by one position.', [['4 1 2 3 4', '4 1 2 3'], ['1 9', '9'], ['3 5 6 7', '7 5 6'], ['2 -1 0', '0 -1']]],
      ['Second Largest Distinct', 'Read n and n integers and print the second-largest distinct value. Inputs always contain at least two distinct values.', [['5 1 9 3 9 7', '7'], ['3 4 2 1', '2'], ['4 -1 -5 -3 -2', '-2'], ['3 8 8 5', '5']], 'Medium'],
      ['Reverse an Array', 'Read n and n integers and print them in reverse order, separated by spaces.', [['4 1 2 3 4', '4 3 2 1'], ['1 9', '9'], ['3 5 0 -2', '-2 0 5'], ['2 7 8', '8 7']]],
      ['Prefix Sums', 'Read n and n integers. Print the running sum after each value.', [['4 1 2 3 4', '1 3 6 10'], ['3 5 -2 1', '5 3 4'], ['1 7', '7'], ['2 0 0', '0 0']]],
      ['Count Positive Values', 'Read n and n integers. Print the number of positive values.', [['5 -1 0 2 3 -4', '2'], ['3 1 2 3', '3'], ['2 -1 0', '0'], ['1 9', '1']]],
      ['First Target Index', 'Read n, n integers, and a target. Print its zero-based first index, or -1 if absent.', [['5 4 2 8 2 9 2', '1'], ['3 1 2 3 8', '-1'], ['1 7 7', '0'], ['4 5 6 7 8 8', '3']]],
      ['Merge and Sort Arrays', 'Read n, m, then both arrays. Print all values in ascending order.', [['3 2 4 1 3 2 5', '1 2 3 4 5'], ['2 2 9 0 4 1', '0 1 4 9'], ['1 3 7 3 2 1', '1 2 3 7'], ['2 1 -1 5 0', '-1 0 5']]],
      ['Array Palindrome', 'Read n and n integers. Print `Yes` if the sequence reads the same forward and backward.', [['5 1 2 3 2 1', 'Yes'], ['4 1 2 2 1', 'Yes'], ['3 1 2 3', 'No'], ['1 9', 'Yes']]],
      ['Most Frequent Value', 'Read n and n integers. Print the most frequent value; if tied, print the smallest tied value.', [['6 2 1 2 3 1 2', '2'], ['4 5 5 1 1', '1'], ['3 7 8 9', '7'], ['5 -1 -1 2 2 0', '-1']], 'Medium'],
      ['Matrix Main Diagonal Sum', 'Read n followed by an n × n matrix and print the sum of its main diagonal.', [['2 1 2 3 4', '5'], ['1 9', '9'], ['3 1 2 3 4 5 6 7 8 9', '15'], ['2 -1 0 4 8', '7']]],
    ],
  },
  {
    topicOrder: 5,
    category: 'js-strings-functions',
    firstQuestion: 1,
    questions: [
      ['String Length', 'Read a line of text and print the number of characters, including spaces.', [['hello', '5'], ['JavaScript', '10'], ['a b', '3'], ['OpenAI', '6']]],
      ['Reverse a String', 'Read one word and print its characters in reverse order.', [['hello', 'olleh'], ['a', 'a'], ['code', 'edoc'], ['12345', '54321']]],
      ['Palindrome Word', 'Print `Yes` if the input word is a palindrome ignoring letter case, otherwise print `No`.', [['Level', 'Yes'], ['hello', 'No'], ['Madam', 'Yes'], ['a', 'Yes']]],
      ['Remove Spaces', 'Read a line and print it with all space characters removed.', [['a b c', 'abc'], ['hello', 'hello'], ['two  spaces', 'twospaces'], [' Java Script ', 'JavaScript']]],
      ['Count Vowels', 'Read a line and print the number of English vowels, ignoring letter case.', [['hello', '2'], ['AEIOU', '5'], ['rhythm', '0'], ['JavaScript', '3']]],
      ['Count a Character', 'Read a line followed by a character on the next line. Print how many times that character occurs.', [['banana\na', '3'], ['hello\nl', '2'], ['abc\nz', '0'], ['aaaa\na', '4']]],
      ['First Repeated Character', 'Print the first character in the word that occurs more than once, or `None` if there is no repeat.', [['swiss', 's'], ['hello', 'l'], ['abc', 'None'], ['level', 'e']]],
      ['Capitalize First Character', 'Read a word and print it with only its first character converted to uppercase.', [['hello', 'Hello'], ['JavaScript', 'JavaScript'], ['a', 'A'], ['WORLD', 'WORLD']]],
      ['Title Case Words', 'Read a line and capitalize the first character of each whitespace-separated word.', [['hello world', 'Hello World'], ['javascript practice', 'Javascript Practice'], ['a b c', 'A B C'], ['Open AI', 'Open Ai']]],
      ['Replace a Character', 'Read a word, a character to find, and a replacement character. Replace every matching occurrence.', [['banana a o', 'bonono'], ['hello l x', 'hexxo'], ['abc z q', 'abc'], ['aaaa a b', 'bbbb']]],
      ['Remove Vowels', 'Read a line and print it with all English vowels removed, preserving letter case and spaces.', [['hello world', 'hll wrld'], ['AEIOU', ''], ['rhythm', 'rhythm'], ['Java Script', 'Jv Scrpt']]],
      ['Count Words', 'Read a line and print the number of whitespace-separated words.', [['hello world', '2'], ['one', '1'], ['  many   spaces  ', '2'], ['', '0']]],
      ['Anagram Check', 'Read two words and print `Yes` if they contain the same letters with the same counts, ignoring case.', [['Listen Silent', 'Yes'], ['hello world', 'No'], ['Dusty study', 'Yes'], ['a A', 'Yes']]],
      ['Prefix and Suffix Check', 'Read a word, a prefix, and a suffix. Print `Yes` if the word starts and ends with them.', [['javascript java script', 'Yes'], ['hello he lo', 'Yes'], ['hello he xx', 'No'], ['abc a c', 'Yes']]],
      ['Run-Length Encode', 'Encode each run of identical adjacent characters as the character followed by its count.', [['aaabbc', 'a3b2c1'], ['abcd', 'a1b1c1d1'], ['zzzz', 'z4'], ['a', 'a1']]],
      ['Greeting Function', 'Read a name and print `Hello, <name>!` using a reusable greeting function.', [['Ada', 'Hello, Ada!'], ['Grace Hopper', 'Hello, Grace Hopper!'], ['Sam', 'Hello, Sam!'], ['Taylor', 'Hello, Taylor!']]],
      ['Factorial Function', 'Read a non-negative integer and print its factorial by using a function.', [['5', '120'], ['0', '1'], ['1', '1'], ['6', '720']], 'Medium'],
      ['Prime-Checking Function', 'Print `Prime` if the input integer is prime, otherwise print `Not prime`, using a reusable function.', [['2', 'Prime'], ['9', 'Not prime'], ['1', 'Not prime'], ['17', 'Prime']], 'Medium'],
      ['Fibonacci Value', 'Read n and print the zero-based Fibonacci value F(n), where F(0)=0 and F(1)=1.', [['0', '0'], ['1', '1'], ['7', '13'], ['10', '55']], 'Medium'],
      ['Longest Word', 'Read a line of words and print the longest word. If tied, print the first longest word.', [['I love JavaScript', 'JavaScript'], ['cat dog', 'cat'], ['tiny enormous big', 'enormous'], ['one', 'one']]],
    ],
  },
]

export const JAVASCRIPT_QUESTIONS = [
  ...introductoryQuestions,
  ...addedTopics.flatMap(({ topicOrder, category, firstQuestion, questions }) =>
    questions.map(([title, description, cases, difficulty], index) =>
      addedQuestion(topicOrder, firstQuestion + index, category, title, description,
        cases.map(([input, expectedOutput]) => ({ input, expectedOutput })), difficulty)
    )
  ),
]
