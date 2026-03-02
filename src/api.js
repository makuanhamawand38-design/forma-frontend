const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
async function request(path, options = {}) {
  const token = localStorage.getItem('forma_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API}${path}`, { ...options, headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Något gick fel')
  return data
}
export const api = {
  register: (email, password, username) => request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, username }) }),
  login: (identifier, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  getProfile: () => request('/users/me'),
  updateProfile: (data) => request('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  getPrograms: () => request('/programs/'),
  getProgram: (id) => request(`/programs/${id}`),
  generateProgram: (id) => request(`/programs/${id}/generate`, { method: 'POST' }),
  completeProgram: (id) => request(`/programs/${id}/complete`, { method: 'POST' }),
  updateWeightLog: (id, weightLog) => request(`/programs/${id}/weight-log`, { method: 'PUT', body: JSON.stringify({ weight_log: weightLog }) }),
  createCheckout: (productType) => request('/stripe/create-checkout', { method: 'POST', body: JSON.stringify({ product_type: productType }) }),
  cancelSubscription: () => request('/stripe/cancel-subscription', { method: 'POST' }),
  getOrders: () => request('/users/me/orders'),
  downloadPdf: async (programId) => {
    const token = localStorage.getItem('forma_token')
    const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const res = await fetch(`${API}/programs/${programId}/pdf`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Kunde inte ladda ner PDF')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `forma_program.pdf`
    a.click()
    URL.revokeObjectURL(url)
  },
  swapExercise: (programId, weekIdx, dayIdx, exerciseIdx) =>
    request(`/programs/${programId}/swap-exercise`, { method: 'POST', body: JSON.stringify({ week_idx: weekIdx, day_idx: dayIdx, exercise_idx: exerciseIdx }) }),
  swapMeal: (programId, weekIdx, dayIdx, mealIdx) =>
    request(`/programs/${programId}/swap-meal`, { method: 'POST', body: JSON.stringify({ week_idx: weekIdx, day_idx: dayIdx, meal_idx: mealIdx }) }),
  getXp: () => request('/users/me/xp'),
  addXp: (action, meta = {}) => request('/users/me/xp/add', { method: 'POST', body: JSON.stringify({ action, meta }) }),
  getLeaderboard: (period = 'alltime', scope = 'all') => request(`/users/leaderboard?period=${period}&scope=${scope}`),
  // Competitions
  getCompetitions: (status = 'active') => request(`/competitions?status=${status}`),
  getCompetition: (id) => request(`/competitions/${id}`),
  createCompetition: (data) => request('/competitions', { method: 'POST', body: JSON.stringify(data) }),
  joinCompetition: (id) => request(`/competitions/${id}/join`, { method: 'POST' }),
  getPublicProfile: (username) => request(`/users/profile/${encodeURIComponent(username)}`),
  checkUsername: (username) => request(`/users/username/check/${encodeURIComponent(username)}`),
  setUsername: (username) => request('/users/me/username', { method: 'PUT', body: JSON.stringify({ username }) }),
  followUser: (username) => request(`/users/${encodeURIComponent(username)}/follow`, { method: 'POST' }),
  unfollowUser: (username) => request(`/users/${encodeURIComponent(username)}/unfollow`, { method: 'DELETE' }),
  getFollowers: (username, limit = 20, offset = 0) => request(`/users/${encodeURIComponent(username)}/followers?limit=${limit}&offset=${offset}`),
  getFollowing: (username, limit = 20, offset = 0) => request(`/users/${encodeURIComponent(username)}/following?limit=${limit}&offset=${offset}`),
  getSuggestedUsers: () => request('/users/suggested'),
  // Posts
  createPost: (text, sport_tag) => request('/posts', { method: 'POST', body: JSON.stringify({ text, sport_tag: sport_tag || null }) }),
  getFeed: (limit = 20, offset = 0) => request(`/posts/feed?limit=${limit}&offset=${offset}`),
  getExplore: (limit = 20, offset = 0) => request(`/posts/explore?limit=${limit}&offset=${offset}`),
  getPost: (id) => request(`/posts/${id}`),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  likePost: (id) => request(`/posts/${id}/like`, { method: 'POST' }),
  unlikePost: (id) => request(`/posts/${id}/like`, { method: 'DELETE' }),
  getComments: (id, limit = 20, offset = 0) => request(`/posts/${id}/comments?limit=${limit}&offset=${offset}`),
  addComment: (id, text) => request(`/posts/${id}/comments`, { method: 'POST', body: JSON.stringify({ text }) }),
  deleteComment: (postId, commentId) => request(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }),
  // DM
  startConversation: (username) => request('/dm/conversations', { method: 'POST', body: JSON.stringify({ username }) }),
  getConversations: () => request('/dm/conversations'),
  getUnreadCount: () => request('/dm/conversations/unread-count'),
  getMessages: (conversationId, limit = 50, offset = 0) => request(`/dm/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`),
  sendMessage: (conversationId, text) => request(`/dm/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ text }) }),
  // Notifications
  getNotifications: (limit = 30, offset = 0) => request(`/notifications?limit=${limit}&offset=${offset}`),
  markNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),
  getNotifUnreadCount: () => request('/notifications/unread-count'),
}