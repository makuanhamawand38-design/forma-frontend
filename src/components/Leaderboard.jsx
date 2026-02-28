import { useState, useEffect } from 'react'
import { api } from '../api'

const LEVEL_COLORS = {
  1: '#888',
  2: '#3b82f6',
  3: '#22c55e',
  4: '#eab308',
  5: '#f97316',
  6: '#ef4444',
}

const RANK_ICONS = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function Leaderboard() {
  const [data, setData] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (show && !data) {
      api.getLeaderboard().then(setData).catch(() => {})
    }
  }, [show])

  return (
    <div style={{
      background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 14,
      padding: 16, marginBottom: 24,
    }}>
      <button onClick={() => setShow(!show)} style={{
        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)',
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🏅</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)' }}>Topplista</span>
        </div>
        <span style={{ color: 'var(--ts)', fontSize: 18, transition: 'transform 0.2s', transform: show ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
      </button>

      {show && (
        <div style={{ marginTop: 16 }}>
          {!data && <div style={{ textAlign: 'center', padding: 20 }}><span className="spinner" style={{ width: 20, height: 20 }} /></div>}

          {data && data.leaderboard.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--td)', fontSize: 13 }}>Inga användare ännu. Bli först!</p>
          )}

          {data && data.leaderboard.map((user) => (
            <div key={user.rank} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              borderRadius: 10, marginBottom: 4,
              background: user.is_you ? 'rgba(255,69,0,0.08)' : 'transparent',
              border: user.is_you ? '1px solid rgba(255,69,0,0.2)' : '1px solid transparent',
            }}>
              {/* Rank */}
              <div style={{ width: 32, textAlign: 'center', fontSize: user.rank <= 3 ? 20 : 14, fontWeight: 800, color: user.rank <= 3 ? 'var(--t)' : 'var(--td)' }}>
                {RANK_ICONS[user.rank] || user.rank}
              </div>

              {/* Level badge */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: LEVEL_COLORS[user.level] || '#888',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0,
              }}>
                {user.level}
              </div>

              {/* Name */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: user.is_you ? 700 : 500, color: user.is_you ? 'var(--a)' : 'var(--t)' }}>
                  {user.name} {user.is_you && <span style={{ fontSize: 11, color: 'var(--ts)' }}>(du)</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--td)' }}>{user.level_name} • {user.achievements_count} 🏆</div>
              </div>

              {/* XP */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: user.rank <= 3 ? 'var(--a)' : 'var(--t)' }}>{user.xp.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--td)' }}>XP</div>
              </div>
            </div>
          ))}

          {/* Show user's rank if not in top 20 */}
          {data && data.my_rank && (
            <>
              <div style={{ textAlign: 'center', color: 'var(--td)', fontSize: 13, padding: '8px 0' }}>• • •</div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                borderRadius: 10, background: 'rgba(255,69,0,0.08)', border: '1px solid rgba(255,69,0,0.2)',
              }}>
                <div style={{ width: 32, textAlign: 'center', fontSize: 14, fontWeight: 800, color: 'var(--td)' }}>
                  {data.my_rank.rank}
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: LEVEL_COLORS[data.my_rank.level] || '#888',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0,
                }}>
                  {data.my_rank.level}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--a)' }}>
                    {data.my_rank.name} <span style={{ fontSize: 11, color: 'var(--ts)' }}>(du)</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--td)' }}>{data.my_rank.level_name} • {data.my_rank.achievements_count} 🏆</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--a)' }}>{data.my_rank.xp.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'var(--td)' }}>XP</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}