import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { Zap, User } from '../components/Icons'

export default function Register() {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (pw !== pw2) { setError('Lösenorden matchar inte'); return }
    if (pw.length < 8) { setError('Lösenordet måste vara minst 8 tecken'); return }
    setLoading(true)
    try {
      const data = await api.register(email, pw)
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
          <div className="auth-icon"><User size={32} /></div>
          <h1 className="auth-title">Skapa konto</h1>
          <p className="auth-sub">Registrera dig för att komma igång med FORMA</p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="auth-field"><label className="auth-label">E-postadress</label><input type="email" className="auth-input" placeholder="din@email.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div className="auth-field"><label className="auth-label">Lösenord</label><input type="password" className="auth-input" placeholder="Minst 8 tecken" value={pw} onChange={e => setPw(e.target.value)} required /></div>
            <div className="auth-field"><label className="auth-label">Bekräfta lösenord</label><input type="password" className="auth-input" placeholder="Upprepa lösenord" value={pw2} onChange={e => setPw2(e.target.value)} required /></div>
            <button className="auth-btn" type="submit" disabled={loading}>{loading ? <span className="spinner" /> : 'Skapa konto'}</button>
          </form>
          <div className="auth-link">Har du redan ett konto? <Link to="/login">Logga in</Link></div>
        </div>
      </div>
    </div>
  )
}
