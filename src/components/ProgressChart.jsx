import { useMemo } from 'react'

export default function ProgressChart({ weightLog, weeks, activeDay }) {
  // Parse weight log and find exercises that have been logged across multiple weeks
  const chartData = useMemo(() => {
    if (!weightLog || !weeks || weeks.length === 0) return []

    const exerciseMap = {}

    weeks.forEach((week, weekIdx) => {
      const days = week.days || []
      const day = days[activeDay] || days[0]
      if (!day) return

      const exercises = day.exercises || []
      exercises.forEach((ex, exIdx) => {
        const name = ex.name
        if (!exerciseMap[name]) exerciseMap[name] = { name, weeks: [] }

        // Get max weight logged for this exercise in this week
        const numSets = parseInt(ex.sets) || 4
        let maxWeight = 0
        let hasData = false

        for (let s = 0; s < numSets; s++) {
          const key = `${weekIdx}-${activeDay}-${exIdx}-${s}`
          const val = parseFloat(weightLog[key])
          if (val && val > 0) {
            maxWeight = Math.max(maxWeight, val)
            hasData = true
          }
        }

        exerciseMap[name].weeks.push({
          week: weekIdx + 1,
          maxWeight: hasData ? maxWeight : null,
        })
      })
    })

    // Only return exercises that have at least 1 logged entry
    return Object.values(exerciseMap).filter(ex =>
      ex.weeks.some(w => w.maxWeight !== null)
    )
  }, [weightLog, weeks, activeDay])

  if (chartData.length === 0) return null

  return (
    <div style={{ marginTop: 32, marginBottom: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        📈 Din progress
      </h3>

      {chartData.map((exercise, i) => {
        const validWeeks = exercise.weeks.filter(w => w.maxWeight !== null)
        if (validWeeks.length === 0) return null

        const maxVal = Math.max(...validWeeks.map(w => w.maxWeight))
        const minVal = Math.min(...validWeeks.map(w => w.maxWeight))
        const firstWeight = validWeeks[0]?.maxWeight || 0
        const lastWeight = validWeeks[validWeeks.length - 1]?.maxWeight || 0
        const diff = lastWeight - firstWeight
        const improved = diff > 0

        return (
          <div key={i} style={{ background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--t)' }}>{exercise.name}</div>
              {validWeeks.length > 1 && (
                <div style={{
                  fontSize: 13, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                  background: improved ? 'rgba(34,197,94,0.1)' : diff === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,69,0,0.1)',
                  color: improved ? '#22c55e' : diff === 0 ? 'var(--ts)' : 'var(--a)',
                }}>
                  {improved ? `+${diff.toFixed(1)} kg ↑` : diff === 0 ? '= Samma' : `${diff.toFixed(1)} kg ↓`}
                </div>
              )}
            </div>

            {/* Bar chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
              {exercise.weeks.map((w, wi) => {
                const heightPct = w.maxWeight !== null ? (maxVal > 0 ? (w.maxWeight / maxVal) * 100 : 0) : 0
                const isLogged = w.maxWeight !== null

                return (
                  <div key={wi} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    {isLogged && (
                      <span style={{ fontSize: 11, color: 'var(--ts)', fontWeight: 600 }}>{w.maxWeight}kg</span>
                    )}
                    <div style={{
                      width: '100%', maxWidth: 40, borderRadius: 6,
                      height: isLogged ? `${Math.max(heightPct, 15)}%` : '8px',
                      background: isLogged
                        ? (wi === exercise.weeks.length - 1 ? 'var(--a)' : 'rgba(255,69,0,0.3)')
                        : 'var(--br)',
                      transition: 'height 0.3s',
                    }} />
                    <span style={{ fontSize: 10, color: 'var(--td)' }}>V{w.week}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}