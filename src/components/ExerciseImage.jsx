import { useState, useEffect } from 'react'
import { Dumbbell } from './Icons'

const imageCache = {}
const API_KEY = '87e820ac92mshd0b7a5e4df21869p139da7jsn7aac1920b031'

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

    fetch(`https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(key)}?limit=1`, {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      }
    })
      .then(r => r.json())
      .then(data => {
        if (data && data.length > 0 && data[0].gifUrl) {
          imageCache[key] = data[0].gifUrl
          setSrc(data[0].gifUrl)
        } else {
          imageCache[key] = null
          setFailed(true)
        }
      })
      .catch(() => { imageCache[key] = null; setFailed(true) })
  }, [name])

  if (failed || !src) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 10,
        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--br)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
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