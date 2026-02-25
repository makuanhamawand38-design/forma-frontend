import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'
import { productIcon, catBg, Sparkle, Play, CheckCircle, Zap } from '../components/Icons'

const NAMES = { training: "4 Veckors Träningsprogram", nutrition: "4 Veckors Kostschema", bundle: "8 Veckors Träning + Kost" }

export default function Dashboard() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(null)

  useEffect(() => {
    api.getPrograms().then(setPrograms).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleGenerate = async (id) => {
    setGenerating(id)
    try {
      await api.generateProgram(id)
      const updated = await api.getPrograms()
      setPrograms(updated)
    } catch (err) {
      alert(err.message)
    }
    setGenerating(null)
  }

  const handleComplete = async (id) => {
    try {
      await api.completeProgram(id)
      const updated = await api.getPrograms()
      setPrograms(updated)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div>
      <Nav />
      <div className="dash-main">
        <p className="dash-greeting">Hej, {user?.email}!</p>
        <h1 className="dash-title">Mina Program</h1>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--ts)' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : programs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <p style={{ color: 'var(--ts)', marginBottom: 24 }}>Du har inga program ännu. Köp ett program för att komma igång!</p>
            <button className="btn-primary" onClick={() => nav('/')}>Se program</button>
          </div>
        ) : (
          <div className="dash-grid">
            {programs.map(p => (
              <div key={p.id} className="prog-card">
                <div className="prog-card-img">
                  <div style={{ background: catBg(p.product_type), width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,var(--c),transparent)' }} />
                  <div style={{ position: 'absolute', bottom: 12, left: 16, color: 'var(--a)' }}>{productIcon(p.product_type, 28)}</div>
                </div>
                <div className="prog-card-body">
                  <div className="prog-card-top">
                    <span className="prog-name">{NAMES[p.product_type] || p.product_type}</span>
                    <span className={`prog-badge ${p.status}`}>
                      {p.status === 'pending' ? 'Ej genererat' : p.status === 'active' ? 'Aktiv' : p.status === 'completed' ? 'Slutfört' : p.status}
                    </span>
                  </div>
                  <p className="prog-meta">Version {p.version_number}</p>

                  {p.status === 'pending' && (
                    <button className="prog-btn orange" onClick={() => handleGenerate(p.id)} disabled={generating === p.id}>
                      {generating === p.id ? <span className="spinner" /> : <><Sparkle size={18} />Generera mitt program</>}
                    </button>
                  )}
                  {p.status === 'active' && (
                    <>
                      <button className="prog-btn orange" onClick={() => nav(`/program/${p.id}`)}><Play size={16} />Öppna program</button>
                      <button className="prog-btn outline" style={{ marginTop: 8 }} onClick={() => handleComplete(p.id)}><CheckCircle size={16} />Markera som slutfört</button>
                    </>
                  )}
                  {p.status === 'completed' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--suc)', marginBottom: 12 }}><CheckCircle size={16} /> Slutfört</div>
                      <button className="prog-btn outline" onClick={() => nav(`/program/${p.id}`)}>Visa program</button>
                      <div className="prog-discount"><Zap size={16} />20% rabatt aktiverad! Använd vid nästa köp.</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
