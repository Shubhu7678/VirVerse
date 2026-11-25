// Beginner guide for the first ten Python questions (served by /api/guides/python). Lesson N is taught right
// before question N, so each guide ends with a "your turn" link to that question.
// Examples use different numbers and words than the questions on purpose.
const q = (n) => `python-python-basics-${String(n).padStart(2, '0')}`

export const PYTHON_GUIDE = [
  {
    n: 1,
    section: 'Output and input',
    slug: 'print',
    title: 'Your first program: print()',
    summary: 'Make the computer show a message.',
    intro:
      'A program is a list of instructions the computer follows from top to bottom. The simplest useful instruction is "show this on the screen". In Python that instruction is called print.',
    steps: [
      {
        title: 'Print some text',
        text: 'Write print, then round brackets, then your text inside quotes. The quotes tell Python "this is text". They are not shown on the screen.',
        code: 'print("Good morning")',
        output: 'Good morning',
      },
      {
        title: 'Each print starts a new line',
        text: 'Every print call shows its text and then moves to the next line. Python runs your lines in order, top to bottom.',
        code: 'print("Hello")\nprint("I am learning Python")',
        output: 'Hello\nI am learning Python',
      },
      {
        title: 'Comments are notes for people',
        text: 'A line that starts with # is a comment. Python ignores it, so you can use it to leave notes for yourself.',
        code: '# This line is ignored\nprint("Only this runs")',
        output: 'Only this runs',
      },
    ],
    mistakes: [
      'Forgetting a quote or a bracket. Every opening " and ( needs a matching closing one.',
      'Using the wrong capital letters. print must be all lowercase, and your text is shown exactly as you type it.',
      'Adding extra spaces or punctuation inside the quotes. What is inside the quotes is what gets shown.',
    ],
    recap: ['print("...") shows text.', 'Text goes inside quotes.', 'Lines run from top to bottom.'],
    question: q(1),
    check: { question: "Which line shows the text Hello on the screen?", options: ["print(\"Hello\")", "Print(Hello)", "show \"Hello\""], answer: 0, explain: "print is all lowercase, the text goes in quotes, and everything sits inside round brackets." },
  },
  {
    n: 2,
    section: 'Output and input',
    slug: 'input-and-variables',
    title: 'Asking the user: input() and variables',
    summary: 'Read what someone types and remember it.',
    intro:
      'Programs become useful when they react to the person using them. input() waits for the user to type a line and press Enter. To keep what they typed, you store it in a variable, which is just a name for a value.',
    steps: [
      {
        title: 'Store input in a variable',
        text: 'Write a name, an equals sign, then input(). The text the user types is now stored under that name. Use the = sign to store, not to compare.',
        code: 'city = input()',
        output: '',
      },
      {
        title: 'Mix a variable into a sentence',
        text: 'Put the letter f right before the opening quote, and wrap the variable name in curly brackets { }. Python swaps the name for what it holds. This is called an f-string.',
        code: 'city = input()\nprint(f"I live in {city}")',
        input: 'Pune',
        output: 'I live in Pune',
      },
      {
        title: 'Names can be anything sensible',
        text: 'Pick names that say what is inside: city, name, score. A name cannot have spaces and cannot start with a number.',
        code: 'pet = input()\nprint(f"My pet is {pet}")',
        input: 'Bruno',
        output: 'My pet is Bruno',
      },
    ],
    mistakes: [
      'Forgetting the f before the quote. Without it you will see {city} printed literally.',
      'Writing the variable inside the quotes without curly brackets. Only {city} is replaced.',
      'Using input("Enter name: ") with a message. The judge only expects your final output, so leave the brackets empty.',
    ],
    recap: ['A variable is a name for a value.', 'input() reads one line of text.', 'f"...{name}..." mixes a variable into text.'],
    question: q(2),
    check: { question: "What does f\"Hi {name}\" do when name holds Asha?", options: ["Shows Hi {name}", "Shows Hi Asha", "Shows an error"], answer: 1, explain: "The f before the quote tells Python to swap {name} for what the variable holds." },
  },
  {
    n: 3,
    section: 'Output and input',
    slug: 'printing-variables',
    title: 'Printing a variable by itself',
    summary: 'Show exactly what a variable holds.',
    intro:
      'You do not always need an f-string. If you only want to show what is inside a variable, give the variable to print directly. No quotes are needed, because you are not writing text, you are naming a variable.',
    steps: [
      {
        title: 'Quotes or no quotes?',
        text: 'With quotes, print shows the words you typed. Without quotes, print looks for a variable of that name and shows what it holds.',
        code: 'word = "banana"\nprint("word")\nprint(word)',
        output: 'word\nbanana',
      },
      {
        title: 'Read and show it back',
        text: 'This is the full pattern: read a line into a variable, then print the variable. The text is shown unchanged, spaces and all.',
        code: 'line = input()\nprint(line)',
        input: 'Nice day!',
        output: 'Nice day!',
      },
    ],
    mistakes: [
      'Putting quotes around the variable name. print("line") shows the word line, not what you typed.',
      'Trying to clean up the text. When a problem says "unchanged", print it exactly as you read it.',
    ],
    recap: ['print(variable) shows the value inside it.', 'No quotes around a variable name.'],
    question: q(3),
    check: { question: "What is the difference between print(word) and print(\"word\")?", options: ["None, they do the same", "The first shows what the variable holds, the second shows the letters w-o-r-d", "The first causes an error"], answer: 1, explain: "Quotes mean text. No quotes means a variable name." },
  },
  {
    n: 4,
    section: 'Numbers and maths',
    slug: 'text-vs-numbers',
    title: 'Text versus numbers: int()',
    summary: 'Turn typed digits into a real number.',
    intro:
      'This is the most important surprise for beginners: input() always gives you text, even when the user types digits. The text "7" and the number 7 are different things. To do maths you need a real number, and int() converts text into a whole number (an integer).',
    steps: [
      {
        title: 'Convert with int()',
        text: 'Wrap input() in int(). Python reads the text and gives back a whole number. It also understands negative numbers.',
        code: 'age = int(input())\nprint(age)',
        input: '15',
        output: '15',
      },
      {
        title: 'Why it matters',
        text: 'As text, "2" + "3" glues the pieces together into "23". As numbers, 2 + 3 is 5. Converting first means the maths works.',
        code: 'print("2" + "3")\nprint(2 + 3)',
        output: '23\n5',
      },
    ],
    mistakes: [
      'Forgetting int(). The value looks like a number but behaves like text, so later maths gives odd results.',
      'Typing int(input) without the second pair of brackets. input() needs its own ().',
      'Using int() on something that is not a whole number, such as 2.5. Decimals need float(), which you meet later.',
    ],
    recap: ['input() always returns text.', 'int(...) turns text into a whole number.', 'Do maths only with real numbers.'],
    question: q(4),
    check: { question: "input() always gives you...", options: ["A whole number", "Text", "A decimal"], answer: 1, explain: "Even if you type digits, input() returns text. Use int() to turn it into a number." },
  },
  {
    n: 5,
    section: 'Numbers and maths',
    slug: 'two-numbers-and-adding',
    title: 'Two numbers on one line, and adding',
    summary: 'Split a line into pieces and use +.',
    intro:
      'Often the input has several values on one line, like "4 6". split() cuts a line into pieces wherever there are spaces. Then you can give each piece its own variable and convert them all to numbers in one go.',
    steps: [
      {
        title: 'Basic maths symbols',
        text: 'Python uses + to add, - to subtract, * to multiply and / to divide.',
        code: 'print(10 + 5)\nprint(10 - 5)\nprint(10 * 5)',
        output: '15\n5\n50',
      },
      {
        title: 'Read two numbers',
        text: 'input().split() cuts the line into pieces. map(int, ...) converts every piece to a whole number. The two names on the left receive the first and second number.',
        code: 'a, b = map(int, input().split())\nprint(a)\nprint(b)',
        input: '7 3',
        output: '7\n3',
      },
      {
        title: 'Use them together',
        text: 'Once the numbers are in variables, you can do maths with them and print the result.',
        code: 'a, b = map(int, input().split())\nprint(a * b)',
        input: '7 3',
        output: '21',
      },
    ],
    mistakes: [
      'Having a different number of names on the left than numbers in the input. Two numbers need two names.',
      'Forgetting map(int, ...). The pieces would still be text.',
      'Mixing up the order of a and b. The first number goes into the first name.',
    ],
    recap: ['+ - * / do maths.', 'split() cuts a line at spaces.', 'a, b = map(int, input().split()) reads two numbers.'],
    question: q(5),
    check: { question: "What does a, b = map(int, input().split()) do with the line 4 6?", options: ["Stores 4 in a and 6 in b as numbers", "Stores the text 4 6 in a", "Adds 4 and 6"], answer: 0, explain: "split cuts the line at spaces, and map(int, ...) converts each piece to a number." },
  },
  {
    n: 6,
    section: 'Numbers and maths',
    slug: 'using-a-formula',
    title: 'Turning a formula into code',
    summary: 'Read values, calculate, print the result.',
    intro:
      'Most problems follow the same three steps: read the input, calculate, print the answer. A formula from maths is just an expression written with variables. If you know the formula, you can write it almost as it appears on paper.',
    steps: [
      {
        title: 'Keep the result in a variable',
        text: 'Storing the answer in a variable first makes the program easier to read, and easier to fix when something goes wrong.',
        code: 'length, width = map(int, input().split())\nresult = length + width\nprint(result)',
        input: '6 2',
        output: '8',
      },
      {
        title: 'Three-step pattern',
        text: 'Step 1 read, step 2 calculate, step 3 print. Say the steps out loud before you write code. It makes the code much easier.',
        code: '# 1. read\nbase, height = map(int, input().split())\n# 2. calculate\ntriangle = base * height / 2\n# 3. print\nprint(triangle)',
        input: '6 4',
        output: '12.0',
      },
    ],
    mistakes: [
      'Printing before you have calculated anything.',
      'Using the wrong symbol. x is not multiply in Python, use *.',
      'Mixing up the names, for example multiplying width by width.',
    ],
    recap: ['Read, calculate, print.', 'Store the result in a variable.', '* means multiply.'],
    question: q(6),
    check: { question: "Which order of steps do most problems follow?", options: ["Print, read, calculate", "Read, calculate, print", "Calculate, print, read"], answer: 1, explain: "First read the input, then calculate, then print the answer." },
  },
  {
    n: 7,
    section: 'Decimals and formulas',
    slug: 'decimals',
    title: 'Numbers with decimals: float and int',
    summary: 'Read decimal numbers and print clean whole numbers.',
    intro:
      'int() only understands whole numbers. For numbers with a decimal part, like 36.6, use float(). Maths with a float gives a float, and Python always shows floats with a decimal point, even when the value is whole, for example 212.0.',
    steps: [
      {
        title: 'Read a decimal',
        text: 'float(input()) reads a number that may have a decimal part.',
        code: 'price = float(input())\nprint(price)',
        input: '2.5',
        output: '2.5',
      },
      {
        title: 'Why you see .0',
        text: 'A float is always printed with a decimal point. Even 4 * 2.5 becomes 10.0.',
        code: 'print(4 * 2.5)',
        output: '10.0',
      },
      {
        title: 'Turn a whole-valued float into an integer',
        text: 'If you know the answer is a whole number, wrap it in int() when printing and the .0 disappears. Only do this when the answer is always whole, because int() cuts off any decimal part.',
        code: 'print(int(10.0))',
        output: '10',
      },
    ],
    mistakes: [
      'Using int(input()) when the input may have a decimal point. It will raise an error.',
      'Using int() on an answer that can have decimals. You would lose the part after the point.',
      'Forgetting that a float prints with .0 when the checker expects a plain number.',
    ],
    recap: ['float() reads decimals.', 'A float prints with a decimal point.', 'int() on a whole-valued float removes the .0.'],
    question: q(7),
    check: { question: "Why does print(4 * 2.5) show 10.0?", options: ["Python made a mistake", "A float is always shown with a decimal point", "Because 4 is a float"], answer: 1, explain: "Maths with a float gives a float, and floats print with a decimal point." },
  },
  {
    n: 8,
    section: 'Decimals and formulas',
    slug: 'three-values',
    title: 'Reading three values',
    summary: 'The same idea works for any number of values.',
    intro:
      'Reading three numbers is no different from reading two. You only need three names on the left of the equals sign. The number of names must match the number of values on the line.',
    steps: [
      {
        title: 'Three names for three numbers',
        text: 'The first number goes into the first name, the second into the second, and so on.',
        code: 'x, y, z = map(int, input().split())\nprint(x)\nprint(y)\nprint(z)',
        input: '4 8 2',
        output: '4\n8\n2',
      },
      {
        title: 'Chain the maths',
        text: 'You can combine more than two numbers in one expression.',
        code: 'x, y, z = map(int, input().split())\nprint(x * y - z)',
        input: '4 8 2',
        output: '30',
      },
      {
        title: 'Negative numbers are fine',
        text: 'int() understands a minus sign, so negative numbers work with no extra code.',
        code: 'a, b, c = map(int, input().split())\nprint(a + b + c)',
        input: '-5 2 1',
        output: '-2',
      },
    ],
    mistakes: [
      'Names and values not matching. Three values need exactly three names, otherwise Python raises an error.',
      'Forgetting a name when adding, for example writing x + y when you need x + y + z.',
    ],
    recap: ['One name for each value.', 'int() handles negative numbers.', 'Combine as many values as you need in one expression.'],
    question: q(8),
    check: { question: "How many names do you need to read three numbers on one line?", options: ["One", "Two", "Three"], answer: 2, explain: "One name per value: a, b, c = map(int, input().split())." },
  },
  {
    n: 9,
    section: 'Decimals and formulas',
    slug: 'brackets',
    title: 'Brackets and the order of maths',
    summary: 'Make Python calculate things in the order you want.',
    intro:
      'Python follows the same order as school maths: multiplication and division happen before addition and subtraction. If you want something to happen first, put it in brackets. Brackets are how you say "do this part first".',
    steps: [
      {
        title: 'Order matters',
        text: 'Without brackets, 2 + 3 * 4 first does 3 * 4 = 12, then adds 2 to get 14.',
        code: 'print(2 + 3 * 4)',
        output: '14',
      },
      {
        title: 'Brackets go first',
        text: 'With brackets, the addition happens first: 2 + 3 = 5, then 5 * 4 = 20.',
        code: 'print((2 + 3) * 4)',
        output: '20',
      },
      {
        title: 'In a formula',
        text: 'When a formula multiplies a sum, you almost always need brackets around the sum.',
        code: 'a, b = map(int, input().split())\nprint(3 * (a + b))',
        input: '2 5',
        output: '21',
      },
    ],
    mistakes: [
      'Leaving out brackets. 3 * a + b is not the same as 3 * (a + b).',
      'Unbalanced brackets. Count them: every ( needs a ).',
    ],
    recap: ['* and / run before + and -.', 'Brackets run first.', 'Use brackets to be sure.'],
    question: q(9),
    check: { question: "What does 2 + 3 * 4 give?", options: ["20", "14", "24"], answer: 1, explain: "Multiplication goes first: 3 * 4 = 12, then 2 + 12 = 14. Brackets would change that." },
  },
  {
    n: 10,
    section: 'Decimals and formulas',
    slug: 'unit-conversion',
    title: 'Converting units',
    summary: 'Multiply by a fixed number to change units.',
    intro:
      'Converting units is multiplying by a conversion number. One minute is 60 seconds, so minutes times 60 gives seconds. Distances often have decimals, so you read them with float(). This lesson puts everything together: float, multiplication, and printing a clean whole number.',
    steps: [
      {
        title: 'Find the conversion number',
        text: 'Write it down first: 1 minute = 60 seconds. Then the program is read the value, multiply by 60, print.',
        code: 'minutes = float(input())\nseconds = minutes * 60\nprint(seconds)',
        input: '1.5',
        output: '90.0',
      },
      {
        title: 'Print as a whole number when the answer is whole',
        text: 'The answer 90.0 is a whole number, so wrapping it in int() prints a tidy 90. Use this only when you know the answer is always whole.',
        code: 'minutes = float(input())\nseconds = minutes * 60\nprint(int(seconds))',
        input: '1.5',
        output: '90',
      },
    ],
    mistakes: [
      'Using int(input()) for a value that can have decimals.',
      'Using the wrong conversion number. Check it before you code.',
      'Printing 90.0 when the problem wants 90.',
    ],
    recap: ['Conversion means multiplying by a fixed number.', 'float() for decimal input.', 'int(...) to print a whole answer.'],
    question: q(10),
    check: { question: "To convert kilometers to meters you...", options: ["Add 1000", "Divide by 1000", "Multiply by 1000"], answer: 2, explain: "One kilometer is 1000 meters, so multiply by 1000." },
  },
]

