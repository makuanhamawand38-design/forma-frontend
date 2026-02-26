import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { Zap, Mail } from '../components/Icons'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.forgotPassword(email)
      setSent(true)
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
          <div className="auth-icon"><Mail size={32} /></div>
          {sent ? (
            <>
              <h1 className="auth-title">Kolla din mejl!</h1>
              <p className="auth-sub">Vi har skickat en länk till <strong>{email}</strong> där du kan återställa ditt lösenord.</p>
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: 16, marginTop: 16, marginBottom: 16, textAlign: 'center' }}>
                <span style={{ fontSize: 32 }}>📧</span>
                <p style={{ fontSize: 13, color: 'var(--ts)', marginTop: 8 }}>Hittar du inte mejlet? Kolla skräpposten.</p>
              </div>
              <div className="auth-link"><Link to="/login">← Tillbaka till inloggning</Link></div>
            </>
          ) : (
            <>
              <h1 className="auth-title">Glömt lösenord?</h1>
              <p className="auth-sub">Ange din e-postadress så skickar vi en återställningslänk</p>
              {error && <div className="auth-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="auth-field"><label className="auth-label">E-postadress</label><input type="email" className="auth-input" placeholder="din@email.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
                <button className="auth-btn" type="submit" disabled={loading}>{loading ? <span className="spinner" /> : 'Skicka återställningslänk'}</button>
              </form>
              <div className="auth-link"><Link to="/login">← Tillbaka till inloggning</Link></div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}