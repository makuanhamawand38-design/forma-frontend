import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { Zap, Mail, productIcon } from '../components/Icons'

const PRODUCTS = [
  { id: "training", name: "4 Veckors Träningsprogram", price: 349, cat: "training", weeks: 4 },
  { id: "nutrition", name: "4 Veckors Kostschema", price: 349, cat: "nutrition", weeks: 4 },
  { id: "bundle", name: "8 Veckors Träning + Kost", price: 799, cat: "bundle", weeks: 8 },
]

export default function Guest() {
  const [email, setEmail] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const handlePay = async () => {
    if (!email || !selected) return
    setLoading(true)
    try {
      const data = await api.guestCheckout(selected.id, email)
      window.location.href = data.checkout_url
    } catch (err) {
      alert(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 32, cursor: 'pointer' }} onClick={() => nav('/')}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <div className="logo-icon"><Zap size={24} /></div>
            <span className="logo-text">FORMA</span>
          </div>
        </div>
        <div className="auth-box" style={{ maxWidth: 520 }}>
          <div className="auth-icon"><Mail size={32} /></div>
          <h1 className="auth-title">Köp som gäst</h1>
          <p className="auth-sub">Välj ditt program och ange din e-post – vi skickar allt dit.</p>
          {!selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PRODUCTS.map(p => (
                <button key={p.id} onClick={() => setSelected(p)} style={{ background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 12, padding: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--t)', fontFamily: 'var(--f)', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,69,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--a)' }}>{productIcon(p.cat, 20)}</div>
                    <div><div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div><div style={{ fontSize: 13, color: 'var(--ts)' }}>{p.weeks} veckor</div></div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{p.price}<span style={{ fontSize: 13, color: 'var(--ts)', fontWeight: 400, marginLeft: 4 }}>SEK</span></div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,69,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--a)' }}>{productIcon(selected.cat, 20)}</div>
                  <div><div style={{ fontWeight: 600 }}>{selected.name}</div><div style={{ fontSize: 13, color: 'var(--ts)' }}>{selected.price} SEK</div></div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--ts)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--f)' }}>Ändra</button>
              </div>
              <div className="auth-field"><label className="auth-label">Din e-postadress</label><input type="email" className="auth-input" placeholder="din@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}><span className="klarna-badge">Klarna.</span><span style={{ fontSize: 12, color: 'var(--td)', display: 'flex', alignItems: 'center' }}>Betala med kort eller Klarna</span></div>
              <button className="auth-btn" onClick={handlePay} disabled={loading}>{loading ? <span className="spinner" /> : `Betala ${selected.price} SEK`}</button>
              <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--td)' }}>Programmet skickas till din e-post efter betalning</p>
            </div>
          )}
          <div className="auth-divider">eller</div>
          <div className="auth-link"><Link to="/register">Skapa konto</Link> för dashboard, progress-tracking & rabatter</div>
        </div>
      </div>
    </div>
  )
}
