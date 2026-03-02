import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { Zap, User } from '../components/Icons'

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

function StatusIcon({ status }) {
  if (status === 'checking') return <span className="uname-spinner" />
  if (status === 'available') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
  if (status === 'taken') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
  return null
}

export default function Register() {
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState('idle') // idle | invalid | checking | available | taken
  const [usernameHint, setUsernameHint] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [showReferral, setShowReferral] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const { login } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const v = username.trim().toLowerCase()

    if (!v) { setUsernameStatus('idle'); setUsernameHint(''); return }

    if (!USERNAME_RE.test(v)) {
      setUsernameStatus('invalid')
      if (v.length < 3) setUsernameHint('Minst 3 tecken')
      else if (v.length > 20) setUsernameHint('Max 20 tecken')
      else setUsernameHint('Bara a–z, 0–9 och understreck')
      return
    }

    setUsernameStatus('checking')
    setUsernameHint('')

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.checkUsername(v)
        if (data.available) {
          setUsernameStatus('available')
          setUsernameHint('@' + v + ' är ledigt!')
        } else {
          setUsernameStatus('taken')
          setUsernameHint(data.reason || 'Redan taget')
        }
      } catch {
        setUsernameStatus('idle')
        setUsernameHint('')
      }
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [username])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (usernameStatus !== 'available') { setError('Välj ett giltigt användarnamn'); return }
    if (pw !== pw2) { setError('Lösenorden matchar inte'); return }
    if (pw.length < 8) { setError('Lösenordet måste vara minst 8 tecken'); return }
    setLoading(true)
    try {
      const data = await api.register(email, pw, username.trim().toLowerCase(), referralCode.trim() || undefined)
      login(data.token, data.email)
      nav('/feed')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const hintColor =
    usernameStatus === 'available' ? '#22c55e' :
    usernameStatus === 'taken' || usernameStatus === 'invalid' ? '#ef4444' :
    'var(--ts)'

  const showIndicator = ['checking', 'available', 'taken'].includes(usernameStatus)

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
            <div className="auth-field">
              <label className="auth-label">Användarnamn</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--a)', fontWeight: 700, fontSize: 16, userSelect: 'none',
                  pointerEvents: 'none'
                }}>@</span>
                <input
                  type="text"
                  className="auth-input"
                  style={{
                    paddingLeft: 30,
                    paddingRight: 44,
                    borderColor:
                      usernameStatus === 'available' ? '#22c55e' :
                      (usernameStatus === 'taken' || usernameStatus === 'invalid') ? '#ef4444' :
                      undefined,
                    transition: 'border-color .2s',
                  }}
                  placeholder="ditt_namn"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  maxLength={20}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                {showIndicator && (
                  <span style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    display: 'flex', alignItems: 'center',
                  }}>
                    <StatusIcon status={usernameStatus} />
                  </span>
                )}
              </div>
              {usernameHint && (
                <p style={{ fontSize: 13, marginTop: 6, marginBottom: 0, color: hintColor, transition: 'color .2s' }}>
                  {usernameHint}
                </p>
              )}
            </div>
            <div className="auth-field"><label className="auth-label">E-postadress</label><input type="email" className="auth-input" placeholder="din@email.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div className="auth-field"><label className="auth-label">Lösenord</label><input type="password" className="auth-input" placeholder="Minst 8 tecken" value={pw} onChange={e => setPw(e.target.value)} required /></div>
            <div className="auth-field"><label className="auth-label">Bekräfta lösenord</label><input type="password" className="auth-input" placeholder="Upprepa lösenord" value={pw2} onChange={e => setPw2(e.target.value)} required /></div>
            {!showReferral ? (
              <button type="button" onClick={() => setShowReferral(true)} style={{
                background: 'none', border: 'none', color: 'var(--a)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--f)', padding: '4px 0', marginBottom: 8,
              }}>
                Har du en inbjudningskod?
              </button>
            ) : (
              <div className="auth-field">
                <label className="auth-label">Inbjudningskod <span style={{ fontSize: 11, color: 'var(--td)', fontWeight: 400 }}>(valfritt)</span></label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="T.ex. ABC12345"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  maxLength={8}
                  autoComplete="off"
                />
              </div>
            )}
            <button className="auth-btn" type="submit" disabled={loading || usernameStatus !== 'available'}>{loading ? <span className="spinner" /> : 'Skapa konto'}</button>
          </form>
          <div className="auth-link">Har du redan ett konto? <Link to="/login">Logga in</Link></div>
        </div>
      </div>

      <style>{`
        .uname-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: var(--a);
          border-radius: 50%;
          animation: uname-spin .7s linear infinite;
        }
        @keyframes uname-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
