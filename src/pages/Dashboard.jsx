import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'
import { productIcon, catBg, Sparkle, Play, CheckCircle, Zap } from '../components/Icons'
import { XpBar } from '../components/XpSystem'
import Leaderboard from '../components/Leaderboard'

const NAMES = { training: "4 Veckors Träningsprogram", nutrition: "4 Veckors Kostschema", bundle: "8 Veckors Träning + Kost" }

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

export default function Dashboard() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [programs, setPrograms] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(null)
  const [suggested, setSuggested] = useState([])
  const [feedPosts, setFeedPosts] = useState([])
  const [coins, setCoins] = useState(null)
  const [streaks, setStreaks] = useState([])
  const [checkinData, setCheckinData] = useState(null)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [gymLeaderboard, setGymLeaderboard] = useState(null)

  useEffect(() => {
    Promise.all([
      api.getPrograms().catch(() => []),
      api.getProfile().catch(() => null),
      api.getSuggestedUsers().catch(() => []),
      api.getFeed(3, 0).catch(() => ({ posts: [] })),
      api.getCoins(1, 0).catch(() => ({ balance: 0 })),
      api.getStreaks().catch(() => ({ streaks: [] })),
      api.getMyCheckins().catch(() => null),
    ]).then(([p, prof, sug, feed, coinData, streakData, checkins]) => {
      setPrograms(p)
      setProfile(prof)
      setSuggested(sug)
      setFeedPosts(Array.isArray(feed) ? feed.slice(0, 3) : (feed.posts || []).slice(0, 3))
      setCoins(coinData?.balance ?? coinData?.coins ?? 0)
      setStreaks(streakData?.streaks || [])
      if (checkins) setCheckinData(checkins)
      // Load gym leaderboard if user has a gym
      if (prof?.gym) {
        api.getGymLeaderboard(prof.gym).then(setGymLeaderboard).catch(() => {})
      }
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

  const handleCheckin = async () => {
    setCheckinLoading(true)
    try {
      const res = await api.checkin(profile?.gym || '')
      setCheckinData({ active: { gym_name: res.gym_name, expires_at: res.expires_at, active_count: res.active_count }, history: checkinData?.history || [], total_checkins: (checkinData?.total_checkins || 0) + 1 })
      // Refresh coins/XP
      api.getCoins(1, 0).then(d => setCoins(d?.balance ?? d?.coins ?? 0)).catch(() => {})
      api.getProfile().then(setProfile).catch(() => {})
      if (profile?.gym) api.getGymLeaderboard(profile.gym).then(setGymLeaderboard).catch(() => {})
    } catch (err) {
      alert(err.message)
    }
    setCheckinLoading(false)
  }

  const greeting = profile?.username ? `@${profile.username}` : profile?.first_name || ''
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
            <h1 className="dash-title" style={{ margin: 0 }}>Min träning</h1>
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

        {/* Quick links */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 24 }}>
            {[
              { label: 'Flöde', icon: '📰', path: '/feed' },
              { label: 'Logga pass', icon: '💪', path: '/log' },
              { label: 'Tävlingar', icon: '🏆', path: '/competitions' },
              { label: 'Badges', icon: '🏅', path: '/badges' },
              { label: 'Butik', icon: '🛍️', path: '/shop' },
            ].map(link => (
              <button key={link.label} onClick={() => nav(link.path)} style={{
                background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 12,
                padding: '14px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: 8, fontFamily: 'var(--f)', fontSize: 14, fontWeight: 600, color: 'var(--t)',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--a)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--br)'}
              >
                <span style={{ fontSize: 18 }}>{link.icon}</span>
                {link.label}
              </button>
            ))}
          </div>
        )}

        {/* Coins, Streak, Level stats row */}
        {!loading && profile && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 24 }}>
            <div style={{ background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.2)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fbbf24' }}>{coins ?? 0}</div>
              <div style={{ fontSize: 11, color: 'var(--ts)', fontWeight: 600 }}>Coins</div>
            </div>
            <div style={{ background: 'rgba(255,69,0,0.08)', border: '1px solid rgba(255,69,0,0.2)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--a)' }}>{profile.login_streak || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--ts)', fontWeight: 600 }}>Streak</div>
            </div>
            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#6366f1' }}>{profile.level || 1}</div>
              <div style={{ fontSize: 11, color: 'var(--ts)', fontWeight: 600 }}>Level</div>
            </div>
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e' }}>{profile.xp || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--ts)', fontWeight: 600 }}>XP</div>
            </div>
          </div>
        )}

        {/* XP System */}
        {!loading && <XpBar />}

        {/* Gym Check-in */}
        {!loading && profile && (
          <div style={{ marginBottom: 24 }}>
            {checkinData?.active ? (
              <div style={{
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: 16, padding: 20, textAlign: 'center',
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📍</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>
                  Du tränar på {checkinData.active.gym_name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ts)', marginBottom: 8 }}>
                  {checkinData.active.active_count} FORMA-{checkinData.active.active_count === 1 ? 'medlem' : 'medlemmar'} tränar här just nu
                </div>
                <div style={{ fontSize: 12, color: 'var(--td)' }}>
                  Aktiv till {new Date(checkinData.active.expires_at).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ) : (
              <button onClick={handleCheckin} disabled={checkinLoading} style={{
                width: '100%', padding: '20px 24px', borderRadius: 16, border: '2px dashed rgba(255,69,0,0.3)',
                background: 'rgba(255,69,0,0.05)', cursor: 'pointer', fontFamily: 'var(--f)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--a)'; e.currentTarget.style.background = 'rgba(255,69,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,69,0,0.3)'; e.currentTarget.style.background = 'rgba(255,69,0,0.05)' }}
              >
                {checkinLoading ? (
                  <span className="spinner" style={{ width: 24, height: 24 }} />
                ) : (
                  <>
                    <span style={{ fontSize: 28 }}>📍</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--a)' }}>
                        Checka in på gym
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ts)' }}>
                        {profile.gym ? profile.gym : 'Ange gym i din profil'} · +5 coins +10 XP
                      </div>
                    </div>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Gym Leaderboard */}
        {!loading && gymLeaderboard && gymLeaderboard.leaderboard?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ts)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🏋️</span> Veckans topp — {gymLeaderboard.gym_name}
            </h2>
            <div style={{ background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 14, overflow: 'hidden' }}>
              {gymLeaderboard.leaderboard.map((u, i) => (
                <div key={i} onClick={() => u.username && nav(`/user/${u.username}`)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  borderBottom: i < gymLeaderboard.leaderboard.length - 1 ? '1px solid var(--br)' : 'none',
                  cursor: u.username ? 'pointer' : 'default',
                  background: u.is_you ? 'rgba(255,69,0,0.06)' : 'transparent',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => { if (u.username) e.currentTarget.style.background = u.is_you ? 'rgba(255,69,0,0.1)' : 'var(--s)' }}
                  onMouseLeave={e => e.currentTarget.style.background = u.is_you ? 'rgba(255,69,0,0.06)' : 'transparent'}
                >
                  <div style={{
                    width: 28, textAlign: 'center', fontSize: u.rank <= 3 ? 18 : 14,
                    fontWeight: 800, color: u.rank <= 3 ? 'var(--t)' : 'var(--td)',
                  }}>
                    {u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : u.rank}
                  </div>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: avatarGradient(u.username || ''),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#fff',
                  }}>
                    {u.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: u.is_you ? 700 : 500, color: u.is_you ? 'var(--a)' : 'var(--t)' }}>
                      @{u.username} {u.is_you && <span style={{ fontSize: 11, color: 'var(--ts)' }}>(du)</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: u.rank <= 3 ? 'var(--a)' : 'var(--t)' }}>
                    {u.xp_gained} <span style={{ fontSize: 11, color: 'var(--td)', fontWeight: 500 }}>XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Streaks */}
        {!loading && streaks.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ts)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🔥</span> Träningsstreaks
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {streaks.map(s => (
                <div key={s.id} onClick={() => nav(`/user/${s.partner.username}`)} style={{
                  background: s.at_risk ? 'rgba(245,158,11,0.08)' : 'rgba(255,69,0,0.06)',
                  border: s.at_risk ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,69,0,0.15)',
                  borderRadius: 12, padding: '12px 16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--a)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = s.at_risk ? 'rgba(245,158,11,0.3)' : 'rgba(255,69,0,0.15)'}
                >
                  <div style={{ fontSize: 28, lineHeight: 1 }}>🔥</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--a)' }}>{s.current_streak}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)' }}>dagar med @{s.partner.username}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--td)', marginTop: 2 }}>
                      {s.i_trained_today && s.partner_trained_today ? 'Båda har tränat idag!' :
                       s.i_trained_today ? 'Du har tränat — väntar på partnern' :
                       s.partner_trained_today ? 'Partnern har tränat — din tur!' : 'Ingen har tränat idag'}
                    </div>
                  </div>
                  {s.at_risk && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.15)',
                      padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap',
                    }}>
                      Risk!
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feed preview */}
        {!loading && feedPosts.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ts)', margin: 0 }}>Senaste i flödet</h2>
              <button onClick={() => nav('/feed')} style={{
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)',
                fontSize: 13, fontWeight: 600, color: 'var(--a)',
              }}>
                Visa allt →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {feedPosts.map(post => (
                <div key={post.id} onClick={() => nav(`/post/${post.id}`)} style={{
                  background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 12,
                  padding: '12px 16px', cursor: 'pointer', transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--a)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--br)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', background: avatarGradient(post.username),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#fff',
                    }}>
                      {post.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)' }}>@{post.username}</span>
                    {post.sport_tag && <span style={{ fontSize: 11, color: 'var(--a)', background: 'rgba(255,69,0,0.1)', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{post.sport_tag}</span>}
                    <span style={{ fontSize: 11, color: 'var(--td)', marginLeft: 'auto' }}>
                      {new Date(post.created_at).toLocaleDateString('sv-SE')}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ts)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {!loading && <Leaderboard />}

        {/* Suggested users */}
        {!loading && suggested.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ts)', marginBottom: 16 }}>Föreslagna att följa</h2>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {suggested.map(u => (
                <div key={u.username} onClick={() => nav(`/user/${u.username}`)} style={{
                  minWidth: 160, background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 12,
                  padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 8, transition: 'border-color 0.2s', flexShrink: 0,
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--a)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--br)'}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', background: avatarGradient(u.username),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 700, color: '#fff',
                  }}>
                    {u.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)', textAlign: 'center' }}>@{u.username}</div>
                  {u.city && <div style={{ fontSize: 11, color: 'var(--td)' }}>{u.city}</div>}
                  {u.sports?.length > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--a)', textAlign: 'center' }}>
                      {u.sports.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Programs section */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--ts)' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : programs.length === 0 ? null : (
          <>
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
