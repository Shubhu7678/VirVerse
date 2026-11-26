import { useEffect, useState } from 'react'
import { getErrorMessage } from '../api/client'

// Results are kept briefly so going back to a page shows data at once while a fresh copy loads quietly.
const FRESH_MS = 30_000
const cache = new Map()
// Requests already in flight, so two components asking for the same thing share one call.
const inflight = new Map()

// Call after changing data (e.g. a submission) so the next visit refetches.
export function clearAsyncCache() {
  cache.clear()
  inflight.clear()
}

function load(loader, key) {
  if (!inflight.has(key)) {
    const request = loader()
      .then((data) => {
        cache.set(key, { data, at: Date.now() })
        return data
      })
      .finally(() => inflight.delete(key))
    inflight.set(key, request)
  }
  return inflight.get(key)
}

// Warms the cache (e.g. on link hover) so the page opens with its data already there.
export function prefetch(key, loader) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < FRESH_MS) return
  load(loader, key).catch(() => {})
}

// Runs an async loader on mount (and when `key` changes) and tracks its state.
export default function useAsync(loader, key) {
  const [state, setState] = useState(() => {
    const hit = cache.get(key)
    return hit ? { data: hit.data, loading: false, error: '' } : { data: null, loading: true, error: '' }
  })

  useEffect(() => {
    let cancelled = false
    const hit = cache.get(key)
    if (hit) {
      setState({ data: hit.data, loading: false, error: '' })
      if (Date.now() - hit.at < FRESH_MS) return undefined
    } else {
      setState({ data: null, loading: true, error: '' })
    }
    load(loader, key)
      .then((data) => !cancelled && setState({ data, loading: false, error: '' }))
      .catch((err) => !cancelled && setState((s) => (hit ? s : { data: null, loading: false, error: getErrorMessage(err) })))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
