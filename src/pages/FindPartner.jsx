import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'
import Paywall from '../components/Paywall'
import { Zap, Mail, User } from '../components/Icons'

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

const LEVEL_COLORS = {
  1: '#888', 2: '#3b82f6', 3: '#22c55e', 4: '#eab308', 5: '#f97316', 6: '#ef4444',
}

const SPORTS = [
  'Styrketräning', 'Löpning', 'Crossfit', 'Yoga', 'Simning',
  'Cykling', 'Kampsport', 'Fotboll', 'Tennis', 'Padel', 'Klättring',
]

export default function FindPartner() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [partners, setPartners] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sport, setSport] = useState('')
  const [city, setCity] = useState('')
  const [gym, setGym] = useState('')
  const [showPaywall, setShowPaywall] = useState(false)
  const [followedSet, setFollowedSet] = useState(new Set())
  const [followLoading, setFollowLoading] = useState(null)

  const isPremium = user && user.subscription_type && user.subscription_type !== 'free'

  useEffect(() => {
    if (!isPremium) {
      setLoading(false)
      return
    }
    search()
  }, [isPremium])

  const search = (offset = 0) => {
    setLoading(true)
    const params = { limit: 20, offset }
    if (sport) params.sport = sport
    if (city) params.city = city
    if (gym) params.gym = gym
    api.searchPartners(params)
      .then(data => {
        if (offset === 0) {
          setPartners(data.partners || [])
        } else {
          setPartners(prev => [...prev, ...(data.partners || [])])
        }
        setTotal(data.total || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const handleSearch = () => {
    search(0)
  }

  const handleFollow = async (username) => {
    setFollowLoading(username)
    try {
      await api.followUser(username)
      setFollowedSet(prev => new Set([...prev, username]))
    } catch (e) {}
    setFollowLoading(null)
  }

  const selectStyle = {
    padding: '10px 14px', borderRadius: 10, border: '1px solid var(--br)',
    background: 'var(--c)', color: 'var(--t)', fontFamily: 'var(--f)', fontSize: 14,
    outline: 'none', flex: 1, minWidth: 0,
  }

  if (!isPremium) {
    return (
      <div>
        <Nav />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
              background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#8b5cf6',
            }}>
              <User size={36} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Hitta träningspartner</h2>
            <p style={{ color: 'var(--ts)', fontSize: 15, marginBottom: 24 }}>
              Uppgradera till Premium för att hitta träningspartners nära dig.
            </p>
            <button
              onClick={() => setShowPaywall(true)}
              style={{
                padding: '12px 32px', borderRadius: 999, fontSize: 15, fontWeight: 700,
                background: '#8b5cf6', color: '#fff', border: 'none', cursor: 'pointer',
              }}
            >
              Uppgradera till Premium
            </button>
          </div>
        </div>
        {showPaywall && <Paywall requiredLevel="premium" onClose={() => setShowPaywall(false)} />}
      </div>
    )
  }

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px 16px 80px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Hitta träningspartner</h1>
        <p style={{ color: 'var(--ts)', fontSize: 14, marginBottom: 20 }}>
          Hitta någon att träna med baserat på sport, stad och gym.
        </p>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <select value={sport} onChange={e => setSport(e.target.value)} style={selectStyle}>
            <option value="">Alla sporter</option>
            {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            type="text"
            placeholder="Stad..."
            value={city}
            onChange={e => setCity(e.target.value)}
            style={selectStyle}
          />
          <input
            type="text"
            placeholder="Gym..."
            value={gym}
            onChange={e => setGym(e.target.value)}
            style={selectStyle}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: 'var(--a)', color: '#fff', fontFamily: 'var(--f)',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
            }}
          >
            Sök
          </button>
        </div>

        {/* Results */}
        {loading && partners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <span className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : partners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--td)' }}>
            <User size={48} />
            <p style={{ fontSize: 15, marginTop: 12 }}>Inga träningspartners hittade med dessa filter</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Testa att ändra eller ta bort filter</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {partners.map(p => {
                const isFollowed = followedSet.has(p.username)
                return (
                  <div
                    key={p.username}
                    style={{
                      background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 16,
                      padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start',
                    }}
                  >
                    {/* Avatar */}
                    <div
                      onClick={() => nav(`/user/${p.username}`)}
                      style={{
                        width: 52, height: 52, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                        background: avatarGradient(p.username),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 700, color: '#fff',
                      }}
                    >
                      {p.username?.[0]?.toUpperCase() || '?'}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span
                          onClick={() => nav(`/user/${p.username}`)}
                          style={{ fontSize: 15, fontWeight: 600, color: 'var(--t)', cursor: 'pointer' }}
                        >
                          @{p.username}
                        </span>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: (LEVEL_COLORS[p.level] || '#888') + '20',
                          color: LEVEL_COLORS[p.level] || '#888',
                        }}>
                          <Zap size={10} /> {p.level}
                        </span>
                      </div>

                      {(p.city || p.gym) && (
                        <div style={{ fontSize: 13, color: 'var(--td)', marginTop: 4 }}>
                          {[p.city, p.gym].filter(Boolean).join(' · ')}
                        </div>
                      )}

                      {p.sports?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                          {p.sports.map(s => (
                            <span key={s} style={{
                              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                              background: 'rgba(255,69,0,0.08)', color: 'var(--a)',
                              border: '1px solid rgba(255,69,0,0.15)',
                            }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        {isFollowed ? (
                          <span style={{
                            padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                            background: 'var(--b)', border: '1px solid var(--br)', color: 'var(--ts)',
                          }}>
                            Följer
                          </span>
                        ) : (
                          <button
                            onClick={() => handleFollow(p.username)}
                            disabled={followLoading === p.username}
                            style={{
                              padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                              background: 'var(--a)', color: '#fff', border: 'none', cursor: 'pointer',
                              fontFamily: 'var(--f)',
                            }}
                          >
                            {followLoading === p.username ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Följ'}
                          </button>
                        )}
                        <button
                          onClick={() => nav(`/messages?to=${p.username}`)}
                          style={{
                            padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                            background: 'var(--b)', border: '1px solid var(--br)', color: 'var(--t)',
                            cursor: 'pointer', fontFamily: 'var(--f)',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          <Mail size={13} /> Meddelande
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {partners.length < total && (
              <button
                onClick={() => search(partners.length)}
                disabled={loading}
                style={{
                  display: 'block', width: '100%', padding: 14, marginTop: 16,
                  background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 12,
                  color: 'var(--ts)', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--f)',
                }}
              >
                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Visa fler'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
