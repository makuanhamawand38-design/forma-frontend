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
  register: (email, password) => request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getProducts: () => request('/products/'),
  getProfile: () => request('/users/me'),
  updateProfile: (data) => request('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  getPrograms: () => request('/programs/'),
  getProgram: (id) => request(`/programs/${id}`),
  generateProgram: (id) => request(`/programs/${id}/generate`, { method: 'POST' }),
  completeProgram: (id) => request(`/programs/${id}/complete`, { method: 'POST' }),
  createCheckout: (productType) => request('/stripe/create-checkout', { method: 'POST', body: JSON.stringify({ product_type: productType }) }),
  guestCheckout: (productType, email) => request('/stripe/guest-checkout', { method: 'POST', body: JSON.stringify({ product_type: productType, email }) }),
  guestCheckoutWithProfile: (productType, email, profile) => request('/stripe/guest-checkout', { method: 'POST', body: JSON.stringify({ product_type: productType, email, profile }) }),
  getOrders: () => request('/users/me/orders'),
}