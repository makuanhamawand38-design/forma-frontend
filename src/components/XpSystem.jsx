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

export function XpBar() {
  const [xpData, setXpData] = useState(null)
  const [showAchievements, setShowAchievements] = useState(false)

  useEffect(() => {
    api.getXp().then(setXpData).catch(() => {})
  }, [])

  if (!xpData) return null

  const { xp, level, level_name, next_level, achievements, all_achievements } = xpData
  const color = LEVEL_COLORS[level] || '#ff4500'
  const progress = next_level ? ((xp - (next_level.min_xp - (next_level.min_xp - (xpData.all_levels[level - 1]?.min_xp || 0)))) / (next_level.min_xp - (xpData.all_levels[level - 1]?.min_xp || 0))) * 100 : 100

  const currentLevelXp = xpData.all_levels[level - 1]?.min_xp || 0
  const nextLevelXp = next_level?.min_xp || xp
  const progressPct = next_level ? Math.min(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100, 100) : 100

  return (
    <>
      <div style={{
        background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 14, padding: 16, marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: color, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff',
            }}>
              {level}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--t)' }}>{level_name}</div>
              <div style={{ fontSize: 12, color: 'var(--ts)' }}>{xp} XP</div>
            </div>
          </div>
          <button onClick={() => setShowAchievements(!showAchievements)} style={{
            background: 'rgba(255,69,0,0.1)', border: '1px solid rgba(255,69,0,0.2)', borderRadius: 8,
            padding: '6px 12px', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12, color: 'var(--a)', fontWeight: 600,
          }}>
            🏆 {achievements?.length || 0} Achievements
          </button>
        </div>

        {/* XP Progress bar */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
          <div style={{
            width: `${progressPct}%`, height: '100%', borderRadius: 8,
            background: `linear-gradient(90deg, ${color}, #ff4500)`,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--td)' }}>
          <span>Level {level}</span>
          {next_level ? <span>{nextLevelXp - xp} XP till Level {next_level.level} ({next_level.name})</span> : <span>Max level!</span>}
        </div>
      </div>

      {/* Achievements panel */}
      {showAchievements && (
        <div style={{
          background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 14, padding: 16, marginBottom: 24,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)', marginBottom: 12 }}>🏆 Achievements</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {Object.entries(all_achievements || {}).map(([id, ach]) => {
              const unlocked = achievements?.includes(id)
              return (
                <div key={id} style={{
                  background: unlocked ? 'rgba(255,69,0,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${unlocked ? 'rgba(255,69,0,0.2)' : 'var(--br)'}`,
                  borderRadius: 10, padding: 12, textAlign: 'center',
                  opacity: unlocked ? 1 : 0.4,
                }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{ach.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: unlocked ? 'var(--a)' : 'var(--td)', marginBottom: 2 }}>{ach.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--td)' }}>{ach.desc}</div>
                  {unlocked && <div style={{ fontSize: 10, color: '#22c55e', marginTop: 4 }}>✓ Upplåst</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

export function XpToast({ data, onClose }) {
  if (!data) return null

  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [data])

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end',
    }}>
      {/* XP gained */}
      <div style={{
        background: '#1a1a2e', border: '1px solid rgba(255,69,0,0.3)', borderRadius: 12,
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
        animation: 'slideIn 0.3s ease',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <span style={{ fontSize: 18 }}>⚡</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#ff4500' }}>+{data.xp_gained} XP</span>
      </div>

      {/* Level up */}
      {data.leveled_up && (
        <div style={{
          background: 'linear-gradient(135deg, #ff4500, #ff6b35)', borderRadius: 12,
          padding: '12px 20px', color: '#fff', textAlign: 'center',
          animation: 'slideIn 0.3s ease 0.2s both',
          boxShadow: '0 4px 20px rgba(255,69,0,0.4)',
        }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>🎉</div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Level Up!</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Level {data.level} — {data.level_name}</div>
        </div>
      )}

      {/* New achievements */}
      {data.new_achievements?.map((ach, i) => (
        <div key={i} style={{
          background: '#1a1a2e', border: '1px solid rgba(255,69,0,0.3)', borderRadius: 12,
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
          animation: `slideIn 0.3s ease ${0.3 + i * 0.15}s both`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          <span style={{ fontSize: 24 }}>{ach.icon}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ff4500' }}>{ach.name}</div>
            <div style={{ fontSize: 11, color: '#888' }}>{ach.desc}</div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}