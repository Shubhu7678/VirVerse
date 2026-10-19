// Learning roadmap: topics in recommended order. `icon` is a short glyph shown on topic cards.
export const CATEGORIES = [
  { slug: 'basics', name: 'C Basics and Hello World', order: 1, icon: 'Hi', description: 'Write and run your very first C programs.' },
  { slug: 'variables', name: 'Variables and Data Types', order: 2, icon: 'int', description: 'Store numbers, characters and decimals in variables.' },
  { slug: 'input-output', name: 'Input and Output', order: 3, icon: 'I/O', description: 'Read values with scanf and print them with printf.' },
  { slug: 'operators', name: 'Operators', order: 4, icon: '+−', description: 'Arithmetic, relational, logical and bitwise operators.' },
  { slug: 'if-else', name: 'If-Else Conditions', order: 5, icon: 'if', description: 'Make decisions in your programs.' },
  { slug: 'switch', name: 'Switch Case', order: 6, icon: 'sw', description: 'Choose between many options cleanly.' },
  { slug: 'for-loops', name: 'For Loops', order: 7, icon: 'for', description: 'Repeat work a known number of times.' },
  { slug: 'while-loops', name: 'While and Do-While Loops', order: 8, icon: 'do', description: 'Repeat work until a condition changes.' },
  { slug: 'patterns', name: 'Nested Loops and Patterns', order: 9, icon: '▦', description: 'Print stars, numbers and shapes with nested loops.' },
  { slug: 'arrays', name: 'Arrays', order: 10, icon: '[ ]', description: 'Store and process lists of values.' },
  { slug: 'arrays-2d', name: 'Two-Dimensional Arrays', order: 11, icon: '[][]', description: 'Work with matrices and tables.' },
  { slug: 'strings', name: 'Strings', order: 12, icon: '"a"', description: 'Process text, one character at a time.' },
  { slug: 'functions', name: 'Functions', order: 13, icon: 'f()', description: 'Break programs into reusable pieces.' },
  { slug: 'recursion', name: 'Recursion', order: 14, icon: 'f(f)', description: 'Solve problems with functions that call themselves.' },
  { slug: 'pointers', name: 'Pointers', order: 15, icon: '*p', description: 'Work directly with memory addresses.' },
  { slug: 'structures', name: 'Structures and Unions', order: 16, icon: '{ }', description: 'Group related data into your own types.' },
  { slug: 'file-handling', name: 'File Handling', order: 17, icon: 'FILE', description: 'Create, write and read files.' },
];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);
