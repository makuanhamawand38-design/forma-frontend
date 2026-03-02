import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'
import { Zap } from '../components/Icons'

export default function UserProfile() {
  const { username } = useParams()
  const { user } = useAuth()
  const nav = useNavigate()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)

  const isOwn = user?.username === username

  useEffect(() => {
    setProfile(null)
    setError(null)
    api.getPublicProfile(username)
      .then(setProfile)
      .catch(() => setError('Användaren hittades inte'))
  }, [username])

  const initial = profile?.username?.[0]?.toUpperCase() || '?'

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
            <div style={{
              height: 200, position: 'relative',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)',
            }}>
              <div style={{
                position: 'absolute', inset: 0, opacity: 0.06,
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
                background: 'linear-gradient(to top, var(--bg), transparent)',
              }} />
            </div>

            {/* Profile header */}
            <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 20px' }}>
              <div style={{ marginTop: -60, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Avatar */}
                <div style={{
                  width: 120, height: 120, borderRadius: '50%', border: '4px solid var(--bg)',
                  background: 'linear-gradient(135deg, #ff4500, #ff6b35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 48, fontWeight: 800, color: '#fff', flexShrink: 0,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}>
                  {initial}
                </div>

                {/* Name + username */}
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  {(profile.first_name || profile.last_name) && (
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--t)', margin: '0 0 4px' }}>
                      {[profile.first_name, profile.last_name].filter(Boolean).join(' ')}
                    </h1>
                  )}
                  <div style={{ fontSize: 16, color: 'var(--a)', fontWeight: 600 }}>@{profile.username}</div>
                </div>

                {/* Level badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12,
                  background: 'rgba(255,69,0,0.08)', border: '1px solid rgba(255,69,0,0.2)',
                  borderRadius: 20, padding: '4px 14px',
                }}>
                  <Zap size={14} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--a)' }}>{profile.level}</span>
                  <span style={{ fontSize: 11, color: 'var(--td)' }}>{profile.xp} XP</span>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p style={{
                    fontSize: 15, color: 'var(--ts)', lineHeight: 1.6, textAlign: 'center',
                    marginTop: 16, marginBottom: 0, maxWidth: 450,
                  }}>
                    {profile.bio}
                  </p>
                )}

                {/* City + Gym */}
                {(profile.city || profile.gym) && (
                  <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {profile.city && (
                      <span style={{ fontSize: 13, color: 'var(--td)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        {profile.city}
                      </span>
                    )}
                    {profile.gym && (
                      <span style={{ fontSize: 13, color: 'var(--td)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
                        {profile.gym}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats row */}
                <div style={{
                  display: 'flex', gap: 0, marginTop: 24, borderTop: '1px solid var(--br)',
                  borderBottom: '1px solid var(--br)', width: '100%', maxWidth: 400,
                }}>
                  {[
                    { n: profile.posts_count, l: 'inlägg' },
                    { n: profile.followers_count, l: 'följare' },
                    { n: profile.following_count, l: 'följer' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      flex: 1, textAlign: 'center', padding: '16px 0',
                      borderRight: i < 2 ? '1px solid var(--br)' : 'none',
                    }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t)' }}>{s.n}</div>
                      <div style={{ fontSize: 12, color: 'var(--td)', marginTop: 2 }}>{s.l}</div>
                    </div>
                  ))}
                </div>

                {/* Sports badges */}
                {profile.sports?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 20 }}>
                    {profile.sports.map(s => (
                      <span key={s} style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                        background: 'rgba(255,69,0,0.08)', color: 'var(--a)',
                        border: '1px solid rgba(255,69,0,0.15)',
                      }}>{s}</span>
                    ))}
                  </div>
                )}

                {/* Edit button (own profile) */}
                {isOwn && (
                  <button onClick={() => nav('/profile')} style={{
                    marginTop: 24, padding: '10px 28px', borderRadius: 10,
                    cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 14, fontWeight: 600,
                    background: 'var(--b)', border: '1px solid var(--br)', color: 'var(--t)',
                    transition: 'border-color 0.2s',
                  }}>
                    Redigera profil
                  </button>
                )}

                {/* Member since */}
                {profile.created_at && (
                  <div style={{ marginTop: 24, marginBottom: 48, fontSize: 12, color: 'var(--td)' }}>
                    Medlem sedan {new Date(profile.created_at).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
