import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'

const GOAL_TYPES = [
  { value: 'weight', label: 'Vikt', icon: '⚖️', unit: 'kg' },
  { value: 'strength', label: 'Styrka', icon: '💪', unit: 'kg' },
  { value: 'streak', label: 'Streak', icon: '🔥', unit: 'dagar' },
  { value: 'cardio', label: 'Kondition', icon: '🏃', unit: 'min' },
  { value: 'custom', label: 'Eget', icon: '🎯', unit: '' },
]

const TYPE_COLORS = {
  weight: '#6366f1',
  strength: '#ef4444',
  streak: '#f59e0b',
  cardio: '#22c55e',
  custom: '#8b5cf6',
}

export default function Goals() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [celebration, setCelebration] = useState(null)
  const [stats, setStats] = useState({ active: 0, completed: 0 })

  // Create form
  const [title, setTitle] = useState('')
  const [goalType, setGoalType] = useState('custom')
  const [targetValue, setTargetValue] = useState('')
  const [startValue, setStartValue] = useState('')
  const [unit, setUnit] = useState('')
  const [exerciseName, setExerciseName] = useState('')
  const [deadline, setDeadline] = useState('')

  const load = () => {
    setLoading(true)
    api.getGoals(filter).then(data => {
      setGoals(data.goals || [])
      setStats({ active: data.active_count || 0, completed: data.completed_count || 0 })
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const handleCreate = async () => {
    if (!title.trim() || !targetValue) return
    setCreating(true)
    try {
      await api.createGoal({
        title: title.trim(),
        type: goalType,
        target_value: parseFloat(targetValue),
        start_value: startValue ? parseFloat(startValue) : 0,
        unit: unit || GOAL_TYPES.find(t => t.value === goalType)?.unit || '',
        exercise_name: goalType === 'strength' ? exerciseName : undefined,
        deadline: deadline || undefined,
      })
      setShowModal(false)
      resetForm()
      load()
    } catch (err) {
      alert(err.message)
    }
    setCreating(false)
  }

  const handleComplete = async (goal) => {
    try {
      await api.completeGoal(goal.id, true)
      setCelebration(goal)
      setTimeout(() => setCelebration(null), 3000)
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Ta bort detta mål?')) return
    try {
      await api.deleteGoal(id)
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  const resetForm = () => {
    setTitle('')
    setGoalType('custom')
    setTargetValue('')
    setStartValue('')
    setUnit('')
    setExerciseName('')
    setDeadline('')
  }

  const progressColor = (progress) => {
    if (progress >= 100) return '#22c55e'
    if (progress >= 75) return '#6366f1'
    if (progress >= 50) return '#f59e0b'
    return 'var(--a)'
  }

  return (
    <div>
      <Nav />
      <div className="dash-main">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Mina mål</h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--ts)' }}>
              {stats.active} aktiva · {stats.completed} avklarade
            </p>
          </div>
          <button onClick={() => setShowModal(true)} style={{
            background: 'var(--a)', color: '#fff', border: 'none', borderRadius: 12,
            padding: '12px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'var(--f)', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            + Nytt mål
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { value: 'all', label: 'Alla' },
            { value: 'active', label: 'Aktiva' },
            { value: 'completed', label: 'Avklarade' },
            { value: 'failed', label: 'Missade' },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} style={{
              background: filter === f.value ? 'var(--a)' : 'var(--c)',
              color: filter === f.value ? '#fff' : 'var(--ts)',
              border: filter === f.value ? 'none' : '1px solid var(--br)',
              borderRadius: 20, padding: '8px 18px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--f)', whiteSpace: 'nowrap',
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Goals list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <span className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : goals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <h3 style={{ color: 'var(--t)', marginBottom: 8 }}>Inga mål ännu</h3>
            <p style={{ color: 'var(--td)', fontSize: 14, marginBottom: 20 }}>
              Sätt upp ditt första mål och börja tracka din progress!
            </p>
            <button onClick={() => setShowModal(true)} style={{
              background: 'var(--a)', color: '#fff', border: 'none', borderRadius: 12,
              padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)',
            }}>
              Skapa mål
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                progressColor={progressColor}
                onComplete={handleComplete}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'var(--c)', borderRadius: 20, width: '100%', maxWidth: 480,
            maxHeight: '90vh', overflow: 'auto', padding: 28,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Nytt mål</h2>
              <button onClick={() => setShowModal(false)} style={{
                background: 'none', border: 'none', fontSize: 22, color: 'var(--td)',
                cursor: 'pointer', padding: 4,
              }}>✕</button>
            </div>

            {/* Goal type selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts)', display: 'block', marginBottom: 8 }}>Typ</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {GOAL_TYPES.map(t => (
                  <button key={t.value} onClick={() => { setGoalType(t.value); setUnit(t.unit) }} style={{
                    background: goalType === t.value ? `${TYPE_COLORS[t.value]}15` : 'var(--b)',
                    border: goalType === t.value ? `2px solid ${TYPE_COLORS[t.value]}` : '1px solid var(--br)',
                    borderRadius: 12, padding: '10px 16px', cursor: 'pointer',
                    fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600,
                    color: goalType === t.value ? TYPE_COLORS[t.value] : 'var(--ts)',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts)', display: 'block', marginBottom: 6 }}>Titel</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="T.ex. Bänkpress 100 kg"
                maxLength={100}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--br)',
                  background: 'var(--b)', color: 'var(--t)', fontFamily: 'var(--f)', fontSize: 15,
                  outline: 'none', boxSizing: 'border-box',
                }} />
            </div>

            {/* Exercise name for strength */}
            {goalType === 'strength' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts)', display: 'block', marginBottom: 6 }}>Övning</label>
                <input value={exerciseName} onChange={e => setExerciseName(e.target.value)} placeholder="T.ex. Bänkpress"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--br)',
                    background: 'var(--b)', color: 'var(--t)', fontFamily: 'var(--f)', fontSize: 15,
                    outline: 'none', boxSizing: 'border-box',
                  }} />
              </div>
            )}

            {/* Values row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts)', display: 'block', marginBottom: 6 }}>Startvärde</label>
                <input type="number" value={startValue} onChange={e => setStartValue(e.target.value)} placeholder="0"
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--br)',
                    background: 'var(--b)', color: 'var(--t)', fontFamily: 'var(--f)', fontSize: 15,
                    outline: 'none', boxSizing: 'border-box',
                  }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts)', display: 'block', marginBottom: 6 }}>Målvärde *</label>
                <input type="number" value={targetValue} onChange={e => setTargetValue(e.target.value)} placeholder="100"
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--br)',
                    background: 'var(--b)', color: 'var(--t)', fontFamily: 'var(--f)', fontSize: 15,
                    outline: 'none', boxSizing: 'border-box',
                  }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts)', display: 'block', marginBottom: 6 }}>Enhet</label>
                <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="kg"
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--br)',
                    background: 'var(--b)', color: 'var(--t)', fontFamily: 'var(--f)', fontSize: 15,
                    outline: 'none', boxSizing: 'border-box',
                  }} />
              </div>
            </div>

            {/* Deadline */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts)', display: 'block', marginBottom: 6 }}>Deadline (valfritt)</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--br)',
                  background: 'var(--b)', color: 'var(--t)', fontFamily: 'var(--f)', fontSize: 15,
                  outline: 'none', boxSizing: 'border-box',
                }} />
            </div>

            {/* Submit */}
            <button onClick={handleCreate} disabled={creating || !title.trim() || !targetValue} style={{
              width: '100%', padding: '14px 24px', borderRadius: 14, border: 'none',
              background: (!title.trim() || !targetValue) ? 'var(--br)' : 'var(--a)',
              color: '#fff', fontSize: 16, fontWeight: 700, cursor: (!title.trim() || !targetValue) ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--f)',
            }}>
              {creating ? 'Skapar...' : 'Skapa mål'}
            </button>
          </div>
        </div>
      )}

      {/* Celebration overlay */}
      {celebration && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.3s ease',
        }} onClick={() => setCelebration(null)}>
          <div style={{
            background: 'var(--c)', borderRadius: 24, padding: '48px 40px', textAlign: 'center',
            maxWidth: 400, width: '90%', animation: 'slideUp 0.4s ease',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, color: 'var(--t)' }}>Mål uppnått!</h2>
            <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--a)', margin: '0 0 16px' }}>
              {celebration.title}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#fbbf24' }}>+100</div>
                <div style={{ fontSize: 12, color: 'var(--td)' }}>Coins</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e' }}>+50</div>
                <div style={{ fontSize: 12, color: 'var(--td)' }}>XP</div>
              </div>
            </div>
            <button onClick={() => setCelebration(null)} style={{
              background: 'var(--a)', color: '#fff', border: 'none', borderRadius: 12,
              padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--f)',
            }}>
              Toppen!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function GoalCard({ goal, progressColor, onComplete, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [manualValue, setManualValue] = useState('')
  const color = TYPE_COLORS[goal.type] || 'var(--a)'
  const typeInfo = GOAL_TYPES.find(t => t.value === goal.type)
  const isCompleted = goal.status === 'completed'
  const isFailed = goal.status === 'failed'

  const handleManualUpdate = async () => {
    if (!manualValue) return
    setUpdating(true)
    try {
      await api.updateGoal(goal.id, { current_value: parseFloat(manualValue) })
      setManualValue('')
      setExpanded(false)
      window.location.reload()
    } catch (err) {
      alert(err.message)
    }
    setUpdating(false)
  }

  return (
    <div style={{
      background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 16,
      padding: '20px 20px 16px', transition: 'border-color 0.2s',
      opacity: isFailed ? 0.6 : 1,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: `${color}15`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>
          {isCompleted ? '✅' : isFailed ? '❌' : typeInfo?.icon || '🎯'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--t)' }}>{goal.title}</h3>
            {isCompleted && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 10 }}>
                Klart!
              </span>
            )}
            {isFailed && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 10 }}>
                Missad
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: 'var(--td)', marginTop: 2 }}>
            {goal.exercise_name && <span>{goal.exercise_name} · </span>}
            {goal.current_value} / {goal.target_value} {goal.unit}
            {goal.deadline && (
              <span> · Deadline: {new Date(goal.deadline).toLocaleDateString('sv-SE')}</span>
            )}
          </div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: progressColor(goal.progress), flexShrink: 0 }}>
          {goal.progress}%
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%', height: 8, borderRadius: 4,
        background: 'var(--b)', overflow: 'hidden', marginBottom: 12,
      }}>
        <div style={{
          width: `${Math.min(100, goal.progress)}%`, height: '100%', borderRadius: 4,
          background: progressColor(goal.progress),
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Actions */}
      {goal.status === 'active' && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(goal.type === 'custom' || goal.type === 'cardio') && (
            <>
              {expanded ? (
                <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                  <input type="number" value={manualValue} onChange={e => setManualValue(e.target.value)}
                    placeholder={`Nytt värde (${goal.unit})`}
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--br)',
                      background: 'var(--b)', color: 'var(--t)', fontFamily: 'var(--f)', fontSize: 13,
                      outline: 'none', minWidth: 0,
                    }} />
                  <button onClick={handleManualUpdate} disabled={updating} style={{
                    background: 'var(--a)', color: '#fff', border: 'none', borderRadius: 10,
                    padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)',
                  }}>
                    {updating ? '...' : 'Spara'}
                  </button>
                  <button onClick={() => setExpanded(false)} style={{
                    background: 'none', border: '1px solid var(--br)', borderRadius: 10,
                    padding: '8px 12px', fontSize: 13, color: 'var(--td)', cursor: 'pointer', fontFamily: 'var(--f)',
                  }}>✕</button>
                </div>
              ) : (
                <button onClick={() => setExpanded(true)} style={{
                  background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 10,
                  padding: '8px 16px', fontSize: 13, fontWeight: 600, color: 'var(--ts)',
                  cursor: 'pointer', fontFamily: 'var(--f)',
                }}>
                  Uppdatera
                </button>
              )}
            </>
          )}
          <button onClick={() => onComplete(goal)} style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10,
            padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#22c55e',
            cursor: 'pointer', fontFamily: 'var(--f)',
          }}>
            Markera klar
          </button>
          <button onClick={() => onDelete(goal.id)} style={{
            background: 'none', border: '1px solid var(--br)', borderRadius: 10,
            padding: '8px 12px', fontSize: 13, color: 'var(--td)', cursor: 'pointer', fontFamily: 'var(--f)',
            marginLeft: 'auto',
          }}>
            🗑️
          </button>
        </div>
      )}

      {/* Completed date */}
      {isCompleted && goal.completed_at && (
        <div style={{ fontSize: 12, color: 'var(--td)', marginTop: 4 }}>
          Avklarat {new Date(goal.completed_at).toLocaleDateString('sv-SE')}
        </div>
      )}
    </div>
  )
}
