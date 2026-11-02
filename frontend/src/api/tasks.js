import api from './client'

export const fetchTasks = (language = 'c') => api.get('/tasks', { params: { language } }).then((r) => r.data)
export const fetchTask = (slug) => api.get(`/tasks/${slug}`).then((r) => r.data.task)
export const fetchTaskSolution = (slug) => api.get(`/tasks/${slug}/solution`).then((r) => r.data)
