// Plain-English explanations shown next to the real compiler / runtime diagnostics.
const compilerHints = [
  [/expected ';'|expected ';' after/i, 'A semicolon (;) is probably missing. Check the line shown below and the line just before it.'],
  [/undeclared identifier|undeclared \(first use/i, "You used a name the compiler doesn't know. Check the spelling, or declare the variable before using it."],
  [/implicit declaration of function/i, "You called a function the compiler doesn't know. Did you forget a #include (like <stdio.h>) or misspell its name?"],
  [/expected '\}'|expected declaration or statement|extraneous closing brace/i, 'Your curly braces { } may not match. Every { needs a closing }.'],
  [/format specifies type|format '%/i, 'The printf/scanf format (like %d or %f) does not match the variable type.'],
  [/too few arguments|too many arguments/i, 'A function was called with the wrong number of arguments.'],
  [/file not found|cannot open file/i, 'The #include file could not be found. Check its name (for example <stdio.h>).'],
  [/unterminated|missing terminating/i, 'A string or comment was not closed. Check for a missing quote (") or */.'],
]

const signalHints = {
  SIGSEGV: 'Segmentation fault: the program touched memory it should not. Check array indexes and pointers.',
  SIGFPE: 'Arithmetic error: this is usually a division (or modulo) by zero.',
  SIGABRT: 'The program aborted itself, often because of invalid memory use.',
  SIGBUS: 'Bad memory access. Check array indexes and pointers.',
}

export function getHint({ status, compileOutput, signal, exitCode }) {
  switch (status) {
    case 'Compilation Error': {
      const match = compilerHints.find(([re]) => re.test(compileOutput || ''))
      return match ? match[1] : 'Your code did not compile. Read the first error below: it points to the line to fix.'
    }
    case 'Time Limit Exceeded':
      return 'Your program ran for too long. Look for an infinite loop, or a loop whose condition never becomes false. If it reads input, make sure the Input tab has data.'
    case 'Output Limit Exceeded':
      return 'Your program printed far too much text. This is usually a loop that never ends.'
    case 'Memory Limit Exceeded':
      return 'Your program used too much memory. Check for loops that keep allocating memory.'
    case 'Runtime Error':
      if (signal && signalHints[signal]) return signalHints[signal]
      if (exitCode) return `main returned ${exitCode}. Return 0 from main when the program finishes successfully.`
      return 'The program crashed while running.'
    default:
      return ''
  }
}
