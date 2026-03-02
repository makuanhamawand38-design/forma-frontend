import { useState, useEffect } from 'react'
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
  return new Date(dateStr).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}

const NOTIF_ICONS = {
  like: '❤️',
  comment: '💬',
  follow: '👤',
  follow_request: '🔔',
  competition: '🏆',
  achievement: '🎖️',
  level_up: '⚡',
}

export default function Notifications() {
  const nav = useNavigate()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    api.getNotifications()
      .then(data => {
        setNotifs(data.notifications || [])
        setTotal(data.total || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    // Mark all as read when opening
    api.markNotificationsRead().catch(() => {})
  }, [])

  const handleClick = (n) => {
    if (n.ref_type === 'post' && n.ref_id) {
      nav(`/explore`)
    } else if (n.type === 'follow' && n.from_username) {
      nav(`/user/${n.from_username}`)
    } else if (n.from_username) {
      nav(`/user/${n.from_username}`)
    }
  }

  const loadMore = () => {
    api.getNotifications(30, notifs.length)
      .then(data => {
        setNotifs(prev => [...prev, ...(data.notifications || [])])
      })
      .catch(() => {})
  }

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px 80px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Notiser</h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <span className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : notifs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--td)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <p style={{ fontSize: 15 }}>Inga notiser ännu</p>
            <p style={{ fontSize: 13, marginTop: 4, color: 'var(--td)' }}>
              Du får notiser när någon gillar, kommenterar eller följer dig.
            </p>
          </div>
        ) : (
          <>
            {notifs.map(n => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 12px',
                  borderRadius: 12, marginBottom: 4, cursor: 'pointer',
                  background: n.read ? 'transparent' : 'rgba(255,69,0,0.04)',
                  borderLeft: n.read ? '3px solid transparent' : '3px solid var(--a)',
                  transition: 'background 0.15s',
                }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: avatarGradient(n.from_username),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: '#fff',
                  }}>
                    {n.from_username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span style={{
                    position: 'absolute', bottom: -2, right: -2,
                    fontSize: 14, lineHeight: 1,
                  }}>
                    {NOTIF_ICONS[n.type] || '🔔'}
                  </span>
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

                {/* Unread dot */}
                {!n.read && (
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--a)', flexShrink: 0,
                  }} />
                )}
              </div>
            ))}

            {notifs.length < total && (
              <button
                onClick={loadMore}
                style={{
                  display: 'block', width: '100%', padding: 14, marginTop: 8,
                  background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 12,
                  color: 'var(--ts)', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--f)',
                }}
              >
                Visa fler
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
