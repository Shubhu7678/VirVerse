export const nums = (s) => s.trim().split(/\s+/).map(Number)
export const lines = (s) => s.split('\n')
export const T = (title, diff, desc, hint, notes, fn, inputs, cons) => ({ title, diff, desc, hint, notes, fn, inputs, cons })
