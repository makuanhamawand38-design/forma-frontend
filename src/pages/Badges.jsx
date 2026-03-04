import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'

const RARITY_COLORS = {
  common: { bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.25)', text: '#9ca3af', label: 'Vanlig' },
  uncommon: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', text: '#22c55e', label: 'Ovanlig' },
  rare: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', text: '#3b82f6', label: 'Sällsynt' },
  epic: { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.25)', text: '#a855f7', label: 'Episk' },
  legendary: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', text: '#f59e0b', label: 'Legendarisk' },
}

const CATEGORY_LABELS = {
  training: { label: 'Traning', icon: '💪' },
  social: { label: 'Socialt', icon: '💬' },
  community: { label: 'Community', icon: '👥' },
  gym: { label: 'Gym', icon: '📍' },
  streak: { label: 'Streaks', icon: '🔥' },
  special: { label: 'Special', icon: '⭐' },
}

export default function Badges() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showLocked, setShowLocked] = useState(true)

  useEffect(() => {
    api.getBadges()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const badges = data?.badges || []
  const filtered = badges.filter(b => {
    if (filter !== 'all' && b.category !== filter) return false
    if (!showLocked && !b.unlocked) return false
    return true
  })

  const unlocked = data?.unlocked_count || 0
  const total = data?.total || 0
  const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0

  return (
    <div>
      <Nav />
      <div className="dash-main">
        <h1 className="dash-title" style={{ marginBottom: 8 }}>Badges</h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 64 }}>
            <span className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : (
          <>
            {/* Progress */}
            <div style={{
              background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 16,
              padding: 20, marginBottom: 24,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t)' }}>
                  {unlocked}/{total} upplasta
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--a)' }}>{pct}%</span>
              </div>
              <div style={{
                height: 8, borderRadius: 4,
                background: 'rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  background: 'var(--a)',
                  width: `${pct}%`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                {Object.entries(RARITY_COLORS).map(([key, r]) => {
                  const count = badges.filter(b => b.rarity === key && b.unlocked).length
                  const rTotal = badges.filter(b => b.rarity === key).length
                  return (
                    <span key={key} style={{ fontSize: 12, color: r.text, fontWeight: 600 }}>
                      {r.label}: {count}/{rTotal}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
              <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')} label="Alla" />
              {(data?.categories || []).map(cat => (
                <FilterBtn
                  key={cat}
                  active={filter === cat}
                  onClick={() => setFilter(cat)}
                  label={`${CATEGORY_LABELS[cat]?.icon || ''} ${CATEGORY_LABELS[cat]?.label || cat}`}
                />
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <button onClick={() => setShowLocked(!showLocked)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--f)', fontSize: 13, fontWeight: 500, color: 'var(--ts)',
              }}>
                {showLocked ? 'Dolj lasta' : 'Visa lasta'}
              </button>
              <span style={{ fontSize: 12, color: 'var(--td)' }}>({filtered.length} badges)</span>
            </div>

            {/* Badge grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 12,
            }}>
              {filtered.map(b => {
                const r = RARITY_COLORS[b.rarity] || RARITY_COLORS.common
                return (
                  <div key={b.id} style={{
                    background: b.unlocked ? r.bg : 'var(--c)',
                    border: `1px solid ${b.unlocked ? r.border : 'var(--br)'}`,
                    borderRadius: 14, padding: 16,
                    opacity: b.unlocked ? 1 : 0.45,
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    cursor: 'default',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                    onMouseEnter={e => { if (b.unlocked) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${r.border}` } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 8, lineHeight: 1 }}>{b.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: b.unlocked ? 'var(--t)' : 'var(--td)', marginBottom: 4 }}>
                      {b.name}
                    </div>
                    <div style={{ fontSize: 12, color: b.unlocked ? 'var(--ts)' : 'var(--td)', lineHeight: 1.4, marginBottom: 8 }}>
                      {b.desc}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                        color: r.text, background: r.bg, padding: '3px 8px', borderRadius: 6,
                        border: `1px solid ${r.border}`,
                      }}>
                        {r.label}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--td)' }}>
                        +{b.xp} XP
                      </span>
                    </div>
                    {b.unlocked && (
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'rgba(34,197,94,0.2)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--td)' }}>
                Inga badges att visa
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function FilterBtn({ active, onClick, label }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
      fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
      background: active ? 'var(--a)' : 'var(--c)',
      border: active ? 'none' : '1px solid var(--br)',
      color: active ? '#fff' : 'var(--ts)',
      transition: 'all 0.15s',
    }}>
      {label}
    </button>
  )
}
