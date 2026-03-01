import { useState, useEffect } from 'react'
import { Dumbbell } from './Icons'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const imageCache = {}

export default function ExerciseImage({ name, size = 80 }) {
  const [images, setImages] = useState([])
  const [currentImg, setCurrentImg] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!name) return

    const key = name.toLowerCase().trim()

    if (imageCache[key] !== undefined) {
      if (imageCache[key] && imageCache[key].length > 0) {
        setImages(imageCache[key])
      } else {
        setFailed(true)
      }
      return
    }

    fetch(`${API}/exercises/exercise-image/${encodeURIComponent(key)}`)
      .then(r => r.json())
      .then(data => {
        if (data.images && data.images.length > 0) {
          imageCache[key] = data.images
          setImages(data.images)
        } else if (data.gifUrl) {
          imageCache[key] = [data.gifUrl]
          setImages([data.gifUrl])
        } else {
          imageCache[key] = []
          setFailed(true)
        }
      })
      .catch(() => {
        imageCache[key] = []
        setFailed(true)
      })
  }, [name])

  // Animate between start/end position
  useEffect(() => {
    if (images.length <= 1) return
    const interval = setInterval(() => {
      setCurrentImg(prev => (prev + 1) % images.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [images])

  if (failed || images.length === 0) {
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
      src={images[currentImg]}
      alt={name}
      loading="lazy"
      style={{
        width: size, height: size, borderRadius: 10,
        objectFit: 'cover', flexShrink: 0,
        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--br)',
        transition: 'opacity 0.3s',
      }}
      onError={() => { setFailed(true) }}
    />
  )
}