import { Dumbbell } from './Icons'

// Map muscle groups to Unsplash images
const MUSCLE_IMAGES = {
  chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=160&q=80',
  back: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=160&q=80',
  shoulders: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=160&q=80',
  legs: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=160&q=80',
  arms: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=160&q=80',
  core: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=160&q=80',
  cardio: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=160&q=80',
  default: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=160&q=80',
}

const EXERCISE_MUSCLES = {
  'bench press': 'chest', 'incline bench press': 'chest', 'decline bench press': 'chest',
  'dumbbell press': 'chest', 'incline dumbbell press': 'chest', 'dumbbell flyes': 'chest',
  'cable fly': 'chest', 'cable flyes': 'chest', 'chest fly': 'chest', 'chest press': 'chest',
  'push up': 'chest', 'push-up': 'chest', 'pushup': 'chest', 'dips': 'chest',
  'pec deck': 'chest', 'close-grip bench press': 'chest',
  'deadlift': 'back', 'pull up': 'back', 'pull-up': 'back', 'pullup': 'back',
  'chin up': 'back', 'chin-up': 'back', 'lat pulldown': 'back', 'barbell row': 'back',
  'bent over row': 'back', 'seated row': 'back', 'cable row': 'back', 't-bar row': 'back',
  'dumbbell row': 'back', 'single arm row': 'back', 'face pull': 'back',
  'back extension': 'back', 'hyperextension': 'back', 'rack pull': 'back',
  'pendlay row': 'back', 'meadows row': 'back',
  'overhead press': 'shoulders', 'military press': 'shoulders', 'shoulder press': 'shoulders',
  'lateral raise': 'shoulders', 'front raise': 'shoulders', 'rear delt fly': 'shoulders',
  'arnold press': 'shoulders', 'upright row': 'shoulders', 'shrug': 'shoulders',
  'dumbbell shoulder press': 'shoulders', 'face pulls': 'shoulders',
  'reverse fly': 'shoulders', 'rear delt': 'shoulders',
  'squat': 'legs', 'back squat': 'legs', 'front squat': 'legs', 'goblet squat': 'legs',
  'leg press': 'legs', 'lunge': 'legs', 'lunges': 'legs', 'walking lunge': 'legs',
  'leg extension': 'legs', 'leg curl': 'legs', 'hamstring curl': 'legs',
  'calf raise': 'legs', 'romanian deadlift': 'legs', 'rdl': 'legs',
  'hip thrust': 'legs', 'glute bridge': 'legs', 'bulgarian split squat': 'legs',
  'hack squat': 'legs', 'step up': 'legs', 'box squat': 'legs',
  'sumo deadlift': 'legs',
  'bicep curl': 'arms', 'hammer curl': 'arms', 'barbell curl': 'arms',
  'preacher curl': 'arms', 'concentration curl': 'arms', 'cable curl': 'arms',
  'tricep pushdown': 'arms', 'tricep extension': 'arms', 'skull crusher': 'arms',
  'overhead tricep extension': 'arms', 'close grip bench': 'arms',
  'tricep dip': 'arms', 'kickback': 'arms', 'dumbbell curl': 'arms',
  'incline curl': 'arms', 'spider curl': 'arms', 'ez bar curl': 'arms',
  'plank': 'core', 'crunch': 'core', 'sit up': 'core', 'sit-up': 'core',
  'russian twist': 'core', 'leg raise': 'core', 'hanging leg raise': 'core',
  'ab wheel': 'core', 'cable crunch': 'core', 'mountain climber': 'core',
  'dead bug': 'core', 'bird dog': 'core', 'woodchop': 'core',
  'running': 'cardio', 'cycling': 'cardio', 'rowing': 'cardio', 'jump rope': 'cardio',
  'burpee': 'cardio', 'jumping jack': 'cardio', 'box jump': 'cardio',
}

function getMuscleGroup(name) {
  const lower = name.toLowerCase().trim()
  if (EXERCISE_MUSCLES[lower]) return EXERCISE_MUSCLES[lower]
  for (const [key, muscle] of Object.entries(EXERCISE_MUSCLES)) {
    if (lower.includes(key) || key.includes(lower)) return muscle
  }
  if (lower.includes('chest') || lower.includes('bench') || lower.includes('fly') || lower.includes('push')) return 'chest'
  if (lower.includes('back') || lower.includes('row') || lower.includes('pull') || lower.includes('lat')) return 'back'
  if (lower.includes('shoulder') || lower.includes('delt') || lower.includes('lateral')) return 'shoulders'
  if (lower.includes('squat') || lower.includes('leg') || lower.includes('lunge') || lower.includes('calf') || lower.includes('glute') || lower.includes('hip')) return 'legs'
  if (lower.includes('curl') || lower.includes('bicep') || lower.includes('tricep') || lower.includes('arm')) return 'arms'
  if (lower.includes('core') || lower.includes('ab') || lower.includes('crunch') || lower.includes('plank')) return 'core'
  if (lower.includes('cardio') || lower.includes('run') || lower.includes('jump')) return 'cardio'
  return 'default'
}

export default function ExerciseImage({ name, size = 80 }) {
  if (!name) {
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

  const muscle = getMuscleGroup(name)
  const imgUrl = MUSCLE_IMAGES[muscle] || MUSCLE_IMAGES.default

  return (
    <img
      src={imgUrl}
      alt={name}
      loading="lazy"
      style={{
        width: size, height: size, borderRadius: 10,
        objectFit: 'cover', flexShrink: 0,
        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--br)',
      }}
      onError={(e) => { e.target.style.display = 'none' }}
    />
  )
}