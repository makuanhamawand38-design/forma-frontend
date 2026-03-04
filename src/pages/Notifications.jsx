import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import Nav from '../components/Nav'

const AVATAR_COLORS = [
  ['#ff4500', '#ff6b35'],
  ['#6366f1', '#818cf8'],
  ['#ec4899', '#f472b6'],
  ['#14b8a6', '#2dd4bf'],
  ['#f59e0b', '#fbbf24'],
  ['#8b5cf6', '#a78bfa'],
  ['#06b6d4', '#22d3ee'],
  ['#ef4444', '#f87171'],
]

function avatarGradient(username) {
  let hash = 0
  for (let i = 0; i < (username || '').length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash)
  const pair = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
  return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'nu'
  if (mins < 60) return `${mins}m sedan`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h sedan`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d sedan`
  if (days < 30) return `${Math.floor(days / 7)}v sedan`
  return new Date(dateStr).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}

function dateGroup(dateStr) {
  if (!dateStr) return 'Okänt'
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Idag'
  if (days === 1) return 'Igår'
  if (days < 7) return 'Denna vecka'
  if (days < 30) return 'Denna månad'
  return 'Äldre'
}

const NOTIF_CONFIG = {
  like: { icon: '❤️', label: 'Gilla', color: '#ef4444' },
  comment: { icon: '💬', label: 'Kommentar', color: '#3b82f6' },
  follow: { icon: '👤', label: 'Följare', color: '#8b5cf6' },
  follow_request: { icon: '🔔', label: 'Följförfrågan', color: '#f59e0b' },
  follow_accepted: { icon: '✅', label: 'Följ godkänd', color: '#22c55e' },
  competition: { icon: '🏆', label: 'Tävling', color: '#f59e0b' },
  achievement: { icon: '🎖️', label: 'Prestation', color: '#a855f7' },
  level_up: { icon: '⚡', label: 'Level up', color: '#ff4500' },
  badge_unlocked: { icon: '🏅', label: 'Badge', color: '#f59e0b' },
  streak_increase: { icon: '🔥', label: 'Streak', color: '#ff4500' },
  streak_risk: { icon: '⚠️', label: 'Streak risk', color: '#f59e0b' },
  streak_broken: { icon: '💔', label: 'Streak bruten', color: '#ef4444' },
  challenge_received: { icon: '⚔️', label: 'Utmaning', color: '#6366f1' },
  challenge_accepted: { icon: '🤝', label: 'Utmaning', color: '#22c55e' },
  challenge_completed: { icon: '🏆', label: 'Utmaning', color: '#f59e0b' },
  coin_earned: { icon: '🪙', label: 'Coins', color: '#fbbf24' },
  dm: { icon: '✉️', label: 'Meddelande', color: '#06b6d4' },
}

const FILTER_TYPES = [
  { key: null, label: 'Alla' },
  { key: 'like', label: '❤️ Likes' },
  { key: 'comment', label: '💬 Kommentarer' },
  { key: 'follow', label: '👤 Följare' },
  { key: 'badge_unlocked', label: '🏅 Badges' },
  { key: 'streak_increase', label: '🔥 Streaks' },
]

const ACTIVITY_COLORS = {
  xp: '#ff4500',
  post: '#6366f1',
  checkin: '#22c55e',
  coins: '#fbbf24',
  badge: '#a855f7',
}

