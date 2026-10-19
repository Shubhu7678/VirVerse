export const LAST_TASK_KEY = 'virvese:last-task'

export function rememberTask(slug, title) {
  try {
    localStorage.setItem(LAST_TASK_KEY, JSON.stringify({ slug, title }))
  } catch {
    // storage unavailable: resume simply will not be offered
  }
}
