import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { Trophy } from '../components/Icons'

const LEVEL_COLORS = {
  1: '#888', 2: '#3b82f6', 3: '#22c55e',
  4: '#eab308', 5: '#f97316', 6: '#ef4444',
}
const RANK_ICONS = { 1: '🥇', 2: '🥈', 3: '🥉' }

const TYPE_LABELS = { xp: 'XP-tävling', streak: 'Streak-tävling', workouts: 'Träningspass' }
const TYPE_ICONS = { xp: '⚡', streak: '🔥', workouts: '🏋️' }
const SCOPE_LABELS = { sweden: 'Sverige', city: 'Stad', gym: 'Gym' }

function timeLeft(endDate) {
  const diff = new Date(endDate) - new Date()
  if (diff <= 0) return 'Avslutad'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `${days}d ${hours}h kvar`
  const mins = Math.floor((diff % 3600000) / 60000)
  return `${hours}h ${mins}m kvar`
}

export default function Competitions() {
  const { user } = useAuth()
  const [competitions, setCompetitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('active')
  const [selectedComp, setSelectedComp] = useState(null)
  const [compDetail, setCompDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [joining, setJoining] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  const fetchList = (status) => {
    setLoading(true)
    api.getCompetitions(status).then(setCompetitions).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchList(tab) }, [tab])

  const openDetail = async (id) => {
    setSelectedComp(id)
    setDetailLoading(true)
    try {
      const data = await api.getCompetition(id)
      setCompDetail(data)
    } catch { setCompDetail(null) }
    setDetailLoading(false)
  }

  const handleJoin = async (id) => {
    setJoining(id)
    try {
      await api.joinCompetition(id)
      // Refresh
      fetchList(tab)
      if (selectedComp === id) openDetail(id)
    } catch (e) { alert(e.message) }
    setJoining(null)
  }

  const closeDetail = () => { setSelectedComp(null); setCompDetail(null) }

  return (
    <>
      <Nav />
      <div style={{ minHeight: '100vh', maxWidth: 900, margin: '0 auto', padding: '48px 24px 96px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 4 }}>Tävlingar</h1>
            <p style={{ color: 'var(--ts)', fontSize: 15 }}>Utmana dig själv och tävla mot andra</p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{
            background: 'var(--a)', color: '#fff', border: 'none', borderRadius: 999,
            padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            + Skapa tävling
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {[
            { key: 'active', label: 'Aktiva' },
            { key: 'ended', label: 'Avslutade' },
            { key: 'all', label: 'Alla' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--f)', fontSize: 14, fontWeight: tab === t.key ? 700 : 500,
              background: tab === t.key ? 'rgba(255,69,0,0.15)' : 'var(--c)',
              color: tab === t.key ? 'var(--a)' : 'var(--ts)', transition: 'all 0.2s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}><span className="spinner" style={{ width: 28, height: 28 }} /></div>
        ) : competitions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
            <p style={{ color: 'var(--ts)', fontSize: 15 }}>Inga tävlingar just nu.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {competitions.map(c => (
              <div
                key={c.id}
                onClick={() => openDetail(c.id)}
                style={{
                  background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 16,
                  padding: 24, cursor: 'pointer', transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,69,0,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--br)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 24 }}>{TYPE_ICONS[c.type] || '⚡'}</span>
                      <h3 style={{ fontSize: 18, fontWeight: 700 }}>{c.title}</h3>
                      {c.auto && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(255,69,0,0.1)', color: 'var(--a)', fontWeight: 600 }}>Auto</span>}
                    </div>
                    {c.description && <p style={{ color: 'var(--ts)', fontSize: 14, marginBottom: 12 }}>{c.description}</p>}
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--td)', flexWrap: 'wrap' }}>
                      <span>{TYPE_LABELS[c.type]}</span>
                      <span>📍 {SCOPE_LABELS[c.scope]}</span>
                      <span>👥 {c.participants_count} deltagare</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 999,
                      background: c.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                      color: c.is_active ? 'var(--suc)' : 'var(--td)',
                    }}>
                      {c.is_active ? timeLeft(c.end_date) : 'Avslutad'}
                    </div>
                    {c.is_active && !c.is_participant && (
                      <button onClick={e => { e.stopPropagation(); handleJoin(c.id) }} disabled={joining === c.id} style={{
                        marginTop: 8, background: 'var(--a)', color: '#fff', border: 'none',
                        borderRadius: 999, padding: '8px 20px', fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', width: '100%',
                      }}>
                        {joining === c.id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Gå med'}
                      </button>
                    )}
                    {c.is_participant && (
                      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--suc)', fontWeight: 600 }}>✓ Deltar</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Competition detail modal */}
      {selectedComp && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={closeDetail}>
          <div style={{
            background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 24,
            padding: 32, maxWidth: 560, width: '90%', maxHeight: '80vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <button onClick={closeDetail} style={{
              float: 'right', background: 'none', border: 'none', color: 'var(--ts)',
              fontSize: 24, cursor: 'pointer', lineHeight: 1,
            }}>&times;</button>

            {detailLoading && <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" style={{ width: 28, height: 28 }} /></div>}

            {!detailLoading && compDetail && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{TYPE_ICONS[compDetail.type]}</span>
                  <h2 style={{ fontSize: 22, fontWeight: 700 }}>{compDetail.title}</h2>
                </div>
                {compDetail.description && <p style={{ color: 'var(--ts)', fontSize: 14, marginBottom: 16 }}>{compDetail.description}</p>}

                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'var(--ts)' }}>
                    {TYPE_LABELS[compDetail.type]}
                  </span>
                  <span style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'var(--ts)' }}>
                    📍 {SCOPE_LABELS[compDetail.scope]}
                  </span>
                  <span style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'var(--ts)' }}>
                    👥 {compDetail.participants_count} deltagare
                  </span>
                  <span style={{
                    fontSize: 13, padding: '4px 12px', borderRadius: 6,
                    background: compDetail.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                    color: compDetail.is_active ? 'var(--suc)' : 'var(--td)',
                  }}>
                    {compDetail.is_active ? timeLeft(compDetail.end_date) : 'Avslutad'}
                  </span>
                </div>

                {compDetail.is_active && !compDetail.is_participant && (
                  <button onClick={() => handleJoin(compDetail.id)} disabled={joining === compDetail.id} style={{
                    background: 'var(--a)', color: '#fff', border: 'none', borderRadius: 999,
                    padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    {joining === compDetail.id ? <span className="spinner" /> : 'Gå med i tävlingen'}
                  </button>
                )}

                {/* Leaderboard */}
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>🏅 Tävlingsställning</h3>
                {compDetail.leaderboard.length === 0 ? (
                  <p style={{ color: 'var(--td)', fontSize: 13 }}>Inga deltagare med poäng ännu.</p>
                ) : (
                  compDetail.leaderboard.map(u => (
                    <div key={u.rank} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                      borderRadius: 10, marginBottom: 4,
                      background: u.is_you ? 'rgba(255,69,0,0.08)' : 'transparent',
                      border: u.is_you ? '1px solid rgba(255,69,0,0.2)' : '1px solid transparent',
                    }}>
                      <div style={{ width: 32, textAlign: 'center', fontSize: u.rank <= 3 ? 20 : 14, fontWeight: 800, color: u.rank <= 3 ? 'var(--t)' : 'var(--td)' }}>
                        {RANK_ICONS[u.rank] || u.rank}
                      </div>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: LEVEL_COLORS[u.level] || '#888',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0,
                      }}>
                        {u.level}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: u.is_you ? 700 : 500, color: u.is_you ? 'var(--a)' : 'var(--t)' }}>
                          {u.name} {u.is_you && <span style={{ fontSize: 11, color: 'var(--ts)' }}>(du)</span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--td)' }}>{u.level_name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: u.rank <= 3 ? 'var(--a)' : 'var(--t)' }}>{u.xp.toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: 'var(--td)' }}>XP</div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Create competition modal */}
      {showCreate && <CreateCompetitionModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchList(tab) }} />}

      <Footer />
    </>
  )
}

function CreateCompetitionModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('xp')
  const [scope, setScope] = useState('sweden')
  const [duration, setDuration] = useState(7)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { setError('Titel krävs'); return }
    setLoading(true)
    setError('')
    try {
      await api.createCompetition({ title: title.trim(), description: description.trim(), type, scope, duration_days: duration })
      onCreated()
    } catch (err) { setError(err.message); setLoading(false) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 24,
        padding: 32, maxWidth: 460, width: '90%',
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          float: 'right', background: 'none', border: 'none', color: 'var(--ts)',
          fontSize: 24, cursor: 'pointer', lineHeight: 1,
        }}>&times;</button>

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Skapa tävling</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: 'var(--ts)', display: 'block', marginBottom: 6 }}>Titel</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="T.ex. Januaritävlingen"
              className="auth-input" style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: 'var(--ts)', display: 'block', marginBottom: 6 }}>Beskrivning (valfritt)</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Beskriv tävlingen..."
              className="auth-input" style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: 'var(--ts)', display: 'block', marginBottom: 6 }}>Typ</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <button key={k} type="button" onClick={() => setType(k)} style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--f)', fontSize: 13, fontWeight: type === k ? 700 : 500,
                  background: type === k ? 'rgba(255,69,0,0.15)' : 'var(--b)',
                  color: type === k ? 'var(--a)' : 'var(--ts)',
                }}>
                  {TYPE_ICONS[k]} {v}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: 'var(--ts)', display: 'block', marginBottom: 6 }}>Scope</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(SCOPE_LABELS).map(([k, v]) => (
                <button key={k} type="button" onClick={() => setScope(k)} style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--f)', fontSize: 13, fontWeight: scope === k ? 700 : 500,
                  background: scope === k ? 'rgba(255,69,0,0.15)' : 'var(--b)',
                  color: scope === k ? 'var(--a)' : 'var(--ts)',
                }}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, color: 'var(--ts)', display: 'block', marginBottom: 6 }}>Varaktighet (dagar)</label>
            <input type="number" value={duration} onChange={e => setDuration(Math.max(1, Math.min(90, +e.target.value)))}
              min="1" max="90" className="auth-input" style={{ width: 120 }} />
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? <span className="spinner" /> : 'Skapa tävling'}
          </button>
        </form>
      </div>
    </div>
  )
}
