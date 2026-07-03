import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(res => res, async (error) => {
  const orig = error.config
  if (error.response?.status === 401 && !orig._retry) {
    orig._retry = true
    try {
      const refresh = localStorage.getItem('refresh_token')
      if (!refresh) throw new Error('no refresh')
      const res = await axios.post('/api/token/refresh/', { refresh })
      localStorage.setItem('access_token', res.data.access)
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`
      orig.headers.Authorization = `Bearer ${res.data.access}`
      return api(orig)
    } catch { localStorage.clear(); window.location.href = '/login' }
  }
  return Promise.reject(error)
})

export const authAPI = {
  register: (d) => api.post('/accounts/register/', d),
  sendVerificationCode: (d) => api.post('/accounts/send-verification-code/', d),
  login: (d) => api.post('/accounts/login/', d),
  verifyLoginOTP: (d) => api.post('/accounts/login/verify-otp/', d),
  getProfile: () => api.get('/accounts/profile/'),
  updateProfile: (d) => api.put('/accounts/profile/update/', d),
  changePassword: (d) => api.post('/accounts/change-password/', d),
  forgotPassword: (d) => api.post('/accounts/forgot-password/', d),
  resetPassword: (d) => api.post('/accounts/reset-password/', d),
  getMembers: (p) => api.get('/accounts/members/manage/', { params: p }),
  updateMember: (id, d) => api.patch(`/accounts/members/manage/${id}/`, d),
  deleteMember: (id) => api.delete(`/accounts/members/manage/${id}/`),
  toggleMemberStatus: (id) => api.post(`/accounts/members/${id}/toggle-status/`),
}

export const classAPI = {
  getAll: (p) => api.get('/classes/list/', { params: p }),
  create: (d) => api.post('/classes/list/', d),
  update: (id, d) => api.put(`/classes/list/${id}/`, d),
  delete: (id) => api.delete(`/classes/list/${id}/`),
  book: (id) => api.post(`/classes/list/${id}/book/`),
  cancelBooking: (id) => api.post(`/classes/list/${id}/cancel_booking/`),
  myBookings: () => api.get('/classes/list/my_bookings/'),
  upcomingClasses: () => api.get('/classes/list/upcoming_classes/'),
}

export const trainerAPI = {
  getAll: (p) => api.get('/trainers/list/', { params: p }),
  create: (d) => api.post('/trainers/list/', d),
  update: (id, d) => api.put(`/trainers/list/${id}/`, d),
  delete: (id) => api.delete(`/trainers/list/${id}/`),
  getAssignedMembers: () => api.get('/trainers/assigned-members/'),
  getWorkoutPlans: (p) => api.get('/trainers/workout-plans/', { params: p }),
  createWorkoutPlan: (d) => api.post('/trainers/workout-plans/', d),
  updateWorkoutPlan: (id, d) => api.patch(`/trainers/workout-plans/${id}/`, d),
  deleteWorkoutPlan: (id) => api.delete(`/trainers/workout-plans/${id}/`),
  getDietPlans: (p) => api.get('/trainers/diet-plans/', { params: p }),
  createDietPlan: (d) => api.post('/trainers/diet-plans/', d),
  updateDietPlan: (id, d) => api.patch(`/trainers/diet-plans/${id}/`, d),
  deleteDietPlan: (id) => api.delete(`/trainers/diet-plans/${id}/`),
}

export const membershipAPI = {
  getPlans: () => api.get('/memberships/plans/'),
  getPlan: (id) => api.get(`/memberships/plans/${id}/`),
  createPlan: (d) => api.post('/memberships/plans/', d),
  updatePlan: (id, d) => api.put(`/memberships/plans/${id}/`, d),
  deletePlan: (id) => api.delete(`/memberships/plans/${id}/`),
  upgrade: (d) => api.post('/memberships/upgrade/', d),
}

export const paymentAPI = {
  getAll: () => api.get('/payments/'),
  create: (d) => api.post('/payments/create/', d),
  getHistory: () => api.get('/payments/history/'),
  getStats: () => api.get('/payments/stats/'),
}

export const attendanceAPI = {
  getToday: () => api.get('/attendance/today/'),
  mark: (d) => api.post('/attendance/mark/', d),
  getReport: (p) => api.get('/attendance/report/', { params: p }),
  generateQR: () => api.post('/attendance/generate-qr/'),
}

export const dashboardAPI = { getStats: () => api.get('/dashboard/stats/') }

export const supportAPI = {
  getMyTicket: () => api.get('/support/my/'),
  sendMessage: (message) => api.post('/support/my/', { message }),
  getStaffTickets: () => api.get('/support/staff/tickets/'),
  getTicketDetail: (id) => api.get(`/support/staff/tickets/${id}/`),
  staffReply: (id, message) => api.post(`/support/staff/tickets/${id}/reply/`, { message }),
  updateStatus: (id, status) => api.patch(`/support/staff/tickets/${id}/`, { status }),
}

export default api
