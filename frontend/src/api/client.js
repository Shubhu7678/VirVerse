import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

export function getErrorMessage(err, fallback = 'Something went wrong') {
  if (err?.code === 'ECONNABORTED') return 'This took too long. Check your code for an infinite loop and try again.'
  return err?.response?.data?.message || (err?.request ? 'Cannot reach the server' : fallback)
}

// The auth provider registers this so an expired session sends the user back to sign in.
let onUnauthorized = null
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Sign-in, sign-up and the first session check legitimately answer 401 on their own.
    const url = error.config?.url || ''
    if (error.response?.status === 401 && !url.startsWith('/auth/')) onUnauthorized?.(error.response.data?.message)
    return Promise.reject(error)
  },
)

export default api
