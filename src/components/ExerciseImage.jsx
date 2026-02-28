import { useState, useEffect } from 'react'
import { Dumbbell } from './Icons'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const imageCache = {}

const MUSCLE_IMAGES = {
  chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=160&q=80',
  back: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=160&q=80',
  shoulders: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=160&q=80',
  legs: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=160&q=80',
  arms: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=160&q=80',
  core: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=160&q=80',
  default: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=160&q=80',
}

export default function ExerciseImage({ name, size = 80 }) {
  const [src, setSrc] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!name) return

    const key = name.toLowerCase().trim()

    if (imageCache[key] !== undefined) {
      setSrc(imageCache[key])
      if (!imageCache[key]) setFailed(true)
      return
    }

    fetch(`${API}/exercises/exercise-image/${encodeURIComponent(key)}`)
      .then(r => r.json())
      .then(data => {
        if (data.gifUrl) {
          imageCache[key] = data.gifUrl
          setSrc(data.gifUrl)
        } else {
          // Fallback to muscle group image
          const fallback = MUSCLE_IMAGES[data.bodyPart] || MUSCLE_IMAGES[data.target] || MUSCLE_IMAGES.default
          imageCache[key] = fallback
          setSrc(fallback)
        }
      })
      .catch(() => {
        imageCache[key] = MUSCLE_IMAGES.default
        setSrc(MUSCLE_IMAGES.default)
        setFailed(true)
      })
  }, [name])

  if (!src && !failed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 10,
        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--br)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span className="spinner" style={{ width: 16, height: 16 }} />
      </div>
    )
  }

  if (failed || !src) {
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