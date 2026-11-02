import { T, nums, lines } from './lib.js'
export const arrays2dX = [
  T('Column Maximums', 'Medium', 'Print the largest value in each column separated by spaces.|r c then rows.|One line.', 'Collect each column with map.', 'Column j is grid.map(row => row[j]).', (s) => { const g = lines(s).slice(1).map(nums); return g[0].map((_, j) => Math.max(...g.map((r) => r[j]))).join(' ') }, ['2 3\n1 5 2\n4 3 9', '1 2\n7 8', '3 1\n1\n3\n2', '2 2\n-1 -2\n-3 -4'], ['1 ≤ r, c ≤ 50.']),
]
