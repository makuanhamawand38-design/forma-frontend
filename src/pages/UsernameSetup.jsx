import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function UsernameSetup() {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('idle') // idle | invalid | checking | available | taken
  const [hint, setHint] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef(null)
  const { setUser } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const v = value.trim().toLowerCase()

    if (!v) { setStatus('idle'); setHint(''); return }

    if (!USERNAME_RE.test(v)) {
      setStatus('invalid')
      if (v.length < 3) setHint('Minst 3 tecken')
      else if (v.length > 20) setHint('Max 20 tecken')
      else setHint('Bara a–z, 0–9 och understreck')
      return
    }

    setStatus('checking')
    setHint('')

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.checkUsername(v)
        if (data.available) {
          setStatus('available')
          setHint('@' + v + ' är ledigt!')
        } else {
          setStatus('taken')
          setHint(data.reason || 'Redan taget')
        }
      } catch {
        setStatus('idle')
        setHint('')
      }
    }, 420)

    return () => clearTimeout(debounceRef.current)
  }, [value])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status !== 'available') return
    setLoading(true)
    setError('')
    try {
      const data = await api.setUsername(value.trim().toLowerCase())
      setUser(prev => ({ ...prev, username: data.username }))
      nav('/dashboard')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const hintColor =
    status === 'available' ? '#22c55e' :
    status === 'taken' || status === 'invalid' ? '#ef4444' :
    'var(--ts)'

  const showIndicator = ['checking', 'available', 'taken'].includes(status)

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
          <h1 className="auth-title">Välj ditt användarnamn</h1>
          <p className="auth-sub">
            Det här är ditt unika @handle på FORMA.<br />
            Du kan byta det senare från din profil.
          </p>

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
                      status === 'available' ? '#22c55e' :
                      (status === 'taken' || status === 'invalid') ? '#ef4444' :
                      undefined,
                    transition: 'border-color .2s',
                  }}
                  placeholder="ditt_namn"
                  value={value}
                  onChange={e => setValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  maxLength={20}
                  autoFocus
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                {showIndicator && (
                  <span style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    display: 'flex', alignItems: 'center',
                  }}>
                    <StatusIcon status={status} />
                  </span>
                )}
              </div>
              {hint && (
                <p style={{ fontSize: 13, marginTop: 8, color: hintColor, transition: 'color .2s' }}>
                  {hint}
                </p>
              )}
            </div>

            <div style={{
              background: 'rgba(255,69,0,0.07)',
              border: '1px solid rgba(255,69,0,0.2)',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 20,
              fontSize: 13,
              color: 'var(--ts)',
              lineHeight: 1.6,
            }}>
              <strong style={{ color: 'var(--t)' }}>Regler:</strong> 3–20 tecken &nbsp;·&nbsp;
              a–z, 0–9 och understreck &nbsp;·&nbsp; inga mellanslag
            </div>

            <button
              className="auth-btn"
              type="submit"
              disabled={loading || status !== 'available'}
            >
              {loading ? <span className="spinner" /> : 'Välj användarnamn'}
            </button>
          </form>
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
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
