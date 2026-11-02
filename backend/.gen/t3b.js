import { T, nums } from './lib.js'
export const patternsX = [
  T('X Pattern', 'Hard', 'Print an n × n grid (n odd) where both diagonals are `*` and the rest are spaces. Do not add trailing spaces.|One odd integer.|n lines.', 'A cell is a star when row === col or row + col === n - 1.', 'Diagonal tests use the indexes of the loops.', (s) => { const n = Number(s); return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => r === c || r + c === n - 1 ? '*' : ' ').join('').replace(/\s+$/, '')).join('\n') }, ['3', '5', '1', '7'], ['n is odd, 1 ≤ n ≤ 21.']),
]
export const loopsX = [
  T('Min and Position', 'Easy', 'n then n integers. Print the minimum and its first zero-based index as `value index`.|One line.|`value index`.', 'Track min and index together.', 'Compare with < so the first occurrence is kept.', (s) => { const v = nums(s).slice(1); let i = 0; v.forEach((x, k) => { if (x < v[i]) i = k }); return `${v[i]} ${i}` }, ['4 5 2 8 2', '1 9', '3 3 2 1', '2 -1 -1'], ['1 ≤ n ≤ 1000.']),
]
