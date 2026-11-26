export const lastTaskKey = (userId) => `virvese:last-task:${userId}`

export function rememberTask(userId, slug, title) {
  try {
    localStorage.setItem(lastTaskKey(userId), JSON.stringify({ slug, title }))
  } catch {
    // storage unavailable: resume simply will not be offered
  }
}