export default function Notifications() {
  const nav = useNavigate()
  const [tab, setTab] = useState('notifs')
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [unread, setUnread] = useState(0)
  const [filter, setFilter] = useState(null)
  const [activities, setActivities] = useState([])
  const [actLoading, setActLoading] = useState(false)
  const [actTotal, setActTotal] = useState(0)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const loadNotifs = useCallback((reset = false) => {
    const offset = reset ? 0 : notifs.length
    if (reset) setLoading(true)
    api.getNotifications(30, offset, filter)
      .then(data => {
        if (reset) {
          setNotifs(data.notifications || [])
        } else {
          setNotifs(prev => [...prev, ...(data.notifications || [])])
        }
        setTotal(data.total || 0)
        setUnread(data.unread || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter, notifs.length])

  useEffect(() => {
    loadNotifs(true)
    api.markNotificationsRead().catch(() => {})
  }, [filter])

  useEffect(() => {
    if (tab === 'activity' && activities.length === 0) {
      setActLoading(true)
      api.getActivity(30, 0)
        .then(data => {
          setActivities(data.activities || [])
          setActTotal(data.total || 0)
        })
        .catch(() => {})
        .finally(() => setActLoading(false))
    }
  }, [tab])

  const handleClick = (n) => {
    if (!n.read) {
      api.markNotificationRead(n.id).catch(() => {})
      setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
      setUnread(prev => Math.max(0, prev - 1))
    }
    if (n.ref_type === 'post' && n.ref_id) nav('/explore')
    else if (n.type === 'follow_request') nav('/profile')
    else if (n.type === 'badge_unlocked') nav('/badges')
    else if (n.type === 'challenge_received' || n.type === 'challenge_accepted' || n.type === 'challenge_completed') nav('/competitions')
    else if (n.from_username) nav(`/user/${n.from_username}`)
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    try {
      await api.deleteNotification(id)
      setNotifs(prev => prev.filter(n => n.id !== id))
      setTotal(prev => prev - 1)
    } catch {}
  }

  const handleClearAll = async () => {
    try {
      await api.clearAllNotifications()
      setNotifs([])
      setTotal(0)
      setUnread(0)
      setShowClearConfirm(false)
    } catch {}
  }

  const loadMoreActivity = () => {
    api.getActivity(30, activities.length)
      .then(data => setActivities(prev => [...prev, ...(data.activities || [])]))
      .catch(() => {})
  }

  // Group notifications by date
  const grouped = {}
  notifs.forEach(n => {
    const g = dateGroup(n.created_at)
    if (!grouped[g]) grouped[g] = []
    grouped[g].push(n)
  })

  // Group activities by date
  const actGrouped = {}
  activities.forEach(a => {
    const g = dateGroup(a.created_at)
    if (!actGrouped[g]) actGrouped[g] = []
    actGrouped[g].push(a)
  })

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Notiser</h1>
          {notifs.length > 0 && tab === 'notifs' && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowClearConfirm(!showClearConfirm)} style={{
                background: 'none', border: '1px solid var(--br)', borderRadius: 8,
                padding: '6px 14px', cursor: 'pointer', fontFamily: 'var(--f)',
                fontSize: 12, fontWeight: 600, color: 'var(--td)',
              }}>
                Rensa alla
              </button>
              {showClearConfirm && (
                <div style={{
                  position: 'absolute', right: 0, top: 36, zIndex: 50,
                  background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 12,
                  padding: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', minWidth: 200,
                }}>
                  <p style={{ fontSize: 13, color: 'var(--ts)', margin: '0 0 12px' }}>
                    Ta bort alla notiser?
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowClearConfirm(false)} style={{
                      flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--br)',
                      background: 'none', fontFamily: 'var(--f)', fontSize: 13, fontWeight: 500,
                      color: 'var(--ts)', cursor: 'pointer',
                    }}>Avbryt</button>
                    <button onClick={handleClearAll} style={{
                      flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                      background: '#ef4444', fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600,
                      color: '#fff', cursor: 'pointer',
                    }}>Ta bort</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 0, marginBottom: 20,
          background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4,
          border: '1px solid var(--br)',
        }}>
          <button onClick={() => setTab('notifs')} style={{
            flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none',
            background: tab === 'notifs' ? 'var(--a)' : 'transparent',
            color: tab === 'notifs' ? '#fff' : 'var(--ts)',
            fontFamily: 'var(--f)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s', position: 'relative',
          }}>
            Notiser
            {unread > 0 && (
              <span style={{
                marginLeft: 6, minWidth: 18, height: 18, borderRadius: 999,
                background: tab === 'notifs' ? 'rgba(255,255,255,0.25)' : 'var(--a)',
                color: '#fff', fontSize: 10, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
              }}>{unread}</span>
            )}
          </button>
          <button onClick={() => setTab('activity')} style={{
            flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none',
            background: tab === 'activity' ? 'var(--a)' : 'transparent',
            color: tab === 'activity' ? '#fff' : 'var(--ts)',
            fontFamily: 'var(--f)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s',
          }}>
            Aktivitet
          </button>
        </div>

        {/* Notifications tab */}
        {tab === 'notifs' && (
          <>
            {/* Type filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
              {FILTER_TYPES.map(f => (
                <button key={f.key || 'all'} onClick={() => setFilter(f.key)} style={{
                  padding: '6px 14px', borderRadius: 20, whiteSpace: 'nowrap',
                  fontFamily: 'var(--f)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: filter === f.key ? 'rgba(255,69,0,0.15)' : 'rgba(255,255,255,0.04)',
                  border: filter === f.key ? '1px solid rgba(255,69,0,0.3)' : '1px solid var(--br)',
                  color: filter === f.key ? 'var(--a)' : 'var(--ts)',
                  transition: 'all 0.15s',
                }}>
                  {f.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <span className="spinner" style={{ width: 28, height: 28 }} />
              </div>
            ) : notifs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--td)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
                <p style={{ fontSize: 15 }}>Inga notiser {filter ? 'av denna typ' : 'ännu'}</p>
                <p style={{ fontSize: 13, marginTop: 4, color: 'var(--td)' }}>
                  Du får notiser när någon gillar, kommenterar eller följer dig.
                </p>
              </div>
            ) : (
              <>
                {Object.entries(grouped).map(([group, items]) => (
                  <div key={group} style={{ marginBottom: 16 }}>
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: 'var(--td)', textTransform: 'uppercase',
                      letterSpacing: 0.5, padding: '8px 4px', marginBottom: 4,
                    }}>
                      {group}
                    </div>
                    {items.map(n => {
                      const config = NOTIF_CONFIG[n.type] || { icon: '🔔', color: 'var(--ts)' }
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleClick(n)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px',
                            borderRadius: 12, marginBottom: 2, cursor: 'pointer',
                            background: n.read ? 'transparent' : 'rgba(255,69,0,0.04)',
                            borderLeft: n.read ? '3px solid transparent' : `3px solid ${config.color}`,
                            transition: 'background 0.15s',
                            position: 'relative',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = n.read ? 'rgba(255,255,255,0.02)' : 'rgba(255,69,0,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(255,69,0,0.04)'}
                        >
                          {/* Avatar */}
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            {n.from_avatar_url ? (
                              <img src={n.from_avatar_url} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                            ) : n.from_username ? (
                              <div style={{
                                width: 44, height: 44, borderRadius: '50%',
                                background: avatarGradient(n.from_username),
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 18, fontWeight: 700, color: '#fff',
                              }}>
                                {n.from_username[0].toUpperCase()}
                              </div>
                            ) : (
                              <div style={{
                                width: 44, height: 44, borderRadius: '50%',
                                background: `${config.color}15`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 22,
                              }}>
                                {config.icon}
                              </div>
                            )}
                            {n.from_username && (
                              <span style={{
                                position: 'absolute', bottom: -2, right: -2,
                                fontSize: 14, lineHeight: 1,
                              }}>
                                {config.icon}
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 14, color: 'var(--t)', lineHeight: 1.4,
                              fontWeight: n.read ? 400 : 500,
                            }}>
                              {n.text}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--td)', marginTop: 2 }}>
                              {timeAgo(n.created_at)}
                            </div>
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            {!n.read && (
                              <div style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: config.color,
                              }} />
                            )}
                            <button onClick={(e) => handleDelete(e, n.id)} title="Ta bort" style={{
                              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                              color: 'var(--td)', opacity: 0.5, transition: 'opacity 0.15s',
                              fontSize: 14, lineHeight: 1, display: 'flex',
                            }}
                              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}

                {notifs.length < total && (
                  <button onClick={() => loadNotifs(false)} style={{
                    display: 'block', width: '100%', padding: 14, marginTop: 8,
                    background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 12,
                    color: 'var(--ts)', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--f)',
                  }}>
                    Visa fler
                  </button>
                )}
              </>
            )}
          </>
        )}

        {/* Activity tab */}
        {tab === 'activity' && (
          <>
            {actLoading ? (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <span className="spinner" style={{ width: 28, height: 28 }} />
              </div>
            ) : activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--td)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <p style={{ fontSize: 15 }}>Ingen aktivitet ännu</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>
                  Din aktivitet visas här när du tränar, postar och tjänar XP.
                </p>
              </div>
            ) : (
              <>
                {Object.entries(actGrouped).map(([group, items]) => (
                  <div key={group} style={{ marginBottom: 20 }}>
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: 'var(--td)', textTransform: 'uppercase',
                      letterSpacing: 0.5, padding: '8px 4px', marginBottom: 4,
                    }}>
                      {group}
                    </div>
                    <div style={{ position: 'relative', paddingLeft: 24 }}>
                      {/* Timeline line */}
                      <div style={{
                        position: 'absolute', left: 9, top: 8, bottom: 8,
                        width: 2, background: 'var(--br)',
                      }} />
                      {items.map((a, i) => {
                        const color = ACTIVITY_COLORS[a.type] || 'var(--ts)'
                        return (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'flex-start', gap: 12,
                            padding: '10px 0', position: 'relative',
                          }}>
                            {/* Timeline dot */}
                            <div style={{
                              position: 'absolute', left: -18, top: 14,
                              width: 14, height: 14, borderRadius: '50%',
                              background: `${color}20`, border: `2px solid ${color}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 8,
                            }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 18, lineHeight: 1 }}>{a.icon}</span>
                                <span style={{ fontSize: 14, color: 'var(--t)', fontWeight: 500, lineHeight: 1.4 }}>
                                  {a.text}
                                </span>
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--td)', marginTop: 3, marginLeft: 26 }}>
                                {timeAgo(a.created_at)}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {activities.length < actTotal && (
                  <button onClick={loadMoreActivity} style={{
                    display: 'block', width: '100%', padding: 14, marginTop: 8,
                    background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 12,
                    color: 'var(--ts)', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--f)',
                  }}>
                    Visa fler
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
