import api from './client'

export const fetchAdminStats = () => api.get('/admin/stats').then((r) => r.data)
export const fetchStudents = (params) => api.get('/admin/students', { params }).then((r) => r.data)
export const fetchStudent = (id) => api.get(`/admin/students/${id}`).then((r) => r.data)
export const setStudentAccess = (id, languages) => api.put(`/admin/students/${id}/access`, { languages }).then((r) => r.data)
export const fetchLogs = (params) => api.get('/admin/logs', { params }).then((r) => r.data)
