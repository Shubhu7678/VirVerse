import api from './client'

export const runCode = ({ code, stdin }) => api.post('/execute', { code, stdin }, { timeout: 60000 }).then((r) => r.data)

export const submitSolution = ({ taskSlug, code, assignmentId }) =>
  api.post('/submissions', { taskSlug, code, ...(assignmentId ? { assignmentId } : {}) }, { timeout: 90000 }).then((r) => r.data.submission)

export const fetchSubmissions = () => api.get('/submissions').then((r) => r.data.submissions)

export const fetchSubmissionActivity = () => api.get('/submissions/activity').then((r) => r.data)

export const fetchOrganizationLeaderboard = () => api.get('/orgs/leaderboard').then((r) => r.data)
