import api from './client'

export const fetchAdminStats = () => api.get('/admin/stats').then((r) => r.data)
export const fetchStudents = (params) => api.get('/admin/students', { params }).then((r) => r.data)
export const fetchStudent = (id) => api.get(`/admin/students/${id}`).then((r) => r.data)
export const setStudentAccess = (id, languages) => api.put(`/admin/students/${id}/access`, { languages }).then((r) => r.data)
export const fetchLogs = (params) => api.get('/admin/logs', { params }).then((r) => r.data)
export const updateStudent = (id, details) => api.patch(`/admin/students/${id}`, details).then((r) => r.data)
export const resetStudentPassword = (id) => api.post(`/admin/students/${id}/reset-password`).then((r) => r.data)
export const setStudentDisabled = (id, disabled) => api.post(`/admin/students/${id}/${disabled ? 'disable' : 'enable'}`).then((r) => r.data)
export const deleteStudent = (id, confirmEmail) => api.delete(`/admin/students/${id}`, { data: { confirmEmail } }).then((r) => r.data)
export const fetchEmails = (params) => api.get('/admin/emails', { params }).then((r) => r.data)
