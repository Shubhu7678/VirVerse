// Older versions saved drafts under keys shared by every user. Remove them once so they don't linger.
export function purgeLegacyStorage() {
  try {
    const stale = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (
        /^virvese:draft:[^:]+$/.test(key) ||
        /^virvese:playground:(c|javascript|python):code$/.test(key) ||
        key === 'virvese:playground:code' ||
        key === 'virvese:last-task'
      ) stale.push(key)
    }
    stale.forEach((key) => localStorage.removeItem(key))
  } catch {
    // storage unavailable: nothing to clean
  }
}
