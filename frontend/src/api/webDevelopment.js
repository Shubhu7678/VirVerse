import api from './client'

export async function fetchHtmlProgress() {
  const { data } = await api.get('/web-development/html/progress')
  return data.progress
}

export async function saveHtmlProgress(taskId, progress) {
  const { data } = await api.put(`/web-development/html/progress/${taskId}`, progress)
  return data.progress
}
