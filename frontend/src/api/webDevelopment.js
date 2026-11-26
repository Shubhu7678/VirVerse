import api from './client'

// Both calls return { progress, reward }. `reward` is set when this request paid out points.
export async function fetchHtmlProgress() {
  const { data } = await api.get('/web-development/html/progress')
  return data
}

export async function saveHtmlProgress(taskId, progress) {
  const { data } = await api.put(`/web-development/html/progress/${taskId}`, progress)
  return data
}
