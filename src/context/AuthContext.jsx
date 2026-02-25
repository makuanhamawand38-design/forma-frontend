import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('forma_token')
    const email = localStorage.getItem('forma_email')
    if (token && email) {
      setUser({ email, token })
      // Try to load profile
      api.getProfile().then(profile => {
        setUser(prev => ({ ...prev, ...profile }))
      }).catch(() => {
        localStorage.removeItem('forma_token')
        localStorage.removeItem('forma_email')
        setUser(null)
      })
    }
    setLoading(false)
  }, [])

  const login = (token, email) => {
    localStorage.setItem('forma_token', token)
    localStorage.setItem('forma_email', email)
    setUser({ email, token })
  }

  const logout = () => {
    localStorage.removeItem('forma_token')
    localStorage.removeItem('forma_email')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
