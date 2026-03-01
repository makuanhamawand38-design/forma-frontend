import { useState, useEffect } from 'react'
import { Dumbbell } from './Icons'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const imageCache = {}

export default function ExerciseImage({ name, size = 80 }) {
  const [src, setSrc] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!name) return

    const key = name.toLowerCase().trim()

    if (imageCache[key] !== undefined) {
      if (imageCache[key]) setSrc(imageCache[key])
      else setFailed(true)
      return
    }

    fetch(`${API}/exercises/exercise-image/${encodeURIComponent(key)}`)
      .then(r => r.json())
      .then(data => {
        if (data.imageUrl) {
          imageCache[key] = data.imageUrl
          setSrc(data.imageUrl)
        } else {
          imageCache[key] = null
          setFailed(true)
        }
      })
      .catch(() => {
        imageCache[key] = null
        setFailed(true)
      })
  }, [name])

  if (failed || (!src && !failed)) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 10,
        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--br)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Dumbbell size={size * 0.4} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      style={{
        width: size, height: size, borderRadius: 10,
        objectFit: 'cover', flexShrink: 0,
        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--br)',
      }}
      onError={() => { setFailed(true); setSrc(null) }}
    />
  )
}