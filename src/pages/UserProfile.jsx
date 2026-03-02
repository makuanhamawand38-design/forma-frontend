import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'
import { Zap } from '../components/Icons'

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

function FollowListModal({ username, type, onClose }) {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  const title = type === 'followers' ? 'Följare' : 'Följer'

  useEffect(() => {
    const fetch = type === 'followers' ? api.getFollowers : api.getFollowing
    fetch(username, 50, 0)
      .then(data => {
        setItems(data[type] || [])
        setTotal(data.total || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [username, type])

  return (
    <div className="flm-overlay" onClick={onClose}>
      <div className="flm-modal" onClick={e => e.stopPropagation()}>
        <div className="flm-header">
          <h3 className="flm-title">{title}</h3>
          <button className="flm-close" onClick={onClose}>✕</button>
        </div>
        <div className="flm-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <span className="spinner" style={{ width: 24, height: 24 }} />
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--td)', fontSize: 14 }}>
              {type === 'followers' ? 'Inga följare ännu' : 'Följer ingen ännu'}
            </div>
          ) : (
            items.map((u, i) => (
              <div key={i} className="flm-item" onClick={() => { onClose(); nav(`/user/${u.username}`) }}>
                <div className="flm-avatar" style={{ background: avatarGradient(u.username) }}>
                  {u.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flm-username">@{u.username}</div>
                  {u.city && <div className="flm-city">{u.city}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function UserProfile() {
  const { username } = useParams()
  const { user } = useAuth()
  const nav = useNavigate()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [modal, setModal] = useState(null)

  const isOwn = user?.username === username

  useEffect(() => {
    setProfile(null)
    setError(null)
    setFollowing(false)
    api.getPublicProfile(username)
      .then(p => {
        setProfile(p)
        setFollowing(p.is_following || false)
      })
      .catch(() => setError('Användaren hittades inte'))
  }, [username])

  const handleFollow = async () => {
    if (!user) return nav('/login')
    setFollowLoading(true)
    try {
      if (following) {
        await api.unfollowUser(username)
        setFollowing(false)
        setProfile(p => ({ ...p, followers_count: Math.max(0, (p.followers_count || 0) - 1) }))
      } else {
        await api.followUser(username)
        setFollowing(true)
        setProfile(p => ({ ...p, followers_count: (p.followers_count || 0) + 1 }))
      }
    } catch (err) {
      // silently ignore (e.g. already following)
    }
    setFollowLoading(false)
  }

  const initial = profile?.username?.[0]?.toUpperCase() || '?'
  const locationParts = [profile?.city, profile?.gym].filter(Boolean)

  const followBtn = (
    <button
      className={following ? 'up-btn-following' : 'up-btn-follow'}
      onClick={handleFollow}
      disabled={followLoading}
    >
      {followLoading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : following ? 'Följer' : 'Följ'}
    </button>
  )

  return (
    <div>
      <Nav />
      <div style={{ minHeight: '100vh' }}>
        {error ? (
          <div style={{ textAlign: 'center', padding: '120px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
            <h2 style={{ color: 'var(--t)', marginBottom: 8 }}>{error}</h2>
            <p style={{ color: 'var(--ts)' }}>@{username} finns inte på FORMA</p>
          </div>
        ) : !profile ? (
          <div style={{ textAlign: 'center', padding: '120px 20px' }}>
            <span className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : (
          <>
            {/* Cover */}
            <div className="up-cover">
              <div className="up-cover-pattern" />
              <div className="up-cover-fade" />
            </div>

            {/* Profile content */}
            <div className="up-container">
              {/* Top section: avatar + info */}
              <div className="up-header">
                <div className="up-avatar" style={{ background: avatarGradient(profile.username) }}>
                  {initial}
                </div>

                <div className="up-info">
                  <div className="up-name-row">
                    <h1 className="up-username">@{profile.username}</h1>
                    <div className="up-level">
                      <Zap size={14} />
                      <span>{profile.level}</span>
                    </div>
                  </div>

                  {(profile.first_name || profile.last_name) && (
                    <div className="up-fullname">
                      {[profile.first_name, profile.last_name].filter(Boolean).join(' ')}
                    </div>
                  )}

                  {locationParts.length > 0 && (
                    <div className="up-location">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {locationParts.join(' · ')}
                    </div>
                  )}

                  {/* Stats - desktop (inline) */}
                  <div className="up-stats-inline">
                    <span><strong>{profile.posts_count}</strong> inlägg</span>
                    <span className="up-stat-clickable" onClick={() => setModal('followers')}><strong>{profile.followers_count}</strong> följare</span>
                    <span className="up-stat-clickable" onClick={() => setModal('following')}><strong>{profile.following_count}</strong> följer</span>
                  </div>

                  {/* Action button - desktop */}
                  <div className="up-action-desktop">
                    {isOwn ? (
                      <button className="up-btn-edit" onClick={() => nav('/profile')}>Redigera profil</button>
                    ) : followBtn}
                  </div>
                </div>
              </div>

              {/* Stats - mobile (full width) */}
              <div className="up-stats-mobile">
                {[
                  { n: profile.posts_count, l: 'inlägg', click: null },
                  { n: profile.followers_count, l: 'följare', click: () => setModal('followers') },
                  { n: profile.following_count, l: 'följer', click: () => setModal('following') },
                ].map((s, i) => (
                  <div key={i} className={`up-stat-cell${s.click ? ' up-stat-clickable' : ''}`} onClick={s.click}>
                    <div className="up-stat-num">{s.n}</div>
                    <div className="up-stat-label">{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Action button - mobile */}
              <div className="up-action-mobile">
                {isOwn ? (
                  <button className="up-btn-edit" onClick={() => nav('/profile')}>Redigera profil</button>
                ) : followBtn}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="up-bio">{profile.bio}</p>
              )}

              {/* Sports badges */}
              {profile.sports?.length > 0 && (
                <div className="up-sports">
                  {profile.sports.map(s => (
                    <span key={s} className="up-sport-badge">{s}</span>
                  ))}
                </div>
              )}

              {/* XP bar */}
              <div className="up-xp-row">
                <Zap size={14} />
                <span className="up-xp-text">{profile.xp} XP</span>
                {profile.created_at && (
                  <>
                    <span className="up-xp-dot">·</span>
                    <span className="up-xp-text">
                      Medlem sedan {new Date(profile.created_at).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' })}
                    </span>
                  </>
                )}
              </div>

              {/* Posts grid */}
              <div className="up-divider" />
              <div className="up-posts-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                <span>INLÄGG</span>
              </div>

              {profile.posts_count > 0 ? (
                <div className="up-posts-grid">
                  {/* Posts will be rendered here */}
                </div>
              ) : (
                <div className="up-no-posts">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--td)" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="m21 15-5-5L5 21"/>
                  </svg>
                  <p>Inga inlägg ännu</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {modal && <FollowListModal username={username} type={modal} onClose={() => setModal(null)} />}

      <style>{`
        .up-cover {
          height: 180px;
          position: relative;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%);
        }
        .up-cover-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.06;
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0);
          background-size: 32px 32px;
        }
        .up-cover-fade {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: linear-gradient(to top, var(--b), transparent);
        }

        .up-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 0 20px 48px;
        }

        .up-header {
          display: flex;
          gap: 32px;
          align-items: flex-start;
          margin-top: -48px;
        }

        .up-avatar {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 4px solid var(--b);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 56px;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 24px rgba(0,0,0,0.5);
        }

        .up-info {
          flex: 1;
          padding-top: 56px;
          min-width: 0;
        }

        .up-name-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .up-username {
          font-size: 24px;
          font-weight: 800;
          color: var(--t);
          margin: 0;
          letter-spacing: -0.5px;
        }

        .up-level {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 20px;
          background: rgba(255,69,0,0.1);
          border: 1px solid rgba(255,69,0,0.2);
          font-size: 12px;
          font-weight: 600;
          color: var(--a);
        }

        .up-fullname {
          font-size: 15px;
          color: var(--ts);
          margin-top: 4px;
          font-weight: 500;
        }

        .up-location {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--td);
          margin-top: 8px;
        }

        .up-stats-inline {
          display: flex;
          gap: 20px;
          margin-top: 16px;
          font-size: 15px;
          color: var(--ts);
        }
        .up-stats-inline strong {
          color: var(--t);
          font-weight: 700;
        }

        .up-stat-clickable {
          cursor: pointer;
          transition: color 0.2s;
        }
        .up-stat-clickable:hover,
        .up-stat-clickable:hover strong {
          color: var(--a);
        }

        .up-stats-mobile {
          display: none;
        }

        .up-action-desktop {
          margin-top: 16px;
        }
        .up-action-mobile {
          display: none;
        }

        .up-btn-edit {
          padding: 8px 24px;
          border-radius: 8px;
          font-family: var(--f);
          font-size: 14px;
          font-weight: 600;
          background: var(--c);
          border: 1px solid var(--br);
          color: var(--t);
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .up-btn-edit:hover {
          border-color: var(--a);
        }

        .up-btn-follow {
          padding: 8px 32px;
          border-radius: 8px;
          font-family: var(--f);
          font-size: 14px;
          font-weight: 700;
          background: var(--a);
          border: none;
          color: #fff;
          cursor: pointer;
          transition: background 0.2s;
        }
        .up-btn-follow:hover {
          background: var(--ah);
        }
        .up-btn-follow:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .up-btn-following {
          padding: 8px 32px;
          border-radius: 8px;
          font-family: var(--f);
          font-size: 14px;
          font-weight: 600;
          background: var(--c);
          border: 1px solid var(--br);
          color: var(--t);
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .up-btn-following:hover {
          border-color: #ef4444;
          color: #ef4444;
        }
        .up-btn-following:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .up-bio {
          font-size: 15px;
          color: var(--ts);
          line-height: 1.6;
          margin-top: 20px;
          margin-bottom: 0;
        }

        .up-sports {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
        }

        .up-sport-badge {
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          background: rgba(255,69,0,0.08);
          color: var(--a);
          border: 1px solid rgba(255,69,0,0.15);
        }

        .up-xp-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 16px;
          color: var(--td);
          font-size: 13px;
        }
        .up-xp-row svg { color: var(--a); }
        .up-xp-text { color: var(--td); }
        .up-xp-dot { color: var(--td); }

        .up-divider {
          height: 1px;
          background: var(--br);
          margin-top: 32px;
        }

        .up-posts-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 0;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: var(--t);
        }

        .up-posts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
        }

        .up-no-posts {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 64px 20px;
          color: var(--td);
          font-size: 15px;
        }

        /* Follow list modal */
        .flm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .flm-modal {
          background: var(--c);
          border: 1px solid var(--br);
          border-radius: 16px;
          width: 100%;
          max-width: 400px;
          max-height: 70vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .flm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--br);
        }
        .flm-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--t);
        }
        .flm-close {
          background: none;
          border: none;
          color: var(--ts);
          font-size: 18px;
          cursor: pointer;
          padding: 4px 8px;
        }
        .flm-close:hover { color: var(--t); }
        .flm-body {
          overflow-y: auto;
          padding: 8px 0;
        }
        .flm-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .flm-item:hover {
          background: var(--s);
        }
        .flm-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }
        .flm-username {
          font-size: 14px;
          font-weight: 600;
          color: var(--t);
        }
        .flm-city {
          font-size: 12px;
          color: var(--td);
          margin-top: 2px;
        }

        @media (max-width: 600px) {
          .up-cover { height: 120px; }

          .up-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin-top: -52px;
            gap: 0;
          }

          .up-avatar {
            width: 96px;
            height: 96px;
            font-size: 40px;
          }

          .up-info {
            padding-top: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .up-name-row {
            justify-content: center;
          }

          .up-username { font-size: 20px; }

          .up-location { justify-content: center; }

          .up-stats-inline { display: none; }

          .up-stats-mobile {
            display: flex;
            border-top: 1px solid var(--br);
            border-bottom: 1px solid var(--br);
            margin-top: 20px;
          }
          .up-stat-cell {
            flex: 1;
            text-align: center;
            padding: 14px 0;
          }
          .up-stat-num {
            font-size: 18px;
            font-weight: 800;
            color: var(--t);
          }
          .up-stat-label {
            font-size: 12px;
            color: var(--td);
            margin-top: 2px;
          }

          .up-action-desktop { display: none; }
          .up-action-mobile {
            display: flex;
            justify-content: center;
            margin-top: 16px;
          }
          .up-btn-edit, .up-btn-follow, .up-btn-following {
            width: 100%;
          }

          .up-bio { text-align: center; }
          .up-sports { justify-content: center; }
          .up-xp-row { justify-content: center; }
        }
      `}</style>
    </div>
  )
}
