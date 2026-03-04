import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'

const STAT_DEFS = [
  { key: 'workouts', icon: '💪', label: 'Träningspass', color: '#ef4444' },
  { key: 'xp_gained', icon: '⚡', label: 'XP tjänad', color: '#6366f1' },
  { key: 'coins_earned', icon: '🪙', label: 'Coins tjänade', color: '#fbbf24' },
  { key: 'login_streak', icon: '🔥', label: 'Dagars streak', color: '#f97316' },
  { key: 'prs_beaten', icon: '🏆', label: 'Nya PR', color: '#22c55e' },
  { key: 'posts_created', icon: '📝', label: 'Inlägg', color: '#3b82f6' },
  { key: 'likes_received', icon: '❤️', label: 'Likes fått', color: '#ec4899' },
  { key: 'goals_completed', icon: '🎯', label: 'Mål avklarade', color: '#8b5cf6' },
  { key: 'checkins', icon: '📍', label: 'Gym check-ins', color: '#14b8a6' },
]

export default function WeeklySummary() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    api.getWeeklySummary()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleShare = useCallback(async () => {
    if (!data || !cardRef.current) return
    setSharing(true)
    try {
      const { default: html2canvas } = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      canvas.toBlob(async (blob) => {
        if (navigator.share && navigator.canShare?.({ files: [new File([blob], 'forma-vecka.png', { type: 'image/png' })] })) {
          await navigator.share({
            files: [new File([blob], 'forma-vecka.png', { type: 'image/png' })],
            title: 'Min vecka på FORMA',
          })
        } else {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'forma-vecka.png'
          a.click()
          URL.revokeObjectURL(url)
        }
        setSharing(false)
      }, 'image/png')
    } catch {
      // Fallback: draw with native canvas
      try {
        const canvas = document.createElement('canvas')
        const w = 1080, h = 1920
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')

        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, 0, h)
        grad.addColorStop(0, '#0a0a0a')
        grad.addColorStop(0.5, '#1a0a00')
        grad.addColorStop(1, '#0a0a0a')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)

        // Top accent
        const accent = ctx.createRadialGradient(w / 2, 200, 0, w / 2, 200, 500)
        accent.addColorStop(0, 'rgba(255,69,0,0.15)')
        accent.addColorStop(1, 'transparent')
        ctx.fillStyle = accent
        ctx.fillRect(0, 0, w, 600)

        // FORMA logo text
        ctx.fillStyle = '#ff4500'
        ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('FORMA', w / 2, 180)

        // Period
        ctx.fillStyle = '#888'
        ctx.font = '36px -apple-system, BlinkMacSystemFont, sans-serif'
        ctx.fillText('Min vecka', w / 2, 260)
        ctx.font = '28px -apple-system, BlinkMacSystemFont, sans-serif'
        ctx.fillText(data.period, w / 2, 310)

        // Username
        ctx.fillStyle = '#ff4500'
        ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, sans-serif'
        ctx.fillText(`@${data.username}`, w / 2, 400)

        // Stats grid
        const active = STAT_DEFS.filter(s => (data[s.key] || 0) > 0)
        const startY = 500
        const cardW = 480, cardH = 140, gap = 24, margin = (w - cardW * 2 - gap) / 2

        active.forEach((stat, i) => {
          const col = i % 2
          const row = Math.floor(i / 2)
          const x = margin + col * (cardW + gap)
          const y = startY + row * (cardH + gap)

          // Card bg
          ctx.fillStyle = 'rgba(255,255,255,0.04)'
          ctx.beginPath()
          ctx.roundRect(x, y, cardW, cardH, 20)
          ctx.fill()

          // Border
          ctx.strokeStyle = 'rgba(255,255,255,0.08)'
          ctx.lineWidth = 1
          ctx.stroke()

          // Icon
          ctx.font = '44px -apple-system'
          ctx.textAlign = 'left'
          ctx.fillStyle = '#fff'
          ctx.fillText(stat.icon, x + 24, y + 72)

          // Value
          ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif'
          ctx.fillStyle = stat.color
          ctx.fillText(String(data[stat.key] || 0), x + 90, y + 72)

          // Label
          ctx.font = '26px -apple-system, BlinkMacSystemFont, sans-serif'
          ctx.fillStyle = '#888'
          ctx.fillText(stat.label, x + 90, y + 110)
        })

        // Leaderboard
        if (data.leaderboard_rank) {
          const lbY = startY + Math.ceil(active.length / 2) * (cardH + gap) + 40
          ctx.textAlign = 'center'
          ctx.fillStyle = '#ff4500'
          ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, sans-serif'
          const scope = data.leaderboard_scope ? ` i ${data.leaderboard_scope}` : ''
          ctx.fillText(`Topp ${data.leaderboard_rank}${scope}`, w / 2, lbY)
        }

        // Footer
        ctx.fillStyle = '#444'
        ctx.font = '24px -apple-system, BlinkMacSystemFont, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('forma.se', w / 2, h - 80)

        canvas.toBlob(async (blob) => {
          if (navigator.share && navigator.canShare?.({ files: [new File([blob], 'forma-vecka.png', { type: 'image/png' })] })) {
            await navigator.share({
              files: [new File([blob], 'forma-vecka.png', { type: 'image/png' })],
              title: 'Min vecka på FORMA',
            })
          } else {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'forma-vecka.png'
            a.click()
            URL.revokeObjectURL(url)
          }
        }, 'image/png')
      } catch {
        alert('Kunde inte skapa bild')
      }
      setSharing(false)
    }
  }, [data])

  if (loading) {
    return (
      <div>
        <Nav />
        <div className="dash-main" style={{ textAlign: 'center', padding: 64 }}>
          <span className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div>
        <Nav />
        <div className="dash-main" style={{ textAlign: 'center', padding: 64, color: 'var(--td)' }}>
          Kunde inte ladda veckans sammanfattning.
        </div>
      </div>
    )
  }

  const activeStats = STAT_DEFS.filter(s => (data[s.key] || 0) > 0)
  const headline = _buildHeadline(data)

  return (
    <div>
      <Nav />
      <div className="dash-main" style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Shareable card */}
        <div ref={cardRef} style={{
          background: 'linear-gradient(180deg, #0f0f0f 0%, #1a0a00 50%, #0f0f0f 100%)',
          borderRadius: 24, padding: '36px 28px 28px', position: 'relative', overflow: 'hidden',
          border: '1px solid rgba(255,69,0,0.15)',
        }}>
          {/* Accent glow */}
          <div style={{
            position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,69,0,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#ff4500', letterSpacing: 2, marginBottom: 4 }}>
              FORMA
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              Min vecka
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>
              {data.period} · @{data.username}
            </div>
          </div>

          {/* Headline */}
          {headline && (
            <div style={{
              textAlign: 'center', fontSize: 15, fontWeight: 600, color: '#ccc',
              marginBottom: 24, lineHeight: 1.5, padding: '0 8px',
            }}>
              {headline}
            </div>
          )}

          {/* Stats grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 10, marginBottom: 20,
          }}>
            {activeStats.map(stat => (
              <div key={stat.key} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: '18px 16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>
                  {data[stat.key]}
                </div>
                <div style={{ fontSize: 12, color: '#777', fontWeight: 600, marginTop: 2 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Leaderboard position */}
          {data.leaderboard_rank && (
            <div style={{
              textAlign: 'center', padding: '14px 20px', borderRadius: 14,
              background: 'rgba(255,69,0,0.08)', border: '1px solid rgba(255,69,0,0.2)',
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#ff4500' }}>
                Topp {data.leaderboard_rank}
                {data.leaderboard_scope && ` i ${data.leaderboard_scope}`}
              </span>
              <span style={{ fontSize: 13, color: '#888', marginLeft: 8 }}>denna vecka</span>
            </div>
          )}

          {/* FORMA branding footer */}
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <div style={{ fontSize: 11, color: '#444', letterSpacing: 1 }}>forma.se</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20, marginBottom: 32 }}>
          <button onClick={handleShare} disabled={sharing} style={{
            flex: 1, padding: '16px 24px', borderRadius: 14, border: 'none',
            background: 'var(--a)', color: '#fff', fontSize: 16, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'var(--f)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            {sharing ? (
              <span className="spinner" style={{ width: 20, height: 20 }} />
            ) : (
              <>
                <span style={{ fontSize: 20 }}>📤</span>
                Dela min vecka
              </>
            )}
          </button>
          <button onClick={() => nav('/dashboard')} style={{
            padding: '16px 20px', borderRadius: 14, border: '1px solid var(--br)',
            background: 'var(--c)', color: 'var(--ts)', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--f)',
          }}>
            Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

function _buildHeadline(data) {
  const parts = []
  if (data.workouts > 0) parts.push(`${data.workouts} pass`)
  if (data.xp_gained > 0) parts.push(`${data.xp_gained} XP`)
  if (data.login_streak > 0) parts.push(`${data.login_streak} dagars streak`)
  if (data.prs_beaten > 0) parts.push(`${data.prs_beaten} nya PR`)
  if (data.goals_completed > 0) parts.push(`${data.goals_completed} mål avklarade`)

  if (parts.length === 0) return null

  let text = parts.join(', ')
  if (data.leaderboard_rank && data.leaderboard_scope) {
    text += ` — Topp ${data.leaderboard_rank} i ${data.leaderboard_scope}`
  }
  return text
}

// Compact card for embedding on Dashboard
export function WeeklySummaryCard() {
  const [data, setData] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    api.getWeeklySummary().then(setData).catch(() => {})
  }, [])

  if (!data) return null

  // Only show on Sunday (0) or Monday (1)
  const today = new Date().getDay()
  if (today !== 0 && today !== 1) return null

  const highlights = []
  if (data.workouts > 0) highlights.push(`${data.workouts} pass`)
  if (data.xp_gained > 0) highlights.push(`${data.xp_gained} XP`)
  if (data.login_streak > 0) highlights.push(`🔥${data.login_streak} dagars streak`)
  if (data.prs_beaten > 0) highlights.push(`${data.prs_beaten} nya PR`)
  if (data.leaderboard_rank && data.leaderboard_scope) {
    highlights.push(`Topp ${data.leaderboard_rank} i ${data.leaderboard_scope}`)
  }

  if (highlights.length === 0) return null

  return (
    <div onClick={() => nav('/weekly-summary')} style={{
      background: 'linear-gradient(135deg, rgba(255,69,0,0.08), rgba(99,102,241,0.08))',
      border: '1px solid rgba(255,69,0,0.2)', borderRadius: 16,
      padding: '18px 20px', cursor: 'pointer', marginBottom: 24,
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--a)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,69,0,0.2)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>📊</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t)' }}>Din vecka</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--a)', fontWeight: 600 }}>Visa →</span>
      </div>
      <div style={{ fontSize: 14, color: 'var(--ts)', lineHeight: 1.6 }}>
        {highlights.join(' · ')}
      </div>
    </div>
  )
}
