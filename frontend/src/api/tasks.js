import api from './client'

// Full question list for a language. Only the practice pages need this.
export const fetchTasks = (language = 'c') => api.get('/tasks', { params: { language } }).then((r) => r.data)
// Counts, categories and "continue" only: no question list. Optionally resolves `resumeSlug`.
export const fetchTaskSummary = (language = 'c', resumeSlug) =>
  api.get('/tasks', { params: { language, summary: true, ...(resumeSlug && { resumeSlug }) } }).then((r) => r.data)
// Categories plus just one topic's questions.
export const fetchTopicTasks = (language = 'c', category) =>
  api.get('/tasks', { params: { language, category } }).then((r) => r.data)
// Progress counts for every language in one call.
export const fetchOverview = () => api.get('/tasks/overview').then((r) => r.data)
export const fetchTask = (slug) => api.get(`/tasks/${slug}`).then((r) => r.data.task)
export const fetchTaskSolution = (slug) => api.get(`/tasks/${slug}/solution`).then((r) => r.data)
