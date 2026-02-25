import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import Nav from '../components/Nav'
import { Back, Dumbbell } from '../components/Icons'

export default function ProgramView() {
  const { id } = useParams()
  const nav = useNavigate()
  const [program, setProgram] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeWeek, setActiveWeek] = useState(0)
  const [activeDay, setActiveDay] = useState(0)
  const [expandedEx, setExpandedEx] = useState(null)
  const [weightLog, setWeightLog] = useState({})

  useEffect(() => {
    api.getProgram(id).then(p => {
      setProgram(p)
      // Load saved weight log from program data
      if (p.weight_log) setWeightLog(p.weight_log)
    }).catch(() => nav('/dashboard')).finally(() => setLoading(false))
  }, [id])

  const logKey = (weekIdx, dayIdx, exIdx, setIdx) => `${weekIdx}-${dayIdx}-${exIdx}-${setIdx}`

  const updateWeightLog = (key, value) => {
    const updated = { ...weightLog, [key]: value }
    setWeightLog(updated)
    // Save to backend
    api.updateWeightLog(id, updated).catch(() => {})
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
  if (!program || !program.content) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ts)' }}>Programmet har inte genererats ännu.</div>

  const content = program.content
  const weeks = content.weeks || content.training?.weeks || []
  const currentWeek = weeks[activeWeek] || {}
  const days = currentWeek.days || []
  const currentDay = days[activeDay] || {}
  const exercises = currentDay.exercises || []

  return (
    <div>
      <Nav />
      <div className="pv-header">
        <div className="pv-header-inner">
          <button className="nav-btn" onClick={() => nav('/dashboard')} style={{ marginBottom: 16 }}><Back /> Tillbaka till dashboard</button>
          <h1 className="pv-title">{content.title || 'Mitt Program'}</h1>
          {content.description && <p style={{ fontSize: 14, color: 'var(--ts)', marginTop: 8, maxWidth: 600 }}>{content.description}</p>}
          <p className="pv-sub">Version {program.version_number} {currentWeek.theme && <span style={{ color: 'var(--ts)' }}> — {currentWeek.theme}</span>}</p>
        </div>
      </div>

      {/* Vecka-tabs */}
      <div style={{ background: 'var(--c)', borderBottom: '1px solid var(--br)' }}>
        <div className="pv-tabs">
          {weeks.map((w, i) => (
            <button key={i} className={`pv-tab ${activeWeek === i ? 'active' : ''}`} onClick={() => { setActiveWeek(i); setActiveDay(0); setExpandedEx(null) }}>Vecka {w.week_number || i + 1}</button>
          ))}
        </div>
      </div>

      {/* Dag-tabs */}
      <div style={{ borderBottom: '1px solid var(--br)' }}>
        <div className="pv-tabs">
          {days.map((d, i) => (
            <button key={i} className={`pv-tab ${activeDay === i ? 'active' : ''}`} onClick={() => { setActiveDay(i); setExpandedEx(null) }}>{d.day_name || `Dag ${i + 1}`}</button>
          ))}
        </div>
      </div>

      <div className="pv-content">
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{currentDay.day_name} — {currentDay.focus || ''}</h2>
        <p style={{ fontSize: 14, color: 'var(--ts)', marginBottom: 24 }}>{exercises.length} övningar</p>

        {/* Uppvärmning */}
        {currentDay.warmup && (
          <div style={{ background: 'rgba(255,69,0,0.05)', border: '1px solid rgba(255,69,0,0.15)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>🔥</span>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--a)' }}>Uppvärmning</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ts)', lineHeight: 1.5 }}>{currentDay.warmup}</p>
          </div>
        )}

        {/* Övningar */}
        {exercises.map((ex, i) => {
          const isExpanded = expandedEx === i
          const numSets = parseInt(ex.sets) || 4

          return (
            <div key={i} className="ex-card" style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'stretch' }} onClick={() => setExpandedEx(isExpanded ? null : i)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="ex-gif"><Dumbbell size={32} /></div>
                <div style={{ flex: 1 }}>
                  <div className="ex-name">{ex.name}</div>
                  <div className="ex-stats"><span>{ex.sets} set</span><span>{ex.reps} reps</span><span>Vila: {ex.rest}</span></div>
                  {/* Föreslagen vikt */}
                  {(ex.suggested_weight_male || ex.suggested_weight_female) && (
                    <div style={{ fontSize: 12, color: 'var(--td)', marginTop: 4 }}>
                      Föreslagen vikt: {ex.suggested_weight_male && <span>♂ {ex.suggested_weight_male}</span>}{ex.suggested_weight_male && ex.suggested_weight_female && ' / '}{ex.suggested_weight_female && <span>♀ {ex.suggested_weight_female}</span>}
                    </div>
                  )}
                </div>
                <div style={{ color: 'var(--ts)', fontSize: 20, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</div>
              </div>

              {/* Expanderat innehåll */}
              {isExpanded && (
                <div style={{ marginTop: 16, borderTop: '1px solid var(--br)', paddingTop: 16 }} onClick={e => e.stopPropagation()}>
                  {/* Beskrivning */}
                  {ex.description && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)', marginBottom: 6 }}>Så gör du:</div>
                      <p style={{ fontSize: 13, color: 'var(--ts)', lineHeight: 1.6 }}>{ex.description}</p>
                    </div>
                  )}

                  {/* Coach tip */}
                  {ex.coach_tip && (
                    <div style={{ background: 'rgba(255,69,0,0.08)', border: '1px solid rgba(255,69,0,0.15)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--a)', marginBottom: 4 }}>💡 Coach-tips</div>
                      <p style={{ fontSize: 13, color: 'var(--ts)', lineHeight: 1.5 }}>{ex.coach_tip}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {ex.notes && !ex.coach_tip && (
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: 13, color: 'var(--ts)', fontStyle: 'italic' }}>{ex.notes}</p>
                    </div>
                  )}

                  {/* Viktloggning */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)', marginBottom: 10 }}>📝 Logga din vikt</div>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(numSets, 6)}, 1fr)`, gap: 8 }}>
                      {Array.from({ length: numSets }).map((_, s) => {
                        const key = logKey(activeWeek, activeDay, i, s)
                        return (
                          <div key={s} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 11, color: 'var(--td)', marginBottom: 4 }}>Set {s + 1}</div>
                            <input
                              type="number"
                              placeholder="kg"
                              value={weightLog[key] || ''}
                              onChange={e => updateWeightLog(key, e.target.value)}
                              style={{
                                width: '100%', padding: '8px 4px', borderRadius: 8, border: '1px solid var(--br)',
                                background: weightLog[key] ? 'rgba(255,69,0,0.1)' : 'var(--b)',
                                color: 'var(--t)', textAlign: 'center', fontSize: 14, fontFamily: 'var(--f)',
                                outline: 'none',
                              }}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Nedvarvning */}
        {currentDay.cooldown && (
          <div style={{ background: 'rgba(100,149,237,0.05)', border: '1px solid rgba(100,149,237,0.15)', borderRadius: 12, padding: 16, marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>🧘</span>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#6495ED' }}>Nedvarvning</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ts)', lineHeight: 1.5 }}>{currentDay.cooldown}</p>
          </div>
        )}

        {/* Nutrition section for bundle */}
        {content.nutrition && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>🍽️ Dagens måltider</h2>
            {(() => {
              const nutritionWeeks = content.nutrition.weeks || []
              const nWeek = nutritionWeeks[activeWeek] || nutritionWeeks[0] || {}
              const nDays = nWeek.days || []
              const nDay = nDays[activeDay] || nDays[0] || {}
              const meals = nDay.meals || []
              return meals.map((meal, mi) => (
                <div key={mi} style={{ background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--a)', fontWeight: 600, marginBottom: 2 }}>{meal.meal}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--t)' }}>{meal.name}</div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ts)' }}>{meal.calories} kcal</div>
                  </div>
                  {meal.ingredients && (
                    <div style={{ fontSize: 13, color: 'var(--ts)', marginBottom: 8 }}>
                      {meal.ingredients.join(' • ')}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--td)' }}>
                    {meal.protein && <span>P: {meal.protein}g</span>}
                    {meal.carbs && <span>K: {meal.carbs}g</span>}
                    {meal.fat && <span>F: {meal.fat}g</span>}
                  </div>
                  {meal.prep_notes && <p style={{ fontSize: 12, color: 'var(--td)', marginTop: 8, fontStyle: 'italic' }}>{meal.prep_notes}</p>}
                </div>
              ))
            })()}
          </div>
        )}
      </div>
    </div>
  )
}