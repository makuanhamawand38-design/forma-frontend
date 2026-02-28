import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'
import { productIcon, catBg, Sparkle, Play, CheckCircle, Zap } from '../components/Icons'
import { XpBar } from '../components/XpSystem'
import Leaderboard from '../components/Leaderboard'

const NAMES = { training: "4 Veckors Träningsprogram", nutrition: "4 Veckors Kostschema", bundle: "8 Veckors Träning + Kost" }

export default function Dashboard() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [programs, setPrograms] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(null)

  useEffect(() => {
    Promise.all([
      api.getPrograms().catch(() => []),
      api.getProfile().catch(() => null),
    ]).then(([p, prof]) => {
      setPrograms(p)
      setProfile(prof)
    }).finally(() => setLoading(false))
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

  const greeting = profile?.first_name || user?.email?.split('@')[0] || ''
  const isPro = profile?.subscription_status === 'active'
  const isCancelling = profile?.subscription_cancel_at_period_end

  const activePrograms = programs.filter(p => p.status === 'active')
  const pendingPrograms = programs.filter(p => p.status === 'pending')
  const completedPrograms = programs.filter(p => p.status === 'completed')

  return (
    <div>
      <Nav />
      <div className="dash-main">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <p className="dash-greeting">Hej, {greeting}!</p>
            <h1 className="dash-title" style={{ margin: 0 }}>Mina Program</h1>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {isPro && (
              <div style={{
                background: 'rgba(255,69,0,0.1)', border: '1px solid rgba(255,69,0,0.3)', borderRadius: 20,
                padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--a)',
              }}>
                ⚡ Pro {isCancelling ? '(avslutas)' : 'aktiv'}
              </div>
            )}
            {!isPro && (
              <button onClick={() => nav('/#pricing')} style={{
                background: 'rgba(255,69,0,0.1)', border: '1px solid rgba(255,69,0,0.2)', borderRadius: 10,
                padding: '8px 16px', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600, color: 'var(--a)',
              }}>
                ⚡ Uppgradera till Pro
              </button>
            )}
          </div>
        </div>

        {/* XP System */}
        {!loading && <XpBar />}

        {/* Leaderboard */}
        {!loading && <Leaderboard />}

        {/* Stats */}
        {!loading && programs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
            <div style={{ background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--a)' }}>{programs.length}</div>
              <div style={{ fontSize: 12, color: 'var(--ts)' }}>Totalt program</div>
            </div>
            <div style={{ background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#22c55e' }}>{activePrograms.length}</div>
              <div style={{ fontSize: 12, color: 'var(--ts)' }}>Aktiva</div>
            </div>
            <div style={{ background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--t)' }}>{completedPrograms.length}</div>
              <div style={{ fontSize: 12, color: 'var(--ts)' }}>Slutförda</div>
            </div>
            {profile?.has_discount && (
              <div style={{ background: 'rgba(255,69,0,0.08)', border: '1px solid rgba(255,69,0,0.2)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--a)' }}>20%</div>
                <div style={{ fontSize: 12, color: 'var(--a)' }}>Rabatt tillgänglig</div>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--ts)' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : programs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏋️</div>
            <p style={{ color: 'var(--ts)', marginBottom: 24, fontSize: 16 }}>Du har inga program ännu. Köp ett program för att komma igång!</p>
            <button className="btn-primary" onClick={() => nav('/')}>Se program</button>
          </div>
        ) : (
          <>
            {/* Pending programs first */}
            {pendingPrograms.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ts)', marginBottom: 16 }}>Väntar på generering</h2>
                <div className="dash-grid">
                  {pendingPrograms.map(p => (
                    <ProgramCard key={p.id} p={p} nav={nav} generating={generating} onGenerate={handleGenerate} onComplete={handleComplete} />
                  ))}
                </div>
              </div>
            )}

            {/* Active programs */}
            {activePrograms.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#22c55e', marginBottom: 16 }}>Aktiva program</h2>
                <div className="dash-grid">
                  {activePrograms.map(p => (
                    <ProgramCard key={p.id} p={p} nav={nav} generating={generating} onGenerate={handleGenerate} onComplete={handleComplete} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed programs */}
            {completedPrograms.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ts)', marginBottom: 16 }}>Slutförda program</h2>
                <div className="dash-grid">
                  {completedPrograms.map(p => (
                    <ProgramCard key={p.id} p={p} nav={nav} generating={generating} onGenerate={handleGenerate} onComplete={handleComplete} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ProgramCard({ p, nav, generating, onGenerate, onComplete }) {
  return (
    <div className="prog-card">
      <div className="prog-card-img">
        <div style={{ background: catBg(p.product_type), width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,var(--c),transparent)' }} />
        <div style={{ position: 'absolute', bottom: 12, left: 16, color: 'var(--a)' }}>{productIcon(p.product_type, 28)}</div>
        {p.subscription && <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--a)', color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Pro</div>}
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
          <button className="prog-btn orange" onClick={() => onGenerate(p.id)} disabled={generating === p.id}>
            {generating === p.id ? <span className="spinner" /> : <><Sparkle size={18} />Generera mitt program</>}
          </button>
        )}
        {p.status === 'active' && (
          <>
            <button className="prog-btn orange" onClick={() => nav(`/program/${p.id}`)}><Play size={16} />Öppna program</button>
            <button className="prog-btn outline" style={{ marginTop: 8 }} onClick={() => onComplete(p.id)}><CheckCircle size={16} />Markera som slutfört</button>
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
  )
}