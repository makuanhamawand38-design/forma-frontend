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

  useEffect(() => {
    api.getProgram(id).then(setProgram).catch(() => nav('/dashboard')).finally(() => setLoading(false))
  }, [id])

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
          <p className="pv-sub">Version {program.version_number}</p>
        </div>
      </div>
      <div style={{ background: 'var(--c)', borderBottom: '1px solid var(--br)' }}>
        <div className="pv-tabs">
          {weeks.map((w, i) => (
            <button key={i} className={`pv-tab ${activeWeek === i ? 'active' : ''}`} onClick={() => { setActiveWeek(i); setActiveDay(0) }}>Vecka {w.week_number || i + 1}</button>
          ))}
        </div>
      </div>
      <div style={{ borderBottom: '1px solid var(--br)' }}>
        <div className="pv-tabs">
          {days.map((d, i) => (
            <button key={i} className={`pv-tab ${activeDay === i ? 'active' : ''}`} onClick={() => setActiveDay(i)}>{d.day_name || `Dag ${i + 1}`}</button>
          ))}
        </div>
      </div>
      <div className="pv-content">
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{currentDay.day_name} – {currentDay.focus || ''}</h2>
        <p style={{ fontSize: 14, color: 'var(--ts)', marginBottom: 24 }}>{exercises.length} övningar</p>
        {exercises.map((ex, i) => (
          <div key={i} className="ex-card">
            <div className="ex-gif">{ex.gif_url ? <img src={ex.gif_url} alt={ex.name} /> : <Dumbbell size={32} />}</div>
            <div>
              <div className="ex-name">{ex.name}</div>
              <div className="ex-target">{ex.target_muscle || ''}</div>
              <div className="ex-stats"><span>{ex.sets} set</span><span>{ex.reps} reps</span><span>Vila: {ex.rest}</span></div>
              {ex.notes && <div className="ex-notes">{ex.notes}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
