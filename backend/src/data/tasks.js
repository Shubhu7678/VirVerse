const STARTER = `#include <stdio.h>

int main() {
    // Write your code here

    return 0;
}
`;

const tasks = [
  {
    slug: 'hello-world',
    title: 'Hello World',
    category: 'introduction',
    difficulty: 'Easy',
    description:
      'Every C journey starts with a first program. Write a program that prints exactly `Hello, World!` followed by a new line.\n\nHint: use `printf()` from `<stdio.h>`.',
    exampleInput: '',
    exampleOutput: 'Hello, World!',
    constraints: ['The program takes no input.', 'Output must match exactly, including capitalization and punctuation.'],
    starterCode: STARTER,
    testCases: [{ input: '', expectedOutput: 'Hello, World!' }],
  },
  {
    slug: 'add-two-numbers',
    title: 'Add Two Numbers',
    category: 'input-output',
    difficulty: 'Easy',
    description:
      'Read two integers from the input and print their sum.\n\nHint: use `scanf("%d", &a);` to read an integer.',
    exampleInput: '3 5',
    exampleOutput: '8',
    constraints: ['-10000 <= a, b <= 10000', 'Both numbers are separated by a space.'],
    starterCode: STARTER,
    testCases: [
      { input: '3 5', expectedOutput: '8' },
      { input: '-4 10', expectedOutput: '6' },
      { input: '0 0', expectedOutput: '0', isHidden: true },
      { input: '-10000 -10000', expectedOutput: '-20000', isHidden: true },
    ],
  },
  {
    slug: 'area-of-rectangle',
    title: 'Area of a Rectangle',
    category: 'variables',
    difficulty: 'Easy',
    description:
      'Read the length and width of a rectangle (both integers) and print its area.\n\nStore the values in `int` variables, calculate `length * width`, and print the result.',
    exampleInput: '6 4',
    exampleOutput: '24',
    constraints: ['1 <= length, width <= 1000'],
    starterCode: STARTER,
    testCases: [
      { input: '6 4', expectedOutput: '24' },
      { input: '1 1', expectedOutput: '1' },
      { input: '1000 1000', expectedOutput: '1000000', isHidden: true },
    ],
  },
  {
    slug: 'quotient-and-remainder',
    title: 'Quotient and Remainder',
    category: 'operators',
    difficulty: 'Easy',
    description:
      'Read two integers `a` and `b`. Print the quotient (`a / b`) on the first line and the remainder (`a % b`) on the second line.',
    exampleInput: '17 5',
    exampleOutput: '3\n2',
    constraints: ['0 <= a <= 100000', '1 <= b <= 100000'],
    starterCode: STARTER,
    testCases: [
      { input: '17 5', expectedOutput: '3\n2' },
      { input: '10 2', expectedOutput: '5\n0' },
      { input: '3 7', expectedOutput: '0\n3', isHidden: true },
      { input: '100000 1', expectedOutput: '100000\n0', isHidden: true },
    ],
  },
  {
    slug: 'even-or-odd',
    title: 'Even or Odd',
    category: 'if-else',
    difficulty: 'Easy',
    description:
      'Read an integer and print `Even` if it is even, or `Odd` if it is odd.\n\nHint: a number is even when `n % 2 == 0`.',
    exampleInput: '7',
    exampleOutput: 'Odd',
    constraints: ['-100000 <= n <= 100000'],
    starterCode: STARTER,
    testCases: [
      { input: '7', expectedOutput: 'Odd' },
      { input: '10', expectedOutput: 'Even' },
      { input: '0', expectedOutput: 'Even', isHidden: true },
      { input: '-3', expectedOutput: 'Odd', isHidden: true },
    ],
  },
  {
    slug: 'day-of-the-week',
    title: 'Day of the Week',
    category: 'switch',
    difficulty: 'Easy',
    description:
      'Read a number from 1 to 7 and print the matching day name using a `switch` statement (1 = Monday ... 7 = Sunday).\n\nFor any other number, print `Invalid`.',
    exampleInput: '3',
    exampleOutput: 'Wednesday',
    constraints: ['-100 <= n <= 100'],
    starterCode: STARTER,
    testCases: [
      { input: '3', expectedOutput: 'Wednesday' },
      { input: '1', expectedOutput: 'Monday' },
      { input: '7', expectedOutput: 'Sunday', isHidden: true },
      { input: '9', expectedOutput: 'Invalid', isHidden: true },
      { input: '0', expectedOutput: 'Invalid', isHidden: true },
    ],
  },
  {
    slug: 'factorial',
    title: 'Factorial of a Number',
    category: 'for-loops',
    difficulty: 'Easy',
    description:
      'Read a non-negative integer `n` and print its factorial.\n\nThe factorial of `n` is `1 * 2 * 3 * ... * n`, and the factorial of 0 is 1.',
    exampleInput: '5',
    exampleOutput: '120',
    constraints: ['0 <= n <= 12 (the result fits in an `int`).'],
    starterCode: STARTER,
    testCases: [
      { input: '5', expectedOutput: '120' },
      { input: '0', expectedOutput: '1' },
      { input: '1', expectedOutput: '1', isHidden: true },
      { input: '12', expectedOutput: '479001600', isHidden: true },
    ],
  },
  {
    slug: 'count-digits',
    title: 'Count the Digits',
    category: 'while-loops',
    difficulty: 'Medium',
    description:
      'Read a positive integer and print how many digits it has.\n\nHint: keep dividing the number by 10 in a `while` loop and count the steps.',
    exampleInput: '12345',
    exampleOutput: '5',
    constraints: ['1 <= n <= 1000000000'],
    starterCode: STARTER,
    testCases: [
      { input: '12345', expectedOutput: '5' },
      { input: '7', expectedOutput: '1' },
      { input: '1000000000', expectedOutput: '10', isHidden: true },
      { input: '99', expectedOutput: '2', isHidden: true },
    ],
  },
  {
    slug: 'right-triangle-pattern',
    title: 'Right Triangle Pattern',
    category: 'patterns',
    difficulty: 'Medium',
    description:
      'Read an integer `n` and print a right triangle of `*` characters with `n` rows. Row `i` has `i` stars.',
    exampleInput: '4',
    exampleOutput: '*\n**\n***\n****',
    constraints: ['1 <= n <= 20', 'No trailing spaces on any line.'],
    starterCode: STARTER,
    testCases: [
      { input: '4', expectedOutput: '*\n**\n***\n****' },
      { input: '1', expectedOutput: '*' },
      { input: '6', expectedOutput: '*\n**\n***\n****\n*****\n******', isHidden: true },
    ],
  },
  {
    slug: 'sum-of-array',
    title: 'Sum of Array Elements',
    category: 'arrays',
    difficulty: 'Medium',
    description:
      'The first line contains `n`, the number of elements. The second line contains `n` integers. Store them in an array and print their sum.',
    exampleInput: '5\n1 2 3 4 5',
    exampleOutput: '15',
    constraints: ['1 <= n <= 100', '-1000 <= each element <= 1000'],
    starterCode: STARTER,
    testCases: [
      { input: '5\n1 2 3 4 5', expectedOutput: '15' },
      { input: '3\n-1 -2 -3', expectedOutput: '-6' },
      { input: '1\n42', expectedOutput: '42', isHidden: true },
      { input: '4\n1000 -1000 500 -500', expectedOutput: '0', isHidden: true },
    ],
  },
];

export default tasks;
