// Lessons 11-40 of the Python beginner guide. Lesson N goes with Python question N
// (questions 11-20 are the rest of Python Basics, 21-40 are Numbers and Operators 1-20).
// Examples use different values than the questions. Code in each step is run by
// `npm run guide:verify`, which checks that `output` is what the code really prints.
const questionSlug = (n) => (n <= 20
  ? `python-python-basics-${String(n).padStart(2, '0')}`
  : `python-python-numbers-${String(n - 20).padStart(2, '0')}`);

const lesson = (n, section, slug, title, summary, intro, steps, mistakes, recap, check) => ({
  n, section, slug, title, summary, intro, steps, mistakes, recap, check, question: questionSlug(n),
});

// Shared by several lessons: print a float without a useless ".0".
const CLEAN = `if result == int(result):
    print(int(result))
else:
    print(result)`;

export const PYTHON_GUIDE_MORE = [
  lesson(11, 'Reordering and division', 'swapping-values', 'Reordering values',
    'Read two words and print them the other way round.',
    'Variables are like labelled boxes. Once you have read values into boxes, you can print them in any order you like. Reordering is just choosing which box to print first.',
    [
      { title: 'Read two words', text: 'split() cuts a line at its spaces. With no map(), the pieces stay as text, which is what you want for words.', code: `a, b = input().split()\nprint(a)\nprint(b)`, input: 'sun moon', output: `sun\nmoon` },
      { title: 'Print on one line', text: 'Give print several things separated by commas and it puts one space between them.', code: `a, b = input().split()\nprint(b, a)`, input: 'sun moon', output: 'moon sun' },
      { title: 'Why no int() here?', text: 'int() is only for numbers. Words and mixed text stay as they are. The same code also works for numbers because they are just printed back.', code: `a, b = input().split()\nprint(b, a)`, input: '10 20', output: '20 10' },
    ],
    ['Using map(int, ...) on words. It would crash, because "sun" is not a number.', 'Writing print(b + a). The + glues text together with no space. Use a comma to get a space.', 'Printing a and b on separate lines when one line is asked for.'],
    ['split() cuts text at spaces.', 'print(x, y) puts one space between x and y.', 'Reordering means printing the same variables in a different order.'],
    { question: 'What does print("a", "b") show?', options: ['ab', 'a b', 'a, b'], answer: 1, explain: 'A comma between the values makes print put exactly one space between them.' }),

  lesson(12, 'Reordering and division', 'integer-division', 'Whole-number division: //',
    'Divide and keep only the whole part.',
    'Normal division with / gives a decimal answer. Sometimes you only want how many whole times one number fits into another, like how many full boxes of 5 you can fill with 17 apples. Python has a separate operator for that: //.',
    [
      { title: '/ versus //', text: '/ keeps the decimal part. // throws it away and keeps the whole number.', code: `print(17 / 5)\nprint(17 // 5)`, output: `3.4\n3` },
      { title: 'Use it with input', text: 'Read two integers, then divide with //. The answer is a whole number, so it prints without a .0.', code: `a, b = map(int, input().split())\nprint(a // b)`, input: '23 4', output: '5' },
      { title: 'It rounds down', text: '// always goes down to the next whole number, not to the nearest one.', code: `print(9 // 2)\nprint(0 // 3)`, output: `4\n0` },
    ],
    ['Using / and expecting a whole number. 17 / 5 is 3.4, not 3.', 'Writing // when you really need the decimal answer.', 'Dividing by zero. Python stops with an error.'],
    ['/ gives a decimal.', '// gives the whole part.', '// rounds down.'],
    { question: 'What is 20 // 6?', options: ['3.33', '3', '4'], answer: 1, explain: '6 fits into 20 three whole times (18), with 2 left over.' }),

  lesson(13, 'Reordering and division', 'remainder', 'The remainder: %',
    'Find what is left over after dividing.',
    'After you fit 5 apples into boxes of 4, 1 apple is left. That leftover is called the remainder, and Python calculates it with the % sign. It is not a percentage here. It means "what is left over".',
    [
      { title: 'See it', text: '17 divided by 5 is 3 whole times with 2 left over. // gives the 3, % gives the 2.', code: `print(17 // 5)\nprint(17 % 5)`, output: `3\n2` },
      { title: 'Use it with input', text: 'Same reading pattern as before: two integers, then the operator.', code: `a, b = map(int, input().split())\nprint(a % b)`, input: '23 4', output: '3' },
      { title: 'A handy trick', text: 'If a number divides exactly, the remainder is 0. That is how programs check "is this a multiple of 3?".', code: `print(12 % 3)\nprint(13 % 3)`, output: `0\n1` },
    ],
    ['Thinking % means percent. In Python it always means remainder.', 'Swapping the numbers. 5 % 17 is 5, not 2.', 'Dividing by zero, which stops the program with an error.'],
    ['% is the remainder.', '// is how many whole times it fits.', 'Remainder 0 means it divides exactly.'],
    { question: 'What is 14 % 4?', options: ['3', '2', '3.5'], answer: 1, explain: '4 fits into 14 three times (12), leaving 2.' }),

  lesson(14, 'Percentages and money', 'simple-formulas-three-inputs', 'A formula with three inputs',
    'Combine three values and print a clean answer.',
    'Real formulas often need more than two values. The idea does not change: read them, calculate, print. There is one new problem: when the answer is a whole number but Python calculated it with decimals, it prints something like 120.0. You will learn a small pattern to print it as 120.',
    [
      { title: 'Read three decimal numbers', text: 'Use float so decimals such as 2.5 work. One name for each value.', code: `a, b, c = map(float, input().split())\nprint(a * b * c)`, input: '2 3 4', output: '24.0' },
      { title: 'Why 24.0?', text: 'Maths with a float gives a float, and Python always shows a float with a decimal point. If you want 24, you must tell Python.', code: `result = 2.0 * 3 * 4\nprint(result)`, output: '24.0' },
      { title: 'The clean-number pattern', text: 'Ask: is the answer a whole number? If yes, print it as an integer. If not, print it normally. (if and else are explained fully in lesson 25. For now, copy the pattern.)', code: `a, b, c = map(float, input().split())\nresult = a * b * c\n${CLEAN}`, input: '2 3 4', output: '24' },
      { title: 'It keeps real decimals', text: 'When the answer really has decimals, the pattern leaves them alone.', code: `a, b, c = map(float, input().split())\nresult = a * b * c\n${CLEAN}`, input: '2 1.5 1', output: '3' },
    ],
    ['Reading with int when a value may be 2.5. Use float.', 'Printing the float directly and getting 120.0 when 120 is expected.', 'Forgetting the indentation (the four spaces) under if and else.'],
    ['Read, calculate, print is the same with three values.', 'Floats print with .0.', 'The clean-number pattern prints whole answers without .0.'],
    { question: 'What is shown by print(2.0 * 5)?', options: ['10', '10.0', '10.00'], answer: 1, explain: 'A float is printed with a decimal point, so you get 10.0.' }),

  lesson(15, 'Percentages and money', 'percent-discount', 'Percentages and discounts',
    'Take a percentage off a price.',
    'A percentage is "out of 100". 20% of 50 is 50 times 20 divided by 100, which is 10. To apply a discount you work out that amount and subtract it from the price.',
    [
      { title: 'Percent of a number', text: 'Multiply by the percentage, then divide by 100.', code: `price = 50\npercent = 20\nsaving = price * percent / 100\nprint(saving)`, output: '10.0' },
      { title: 'Price after the discount', text: 'Subtract the saving from the price. Naming each step makes it easy to read.', code: `price, percent = map(float, input().split())\nsaving = price * percent / 100\nfinal = price - saving\nprint(final)`, input: '80 25', output: '60.0' },
      { title: 'Print it cleanly', text: 'The expected answer is 60, not 60.0, so use the clean-number pattern from lesson 14.', code: `price, percent = map(float, input().split())\nresult = price - price * percent / 100\n${CLEAN}`, input: '80 25', output: '60' },
    ],
    ['Forgetting to divide by 100.', 'Printing the saving instead of the price after the discount.', 'Using int for the input when the discount can have decimals.'],
    ['Percent of x means x * percent / 100.', 'Price after discount is price minus the saving.', 'Print whole answers without .0.'],
    { question: 'What is 10% of 200?', options: ['2', '20', '2000'], answer: 1, explain: '200 * 10 / 100 is 20.' }),

  lesson(16, 'Working with text', 'text-upper', 'Changing text: upper()',
    'Use a ready-made tool to change letters.',
    'Text values come with built-in tools called methods. You use them with a dot after the variable. upper() gives the same text in capital letters, and lower() gives small letters. The original text is not changed; you get a new one back.',
    [
      { title: 'upper() and lower()', text: 'Write the variable, a dot, the tool name, and round brackets.', code: `word = "Python"\nprint(word.upper())\nprint(word.lower())`, output: `PYTHON\npython` },
      { title: 'With input', text: 'Read a word and shout it.', code: `word = input()\nprint(word.upper())`, input: 'hello', output: 'HELLO' },
      { title: 'Numbers and symbols stay the same', text: 'Only letters are affected.', code: `word = input()\nprint(word.upper())`, input: 'room101', output: 'ROOM101' },
    ],
    ['Forgetting the round brackets: word.upper prints a strange object instead of the text.', 'Expecting word.upper() to change word itself. It returns a new value, so print it or store it.', 'Writing Upper or UPPER. Method names are all lowercase.'],
    ['variable.upper() makes capitals.', 'variable.lower() makes small letters.', 'Methods need round brackets.'],
    { question: 'What does "ab1".upper() give?', options: ['AB1', 'ab1', 'Ab1'], answer: 0, explain: 'Letters become capitals. The digit stays the same.' }),

  lesson(17, 'Working with text', 'text-indexing', 'Picking out characters',
    'Get the first and last letter of a word.',
    'Every character in text has a position, counted from zero. In the word code, c is at 0, o at 1, d at 2 and e at 3. You pick one with square brackets. A negative number counts from the end: -1 is the last character.',
    [
      { title: 'Count from zero', text: 'The first position is 0, not 1.', code: `word = "planet"\nprint(word[0])\nprint(word[1])`, output: `p\nl` },
      { title: 'Count from the end', text: 'Use -1 for the last character, -2 for the one before it, and so on.', code: `word = "planet"\nprint(word[-1])\nprint(word[-2])`, output: `t\ne` },
      { title: 'Combine them', text: 'Reading a word then printing two characters with a space between them.', code: `word = input()\nprint(word[0], word[-1])`, input: 'planet', output: 'p t' },
    ],
    ['Using word[1] for the first letter. Counting starts at 0.', 'Using word[len(word)] for the last letter. That is one past the end and gives an error. Use word[-1].', 'Trying it on an empty word. There is no character to pick.'],
    ['Positions start at 0.', 'word[-1] is the last character.', 'word[0] is the first character.'],
    { question: 'What is "hello"[1]?', options: ['h', 'e', 'l'], answer: 1, explain: 'h is at 0, so e is at position 1.' }),

  lesson(18, 'Digits, time and averages', 'last-digit', 'The last digit of a number',
    'Use % 10 and abs() together.',
    'The remainder after dividing by 10 is the last digit: 123 % 10 is 3. There is one trap with negative numbers. In Python, -123 % 10 is 7, not 3. The safe fix is to remove the minus sign first with abs().',
    [
      { title: 'Last digit with % 10', text: 'Dividing by 10 leaves the last digit as the remainder.', code: `print(4827 % 10)\nprint(60 % 10)`, output: `7\n0` },
      { title: 'abs() removes the minus', text: 'abs() gives the number without its sign. abs(-5) is 5 and abs(5) is 5.', code: `print(abs(-5))\nprint(abs(5))`, output: `5\n5` },
      { title: 'The negative number trap', text: 'Without abs, a negative number gives a surprising result. Take abs first, then use % 10.', code: `n = int(input())\nprint(n % 10)\nprint(abs(n) % 10)`, input: '-48', output: `2\n8` },
    ],
    ['Using % 10 on a negative number without abs first.', 'Writing abs(n % 10) instead of abs(n) % 10. The order matters.', 'Using // 10, which removes the last digit instead of keeping it.'],
    ['n % 10 is the last digit.', 'abs() removes the minus sign.', 'Use abs(n) % 10 so negatives work.'],
    { question: 'What is 7305 % 10?', options: ['7', '5', '0'], answer: 1, explain: 'The remainder after dividing by 10 is the last digit, 5.' }),

  lesson(19, 'Digits, time and averages', 'hours-minutes', 'Hours and minutes',
    'Split a total into two parts with // and %.',
    'This is the best use of // and % together. To turn 135 minutes into hours and minutes, // 60 gives whole hours and % 60 gives the minutes left over. Then you build the answer as text with an f-string.',
    [
      { title: 'Whole hours and leftover minutes', text: 'The same idea as boxes and leftovers, with 60 in each box.', code: `total = 200\nprint(total // 60)\nprint(total % 60)`, output: `3\n20` },
      { title: 'Build the text', text: 'Put both values in an f-string with a colon between them.', code: `total = int(input())\nhours = total // 60\nminutes = total % 60\nprint(f"{hours}:{minutes}")`, input: '200', output: '3:20' },
      { title: 'Less than an hour', text: 'The same code works when there are zero whole hours.', code: `total = int(input())\nhours = total // 60\nminutes = total % 60\nprint(f"{hours}:{minutes}")`, input: '45', output: '0:45' },
    ],
    ['Swapping // and %.', 'Using / instead of //. You would get decimals.', 'Forgetting the f before the quote, so the curly brackets show literally.'],
    ['// 60 gives whole hours.', '% 60 gives leftover minutes.', 'f-strings build the final text.'],
    { question: 'How many leftover minutes are there in 130 minutes?', options: ['10', '2', '30'], answer: 0, explain: '130 // 60 is 2 hours (120 minutes), and 130 % 60 is 10.' }),

  lesson(20, 'Digits, time and averages', 'two-decimals-average', 'Printing exactly two decimals',
    'Format a number with .2f.',
    'An average is the sum divided by how many values there are. Often the answer must show exactly two digits after the decimal point, like 2.50. A format code inside an f-string does it: {value:.2f}.',
    [
      { title: 'Average of two numbers', text: 'Add them, then divide by 2.', code: `a, b = map(float, input().split())\naverage = (a + b) / 2\nprint(average)`, input: '4 9', output: '6.5' },
      { title: 'The format code', text: ':.2f means "a float with 2 digits after the point". It pads with zeros if needed.', code: `average = 6.5\nprint(f"{average:.2f}")\nprint(f"{10:.2f}")`, output: `6.50\n10.00` },
      { title: 'Together', text: 'Read, calculate, print with the format code.', code: `a, b = map(float, input().split())\naverage = (a + b) / 2\nprint(f"{average:.2f}")`, input: '4 9', output: '6.50' },
    ],
    ['Forgetting the brackets in (a + b) / 2. Without them only b is divided.', 'Writing :2f instead of :.2f. The dot is needed.', 'Using round() when the problem wants exactly two decimals. round(6.5, 2) still prints 6.5.'],
    ['Average is the sum divided by the count.', '{value:.2f} gives exactly two decimals.', 'Brackets decide what is divided.'],
    { question: 'What does f"{3:.2f}" show?', options: ['3', '3.0', '3.00'], answer: 2, explain: '.2f always shows two digits after the point, so 3 becomes 3.00.' }),

  lesson(21, 'Everyday number tools', 'absolute-difference', 'Distance between two numbers: abs()',
    'The gap between two values, whichever is bigger.',
    'The difference a - b can be negative if b is larger. Often you only care how far apart two numbers are. abs() gives that, because it drops the minus sign.',
    [
      { title: 'A negative difference', text: 'Subtracting a bigger number from a smaller one gives a negative result.', code: `print(3 - 11)\nprint(abs(3 - 11))`, output: `-8\n8` },
      { title: 'Use it with input', text: 'The order of the two numbers no longer matters.', code: `a, b = map(int, input().split())\nprint(abs(a - b))`, input: '3 11', output: '8' },
      { title: 'Same answer both ways', text: 'Swapping the numbers gives the same distance.', code: `a, b = map(int, input().split())\nprint(abs(a - b))`, input: '11 3', output: '8' },
    ],
    ['Forgetting abs and printing a negative number.', 'Writing abs(a) - abs(b). That is a different calculation.', 'Not using brackets: abs(a - b), not abs a - b.'],
    ['abs(x) removes the minus sign.', 'abs(a - b) is the distance between a and b.', 'The order of a and b does not matter.'],
    { question: 'What is abs(-9 + 4)?', options: ['5', '13', '-5'], answer: 0, explain: '-9 + 4 is -5, and abs drops the minus sign.' }),

  lesson(22, 'Everyday number tools', 'unit-conversion-integers', 'Converting units with whole numbers',
    'Multiply by the number of small units in one big unit.',
    'You met unit conversion with decimals. When the input is a whole number, the same idea needs no float and no clean-up. Find out how many small units fit in one big unit, then multiply.',
    [
      { title: 'Write the conversion down', text: '1 hour = 60 minutes, so hours times 60 gives minutes.', code: `hours = int(input())\nprint(hours * 60)`, input: '3', output: '180' },
      { title: 'Another conversion', text: '1 day = 24 hours. The recipe is the same.', code: `days = int(input())\nprint(days * 24)`, input: '2', output: '48' },
      { title: 'Zero is fine', text: 'Multiplying zero gives zero, so no special case is needed.', code: `hours = int(input())\nprint(hours * 60)`, input: '0', output: '0' },
    ],
    ['Dividing when you should multiply, or the other way round. Big unit to small unit means multiply.', 'Using the wrong conversion number.', 'Using float when the input is always whole. int keeps the output clean.'],
    ['Big unit to small unit: multiply.', 'Write the conversion down first.', 'Whole inputs give whole answers with int.'],
    { question: 'How many seconds are in 5 minutes?', options: ['65', '300', '12'], answer: 1, explain: '5 * 60 = 300.' }),

  lesson(23, 'Everyday number tools', 'average-of-three', 'Average of three numbers',
    'Sum, divide, and print without a stray .0.',
    'The average of three numbers is their sum divided by 3. Division with / always gives a float, so a whole-number answer would print as 6.0. Use the clean-number pattern to print 6, and let real decimals like 2.3333333333333335 print as they are.',
    [
      { title: 'Calculate', text: 'Add inside brackets, then divide by 3.', code: `a, b, c = map(float, input().split())\nresult = (a + b + c) / 3\nprint(result)`, input: '2 4 6', output: '4.0' },
      { title: 'Clean it up', text: 'Use the pattern from lesson 14 to remove the .0 when the answer is whole.', code: `a, b, c = map(float, input().split())\nresult = (a + b + c) / 3\n${CLEAN}`, input: '2 4 6', output: '4' },
      { title: 'Real decimals stay', text: 'When the average is not whole, the pattern prints it normally.', code: `a, b, c = map(float, input().split())\nresult = (a + b + c) / 3\n${CLEAN}`, input: '1 2 2', output: '1.6666666666666667' },
    ],
    ['Writing a + b + c / 3. Only c is divided. Use brackets around the sum.', 'Printing 4.0 when 4 is expected.', 'Dividing by the wrong count.'],
    ['Average = sum / count.', 'Brackets around the sum.', 'Use the clean-number pattern.'],
    { question: 'Which is the correct average of a, b and c?', options: ['a + b + c / 3', '(a + b + c) / 3', 'a + b + (c / 3)'], answer: 1, explain: 'Brackets make the whole sum get divided by 3.' }),

  lesson(24, 'Everyday number tools', 'circle-circumference', 'Using a constant: the circle formula',
    'Plug a fixed number into a formula.',
    'Some formulas contain a fixed number, like 3.14 for pi. Just write it in the formula. The circumference of a circle is 2 times pi times the radius. This lesson also reuses the two-decimal format from lesson 20.',
    [
      { title: 'A constant in a formula', text: 'Store the constant in a variable with a clear name, or write it in directly.', code: `pi = 3.14\nradius = 1\nprint(2 * pi * radius)`, output: '6.28' },
      { title: 'With input and two decimals', text: 'Read the radius as a float, calculate, and print with .2f.', code: `radius = float(input())\ncircumference = 2 * 3.14 * radius\nprint(f"{circumference:.2f}")`, input: '10', output: '62.80' },
      { title: 'Radius zero', text: 'Zero still prints two decimals.', code: `radius = float(input())\ncircumference = 2 * 3.14 * radius\nprint(f"{circumference:.2f}")`, input: '0', output: '0.00' },
    ],
    ['Using int(input()) when the radius may have decimals, such as 2.5.', 'Forgetting the 2 in 2 * pi * r.', 'Using the number that the problem does not specify. Use exactly 3.14.'],
    ['Constants go straight into formulas.', 'float() for decimal input.', '.2f for exactly two decimals.'],
    { question: 'In 2 * 3.14 * r, what is 3.14?', options: ['The radius', 'A fixed value for pi', 'The answer'], answer: 1, explain: 'It is the constant pi, which never changes.' }),

  lesson(25, 'Making decisions', 'if-else-even-odd', 'Making a decision: if and else',
    'Run different code depending on a condition.',
    'So far every program did the same steps in the same order. With if and else the program chooses. A number is even if dividing by 2 leaves a remainder of 0. You check that with ==, which means "is equal to".',
    [
      { title: 'if and else', text: 'if checks a condition. The indented lines under it run only when it is true. else runs when it is false. The colon and the four spaces matter.', code: `n = 8\nif n % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")`, output: 'Even' },
      { title: '== is not =', text: 'One equals sign stores a value. Two equals signs ask a question.', code: `n = int(input())\nif n % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")`, input: '7', output: 'Odd' },
      { title: 'Negative numbers', text: 'Python gives a remainder of 0 or 1 here even for negative numbers, so the same code works.', code: `n = int(input())\nif n % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")`, input: '-4', output: 'Even' },
    ],
    ['Using = instead of == in the condition.', 'Forgetting the colon at the end of the if or else line.', 'Not indenting the lines under if and else.'],
    ['if checks a condition, else is the other case.', '== compares, = stores.', 'Indentation shows what belongs inside.'],
    { question: 'What does 9 % 2 == 0 evaluate to?', options: ['True', 'False', '1'], answer: 1, explain: '9 % 2 is 1, and 1 is not equal to 0.' }),

  lesson(26, 'Making decisions', 'comparing-two-numbers', 'Comparing two numbers',
    'Find the larger one with > or max().',
    'You can compare numbers with > (greater than), < (less than), >= and <=. Python also has a ready-made tool called max() that gives the larger of two or more values.',
    [
      { title: 'Compare with if', text: 'Print the first number if it is greater, otherwise the second.', code: `a, b = map(int, input().split())\nif a > b:\n    print(a)\nelse:\n    print(b)`, input: '4 9', output: '9' },
      { title: 'Use max()', text: 'max() does the comparison for you. It is the shortest way.', code: `a, b = map(int, input().split())\nprint(max(a, b))`, input: '4 9', output: '9' },
      { title: 'When they are equal', text: 'Both ways print the same value.', code: `a, b = map(int, input().split())\nprint(max(a, b))`, input: '7 7', output: '7' },
    ],
    ['Writing a > b > c as a trick for three numbers. It does not mean what you expect for finding the largest.', 'Forgetting the else case when the numbers are equal.', 'Comparing text instead of numbers. Convert with int first.'],
    ['> and < compare numbers.', 'max(a, b) gives the larger.', 'min(a, b) gives the smaller.'],
    { question: 'What does min(4, 9) give?', options: ['9', '4', '13'], answer: 1, explain: 'min gives the smaller value.' }),

  lesson(27, 'Powers and digits', 'powers', 'Powers: **',
    'Multiply a number by itself several times.',
    'A power is a number multiplied by itself a number of times. 2 to the power of 5 means 2 * 2 * 2 * 2 * 2 = 32. Python writes this with two stars: 2 ** 5. The ^ sign does something else entirely.',
    [
      { title: 'The ** operator', text: 'Base on the left, exponent on the right.', code: `print(2 ** 5)\nprint(5 ** 2)`, output: `32\n25` },
      { title: 'Special cases', text: 'Anything to the power of 0 is 1.', code: `print(9 ** 0)\nprint(0 ** 3)`, output: `1\n0` },
      { title: 'With input', text: 'Read base and exponent, then use **.', code: `base, exp = map(int, input().split())\nprint(base ** exp)`, input: '3 4', output: '81' },
    ],
    ['Using ^. In Python it is a different operation, not a power.', 'Swapping base and exponent. 2 ** 5 is not 5 ** 2.', 'Forgetting that a power with whole numbers stays whole, so no .0 is needed.'],
    ['a ** b is a to the power b.', 'a ** 0 is 1.', 'Order matters: base first.'],
    { question: 'What is 3 ** 3?', options: ['9', '27', '6'], answer: 1, explain: '3 * 3 * 3 = 27.' }),

  lesson(28, 'Powers and digits', 'for-loop-sum-digits', 'Repeating: the for loop',
    'Go through the digits of a number one by one.',
    'A loop repeats code. A for loop runs once for every item in something, such as every character in text. To work on the digits of a number, read it as text, then loop over the characters, turning each into a number with int(). A variable that starts at 0 can collect a running total.',
    [
      { title: 'Loop over characters', text: 'The variable ch takes each character in turn. The indented line runs once per character.', code: `text = "482"\nfor ch in text:\n    print(ch)`, output: `4\n8\n2` },
      { title: 'Keep a running total', text: 'Start total at 0, then add to it each time round the loop.', code: `text = "482"\ntotal = 0\nfor ch in text:\n    total = total + int(ch)\nprint(total)`, output: '14' },
      { title: 'With input', text: 'Read the number as text with input() and no int(). You want the digits as characters.', code: `text = input()\ntotal = 0\nfor ch in text:\n    total += int(ch)\nprint(total)`, input: '9071', output: '17' },
    ],
    ['Converting the whole input with int() before the loop. You cannot loop over a number.', 'Forgetting to start the total at 0.', 'Putting print inside the loop, so it prints once per digit.'],
    ['for ch in text: runs once per character.', 'total += x adds x to total.', 'Start a running total at 0.'],
    { question: 'How many times does for ch in "abc": run its body?', options: ['1', '3', '0'], answer: 1, explain: 'Once for each of the three characters.' }),

  lesson(29, 'Powers and digits', 'reverse-digits', 'Reversing text with slicing',
    'Flip a number around using [::-1].',
    'A slice takes a part of text. The special slice [::-1] means "everything, going backwards", so it reverses text. If the reversed text starts with zeros, converting it with int() throws those leading zeros away.',
    [
      { title: 'Reverse text', text: 'Put [::-1] after the variable.', code: `word = "planet"\nprint(word[::-1])`, output: 'tenalp' },
      { title: 'Numbers are text first', text: 'Read the number as text, reverse it, and print it.', code: `text = input()\nprint(text[::-1])`, input: '5300', output: '0035' },
      { title: 'Drop leading zeros with int()', text: 'Turning the reversed text into a whole number removes zeros at the front.', code: `text = input()\nprint(int(text[::-1]))`, input: '5300', output: '35' },
    ],
    ['Calling int() first and then trying to slice. A number cannot be sliced.', 'Forgetting int() at the end and printing 0035.', 'Writing [:-1], which removes the last character instead of reversing.'],
    ['text[::-1] reverses text.', 'int() on text removes leading zeros.', 'Keep it as text while you slice.'],
    { question: 'What does "abc"[::-1] give?', options: ['abc', 'cba', 'bca'], answer: 1, explain: 'The slice goes backwards through the whole text.' }),

  lesson(30, 'Loops and divisors', 'range-loops', 'Counting loops: range()',
    'Try every number from 2 up to a limit.',
    'range(a, b) produces the whole numbers from a up to, but not including, b. Looping over it lets you try many numbers. Add a flag variable that starts as True and becomes False when you find a reason, and use break to stop early.',
    [
      { title: 'range counts up to, not including', text: 'range(2, 6) gives 2, 3, 4, 5.', code: `for i in range(2, 6):\n    print(i)`, output: `2\n3\n4\n5` },
      { title: 'Search for a divisor', text: 'Check whether any number in the range divides n exactly. A flag remembers what happened.', code: `n = int(input())\nhas_divisor = False\nfor i in range(2, n):\n    if n % i == 0:\n        has_divisor = True\n        break\nprint(has_divisor)`, input: '15', output: 'True' },
      { title: 'No divisor found', text: 'The flag stays False when nothing divides n.', code: `n = int(input())\nhas_divisor = False\nfor i in range(2, n):\n    if n % i == 0:\n        has_divisor = True\n        break\nprint(has_divisor)`, input: '13', output: 'False' },
      { title: 'Turn the idea into a decision', text: 'Use the flag to print different words. A prime number is the opposite: it has no divisor between 2 and n - 1. Remember that 0 and 1 are not prime, and think about what range(2, n) gives for them.', code: `n = int(input())\nhas_divisor = False\nfor i in range(2, n):\n    if n % i == 0:\n        has_divisor = True\n        break\nif has_divisor:\n    print("Has a divisor")\nelse:\n    print("No divisor")`, input: '15', output: 'Has a divisor' },
    ],
    ['Thinking range(2, 6) includes 6. It stops before the end number.', 'Forgetting that 0 and 1 are special cases, not prime.', 'Forgetting break and printing more than once.'],
    ['range(a, b) is a up to b - 1.', 'A flag remembers what happened inside the loop.', 'break stops the loop early.'],
    { question: 'How many numbers does range(1, 5) produce?', options: ['5', '4', '6'], answer: 1, explain: '1, 2, 3, 4. The end number is not included.' }),

  lesson(31, 'Loops and divisors', 'while-loop-gcd', 'Repeating until: the while loop',
    'Keep going while a condition is true.',
    'A while loop repeats as long as its condition is true. It suits problems where you do not know in advance how many steps you need. The greatest common divisor (GCD) is the biggest number that divides two numbers exactly. A classic method repeats one idea: replace the pair (a, b) with (b, a % b) until b becomes 0. Then a is the answer.',
    [
      { title: 'A simple while loop', text: 'It counts down until the condition becomes false. Make sure something inside changes the variable, or it runs forever.', code: `n = 3\nwhile n > 0:\n    print(n)\n    n = n - 1`, output: `3\n2\n1` },
      { title: 'Several changes at once', text: 'Python can update two variables in one line. The right-hand side is worked out first.', code: `a, b = 48, 18\na, b = b, a % b\nprint(a, b)`, output: '18 12' },
      { title: 'Follow the method by hand', text: 'Repeat the update until b is 0. Then a is the GCD. Here is the trace for 48 and 18: (48, 18) → (18, 12) → (12, 6) → (6, 0), so the answer is 6. Now turn that into a while loop yourself.', code: `a, b = 48, 18\nsteps = 0\nwhile b != 0:\n    a, b = b, a % b\n    steps += 1\nprint(steps)`, output: '3' },
    ],
    ['Forgetting to change the variable inside the loop, which makes it run forever.', 'Using = in the condition instead of != or >.', 'Printing b instead of a at the end.'],
    ['while repeats while the condition is true.', 'a, b = b, a % b updates both at once.', 'Stop when b is 0; a is the answer.'],
    { question: 'What does while n > 0: do when n is already 0?', options: ['Runs once', 'Does not run at all', 'Runs forever'], answer: 1, explain: 'The condition is checked first. If it is false, the body is skipped.' }),

  lesson(32, 'Loops and divisors', 'lcm-from-gcd', 'Common multiples and the LCM',
    'Use the GCD to get the least common multiple.',
    'The least common multiple (LCM) is the smallest number that both numbers divide into. There is a neat link: the two numbers multiplied together equal GCD times LCM. So LCM = a * b // GCD. Python already includes a GCD tool in the math module, so you can focus on the formula.',
    [
      { title: 'Import a ready-made tool', text: 'import brings tools from a library. gcd lives in the math library.', code: `from math import gcd\nprint(gcd(8, 12))`, output: '4' },
      { title: 'The link between them', text: 'Check the rule with numbers: 6 * 15 = 90, GCD is 3, so LCM is 90 // 3 = 30.', code: `from math import gcd\na, b = 6, 15\nprint(a * b // gcd(a, b))`, output: '30' },
      { title: 'With input', text: 'Same formula, with the numbers read from input.', code: `from math import gcd\na, b = map(int, input().split())\nprint(a * b // gcd(a, b))`, input: '9 6', output: '18' },
    ],
    ['Using / instead of //. You would get a float.', 'Forgetting the import line at the top.', 'Dividing a * b by the wrong thing. It is the GCD.'],
    ['a * b = gcd * lcm.', 'LCM = a * b // gcd(a, b).', 'from math import gcd gives you gcd().'],
    { question: 'What is the LCM of 4 and 6?', options: ['2', '12', '24'], answer: 1, explain: 'GCD is 2, so 4 * 6 // 2 = 12.' }),

  lesson(33, 'Loops and divisors', 'counting-in-a-loop', 'Counting things in a loop',
    'Count how many numbers meet a rule.',
    'A counter starts at 0 and goes up by 1 every time something matches. Combine it with range() and if to count things such as divisors. Remember that range(1, n + 1) includes n.',
    [
      { title: 'Count multiples of 3', text: 'Go through the numbers 1 to 20, and count the ones whose remainder after dividing by 3 is 0.', code: `count = 0\nfor i in range(1, 21):\n    if i % 3 == 0:\n        count += 1\nprint(count)`, output: '6' },
      { title: 'Include the last number', text: 'To include n, the range must end at n + 1.', code: `n = int(input())\ncount = 0\nfor i in range(1, n + 1):\n    if i % 2 == 0:\n        count += 1\nprint(count)`, input: '9', output: '4' },
      { title: 'Now think about divisors', text: 'A divisor of n is an i where n % i == 0. Change the rule inside the if and you are counting divisors. Try it yourself in the question.', code: `n = 6\nfor i in range(1, n + 1):\n    print(i, n % i)`, output: `1 0\n2 0\n3 0\n4 2\n5 1\n6 0` },
    ],
    ['Using range(1, n), which stops before n, so n itself is never checked.', 'Forgetting to start the counter at 0.', 'Putting count += 1 outside the if so it counts everything.'],
    ['A counter starts at 0.', 'count += 1 adds one each time.', 'range(1, n + 1) includes n.'],
    { question: 'Which range includes the number 10?', options: ['range(1, 10)', 'range(1, 11)', 'range(0, 9)'], answer: 1, explain: 'The end value is not included, so use 11 to include 10.' }),

  lesson(34, 'Rounding, percentages and shapes', 'rounding', 'Rounding to two decimals',
    'Show a decimal number with exactly two digits.',
    'You already know the format code :.2f. This lesson shows how it behaves and what to watch for. It rounds the displayed number to two digits, and always shows two digits, even for whole numbers.',
    [
      { title: 'Format and round', text: 'It rounds to the nearest hundredth.', code: `print(f"{3.14159:.2f}")\nprint(f"{1.236:.2f}")`, output: `3.14\n1.24` },
      { title: 'Whole numbers get .00', text: 'Two digits always appear.', code: `print(f"{float(2):.2f}")`, output: '2.00' },
      { title: 'With input', text: 'Read a decimal and print it with two decimals.', code: `x = float(input())\nprint(f"{x:.2f}")`, input: '7.891', output: '7.89' },
    ],
    ['Using int() to round. It cuts off the decimals instead of rounding.', 'Using round() when you need trailing zeros. round(2.0, 2) prints 2.0.', 'Forgetting that the input must be a float first.'],
    ['{x:.2f} rounds and always shows two digits.', 'float() reads decimals.', 'int() cuts, it does not round.'],
    { question: 'What does f"{5:.2f}" show?', options: ['5', '5.0', '5.00'], answer: 2, explain: 'Two digits always appear after the point.' }),

  lesson(35, 'Rounding, percentages and shapes', 'percentage-of-total', 'What percent is it?',
    'Turn a part and a total into a percentage.',
    'To find what percent a part is of a total, divide the part by the total and multiply by 100. For 25 out of 200, that is 25 / 200 * 100 = 12.5. Division gives a float, so print whole answers with the clean-number pattern.',
    [
      { title: 'The formula', text: 'part / total * 100.', code: `part, total = map(float, input().split())\nresult = part / total * 100\nprint(result)`, input: '25 200', output: '12.5' },
      { title: 'A whole answer', text: 'When the answer is whole it prints with .0, so clean it.', code: `part, total = map(float, input().split())\nresult = part / total * 100\n${CLEAN}`, input: '50 200', output: '25' },
      { title: 'Zero part', text: 'Zero out of anything is 0 percent.', code: `part, total = map(float, input().split())\nresult = part / total * 100\n${CLEAN}`, input: '0 10', output: '0' },
    ],
    ['Multiplying before dividing and getting the wrong order. Use part / total * 100.', 'Printing the fraction (0.25) instead of the percentage (25).', 'Dividing by zero when the total is 0.'],
    ['percent = part / total * 100.', 'Clean-number pattern for whole answers.', 'Total must not be 0.'],
    { question: 'What percent is 5 of 20?', options: ['4', '25', '40'], answer: 1, explain: '5 / 20 * 100 = 25.' }),

  lesson(36, 'Rounding, percentages and shapes', 'triangle-area', 'Areas with halves',
    'A formula that divides by 2.',
    'The area of a triangle is half of base times height. Dividing by 2 with / gives a float, so the result may be 4.5 for odd products and 20.0 for even ones. The clean-number pattern handles both.',
    [
      { title: 'The formula', text: 'base * height / 2.', code: `base, height = map(float, input().split())\nresult = base * height / 2\nprint(result)`, input: '5 3', output: '7.5' },
      { title: 'A whole answer', text: 'An even product gives a whole number, shown with .0 unless you clean it.', code: `base, height = map(float, input().split())\nresult = base * height / 2\n${CLEAN}`, input: '6 4', output: '12' },
      { title: 'A half stays a half', text: 'The clean pattern keeps real decimals.', code: `base, height = map(float, input().split())\nresult = base * height / 2\n${CLEAN}`, input: '5 3', output: '7.5' },
    ],
    ['Writing base * height / 2 with the wrong inputs in the wrong order. Order does not matter here, but names do.', 'Using // 2, which would lose the half.', 'Printing 12.0 when 12 is expected.'],
    ['Area = base * height / 2.', 'Use / to keep halves.', 'Clean-number pattern for the output.'],
    { question: 'What is the area of a triangle with base 7 and height 2?', options: ['14', '7', '3.5'], answer: 1, explain: '7 * 2 / 2 = 7.' }),

  lesson(37, 'Rounding, percentages and shapes', 'number-line-distance', 'Distance on a number line',
    'Two ways to find how far apart numbers are.',
    'On a number line, the distance between two positions is the bigger one minus the smaller one. You already know abs(a - b). Here is a second way that uses max() and min(), which is useful to understand because it shows why the distance is never negative.',
    [
      { title: 'Using abs', text: 'The tool you already know.', code: `a, b = map(int, input().split())\nprint(abs(a - b))`, input: '-4 3', output: '7' },
      { title: 'Using max and min', text: 'Always subtract the smaller from the larger, so the result cannot be negative.', code: `a, b = map(int, input().split())\nprint(max(a, b) - min(a, b))`, input: '-4 3', output: '7' },
      { title: 'Both negative', text: 'The same logic works when both numbers are below zero.', code: `a, b = map(int, input().split())\nprint(max(a, b) - min(a, b))`, input: '-8 -2', output: '6' },
    ],
    ['Forgetting that a minus a negative number is a plus: 3 - (-4) = 7.', 'Writing the result of a - b without abs, which may be negative.', 'Mixing up max and min.'],
    ['Distance = bigger - smaller.', 'abs(a - b) gives the same.', 'Subtracting a negative adds.'],
    { question: 'What is the distance between -5 and 2?', options: ['3', '7', '-7'], answer: 1, explain: '2 - (-5) = 7.' }),

  lesson(38, 'More digit puzzles', 'product-of-digits', 'Multiplying digits',
    'A running product that starts at 1.',
    'This works like adding up digits, with one important change. A running total for addition starts at 0, but a running product must start at 1, because starting at 0 would make every answer 0. A digit that is 0 makes the whole product 0, and that is correct.',
    [
      { title: 'Start at 1', text: 'Multiply the running product by each digit.', code: `text = "234"\nproduct = 1\nfor ch in text:\n    product = product * int(ch)\nprint(product)`, output: '24' },
      { title: 'A zero digit', text: 'One zero makes everything zero, which is the right answer.', code: `text = "105"\nproduct = 1\nfor ch in text:\n    product *= int(ch)\nprint(product)`, output: '0' },
      { title: 'With input', text: 'Read as text, loop, print after the loop.', code: `text = input()\nproduct = 1\nfor ch in text:\n    product *= int(ch)\nprint(product)`, input: '362', output: '36' },
    ],
    ['Starting the product at 0, so the answer is always 0.', 'Converting the whole input with int() before looping.', 'Printing inside the loop.'],
    ['Running total starts at 0.', 'Running product starts at 1.', 'x *= y multiplies x by y.'],
    { question: 'Where should a running product start?', options: ['0', '1', '10'], answer: 1, explain: 'Starting at 1 does not change the result of multiplying.' }),

  lesson(39, 'More digit puzzles', 'perfect-square', 'Square roots and perfect squares',
    'Check whether a number is a perfect square.',
    'A perfect square is a whole number made by multiplying a whole number by itself, like 49 = 7 * 7. The square root can be found with n ** 0.5. It gives a float, so round it to the nearest whole number and check whether that whole number squared gives back n.',
    [
      { title: 'Square root with ** 0.5', text: 'Raising to the power 0.5 gives the square root.', code: `print(49 ** 0.5)\nprint(50 ** 0.5)`, output: `7.0\n7.0710678118654755` },
      { title: 'Round to a whole number', text: 'round() gives the nearest whole number.', code: `print(round(7.0710678118654755))`, output: '7' },
      { title: 'Check by squaring back', text: 'If the rounded root multiplied by itself gives the original number, it is a perfect square.', code: `n = int(input())\nroot = round(n ** 0.5)\nif root * root == n:\n    print("Yes")\nelse:\n    print("No")`, input: '36', output: 'Yes' },
      { title: 'A number that is not', text: 'The same code answers No.', code: `n = int(input())\nroot = round(n ** 0.5)\nif root * root == n:\n    print("Yes")\nelse:\n    print("No")`, input: '37', output: 'No' },
    ],
    ['Comparing the root with the number directly. 6.0 is a float, so check root * root == n.', 'Forgetting round(). int() could cut a root that is just below a whole number.', 'Forgetting that 0 and 1 are perfect squares.'],
    ['n ** 0.5 is the square root.', 'round() gives the nearest whole number.', 'Square it back to check.'],
    { question: 'Which of these is a perfect square?', options: ['50', '64', '99'], answer: 1, explain: '8 * 8 = 64.' }),

  lesson(40, 'More digit puzzles', 'trailing-zeroes', 'Counting trailing zeroes',
    'Count how many times a number ends in 0.',
    'A number ends in 0 when it divides by 10 exactly. Keep dividing by 10 while that is true, counting each time. This combines everything: a while loop, % to test, // to shorten, and a counter.',
    [
      { title: 'Test the last digit', text: 'A remainder of 0 when divided by 10 means the number ends in 0.', code: `print(1200 % 10 == 0)\nprint(1205 % 10 == 0)`, output: `True\nFalse` },
      { title: 'Remove a digit with //', text: 'Dividing by 10 and dropping the remainder removes the last digit.', code: `print(1200 // 10)`, output: '120' },
      { title: 'Count while it ends in 0', text: 'Here we count how many times a number can be divided by 2 exactly. Use the same shape with 10.', code: `n = int(input())\ncount = 0\nwhile n % 2 == 0:\n    n = n // 2\n    count += 1\nprint(count)`, input: '40', output: '3' },
    ],
    ['Forgetting that 0 itself ends in a zero, and looping forever. Think about what happens when n is 0.', 'Using / and getting floats.', 'Forgetting the counter starts at 0.'],
    ['n % 10 == 0 means it ends in 0.', 'n // 10 removes the last digit.', 'while + counter counts repeats.'],
    { question: 'What is 5000 // 10?', options: ['50', '500', '5'], answer: 1, explain: 'Dividing by 10 removes one trailing zero.' }),
];
