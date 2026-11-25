import api from './client'

export const fetchLeaderboard = (params) => api.get('/leaderboard', { params }).then((r) => r.data)
