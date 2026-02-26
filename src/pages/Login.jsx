import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { Zap, Lock } from '../components/Icons'

export default function Login() {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login(email, pw)
      login(data.token, data.email)
      nav('/dashboard')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div>
        <div style={{ textAlign: 'center', marginBottom: 32, cursor: 'pointer' }} onClick={() => nav('/')}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <div className="logo-icon"><Zap size={24} /></div>
            <span className="logo-text">FORMA</span>
          </div>
        </div>
        <div className="auth-box">
          <div className="auth-icon"><Lock size={32} /></div>
          <h1 className="auth-title">Välkommen tillbaka</h1>
          <p className="auth-sub">Logga in för att komma åt dina program</p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="auth-field"><label className="auth-label">E-postadress</label><input type="email" className="auth-input" placeholder="din@email.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div className="auth-field"><label className="auth-label">Lösenord</label><input type="password" className="auth-input" placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} required /></div>
            <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--a)' }}>Glömt lösenord?</Link>
            </div>
            <button className="auth-btn" type="submit" disabled={loading}>{loading ? <span className="spinner" /> : 'Logga in'}</button>
          </form>
          <div className="auth-link">Har du inget konto? <Link to="/register">Skapa konto</Link></div>
          <div className="auth-divider">eller</div>
          <div className="auth-link"><Link to="/guest">Köp utan konto – få planen via mejl</Link></div>
        </div>
      </div>
    </div>
  )
}