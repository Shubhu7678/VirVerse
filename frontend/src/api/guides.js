import api from './client'

// Lesson list: titles and progress only, never lesson bodies.
export const fetchGuide = (language) => api.get(`/guides/${language}`).then((r) => r.data)
// One lesson, with links to the previous and next lesson.
export const fetchGuideLesson = (language, slug) => api.get(`/guides/${language}/${slug}`).then((r) => r.data)
