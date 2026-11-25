const ONLINE_WINDOW_MS = 5 * 60 * 1000

export const isOnline = (value) => Boolean(value) && Date.now() - new Date(value).getTime() < ONLINE_WINDOW_MS

// "just now", "12 min ago", "3 h ago", "2 days ago", or a date for anything older than a month.
export function timeAgo(value) {
  if (!value) return 'Never'
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.floor(hours / 24)
  if (days < 31) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' })
}
