import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'
import { Zap, User } from '../components/Icons'

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

export default function FindPartner() {
  const { user, refreshProfile } = useAuth()
  const nav = useNavigate()
  const [tab, setTab] = useState('discover')
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [swipeDir, setSwipeDir] = useState(null)
  const [empty, setEmpty] = useState(false)
  const [contactMsg, setContactMsg] = useState('')
  const [showMsgInput, setShowMsgInput] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Settings tab state
  const [seekingPartner, setSeekingPartner] = useState(user?.seeking_partner || false)
  const [seekingText, setSeekingText] = useState(user?.seeking_partner_text || '')
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setSeekingPartner(user.seeking_partner || false)
      setSeekingText(user.seeking_partner_text || '')
    }
  }, [user])

  const fetchNext = () => {
    setLoading(true)
    setSwipeDir(null)
    setEmpty(false)
    setShowMsgInput(false)
    setContactMsg('')
    api.searchPartners()
      .then(data => {
        if (data.partner) {
          setPartner(data.partner)
          setEmpty(false)
        } else {
          setPartner(null)
          setEmpty(true)
        }
      })
      .catch(() => { setPartner(null); setEmpty(true) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchNext() }, [])

  const animateAndNext = (dir, cb) => {
    setSwipeDir(dir)
    setTimeout(async () => {
      if (cb) await cb()
      fetchNext()
    }, 300)
  }

  const handleSkip = () => {
    if (!partner || actionLoading) return
    setActionLoading('skip')
    animateAndNext('left', async () => {
      try { await api.skipPartner(partner.username) } catch {}
      setActionLoading(null)
    })
  }

  const handleContact = async () => {
    if (!partner || actionLoading) return
    if (!showMsgInput) {
      setShowMsgInput(true)
      return
    }
    setActionLoading('contact')
    try {
      await api.contactPartner(partner.username, contactMsg)
      setSuccessMsg(`Förfrågan skickad till @${partner.username}!`)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch {}
    setActionLoading(null)
    animateAndNext('right', null)
  }

  const saveSettings = async () => {
    setSavingSettings(true)
    setSettingsSaved(false)
    try {
      await api.updateProfile({ seeking_partner: seekingPartner, seeking_partner_text: seekingText || '' })
      if (refreshProfile) await refreshProfile()
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 3000)
    } catch (e) { alert(e.message) }
    setSavingSettings(false)
  }

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 100px', minHeight: '100vh' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, textAlign: 'center' }}>Hitta partner</h1>
        <p style={{ color: 'var(--ts)', fontSize: 14, marginBottom: 20, textAlign: 'center' }}>
          Hitta någon att träna med
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, justifyContent: 'center' }}>
          {[['discover', 'Upptäck'], ['settings', 'Min sökning']].map(([k, v]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--f)', fontSize: 14, fontWeight: tab === k ? 700 : 500,
              background: tab === k ? 'rgba(255,69,0,0.15)' : 'var(--c)',
              color: tab === k ? 'var(--a)' : 'var(--ts)', transition: 'all 0.2s',
            }}>
              {v}
            </button>
          ))}
        </div>

        {/* Success toast */}
        {successMsg && (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12,
            padding: '12px 16px', marginBottom: 16, textAlign: 'center',
            color: '#22c55e', fontWeight: 600, fontSize: 14,
          }}>
            {successMsg}
          </div>
        )}

        {tab === 'settings' && (
          <div style={{
            background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 20,
            padding: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Sök träningspartner</div>
                <div style={{ fontSize: 13, color: 'var(--td)' }}>Slå på för att synas och börja upptäcka</div>
              </div>
              <button
                onClick={() => setSeekingPartner(!seekingPartner)}
                style={{
                  width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: seekingPartner ? 'var(--a)' : 'var(--br)',
                  position: 'relative', transition: 'background .2s', flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, left: seekingPartner ? 27 : 3,
                  width: 22, height: 22, borderRadius: '50%', background: '#fff',
                  transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                }} />
              </button>
            </div>

            {seekingPartner && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: 'var(--ts)', display: 'block', marginBottom: 6 }}>
                  Berätta vad du söker <span style={{ color: 'var(--td)' }}>({seekingText.length}/100)</span>
                </label>
                <textarea
                  value={seekingText}
                  onChange={e => e.target.value.length <= 100 && setSeekingText(e.target.value)}
                  placeholder="T.ex. Söker gympartner i Stockholm, helst morgontider"
                  style={{
                    width: '100%', minHeight: 80, padding: '12px 14px', borderRadius: 12,
                    border: '1px solid var(--br)', background: 'var(--b)', color: 'var(--t)',
                    fontFamily: 'var(--f)', fontSize: 14, resize: 'vertical', outline: 'none',
                  }}
                />
              </div>
            )}

            <button onClick={saveSettings} disabled={savingSettings} style={{
              width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
              background: 'var(--a)', color: '#fff', fontFamily: 'var(--f)',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}>
              {savingSettings ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Spara'}
            </button>

            {settingsSaved && (
              <div style={{ textAlign: 'center', marginTop: 12, color: '#22c55e', fontWeight: 600, fontSize: 14 }}>
                Inställningar sparade!
              </div>
            )}
          </div>
        )}

        {tab === 'discover' && (
          <>
            {!seekingPartner && !user?.seeking_partner ? (
              <div style={{
                textAlign: 'center', padding: '64px 20px',
                background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 20,
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'rgba(255,69,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <User size={36} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Aktivera partnersökning</h3>
                <p style={{ color: 'var(--ts)', fontSize: 14, marginBottom: 20 }}>
                  Slå på sökning under "Min sökning" för att synas och börja upptäcka träningspartners.
                </p>
                <button onClick={() => setTab('settings')} style={{
                  padding: '12px 28px', borderRadius: 999, fontSize: 14, fontWeight: 700,
                  background: 'var(--a)', color: '#fff', border: 'none', cursor: 'pointer',
                }}>
                  Gå till inställningar
                </button>
              </div>
            ) : loading ? (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <span className="spinner" style={{ width: 32, height: 32 }} />
              </div>
            ) : empty || !partner ? (
              <div style={{
                textAlign: 'center', padding: '64px 20px',
                background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 20,
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🏋️</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Inga fler partners att visa just nu</h3>
                <p style={{ color: 'var(--ts)', fontSize: 14, marginBottom: 20 }}>
                  Kom tillbaka senare!
                </p>
                <button onClick={fetchNext} style={{
                  padding: '10px 24px', borderRadius: 999, fontSize: 14, fontWeight: 600,
                  background: 'var(--c)', border: '1px solid var(--br)', color: 'var(--t)',
                  cursor: 'pointer', fontFamily: 'var(--f)',
                }}>
                  Försök igen
                </button>
              </div>
            ) : (
              <>
                {/* Partner card */}
                <div
                  style={{
                    background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 24,
                    overflow: 'hidden', position: 'relative',
                    transition: 'transform 0.3s ease, opacity 0.3s ease',
                    transform: swipeDir === 'left' ? 'translateX(-120%) rotate(-8deg)'
                      : swipeDir === 'right' ? 'translateX(120%) rotate(8deg)'
                      : 'translateX(0)',
                    opacity: swipeDir ? 0 : 1,
                  }}
                >
                  {/* Avatar area */}
                  <div
                    onClick={() => nav(`/user/${partner.username}`)}
                    style={{
                      height: 280, cursor: 'pointer', position: 'relative',
                      background: partner.avatar_url ? `url(${partner.avatar_url}) center/cover` : avatarGradient(partner.username),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {!partner.avatar_url && (
                      <span style={{ fontSize: 96, fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>
                        {partner.username?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
                      background: 'linear-gradient(to top, var(--c), transparent)',
                    }} />
                  </div>

                  {/* Info */}
                  <div style={{ padding: '0 24px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                      <h2
                        onClick={() => nav(`/user/${partner.username}`)}
                        style={{ fontSize: 22, fontWeight: 800, cursor: 'pointer', margin: 0 }}
                      >
                        @{partner.username}
                      </h2>
                      {partner.age && (
                        <span style={{ fontSize: 18, color: 'var(--ts)', fontWeight: 500 }}>{partner.age}</span>
                      )}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 10px', borderRadius: 20,
                        background: 'rgba(255,69,0,0.1)', border: '1px solid rgba(255,69,0,0.2)',
                        fontSize: 12, fontWeight: 600, color: 'var(--a)',
                      }}>
                        <Zap size={12} /> {partner.level}
                      </span>
                    </div>

                    {(partner.city || partner.gym) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--td)', marginBottom: 12 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        {[partner.city, partner.gym].filter(Boolean).join(' · ')}
                      </div>
                    )}

                    {partner.sports?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                        {partner.sports.map(s => (
                          <span key={s} style={{
                            padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                            background: 'rgba(255,69,0,0.08)', color: 'var(--a)',
                            border: '1px solid rgba(255,69,0,0.15)',
                          }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {partner.seeking_partner_text && (
                      <div style={{
                        background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 12,
                        padding: '12px 16px', fontSize: 14, color: 'var(--ts)', lineHeight: 1.5,
                        fontStyle: 'italic',
                      }}>
                        "{partner.seeking_partner_text}"
                      </div>
                    )}

                    {/* Message input (shown after clicking contact) */}
                    {showMsgInput && (
                      <div style={{ marginTop: 16 }}>
                        <input
                          value={contactMsg}
                          onChange={e => setContactMsg(e.target.value.slice(0, 200))}
                          placeholder="Skriv ett meddelande (valfritt)..."
                          style={{
                            width: '100%', padding: '12px 14px', borderRadius: 12,
                            border: '1px solid var(--br)', background: 'var(--b)', color: 'var(--t)',
                            fontFamily: 'var(--f)', fontSize: 14, outline: 'none',
                          }}
                          autoFocus
                          onKeyDown={e => e.key === 'Enter' && handleContact()}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24,
                }}>
                  <button
                    onClick={handleSkip}
                    disabled={!!actionLoading}
                    style={{
                      width: 64, height: 64, borderRadius: '50%', border: '2px solid var(--br)',
                      background: 'var(--c)', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--br)'; e.currentTarget.style.background = 'var(--c)' }}
                  >
                    ❌
                  </button>
                  <button
                    onClick={handleContact}
                    disabled={!!actionLoading}
                    style={{
                      width: 64, height: 64, borderRadius: '50%', border: '2px solid var(--br)',
                      background: 'var(--c)', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.background = 'rgba(34,197,94,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--br)'; e.currentTarget.style.background = 'var(--c)' }}
                  >
                    ✅
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--td)', fontWeight: 600 }}>Hoppa över</span>
                  <span style={{ fontSize: 12, color: 'var(--td)', fontWeight: 600 }}>Kontakta</span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
