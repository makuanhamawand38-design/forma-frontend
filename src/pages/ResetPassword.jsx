import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { Zap, Lock } from '../components/Icons'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (pw !== pw2) { setError('Lösenorden matchar inte'); return }
    if (pw.length < 8) { setError('Lösenordet måste vara minst 8 tecken'); return }
    setLoading(true)
    try {
      await api.resetPassword(token, pw)
      setDone(true)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-box">
          <h1 className="auth-title">Ogiltig länk</h1>
          <p className="auth-sub">Länken är ogiltig eller har gått ut.</p>
          <div className="auth-link"><Link to="/forgot-password">Begär en ny återställningslänk</Link></div>
        </div>
      </div>
    )
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
          {done ? (
            <>
              <h1 className="auth-title">Lösenord uppdaterat!</h1>
              <p className="auth-sub">Ditt lösenord har ändrats. Du kan nu logga in med ditt nya lösenord.</p>
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: 16, marginTop: 16, marginBottom: 16, textAlign: 'center' }}>
                <span style={{ fontSize: 32 }}>✅</span>
              </div>
              <button className="auth-btn" onClick={() => nav('/login')}>Logga in</button>
            </>
          ) : (
            <>
              <h1 className="auth-title">Nytt lösenord</h1>
              <p className="auth-sub">Ange ditt nya lösenord</p>
              {error && <div className="auth-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="auth-field"><label className="auth-label">Nytt lösenord</label><input type="password" className="auth-input" placeholder="Minst 8 tecken" value={pw} onChange={e => setPw(e.target.value)} required /></div>
                <div className="auth-field"><label className="auth-label">Bekräfta lösenord</label><input type="password" className="auth-input" placeholder="Upprepa lösenord" value={pw2} onChange={e => setPw2(e.target.value)} required /></div>
                <button className="auth-btn" type="submit" disabled={loading}>{loading ? <span className="spinner" /> : 'Uppdatera lösenord'}</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}