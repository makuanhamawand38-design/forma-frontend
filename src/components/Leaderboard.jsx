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

const PERIODS = [
  { key: 'week', label: 'Vecka' },
  { key: 'month', label: 'Månad' },
  { key: 'alltime', label: 'Alla tider' },
]

const SCOPES = [
  { key: 'all', label: 'Sverige' },
  { key: 'city', label: 'Min stad' },
  { key: 'gym', label: 'Mitt gym' },
]

export default function Leaderboard() {
  const [data, setData] = useState(null)
  const [show, setShow] = useState(false)
  const [period, setPeriod] = useState('alltime')
  const [scope, setScope] = useState('all')
  const [loading, setLoading] = useState(false)

  const fetchData = (p, s) => {
    setLoading(true)
    api.getLeaderboard(p, s).then(setData).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => {
    if (show) fetchData(period, scope)
  }, [show, period, scope])

  const handlePeriod = (p) => { setPeriod(p); setData(null) }
  const handleScope = (s) => { setScope(s); setData(null) }

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
          {/* Period tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => handlePeriod(p.key)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--f)', fontSize: 13, fontWeight: period === p.key ? 700 : 500,
                  background: period === p.key ? 'rgba(255,69,0,0.15)' : 'rgba(255,255,255,0.03)',
                  color: period === p.key ? 'var(--a)' : 'var(--ts)',
                  transition: 'all 0.2s',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Scope filter */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {SCOPES.map(s => (
              <button
                key={s.key}
                onClick={() => handleScope(s.key)}
                style={{
                  padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--f)', fontSize: 12, fontWeight: scope === s.key ? 600 : 400,
                  background: scope === s.key ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: scope === s.key ? 'var(--t)' : 'var(--td)',
                  transition: 'all 0.2s',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {loading && <div style={{ textAlign: 'center', padding: 20 }}><span className="spinner" style={{ width: 20, height: 20 }} /></div>}

          {!loading && data && data.leaderboard.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--td)', fontSize: 13, padding: '12px 0' }}>
              {period === 'alltime' ? 'Inga användare ännu. Bli först!' : 'Ingen aktivitet under den här perioden.'}
            </p>
          )}

          {!loading && data && data.leaderboard.map((user) => (
            <LeaderboardRow key={user.rank} user={user} period={period} />
          ))}

          {/* Show user's rank if not in top 20 */}
          {!loading && data && data.my_rank && (
            <>
              <div style={{ textAlign: 'center', color: 'var(--td)', fontSize: 13, padding: '8px 0' }}>• • •</div>
              <LeaderboardRow user={data.my_rank} period={period} />
            </>
          )}
        </div>
      )}
    </div>
  )
}

function LeaderboardRow({ user, period }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
      borderRadius: 10, marginBottom: 4,
      background: user.is_you ? 'rgba(255,69,0,0.08)' : 'transparent',
      border: user.is_you ? '1px solid rgba(255,69,0,0.2)' : '1px solid transparent',
    }}>
      <div style={{ width: 32, textAlign: 'center', fontSize: user.rank <= 3 ? 20 : 14, fontWeight: 800, color: user.rank <= 3 ? 'var(--t)' : 'var(--td)' }}>
        {RANK_ICONS[user.rank] || user.rank}
      </div>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: LEVEL_COLORS[user.level] || '#888',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0,
      }}>
        {user.level}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: user.is_you ? 700 : 500, color: user.is_you ? 'var(--a)' : 'var(--t)' }}>
          {user.name} {user.is_you && <span style={{ fontSize: 11, color: 'var(--ts)' }}>(du)</span>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--td)' }}>{user.level_name} • {user.achievements_count} 🏆</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: user.rank <= 3 ? 'var(--a)' : 'var(--t)' }}>{user.xp.toLocaleString()}</div>
        <div style={{ fontSize: 11, color: 'var(--td)' }}>{period === 'alltime' ? 'XP' : 'XP denna period'}</div>
      </div>
    </div>
  )
}
