import { T, nums } from './lib.js'
export const numbersX = [
  T('Average of Two with Remainder', 'Easy', 'Read two integers and print the integer part of their average and whether a half remains, as `q` or `q.5`.|Two integers.|`q` or `q.5`.', 'Sum them, then use Math.floor(sum / 2) and sum % 2.', 'The remainder tells you whether the exact average ends with .5.', (s) => { const t = nums(s).reduce((a, b) => a + b, 0); return `${Math.floor(t / 2)}${t % 2 ? '.5' : ''}` }, ['4 6', '3 4', '10 11', '0 0'], ['0 ≤ a, b ≤ 10^9.']),
]
export const logicX = [
  T('Middle Value', 'Medium', 'Print the median (middle value) of three integers.|Three integers.|One integer.', 'Sort numerically with (a, b) => a - b.', 'Array sort compares as text by default; pass a comparator for numbers.', (s) => nums(s).sort((a, b) => a - b)[1], ['3 1 2', '5 5 1', '-1 0 1', '9 8 10'], ['|x| ≤ 10^9.']),
]
export const swX = [
  T('Elevator Floor', 'Easy', 'Given a floor code `G`, `B` or a number, print `Ground`, `Basement` or `Floor <n>`.|One token.|Floor text.', 'switch handles the two letters; default builds the number text.', 'default is the catch-all branch.', (s) => s === 'G' ? 'Ground' : s === 'B' ? 'Basement' : `Floor ${s}`, ['G', 'B', '7', '12'], ['Token is G, B or an integer from 1 to 100.']),
]
