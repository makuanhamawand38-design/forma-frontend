import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'

export default function WorkoutLog() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [tab, setTab] = useState('log')
  const [exercises, setExercises] = useState([{ name: '', sets: [{ reps: '', weight: '', completed: true }] }])
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [timer, setTimer] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [restTimer, setRestTimer] = useState(0)
  const [restRunning, setRestRunning] = useState(false)
  const timerRef = useRef(null)
  const restRef = useRef(null)

  // History tab state
  const [history, setHistory] = useState([])
  const [histLoading, setHistLoading] = useState(false)
  const [histTotal, setHistTotal] = useState(0)

  // Stats tab state
  const [stats, setStats] = useState(null)
  const [prs, setPrs] = useState([])
  const [statsLoading, setStatsLoading] = useState(false)

  // Workout timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [timerRunning])

  // Rest timer
  useEffect(() => {
    if (restRunning && restTimer > 0) {
      restRef.current = setInterval(() => {
        setRestTimer(t => {
          if (t <= 1) { setRestRunning(false); return 0 }
          return t - 1
        })
      }, 1000)
    } else {
      clearInterval(restRef.current)
    }
    return () => clearInterval(restRef.current)
  }, [restRunning, restTimer])

  // Load history on tab switch
  useEffect(() => {
    if (tab === 'history' && history.length === 0) {
      setHistLoading(true)
      api.getWorkouts(20, 0)
        .then(d => { setHistory(d.workouts || []); setHistTotal(d.total || 0) })
        .catch(() => {})
        .finally(() => setHistLoading(false))
    }
    if (tab === 'stats' && !stats) {
      setStatsLoading(true)
      Promise.all([
        api.getWorkoutStats().catch(() => null),
        api.getWorkoutPRs(20).catch(() => ({ records: [] })),
      ]).then(([s, p]) => {
        setStats(s)
        setPrs(p?.records || [])
      }).finally(() => setStatsLoading(false))
    }
  }, [tab])

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ reps: '', weight: '', completed: true }] }])
  }

  const removeExercise = (idx) => {
    if (exercises.length <= 1) return
    setExercises(exercises.filter((_, i) => i !== idx))
  }

  const updateExerciseName = (idx, name) => {
    const copy = [...exercises]
    copy[idx] = { ...copy[idx], name }
    setExercises(copy)
  }

  const addSet = (exIdx) => {
    const copy = [...exercises]
    const lastSet = copy[exIdx].sets[copy[exIdx].sets.length - 1]
    copy[exIdx] = {
      ...copy[exIdx],
      sets: [...copy[exIdx].sets, { reps: lastSet?.reps || '', weight: lastSet?.weight || '', completed: true }],
    }
    setExercises(copy)
  }

  const removeSet = (exIdx, setIdx) => {
    const copy = [...exercises]
    if (copy[exIdx].sets.length <= 1) return
    copy[exIdx] = { ...copy[exIdx], sets: copy[exIdx].sets.filter((_, i) => i !== setIdx) }
    setExercises(copy)
  }

  const updateSet = (exIdx, setIdx, field, value) => {
    const copy = [...exercises]
    const setCopy = [...copy[exIdx].sets]
    setCopy[setIdx] = { ...setCopy[setIdx], [field]: value }
    copy[exIdx] = { ...copy[exIdx], sets: setCopy }
    setExercises(copy)
  }

  const toggleSetCompleted = (exIdx, setIdx) => {
    const copy = [...exercises]
    const setCopy = [...copy[exIdx].sets]
    setCopy[setIdx] = { ...setCopy[setIdx], completed: !setCopy[setIdx].completed }
    copy[exIdx] = { ...copy[exIdx], sets: setCopy }
    setExercises(copy)
  }

  const handleSave = async () => {
    const valid = exercises.filter(e => e.name.trim() && e.sets.some(s => s.reps || s.weight))
    if (valid.length === 0) return alert('Lägg till minst en övning med sets')
    setSaving(true)
    try {
      const data = {
        title: title.trim() || undefined,
        exercises: valid.map(e => ({
          name: e.name.trim(),
          sets: e.sets.map(s => ({
            reps: parseInt(s.reps) || 0,
            weight: parseFloat(s.weight) || 0,
            completed: s.completed,
          })),
        })),
        duration_minutes: Math.floor(timer / 60),
        notes: notes.trim() || undefined,
      }
      await api.createWorkout(data)
      setSaved(true)
      setTimerRunning(false)
      // Reset form after brief delay
      setTimeout(() => {
        setExercises([{ name: '', sets: [{ reps: '', weight: '', completed: true }] }])
        setTitle('')
        setNotes('')
        setTimer(0)
        setSaved(false)
        setTab('history')
        // Reload history
        api.getWorkouts(20, 0).then(d => { setHistory(d.workouts || []); setHistTotal(d.total || 0) }).catch(() => {})
      }, 1500)
    } catch (err) {
      alert(err.message)
    }
    setSaving(false)
  }

  const startRest = (seconds) => {
    setRestTimer(seconds)
    setRestRunning(true)
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const totalVolume = exercises.reduce((sum, ex) =>
    sum + ex.sets.reduce((s, set) =>
      s + ((parseInt(set.reps) || 0) * (parseFloat(set.weight) || 0) * (set.completed ? 1 : 0)), 0), 0)

  const totalSets = exercises.reduce((sum, ex) =>
    sum + ex.sets.filter(s => s.completed && (parseInt(s.reps) > 0 || parseFloat(s.weight) > 0)).length, 0)

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 80px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Träningslogg</h1>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 0, marginBottom: 24,
          background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4,
          border: '1px solid var(--br)',
        }}>
          {[
            { key: 'log', label: 'Logga pass' },
            { key: 'history', label: 'Historik' },
            { key: 'stats', label: 'Statistik' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: '10px 12px', borderRadius: 10, border: 'none',
              background: tab === t.key ? 'var(--a)' : 'transparent',
              color: tab === t.key ? '#fff' : 'var(--ts)',
              fontFamily: 'var(--f)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══ LOG TAB ═══ */}
        {tab === 'log' && (
          <>
            {saved && (
              <div style={{
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'center',
              }}>
                <span style={{ fontSize: 24 }}>💪</span>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#22c55e', marginTop: 4 }}>Pass sparat!</div>
                <div style={{ fontSize: 13, color: 'var(--ts)', marginTop: 2 }}>+10 XP +5 coins</div>
              </div>
            )}

            {/* Timer bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
              background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 12, padding: '12px 16px',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'monospace', color: timerRunning ? 'var(--a)' : 'var(--t)' }}>
                  {formatTime(timer)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--td)', fontWeight: 600 }}>Passtid</div>
              </div>
              <button onClick={() => setTimerRunning(!timerRunning)} style={{
                padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--f)', fontSize: 13, fontWeight: 700,
                background: timerRunning ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                color: timerRunning ? '#ef4444' : '#22c55e',
              }}>
                {timerRunning ? 'Pausa' : timer > 0 ? 'Fortsätt' : 'Starta'}
              </button>

              {/* Rest timer */}
              <div style={{ borderLeft: '1px solid var(--br)', paddingLeft: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 11, color: 'var(--td)', fontWeight: 600 }}>Vila</div>
                {restRunning ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: restTimer <= 10 ? '#ef4444' : 'var(--a)' }}>
                      {formatTime(restTimer)}
                    </span>
                    <button onClick={() => { setRestRunning(false); setRestTimer(0) }} style={{
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--td)', padding: 2,
                    }}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[60, 90, 120].map(s => (
                      <button key={s} onClick={() => startRest(s)} style={{
                        padding: '4px 8px', borderRadius: 6, border: '1px solid var(--br)',
                        background: 'none', fontFamily: 'var(--f)', fontSize: 11, fontWeight: 600,
                        color: 'var(--ts)', cursor: 'pointer',
                      }}>{s}s</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live stats */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <div style={{
                flex: 1, background: 'rgba(255,69,0,0.06)', border: '1px solid rgba(255,69,0,0.15)',
                borderRadius: 10, padding: '10px 14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--a)' }}>{totalSets}</div>
                <div style={{ fontSize: 11, color: 'var(--td)', fontWeight: 600 }}>Sets</div>
              </div>
              <div style={{
                flex: 1, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: 10, padding: '10px 14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#6366f1' }}>{Math.round(totalVolume)}</div>
                <div style={{ fontSize: 11, color: 'var(--td)', fontWeight: 600 }}>Volym (kg)</div>
              </div>
              <div style={{
                flex: 1, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
                borderRadius: 10, padding: '10px 14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>{exercises.filter(e => e.name.trim()).length}</div>
                <div style={{ fontSize: 11, color: 'var(--td)', fontWeight: 600 }}>Övningar</div>
              </div>
            </div>

            {/* Title */}
            <input
              type="text" placeholder="Passnamn (valfritt, t.ex. Bröst & Triceps)"
              value={title} onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                border: '1px solid var(--br)', background: 'var(--b)',
                color: 'var(--t)', fontSize: 14, fontFamily: 'var(--f)',
                marginBottom: 16, outline: 'none', boxSizing: 'border-box',
              }}
            />

            {/* Exercises */}
            {exercises.map((ex, exIdx) => (
              <div key={exIdx} style={{
                background: 'var(--c)', border: '1px solid var(--br)',
                borderRadius: 14, padding: 16, marginBottom: 12,
              }}>
                {/* Exercise header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--a)', width: 24, textAlign: 'center' }}>
                    {exIdx + 1}
                  </span>
                  <input
                    type="text" placeholder="Övningsnamn (t.ex. Bänkpress)"
                    value={ex.name} onChange={e => updateExerciseName(exIdx, e.target.value)}
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: 8,
                      border: '1px solid var(--br)', background: 'var(--b)',
                      color: 'var(--t)', fontSize: 14, fontFamily: 'var(--f)', outline: 'none',
                    }}
                  />
                  {exercises.length > 1 && (
                    <button onClick={() => removeExercise(exIdx)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--td)', fontSize: 16, padding: '4px 8px',
                    }}>✕</button>
                  )}
                </div>

                {/* Sets header */}
                <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 1fr 40px 32px', gap: 8, marginBottom: 6, padding: '0 4px' }}>
                  <span style={{ fontSize: 11, color: 'var(--td)', fontWeight: 600 }}>SET</span>
                  <span style={{ fontSize: 11, color: 'var(--td)', fontWeight: 600 }}>KG</span>
                  <span style={{ fontSize: 11, color: 'var(--td)', fontWeight: 600 }}>REPS</span>
                  <span />
                  <span />
                </div>

                {/* Set rows */}
                {ex.sets.map((set, setIdx) => (
                  <div key={setIdx} style={{
                    display: 'grid', gridTemplateColumns: '36px 1fr 1fr 40px 32px',
                    gap: 8, marginBottom: 6, alignItems: 'center',
                  }}>
                    <span style={{
                      fontSize: 13, fontWeight: 700, textAlign: 'center',
                      color: set.completed ? 'var(--a)' : 'var(--td)',
                    }}>{setIdx + 1}</span>
                    <input
                      type="number" placeholder="0" inputMode="decimal" step="0.5"
                      value={set.weight} onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                      style={{
                        padding: '10px 12px', borderRadius: 8,
                        border: '1px solid var(--br)',
                        background: set.completed && set.weight ? 'rgba(255,69,0,0.08)' : 'var(--b)',
                        color: 'var(--t)', fontSize: 14, fontFamily: 'var(--f)',
                        outline: 'none', width: '100%', boxSizing: 'border-box',
                      }}
                    />
                    <input
                      type="number" placeholder="0" inputMode="numeric"
                      value={set.reps} onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                      style={{
                        padding: '10px 12px', borderRadius: 8,
                        border: '1px solid var(--br)',
                        background: set.completed && set.reps ? 'rgba(255,69,0,0.08)' : 'var(--b)',
                        color: 'var(--t)', fontSize: 14, fontFamily: 'var(--f)',
                        outline: 'none', width: '100%', boxSizing: 'border-box',
                      }}
                    />
                    <button onClick={() => toggleSetCompleted(exIdx, setIdx)} style={{
                      width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: set.completed ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                      color: set.completed ? '#22c55e' : 'var(--td)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    }}>
                      {set.completed ? '✓' : '○'}
                    </button>
                    <button onClick={() => removeSet(exIdx, setIdx)} disabled={ex.sets.length <= 1} style={{
                      background: 'none', border: 'none', cursor: ex.sets.length <= 1 ? 'default' : 'pointer',
                      color: 'var(--td)', fontSize: 14, padding: 4,
                      opacity: ex.sets.length <= 1 ? 0.3 : 0.6,
                    }}>✕</button>
                  </div>
                ))}

                {/* Add set button */}
                <button onClick={() => addSet(exIdx)} style={{
                  width: '100%', padding: '8px', marginTop: 4, borderRadius: 8,
                  border: '1px dashed var(--br)', background: 'none', cursor: 'pointer',
                  fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600, color: 'var(--ts)',
                }}>
                  + Lägg till set
                </button>
              </div>
            ))}

            {/* Add exercise button */}
            <button onClick={addExercise} style={{
              width: '100%', padding: '14px', borderRadius: 12, marginBottom: 16,
              border: '2px dashed rgba(255,69,0,0.2)', background: 'rgba(255,69,0,0.04)',
              cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 14, fontWeight: 700, color: 'var(--a)',
            }}>
              + Lägg till övning
            </button>

            {/* Notes */}
            <textarea
              placeholder="Anteckningar (valfritt)"
              value={notes} onChange={e => setNotes(e.target.value)}
              maxLength={500}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                border: '1px solid var(--br)', background: 'var(--b)',
                color: 'var(--t)', fontSize: 14, fontFamily: 'var(--f)',
                minHeight: 60, resize: 'vertical', outline: 'none',
                marginBottom: 16, boxSizing: 'border-box',
              }}
            />

            {/* Save button */}
            <button onClick={handleSave} disabled={saving} style={{
              width: '100%', padding: '16px', borderRadius: 12, border: 'none',
              background: 'var(--a)', color: '#fff', fontFamily: 'var(--f)',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              opacity: saving ? 0.7 : 1,
            }}>
              {saving ? <span className="spinner" style={{ width: 20, height: 20 }} /> : '💾 Spara pass'}
            </button>
          </>
        )}

        {/* ═══ HISTORY TAB ═══ */}
        {tab === 'history' && (
          <>
            {histLoading ? (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <span className="spinner" style={{ width: 28, height: 28 }} />
              </div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--td)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <p style={{ fontSize: 15 }}>Inga loggade pass ännu</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Logga ditt första pass i "Logga pass"-fliken!</p>
              </div>
            ) : (
              <>
                {history.map(w => (
                  <div key={w.id} style={{
                    background: 'var(--c)', border: '1px solid var(--br)',
                    borderRadius: 14, padding: 16, marginBottom: 10,
                    cursor: 'pointer', transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--a)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--br)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t)' }}>
                          {w.title || w.exercise_names?.join(', ') || 'Träningspass'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--td)', marginTop: 2 }}>
                          {new Date(w.created_at).toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' })}
                          {w.duration_minutes > 0 && ` · ${w.duration_minutes} min`}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                      <span style={{ color: 'var(--ts)' }}><strong style={{ color: 'var(--a)' }}>{w.exercise_count}</strong> övningar</span>
                      <span style={{ color: 'var(--ts)' }}><strong style={{ color: '#6366f1' }}>{w.total_sets}</strong> sets</span>
                      <span style={{ color: 'var(--ts)' }}><strong style={{ color: '#22c55e' }}>{Math.round(w.total_volume)}</strong> kg</span>
                    </div>
                    {w.exercise_names?.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {w.exercise_names.map((name, i) => (
                          <span key={i} style={{
                            padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                            background: 'rgba(255,69,0,0.08)', color: 'var(--a)', border: '1px solid rgba(255,69,0,0.15)',
                          }}>{name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {history.length < histTotal && (
                  <button onClick={() => {
                    api.getWorkouts(20, history.length)
                      .then(d => setHistory(prev => [...prev, ...(d.workouts || [])]))
                      .catch(() => {})
                  }} style={{
                    display: 'block', width: '100%', padding: 14, marginTop: 8,
                    background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 12,
                    color: 'var(--ts)', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--f)',
                  }}>Visa fler</button>
                )}
              </>
            )}
          </>
        )}

        {/* ═══ STATS TAB ═══ */}
        {tab === 'stats' && (
          <>
            {statsLoading ? (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <span className="spinner" style={{ width: 28, height: 28 }} />
              </div>
            ) : !stats ? (
              <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--td)' }}>
                Kunde inte ladda statistik
              </div>
            ) : (
              <>
                {/* Overview cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
                  <StatCard label="Totalt pass" value={stats.total_workouts} color="#ff4500" />
                  <StatCard label="Total volym" value={`${Math.round(stats.total_volume / 1000)}t kg`} color="#6366f1" />
                  <StatCard label="Denna vecka" value={stats.week_count} color="#22c55e" />
                  <StatCard label="Denna månad" value={stats.month_count} color="#f59e0b" />
                </div>

                {/* Volume trend */}
                {stats.week_volumes && stats.week_volumes.some(v => v > 0) && (
                  <div style={{
                    background: 'var(--c)', border: '1px solid var(--br)',
                    borderRadius: 14, padding: 16, marginBottom: 24,
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t)', marginBottom: 12 }}>
                      Volymtrend (4 veckor)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
                      {stats.week_volumes.map((v, i) => {
                        const max = Math.max(...stats.week_volumes, 1)
                        const h = Math.max((v / max) * 80, 4)
                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 11, color: 'var(--ts)', fontWeight: 600 }}>{Math.round(v)}</span>
                            <div style={{
                              width: '100%', height: h, borderRadius: 6,
                              background: i === 3 ? 'var(--a)' : 'rgba(255,69,0,0.3)',
                              transition: 'height 0.3s ease',
                            }} />
                            <span style={{ fontSize: 10, color: 'var(--td)' }}>V{i + 1}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Personal Records */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 20 }}>🏆</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)' }}>Personliga rekord</span>
                    <span style={{
                      fontSize: 12, fontWeight: 600, color: 'var(--a)',
                      background: 'rgba(255,69,0,0.1)', padding: '2px 10px', borderRadius: 10,
                    }}>{stats.pr_count}</span>
                  </div>
                  {prs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 32, color: 'var(--td)', fontSize: 13 }}>
                      Inga PRs ännu — logga ditt första pass!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {prs.map((pr, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          background: i < 3 ? 'rgba(245,158,11,0.06)' : 'var(--c)',
                          border: `1px solid ${i < 3 ? 'rgba(245,158,11,0.2)' : 'var(--br)'}`,
                          borderRadius: 10, padding: '10px 14px',
                        }}>
                          <span style={{
                            fontSize: i < 3 ? 16 : 13, fontWeight: 800, width: 28, textAlign: 'center',
                            color: i === 0 ? '#fbbf24' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7f32' : 'var(--td)',
                          }}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)' }}>{pr.exercise}</div>
                            <div style={{ fontSize: 12, color: 'var(--td)', marginTop: 1 }}>
                              {new Date(pr.date).toLocaleDateString('sv-SE')}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--a)' }}>{pr.weight} kg</div>
                            <div style={{ fontSize: 11, color: 'var(--td)' }}>{pr.reps} reps</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: `${color}10`, border: `1px solid ${color}30`,
      borderRadius: 12, padding: 14, textAlign: 'center',
    }}>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--td)', fontWeight: 600 }}>{label}</div>
    </div>
  )
}
