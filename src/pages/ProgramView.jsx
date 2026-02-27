import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import Nav from '../components/Nav'
import { Back, Dumbbell } from '../components/Icons'
import ProgressChart from '../components/ProgressChart'
import { XpToast } from '../components/XpSystem'

export default function ProgramView() {
  const { id } = useParams()
  const nav = useNavigate()
  const [program, setProgram] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeWeek, setActiveWeek] = useState(0)
  const [activeDay, setActiveDay] = useState(0)
  const [expandedEx, setExpandedEx] = useState(null)
  const [weightLog, setWeightLog] = useState({})
  const [downloading, setDownloading] = useState(false)
  const [swapping, setSwapping] = useState(null) // 'ex-2' or 'meal-3'
  const [xpToast, setXpToast] = useState(null)

  useEffect(() => {
    api.getProgram(id).then(p => {
      setProgram(p)
      if (p.weight_log) setWeightLog(p.weight_log)
    }).catch(() => nav('/dashboard')).finally(() => setLoading(false))
  }, [id])

  const logKey = (weekIdx, dayIdx, exIdx, setIdx) => `${weekIdx}-${dayIdx}-${exIdx}-${setIdx}`

  const updateWeightLog = (key, value) => {
    const updated = { ...weightLog, [key]: value }
    setWeightLog(updated)
    api.updateWeightLog(id, updated).catch(() => {})
    if (value && !weightLog[key]) {
      api.addXp('log_weight', { weight: value }).then(r => setXpToast(r)).catch(() => {})
    }
  }

  const handleDownloadPdf = async () => {
    setDownloading(true)
    try { await api.downloadPdf(id) } catch (err) { alert(err.message) }
    setDownloading(false)
  }

  const handleSwapExercise = async (exIdx) => {
    setSwapping(`ex-${exIdx}`)
    try {
      await api.swapExercise(id, activeWeek, activeDay, exIdx)
      const updated = await api.getProgram(id)
      setProgram(updated)
      api.addXp('swap_exercise').then(r => setXpToast(r)).catch(() => {})
    } catch (err) { alert(err.message) }
    setSwapping(null)
  }

  const handleSwapMeal = async (mealIdx) => {
    setSwapping(`meal-${mealIdx}`)
    try {
      await api.swapMeal(id, activeWeek, activeDay, mealIdx)
      const updated = await api.getProgram(id)
      setProgram(updated)
      api.addXp('swap_meal').then(r => setXpToast(r)).catch(() => {})
    } catch (err) { alert(err.message) }
    setSwapping(null)
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
  if (!program || !program.content) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ts)' }}>Programmet har inte genererats ännu.</div>

  const content = program.content
  const productType = program.product_type

  const isBundle = productType === 'bundle' || !!content.training
  const isNutritionOnly = productType === 'nutrition' || (!content.training && !!(content.weeks?.[0]?.days?.[0]?.meals))
  const isTrainingOnly = productType === 'training' || (!content.training && !!(content.weeks?.[0]?.days?.[0]?.exercises))

  const trainingWeeks = isBundle ? (content.training?.weeks || []) : (isTrainingOnly ? (content.weeks || []) : [])
  const nutritionWeeks = isBundle ? (content.nutrition?.weeks || []) : (isNutritionOnly ? (content.weeks || []) : [])

  const weeks = trainingWeeks.length > 0 ? trainingWeeks : nutritionWeeks
  const currentWeek = weeks[activeWeek] || {}
  const days = currentWeek.days || []
  const currentDay = days[activeDay] || {}

  const exercises = currentDay.exercises || []
  const hasTraining = exercises.length > 0

  let currentNutritionDay = null
  if (isBundle && nutritionWeeks.length > 0) {
    const nWeek = nutritionWeeks[activeWeek] || nutritionWeeks[0] || {}
    const nDays = nWeek.days || []
    currentNutritionDay = nDays[activeDay] || nDays[0] || null
  } else if (isNutritionOnly) {
    currentNutritionDay = currentDay
  }
  const meals = currentNutritionDay?.meals || []
  const hasMeals = meals.length > 0

  const nutritionOverview = isBundle ? content.nutrition : (isNutritionOnly ? content : null)
  const dailyCals = nutritionOverview?.daily_calories
  const macros = nutritionOverview?.macros || {}

  const currentShoppingList = isBundle
    ? (nutritionWeeks[activeWeek]?.shopping_list || [])
    : (isNutritionOnly ? (currentWeek.shopping_list || []) : [])

  const swapBtnStyle = {
    background: 'none', border: '1px solid var(--br)', borderRadius: 8, padding: '6px 12px',
    cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12, color: 'var(--ts)',
    display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'all 0.2s',
  }

  return (
    <div>
      <Nav />
      <div className="pv-header">
        <div className="pv-header-inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <button className="nav-btn" onClick={() => nav('/dashboard')} style={{ marginBottom: 16 }}><Back /> Tillbaka</button>
            <button onClick={handleDownloadPdf} disabled={downloading} style={{
              background: 'rgba(255,69,0,0.1)', border: '1px solid rgba(255,69,0,0.3)', borderRadius: 10,
              padding: '8px 16px', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600, color: 'var(--a)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {downloading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '📄'}
              Ladda ner PDF
            </button>
          </div>
          <h1 className="pv-title">{content.title || 'Mitt Program'}</h1>
          {content.description && <p style={{ fontSize: 14, color: 'var(--ts)', marginTop: 8, maxWidth: 600 }}>{content.description}</p>}
          <p className="pv-sub">Version {program.version_number} {currentWeek.theme && <span style={{ color: 'var(--ts)' }}> — {currentWeek.theme}</span>}</p>

          {dailyCals && (
            <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,69,0,0.08)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: 'var(--a)', fontWeight: 600 }}>
                🔥 {dailyCals} kcal/dag
              </div>
              {macros.protein && <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: 'var(--ts)' }}>Protein: {macros.protein}g</div>}
              {macros.carbs && <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: 'var(--ts)' }}>Kolhydrater: {macros.carbs}g</div>}
              {macros.fat && <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '6px 14px', fontSize: 13, color: 'var(--ts)' }}>Fett: {macros.fat}g</div>}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: 'var(--c)', borderBottom: '1px solid var(--br)' }}>
        <div className="pv-tabs">
          {weeks.map((w, i) => (
            <button key={i} className={`pv-tab ${activeWeek === i ? 'active' : ''}`} onClick={() => { setActiveWeek(i); setActiveDay(0); setExpandedEx(null) }}>Vecka {w.week_number || i + 1}</button>
          ))}
        </div>
      </div>

      <div style={{ borderBottom: '1px solid var(--br)' }}>
        <div className="pv-tabs">
          {days.map((d, i) => (
            <button key={i} className={`pv-tab ${activeDay === i ? 'active' : ''}`} onClick={() => { setActiveDay(i); setExpandedEx(null) }}>{d.day_name || `Dag ${i + 1}`}</button>
          ))}
        </div>
      </div>

      <div className="pv-content">

        {/* ===== TRAINING ===== */}
        {hasTraining && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{currentDay.day_name} — {currentDay.focus || ''}</h2>
            <p style={{ fontSize: 14, color: 'var(--ts)', marginBottom: 24 }}>{exercises.length} övningar</p>

            {currentDay.warmup && (
              <div style={{ background: 'rgba(255,69,0,0.05)', border: '1px solid rgba(255,69,0,0.15)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>🔥</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--a)' }}>Uppvärmning</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--ts)', lineHeight: 1.5 }}>{currentDay.warmup}</p>
              </div>
            )}

            {exercises.map((ex, i) => {
              const isExpanded = expandedEx === i
              const numSets = parseInt(ex.sets) || 4
              const isSwapping = swapping === `ex-${i}`

              return (
                <div key={i} className="ex-card" style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'stretch', opacity: isSwapping ? 0.6 : 1, transition: 'opacity 0.3s' }} onClick={() => setExpandedEx(isExpanded ? null : i)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="ex-gif"><Dumbbell size={32} /></div>
                    <div style={{ flex: 1 }}>
                      <div className="ex-name">{ex.name}</div>
                      <div className="ex-stats"><span>{ex.sets} set</span><span>{ex.reps} reps</span><span>Vila: {ex.rest}</span></div>
                      {(ex.suggested_weight_male || ex.suggested_weight_female) && (
                        <div style={{ fontSize: 12, color: 'var(--td)', marginTop: 4 }}>
                          Föreslagen vikt: {ex.suggested_weight_male && <span>♂ {ex.suggested_weight_male}</span>}{ex.suggested_weight_male && ex.suggested_weight_female && ' / '}{ex.suggested_weight_female && <span>♀ {ex.suggested_weight_female}</span>}
                        </div>
                      )}
                    </div>
                    <div style={{ color: 'var(--ts)', fontSize: 20, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: 16, borderTop: '1px solid var(--br)', paddingTop: 16 }} onClick={e => e.stopPropagation()}>
                      {ex.description && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)', marginBottom: 6 }}>Så gör du:</div>
                          <p style={{ fontSize: 13, color: 'var(--ts)', lineHeight: 1.6 }}>{ex.description}</p>
                        </div>
                      )}

                      {ex.coach_tip && (
                        <div style={{ background: 'rgba(255,69,0,0.08)', border: '1px solid rgba(255,69,0,0.15)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--a)', marginBottom: 4 }}>💡 Coach-tips</div>
                          <p style={{ fontSize: 13, color: 'var(--ts)', lineHeight: 1.5 }}>{ex.coach_tip}</p>
                        </div>
                      )}

                      <div style={{ marginBottom: 12 }}>
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
                                    color: 'var(--t)', textAlign: 'center', fontSize: 14, fontFamily: 'var(--f)', outline: 'none',
                                  }}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Swap exercise button */}
                      <button onClick={() => handleSwapExercise(i)} disabled={isSwapping} style={swapBtnStyle}>
                        {isSwapping ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '🔄'}
                        {isSwapping ? 'Byter övning...' : 'Byt ut övning'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {currentDay.cooldown && (
              <div style={{ background: 'rgba(100,149,237,0.05)', border: '1px solid rgba(100,149,237,0.15)', borderRadius: 12, padding: 16, marginTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>🧘</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#6495ED' }}>Nedvarvning</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--ts)', lineHeight: 1.5 }}>{currentDay.cooldown}</p>
              </div>
            )}

            <ProgressChart weightLog={weightLog} weeks={trainingWeeks} activeDay={activeDay} />
          </>
        )}

        {/* ===== NUTRITION ===== */}
        {hasMeals && (
          <div style={{ marginTop: hasTraining ? 40 : 0 }}>
            {hasTraining && <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>🍽️ Dagens måltider</h2>}
            {!hasTraining && (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{currentDay.day_name || currentNutritionDay?.day_name}</h2>
                {currentNutritionDay?.total_calories && (
                  <p style={{ fontSize: 14, color: 'var(--ts)', marginBottom: 20 }}>
                    Totalt: {currentNutritionDay.total_calories} kcal — {meals.length} måltider
                  </p>
                )}
                {!currentNutritionDay?.total_calories && (
                  <p style={{ fontSize: 14, color: 'var(--ts)', marginBottom: 20 }}>{meals.length} måltider</p>
                )}
              </>
            )}

            {meals.map((meal, mi) => {
              const isSwapping = swapping === `meal-${mi}`
              return (
                <div key={mi} style={{ background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 12, padding: 16, marginBottom: 12, opacity: isSwapping ? 0.6 : 1, transition: 'opacity 0.3s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--a)', fontWeight: 600, marginBottom: 2 }}>{meal.meal}</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--t)' }}>{meal.name}</div>
                      {meal.prep_time && <div style={{ fontSize: 12, color: 'var(--td)', marginTop: 2 }}>⏱️ {meal.prep_time}</div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--a)' }}>{meal.calories} kcal</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                    {meal.protein != null && <div style={{ background: 'rgba(59,130,246,0.1)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>Protein: {meal.protein}g</div>}
                    {meal.carbs != null && <div style={{ background: 'rgba(234,179,8,0.1)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#eab308', fontWeight: 600 }}>Kolhydrater: {meal.carbs}g</div>}
                    {meal.fat != null && <div style={{ background: 'rgba(168,85,247,0.1)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#a855f7', fontWeight: 600 }}>Fett: {meal.fat}g</div>}
                  </div>

                  {meal.ingredients && meal.ingredients.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t)', marginBottom: 6 }}>🥗 Ingredienser:</div>
                      <div style={{ fontSize: 13, color: 'var(--ts)', lineHeight: 1.7 }}>
                        {meal.ingredients.map((ing, ii) => (
                          <div key={ii} style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
                            <span style={{ color: 'var(--a)', fontSize: 8 }}>●</span> {ing}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {meal.prep_notes && (
                    <div style={{ background: 'rgba(255,69,0,0.05)', border: '1px solid rgba(255,69,0,0.1)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--a)', marginBottom: 4 }}>👨‍🍳 Tillagning:</div>
                      <p style={{ fontSize: 13, color: 'var(--ts)', lineHeight: 1.6, margin: 0 }}>{meal.prep_notes}</p>
                    </div>
                  )}

                  {/* Swap meal button */}
                  <button onClick={() => handleSwapMeal(mi)} disabled={isSwapping} style={swapBtnStyle}>
                    {isSwapping ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '🔄'}
                    {isSwapping ? 'Byter måltid...' : 'Byt ut måltid'}
                  </button>
                </div>
              )
            })}

            {currentNutritionDay?.total_calories && !hasTraining && (
              <div style={{ background: 'rgba(255,69,0,0.08)', border: '1px solid rgba(255,69,0,0.2)', borderRadius: 12, padding: 16, marginTop: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t)', marginBottom: 4 }}>Dagstotal</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--a)' }}>{currentNutritionDay.total_calories} kcal</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8, fontSize: 13, color: 'var(--ts)' }}>
                  {meals.reduce((s, m) => s + (m.protein || 0), 0) > 0 && <span>P: {meals.reduce((s, m) => s + (m.protein || 0), 0)}g</span>}
                  {meals.reduce((s, m) => s + (m.carbs || 0), 0) > 0 && <span>K: {meals.reduce((s, m) => s + (m.carbs || 0), 0)}g</span>}
                  {meals.reduce((s, m) => s + (m.fat || 0), 0) > 0 && <span>F: {meals.reduce((s, m) => s + (m.fat || 0), 0)}g</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== SHOPPING LIST ===== */}
        {currentShoppingList.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>🛒</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#22c55e' }}>Inköpslista — Vecka {(currentWeek.week_number || activeWeek + 1)}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ts)', lineHeight: 1.8 }}>
                {currentShoppingList.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
                    <span style={{ color: '#22c55e', fontSize: 8 }}>●</span> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== TIPS ===== */}
        {(content.tips || content.nutrition?.tips) && (
          <div style={{ marginTop: 24 }}>
            <div style={{ background: 'rgba(255,69,0,0.05)', border: '1px solid rgba(255,69,0,0.15)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>💡</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--a)' }}>Tips</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ts)', lineHeight: 1.7 }}>
                {(content.tips || content.nutrition?.tips || []).map((tip, i) => (
                  <div key={i} style={{ marginBottom: 4 }}>• {tip}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!hasTraining && !hasMeals && (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--ts)' }}>
            <p>Inget innehåll att visa för denna dag.</p>
          </div>
        )}
      </div>

      <XpToast data={xpToast} onClose={() => setXpToast(null)} />
    </div>
  )
}