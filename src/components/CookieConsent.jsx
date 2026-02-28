import { useState, useEffect } from 'react'

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('forma_cookie_consent')
    if (!consent) setShow(true)
  }, [])

  const accept = () => {
    localStorage.setItem('forma_cookie_consent', 'accepted')
    setShow(false)
  }

  const decline = () => {
    localStorage.setItem('forma_cookie_consent', 'declined')
    // Disable Google Analytics
    window['ga-disable-G-R0TC746BST'] = true
    setShow(false)
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10000,
      background: '#1a1a2e', borderTop: '1px solid rgba(255,69,0,0.2)',
      padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
    }}>
      <p style={{ fontSize: 13, color: 'var(--ts)', margin: 0, maxWidth: 600, lineHeight: 1.5 }}>
        Vi använder cookies för att förbättra din upplevelse och analysera trafik. Läs vår{' '}
        <a href="/villkor" style={{ color: 'var(--a)', textDecoration: 'underline' }}>integritetspolicy</a>.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={decline} style={{
          background: 'none', border: '1px solid var(--br)', borderRadius: 8,
          padding: '8px 16px', cursor: 'pointer', fontFamily: 'var(--f)',
          fontSize: 13, color: 'var(--ts)',
        }}>
          Avvisa
        </button>
        <button onClick={accept} style={{
          background: 'var(--a)', border: 'none', borderRadius: 8,
          padding: '8px 20px', cursor: 'pointer', fontFamily: 'var(--f)',
          fontSize: 13, fontWeight: 700, color: '#fff',
        }}>
          Acceptera
        </button>
      </div>
    </div>
  )
}