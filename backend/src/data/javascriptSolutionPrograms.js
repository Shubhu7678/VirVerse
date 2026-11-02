const prefix = `const fs = require('node:fs')
const raw = fs.readFileSync(0, 'utf8')
const input = raw.trim()
const values = input ? input.split(/\\s+/) : []
`

export const JAVASCRIPT_SOLUTION_PROGRAMS = {
  'js-basics': [
    `const name = input.split(/\\s+/).join(' ')
console.log(\`Hello, \${name}!\`)`,
    `console.log(raw.replace(/\\n$/, ''))`,
    `console.log(Number(values[0]) + Number(values[1]))`,
    `console.log(Number(values[0]) * Number(values[1]))`,
    `console.log(Number(values[0]) * 9 / 5 + 32)`,
    `console.log(values.slice(0, 3).map(Number).reduce((a, b) => a + b, 0))`,
    `console.log(2 * (Number(values[0]) + Number(values[1])))`,
    `console.log(Number(values[0]) * 1000)`,
    `console.log(\`\${values[1]} \${values[0]}\`)`,
    `console.log(Math.floor(Number(values[0]) / Number(values[1])))`,
    `console.log(Number(values[0]) % Number(values[1]))`,
    `console.log(Number(values[0]) * Number(values[1]) * Number(values[2]) / 100)`,
    `console.log(Number(values[0]) * (1 - Number(values[1]) / 100))`,
    `console.log(values[0].toUpperCase())`,
    `console.log(\`\${values[0][0]} \${values[0].at(-1)}\`)`,
    `console.log(Array(Number(values[1])).fill(values[0]).join(' '))`,
    `const c = (Number(values[0]) - 32) * 5 / 9
console.log(Number.isInteger(c) ? c : c)`,
    `console.log(Math.abs(Number(values[0])) % 10)`,
    `const n = Number(values[0])
console.log(\`\${Math.floor(n / 60)}:\${n % 60}\`)`,
    `console.log(((Number(values[0]) + Number(values[1])) / 2).toFixed(2))`,
  ],
  'js-numbers': [
    `console.log(Math.abs(Number(values[0]) - Number(values[1])))`,
    `console.log(Number(values[0]) * 60)`,
    `console.log((Number(values[0]) + Number(values[1]) + Number(values[2])) / 3)`,
    `console.log((2 * 3.14 * Number(values[0])).toFixed(2))`,
    `console.log(Number(values[0]) % 2 === 0 ? 'Even' : 'Odd')`,
    `console.log(Math.max(Number(values[0]), Number(values[1])))`,
    `console.log(Number(values[0]) ** Number(values[1]))`,
    `console.log([...values[0]].reduce((sum, digit) => sum + Number(digit), 0))`,
    `console.log(Number([...values[0]].reverse().join('')))`,
    `const n = Number(values[0])
let prime = n >= 2
for (let d = 2; d * d <= n; d += 1) if (n % d === 0) prime = false
console.log(prime ? 'Prime' : 'Not prime')`,
    `let a = Number(values[0]), b = Number(values[1])
while (b) [a, b] = [b, a % b]
console.log(a)`,
    `let a = Number(values[0]), b = Number(values[1]), x = a, y = b
while (y) [x, y] = [y, x % y]
console.log(a / x * b)`,
    `const n = Number(values[0])
let count = 0
for (let d = 1; d <= n; d += 1) if (n % d === 0) count += 1
console.log(count)`,
    `console.log(Number(values[0]).toFixed(2))`,
    `console.log(Number(values[0]) / Number(values[1]) * 100)`,
    `console.log(Number(values[0]) * Number(values[1]) / 2)`,
    `console.log(Math.abs(Number(values[0]) - Number(values[1])))`,
    `console.log([...values[0]].reduce((product, digit) => product * Number(digit), 1))`,
    `const n = Number(values[0]), root = Math.floor(Math.sqrt(n))
console.log(root * root === n ? 'Yes' : 'No')`,
    `console.log((values[0].match(/0*$/)?.[0] || '').length)`,
  ],
  'js-logic': [
    `console.log(Math.max(...values.slice(0, 3).map(Number)))`,
    `const n = Number(values[0])
console.log(n > 0 ? 'Positive' : n < 0 ? 'Negative' : 'Zero')`,
    `console.log(Number(values[0]) >= 50 ? 'Pass' : 'Retry')`,
    `const y = Number(values[0])
console.log(y % 400 === 0 || (y % 4 === 0 && y % 100 !== 0) ? 'Leap' : 'Common')`,
    `console.log('aeiou'.includes(values[0].toLowerCase()) ? 'Vowel' : 'Consonant')`,
    `console.log(Number(values[0]) % 3 === 0 ? 'Yes' : 'No')`,
    `console.log(Number(values[0]) % 15 === 0 ? 'Yes' : 'No')`,
    `const n = Number(values[0])
console.log(n >= 90 ? 'A' : n >= 80 ? 'B' : n >= 70 ? 'C' : n >= 60 ? 'D' : 'F')`,
    `const [a, b, c] = values.slice(0, 3).map(Number)
console.log(a + b > c && a + c > b && b + c > a ? 'Valid' : 'Invalid')`,
    `const [a, b, c] = values.slice(0, 3).map(Number)
console.log(a === b && b === c ? 'Equilateral' : a === b || a === c || b === c ? 'Isosceles' : 'Scalene')`,
    `const [a, op, b] = values
const x = Number(a), y = Number(b)
console.log(op === '+' ? x + y : op === '-' ? x - y : op === '*' ? x * y : x / y)`,
    `const [x, a, b] = values.map(Number)
console.log(x >= Math.min(a, b) && x <= Math.max(a, b) ? 'Yes' : 'No')`,
    `const age = Number(values[0])
console.log(age < 13 ? 'Child' : age < 20 ? 'Teen' : 'Adult')`,
    `console.log(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][Number(values[0]) - 1])`,
    `const [a, b] = values.map(Number)
console.log(a === b ? 'Equal' : a > b ? 'First' : 'Second')`,
    `console.log(Math.max(...values.slice(0, 4).map(Number)))`,
    `const [x, y] = values.map(Number)
console.log(y > 0 ? (x > 0 ? 1 : 2) : (x < 0 ? 3 : 4))`,
    `const c = values[0]
console.log(/[0-9]/.test(c) ? 'Digit' : c >= 'A' && c <= 'Z' ? 'Uppercase' : 'Lowercase')`,
    `const total = Number(values[0])
console.log(total + (total < 50 ? 5 : 0))`,
    `const n = Number(values[0])
console.log(Math.min(n, 100) + Math.max(0, Math.min(n - 100, 100)) * 2 + Math.max(0, n - 200) * 3)`,
  ],
  'js-loops-arrays': [
    `const n = Number(values[0])
console.log(values.slice(1, n + 1).map(Number).reduce((a, b) => a + b, 0))`,
    `const n = Number(values[0])
console.log(values.slice(1, n + 1).map(Number).filter((x) => x % 2 === 0).length)`,
    `console.log([...values[0]].reverse().join(''))`,
    `const n = Number(values[0])
let result = 1
for (let i = 2; i <= n; i += 1) result *= i
console.log(result)`,
    `const n = Number(values[0])
console.log(Array.from({ length: 5 }, (_, i) => \`\${n} x \${i + 1} = \${n * (i + 1)}\`).join('\\n'))`,
    `const n = Number(values[0])
console.log(Math.max(...values.slice(1, n + 1).map(Number)))`,
    `const n = Number(values[0])
console.log(Math.min(...values.slice(1, n + 1).map(Number)))`,
    `const n = Number(values[0]), a = values.slice(1, n + 1).map(Number)
console.log((a.reduce((x, y) => x + y, 0) / n).toFixed(2))`,
    `const n = Number(values[0]), target = Number(values[n + 1])
console.log(values.slice(1, n + 1).map(Number).filter((x) => x === target).length)`,
    `const n = Number(values[0])
console.log([...new Set(values.slice(1, n + 1))].join(' '))`,
    `const n = Number(values[0]), a = values.slice(1, n + 1)
console.log([a[n - 1], ...a.slice(0, n - 1)].join(' '))`,
    `const n = Number(values[0]), a = [...new Set(values.slice(1, n + 1).map(Number))].sort((x, y) => y - x)
console.log(a[1])`,
    `const n = Number(values[0])
console.log(values.slice(1, n + 1).reverse().join(' '))`,
    `const n = Number(values[0]), a = values.slice(1, n + 1).map(Number)
let sum = 0
console.log(a.map((x) => (sum += x)).join(' '))`,
    `const n = Number(values[0])
console.log(values.slice(1, n + 1).map(Number).filter((x) => x > 0).length)`,
    `const n = Number(values[0]), target = values[n + 1]
console.log(values.slice(1, n + 1).indexOf(target))`,
    `const n = Number(values[0]), m = Number(values[1])
console.log(values.slice(2, 2 + n + m).map(Number).sort((a, b) => a - b).join(' '))`,
    `const n = Number(values[0]), a = values.slice(1, n + 1)
console.log(a.join(' ') === [...a].reverse().join(' ') ? 'Yes' : 'No')`,
    `const n = Number(values[0]), counts = new Map()
for (const x of values.slice(1, n + 1).map(Number)) counts.set(x, (counts.get(x) || 0) + 1)
const best = [...counts].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0]
console.log(best)`,
    `const n = Number(values[0]), a = values.slice(1).map(Number)
let sum = 0
for (let i = 0; i < n; i += 1) sum += a[i * n + i]
console.log(sum)`,
  ],
  'js-strings-functions': [
    `console.log(raw.replace(/\\n$/, '').length)`,
    `console.log([...input].reverse().join(''))`,
    `const s = input.toLowerCase()
console.log(s === [...s].reverse().join('') ? 'Yes' : 'No')`,
    `console.log(raw.replace(/\\n$/, '').replaceAll(' ', ''))`,
    `console.log([...input.toLowerCase()].filter((c) => 'aeiou'.includes(c)).length)`,
    `const [line, char] = raw.replace(/\\n$/, '').split('\\n')
console.log([...line].filter((c) => c === char).length)`,
    `const seen = new Set()
let answer = 'None'
for (const c of input) { if (seen.has(c)) { answer = c; break } seen.add(c) }
console.log(answer)`,
    `console.log(input[0].toUpperCase() + input.slice(1))`,
    `console.log(raw.trim().split(/\\s+/).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' '))`,
    `const [word, find, replace] = values
console.log(word.split(find).join(replace))`,
    `console.log(raw.replace(/\\n$/, '').replace(/[aeiou]/gi, ''))`,
    `console.log(raw.trim() ? raw.trim().split(/\\s+/).length : 0)`,
    `const [a, b] = values.map((s) => s.toLowerCase().split('').sort().join(''))
console.log(a === b ? 'Yes' : 'No')`,
    `const [word, prefix, suffix] = values
console.log(word.startsWith(prefix) && word.endsWith(suffix) ? 'Yes' : 'No')`,
    `let encoded = ''
for (let i = 0; i < input.length;) { let j = i + 1; while (j < input.length && input[j] === input[i]) j++; encoded += input[i] + (j - i); i = j }
console.log(encoded)`,
    `function greet(name) { return \`Hello, \${name}!\` }
console.log(greet(raw.trim()))`,
    `function factorial(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r }
console.log(factorial(Number(values[0])))`,
    `function isPrime(n) { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true }
console.log(isPrime(Number(values[0])) ? 'Prime' : 'Not prime')`,
    `const n = Number(values[0])
let a = 0, b = 1
for (let i = 0; i < n; i++) [a, b] = [b, a + b]
console.log(a)`,
    `const words = raw.trim().split(/\\s+/)
console.log(words.reduce((best, word) => word.length > best.length ? word : best, words[0]))`,
  ],
}

export function javascriptSolutionProgram(category, order, authoredCode = '') {
  const code = authoredCode || JAVASCRIPT_SOLUTION_PROGRAMS[category]?.[order - 1]
  return code ? `${prefix}{\n${code}\n}\n` : ''
}
