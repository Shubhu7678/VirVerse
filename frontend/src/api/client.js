import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
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
