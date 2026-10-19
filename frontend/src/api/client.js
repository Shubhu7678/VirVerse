import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const organizationId = localStorage.getItem('virvese:activeOrgId')
  if (organizationId) config.headers['X-Org-Id'] = organizationId
  return config
})

export function getErrorMessage(err, fallback = 'Something went wrong') {
  return err?.response?.data?.message || (err?.request ? 'Cannot reach the server' : fallback)
}

export default api
