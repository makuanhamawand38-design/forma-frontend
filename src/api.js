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
  register: (email, password, username, referral_code) => request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, username, referral_code: referral_code || undefined }) }),
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
  // Images
  uploadAvatar: async (file) => {
    const token = localStorage.getItem('forma_token')
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${API}/users/me/avatar`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Kunde inte ladda upp')
    return data
  },
  uploadCover: async (file) => {
    const token = localStorage.getItem('forma_token')
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${API}/users/me/cover`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Kunde inte ladda upp')
    return data
  },
  // Posts
  createPost: async (text, sport_tag, imageFiles = [], videoFile = null) => {
    const token = localStorage.getItem('forma_token')
    const fd = new FormData()
    fd.append('text', text)
    if (sport_tag) fd.append('sport_tag', sport_tag)
    imageFiles.forEach(f => fd.append('images', f))
    if (videoFile) fd.append('video', videoFile)
    const res = await fetch(`${API}/posts`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Något gick fel')
    return data
  },
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
  createGroup: (name, usernames) => request('/dm/groups', { method: 'POST', body: JSON.stringify({ name, usernames }) }),
  updateGroup: (id, data) => request(`/dm/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  leaveGroup: (id) => request(`/dm/groups/${id}/leave`, { method: 'POST' }),
  // Notifications
  getNotifications: (limit = 30, offset = 0, type = null) => request(`/notifications?limit=${limit}&offset=${offset}${type ? `&notif_type=${type}` : ''}`),
  markNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  deleteNotification: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),
  clearAllNotifications: () => request('/notifications', { method: 'DELETE' }),
  getNotifUnreadCount: () => request('/notifications/unread-count'),
  getActivity: (limit = 30, offset = 0) => request(`/notifications/activity?limit=${limit}&offset=${offset}`),
  // Partners
  searchPartners: () => request('/partners/search'),
  contactPartner: (username, message = '') => request(`/partners/${encodeURIComponent(username)}/contact`, { method: 'POST', body: JSON.stringify({ message }) }),
  skipPartner: (username) => request(`/partners/${encodeURIComponent(username)}/skip`, { method: 'POST' }),
  // Referrals
  getMyReferrals: () => request('/users/me/referrals'),
  // Moderation
  reportContent: (target_type, target_id, reason) => request('/moderation/reports', { method: 'POST', body: JSON.stringify({ target_type, target_id, reason }) }),
  blockUser: (username) => request(`/moderation/users/${encodeURIComponent(username)}/block`, { method: 'POST' }),
  unblockUser: (username) => request(`/moderation/users/${encodeURIComponent(username)}/block`, { method: 'DELETE' }),
  getBlockedUsers: () => request('/moderation/users/me/blocked'),
  // Search & Follow requests
  searchUsers: (q, limit = 10) => request(`/users/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  getFollowRequests: (limit = 20, offset = 0) => request(`/users/me/follow-requests?limit=${limit}&offset=${offset}`),
  acceptFollow: (username) => request(`/users/${encodeURIComponent(username)}/accept-follow`, { method: 'POST' }),
  rejectFollow: (username) => request(`/users/${encodeURIComponent(username)}/reject-follow`, { method: 'POST' }),
  // Coins & Shop
  getCoins: (limit = 20, offset = 0) => request(`/users/me/coins?limit=${limit}&offset=${offset}`),
  getShopItems: () => request('/shop/items'),
  purchaseItem: (itemId) => request('/shop/purchase', { method: 'POST', body: JSON.stringify({ item_id: itemId }) }),
  // Streaks
  getStreaks: () => request('/streaks'),
  getStreak: (username) => request(`/streaks/${encodeURIComponent(username)}`),
  startStreak: (username) => request(`/streaks/${encodeURIComponent(username)}/start`, { method: 'POST' }),
  // Challenges
  getChallenges: (status = 'all') => request(`/challenges?status=${status}`),
  getChallenge: (id) => request(`/challenges/${id}`),
  createChallenge: (data) => request('/challenges', { method: 'POST', body: JSON.stringify(data) }),
  acceptChallenge: (id) => request(`/challenges/${id}/accept`, { method: 'POST' }),
  declineChallenge: (id) => request(`/challenges/${id}/decline`, { method: 'POST' }),
  // Checkins
  checkin: (gym_name) => request('/checkins', { method: 'POST', body: JSON.stringify({ gym_name: gym_name || '' }) }),
  getMyCheckins: () => request('/checkins/me'),
  getGymActive: (gym) => request(`/checkins/gym/${encodeURIComponent(gym)}`),
  getGymLeaderboard: (gym) => request(`/checkins/gym/${encodeURIComponent(gym)}/leaderboard`),
  // Badges
  getBadges: () => request('/badges'),
  getUserBadges: (username) => request(`/badges/${encodeURIComponent(username)}`),
  // Workouts
  createWorkout: (data) => request('/workouts', { method: 'POST', body: JSON.stringify(data) }),
  getWorkouts: (limit = 20, offset = 0) => request(`/workouts?limit=${limit}&offset=${offset}`),
  getWorkout: (id) => request(`/workouts/${id}`),
  updateWorkout: (id, data) => request(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorkout: (id) => request(`/workouts/${id}`, { method: 'DELETE' }),
  getWorkoutStats: () => request('/workouts/stats'),
  getWorkoutPRs: (limit = 30) => request(`/workouts/prs?limit=${limit}`),
  getExerciseHistory: (name, limit = 20) => request(`/workouts/exercise/${encodeURIComponent(name)}/history?limit=${limit}`),
  // Goals
  createGoal: (data) => request('/goals', { method: 'POST', body: JSON.stringify(data) }),
  getGoals: (status = 'all') => request(`/goals?status=${status}`),
  updateGoal: (id, data) => request(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGoal: (id) => request(`/goals/${id}`, { method: 'DELETE' }),
  completeGoal: (id, auto_post = false) => request(`/goals/${id}/complete`, { method: 'POST', body: JSON.stringify({ auto_post }) }),
  getUserGoals: (username) => request(`/goals/public/${encodeURIComponent(username)}`),
  // Weekly Summary
  getWeeklySummary: () => request('/users/me/weekly-summary'),
}