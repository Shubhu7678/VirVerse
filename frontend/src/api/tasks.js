import api from './client'

export const fetchTasks = () => api.get('/tasks').then((r) => r.data)
export const fetchTask = (slug) => api.get(`/tasks/${slug}`).then((r) => r.data.task)
