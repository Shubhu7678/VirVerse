import { clearAsyncCache } from '../hooks/useAsync'
import api from './client'

export const runCode = ({ code, stdin, language = 'c' }) =>
  api.post('/execute', { code, stdin, language }, { timeout: 60000 }).then((r) => r.data)

export const submitSolution = ({ taskSlug, code, assignmentId }) =>
  api.post('/submissions', { taskSlug, code, ...(assignmentId ? { assignmentId } : {}) }, { timeout: 90000 }).then((r) => {
    clearAsyncCache() // progress, recent submissions and activity are now out of date
    return r.data.submission
  })

export const fetchSubmissions = (limit) =>
  api.get('/submissions', limit ? { params: { limit } } : undefined).then((r) => r.data.submissions)

export const fetchSubmissionActivity = () => api.get('/submissions/activity').then((r) => r.data)

