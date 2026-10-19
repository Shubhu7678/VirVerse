import { useEffect, useState } from 'react'
import { getErrorMessage } from '../api/client'

// Runs an async loader on mount (and when `key` changes) and tracks its state.
export default function useAsync(loader, key) {
  const [state, setState] = useState({ data: null, loading: true, error: '' })

  useEffect(() => {
    let cancelled = false
    setState({ data: null, loading: true, error: '' })
    loader()
      .then((data) => !cancelled && setState({ data, loading: false, error: '' }))
      .catch((err) => !cancelled && setState({ data: null, loading: false, error: getErrorMessage(err) }))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
