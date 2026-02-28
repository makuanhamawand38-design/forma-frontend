import { useState, useEffect } from 'react'
import { Dumbbell } from './Icons'

// Cache to avoid refetching
const imageCache = {}

export default function ExerciseImage({ name, size = 80 }) {
  const [src, setSrc] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!name) return

    const key = name.toLowerCase().trim()

    // Check cache
    if (imageCache[key] !== undefined) {
      if (imageCache[key]) setSrc(imageCache[key])
      else setFailed(true)
      return
    }

    // Use wger.de open API (no key needed)
    fetch(`https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(key)}&language=english&format=json`)
      .then(r => r.json())
      .then(data => {
        const suggestions = data?.suggestions || []
        if (suggestions.length > 0) {
          const exData = suggestions[0]?.data
          if (exData?.image) {
            const imgUrl = exData.image.startsWith('http') ? exData.image : `https://wger.de${exData.image}`
            imageCache[key] = imgUrl
            setSrc(imgUrl)
            return
          }
          // Try fetching image from exercise ID
          if (exData?.id) {
            fetch(`https://wger.de/api/v2/exerciseimage/?exercise_base=${exData.id}&format=json`)
              .then(r => r.json())
              .then(imgData => {
                if (imgData?.results?.length > 0) {
                  const imgUrl = imgData.results[0].image
                  imageCache[key] = imgUrl
                  setSrc(imgUrl)
                } else {
                  imageCache[key] = null
                  setFailed(true)
                }
              })
              .catch(() => { imageCache[key] = null; setFailed(true) })
            return
          }
        }
        imageCache[key] = null
        setFailed(true)
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