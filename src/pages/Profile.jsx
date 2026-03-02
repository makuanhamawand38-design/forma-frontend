import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'
import { Zap } from '../components/Icons'

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

const GOALS = [
  { id: "muscle", label: "Bygga muskler" },
  { id: "weight_loss", label: "Gå ner i vikt" },
  { id: "endurance", label: "Uthållighet" },
  { id: "health", label: "Allmän hälsa" },
]

const EXPERIENCE = [
  { id: "beginner", label: "Nybörjare" },
  { id: "intermediate", label: "Mellan" },
  { id: "advanced", label: "Avancerad" },
]

const EQUIPMENT = [
  { id: "gym", label: "Gym" },
  { id: "home", label: "Hemma" },
  { id: "minimal", label: "Minimal" },
]

const DIET_TYPES = [
  { id: "none", label: "Inga restriktioner" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "lactose_free", label: "Laktosfri" },
  { id: "gluten_free", label: "Glutenfri" },
]

const CITIES = [
  "Stockholm", "Göteborg", "Malmö", "Uppsala", "Linköping",
  "Örebro", "Västerås", "Helsingborg", "Norrköping", "Jönköping",
  "Umeå", "Lund", "Borås", "Sundsvall", "Gävle",
]

const SPORTS = [
  "Gym", "Löpning", "Fotboll", "Cykling", "Basket", "Simning",
  "Padel", "Kampsport", "Klättring", "Tennis", "Yoga", "CrossFit",
  "Dans", "Vandring", "Skidåkning", "Annat",
]

const PRODUCT_NAMES = {
  training: "Träningsprogram",
  nutrition: "Kostschema",
  bundle: "Kombipaket",
}

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [goal, setGoal] = useState('')
  const [experience, setExperience] = useState('')
  const [trainingDays, setTrainingDays] = useState(4)
  const [equipment, setEquipment] = useState('')
  const [injuries, setInjuries] = useState('')
  const [avoidExercises, setAvoidExercises] = useState('')
  const [dietType, setDietType] = useState('none')
  const [allergies, setAllergies] = useState('')
  const [preferences, setPreferences] = useState('')
  const [displayNamePublic, setDisplayNamePublic] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [usernameStatus, setUsernameStatus] = useState('idle')
  const [usernameHint, setUsernameHint] = useState('')
  const [editingUsername, setEditingUsername] = useState(false)
  const [savingUsername, setSavingUsername] = useState(false)
  const [usernameChangedAt, setUsernameChangedAt] = useState(null)
  const debounceRef = useRef(null)
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [gym, setGym] = useState('')
  const [sports, setSports] = useState([])

  useEffect(() => {
    api.getProfile().then(p => {
      setProfile(p)
      setFirstName(p.first_name || '')
      setLastName(p.last_name || '')
      setDisplayNamePublic(p.display_name_public || false)
      setUsernameChangedAt(p.username_changed_at || null)
      setBio(p.bio || '')
      setCity(p.city || '')
      setGym(p.gym || '')
      setSports(p.sports || [])
      setGender(p.gender || '')
      setAge(p.age || '')
      setWeight(p.current_weight || '')
      setHeight(p.height || '')
      setGoal(p.goal || '')
      setExperience(p.experience || '')
      setTrainingDays(p.training_days || 4)
      setEquipment(p.equipment || '')
      setInjuries(p.injuries || '')
      setAvoidExercises(p.avoid_exercises || '')
      setDietType(p.diet_type || 'none')
      setAllergies(p.allergies || '')
      setPreferences(p.preferences || '')
    }).catch(() => {})
    api.getOrders().then(setOrders).catch(() => {})
  }, [])

  const toggleSport = (s) => {
    if (sports.includes(s)) {
      setSports(sports.filter(x => x !== s))
    } else if (sports.length < 5) {
      setSports([...sports, s])
    }
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const v = usernameInput.trim().toLowerCase()
    if (!v) { setUsernameStatus('idle'); setUsernameHint(''); return }
    if (!USERNAME_RE.test(v)) {
      setUsernameStatus('invalid')
      if (v.length < 3) setUsernameHint('Minst 3 tecken')
      else if (v.length > 20) setUsernameHint('Max 20 tecken')
      else setUsernameHint('Bara a–z, 0–9 och understreck')
      return
    }
    if (profile?.username && v === profile.username) {
      setUsernameStatus('idle'); setUsernameHint(''); return
    }
    setUsernameStatus('checking'); setUsernameHint('')
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.checkUsername(v)
        if (data.available) { setUsernameStatus('available'); setUsernameHint('@' + v + ' är ledigt!') }
        else { setUsernameStatus('taken'); setUsernameHint(data.reason || 'Redan taget') }
      } catch { setUsernameStatus('idle'); setUsernameHint('') }
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [usernameInput])

  const canChangeUsername = () => {
    if (!usernameChangedAt) return true
    const next = new Date(usernameChangedAt)
    next.setDate(next.getDate() + 30)
    return new Date() >= next
  }

  const nextUsernameChangeDate = () => {
    if (!usernameChangedAt) return null
    const next = new Date(usernameChangedAt)
    next.setDate(next.getDate() + 30)
    return next.toLocaleDateString('sv-SE')
  }

  const saveUsername = async () => {
    setSavingUsername(true)
    try {
      const res = await api.setUsername(usernameInput.trim().toLowerCase())
      const p = await api.getProfile()
      setProfile(p)
      setUsernameChangedAt(p.username_changed_at)
      setEditingUsername(false)
      setUsernameInput('')
      setUsernameStatus('idle')
      setUsernameHint('')
    } catch (err) { alert(err.message) }
    setSavingUsername(false)
  }

  const save = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const data = {
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        display_name_public: displayNamePublic,
        bio: bio || undefined,
        city: city || undefined,
        gym: gym || undefined,
        sports: sports,
        gender: gender || undefined,
        age: age ? parseInt(age) : undefined,
        current_weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        goal: goal || undefined,
        experience: experience || undefined,
        training_days: trainingDays || undefined,
        equipment: equipment || undefined,
        injuries: injuries || undefined,
        avoid_exercises: avoidExercises || undefined,
        diet_type: dietType || undefined,
        allergies: allergies || undefined,
        preferences: preferences || undefined,
      }
      Object.keys(data).forEach(k => data[k] === undefined && delete data[k])
      await api.updateProfile(data)
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) { alert(err.message) }
    setSaving(false)
  }

  const SelectBtn = ({ selected, onClick, label }) => (
    <button onClick={onClick} disabled={!editing} style={{
      padding: '10px 14px', borderRadius: 10, cursor: editing ? 'pointer' : 'default', fontFamily: 'var(--f)', fontSize: 13, fontWeight: 500,
      background: selected ? 'rgba(255,69,0,0.15)' : 'var(--b)',
      border: selected ? '2px solid var(--a)' : '1px solid var(--br)',
      color: selected ? 'var(--a)' : 'var(--t)',
      opacity: editing ? 1 : 0.8, transition: 'all 0.2s',
    }}>
      {label}
    </button>
  )

  return (
    <div>
      <Nav />
      <div className="dash-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 className="dash-title" style={{ margin: 0 }}>Mitt Konto</h1>
          {profile && !editing && (
            <button onClick={() => setEditing(true)} style={{
              padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 14, fontWeight: 600,
              background: 'rgba(255,69,0,0.1)', border: '1px solid rgba(255,69,0,0.2)', color: 'var(--a)',
            }}>
              ✏️ Redigera profil
            </button>
          )}
        </div>

        {saved && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>Profil uppdaterad!</span>
          </div>
        )}

        {profile ? (
          <div className="profile-grid">
            <div>
              <div className="profile-card" style={{ marginBottom: 24 }}>
                <h3>Personlig info</h3>

                <div className="profile-field">
                  <div className="profile-label">Användarnamn</div>
                  {!profile.username || editingUsername ? (
                    <div>
                      <div style={{ position: 'relative' }}>
                        <span style={{
                          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                          color: 'var(--a)', fontWeight: 700, fontSize: 16, pointerEvents: 'none',
                        }}>@</span>
                        <input
                          type="text"
                          className="profile-input"
                          style={{
                            paddingLeft: 30, paddingRight: 44,
                            borderColor:
                              usernameStatus === 'available' ? '#22c55e' :
                              (usernameStatus === 'taken' || usernameStatus === 'invalid') ? '#ef4444' : undefined,
                          }}
                          placeholder="ditt_namn"
                          value={usernameInput}
                          onChange={e => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          maxLength={20}
                          autoComplete="off"
                          autoCapitalize="none"
                          spellCheck={false}
                        />
                        {['checking', 'available', 'taken'].includes(usernameStatus) && (
                          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                            {usernameStatus === 'checking' && <span style={{
                              display: 'inline-block', width: 16, height: 16,
                              border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'var(--a)',
                              borderRadius: '50%', animation: 'spin .7s linear infinite',
                            }} />}
                            {usernameStatus === 'available' && (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>
                            )}
                            {usernameStatus === 'taken' && (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            )}
                          </span>
                        )}
                      </div>
                      {usernameHint && (
                        <p style={{
                          fontSize: 13, marginTop: 6, marginBottom: 0,
                          color: usernameStatus === 'available' ? '#22c55e' : usernameStatus === 'taken' || usernameStatus === 'invalid' ? '#ef4444' : 'var(--ts)',
                        }}>{usernameHint}</p>
                      )}
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button
                          onClick={saveUsername}
                          disabled={savingUsername || usernameStatus !== 'available'}
                          style={{
                            padding: '8px 20px', borderRadius: 8, cursor: usernameStatus === 'available' ? 'pointer' : 'default',
                            fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600,
                            background: usernameStatus === 'available' ? 'var(--a)' : 'var(--br)', border: 'none', color: '#fff',
                            opacity: usernameStatus === 'available' ? 1 : 0.5,
                          }}
                        >
                          {savingUsername ? 'Sparar...' : 'Spara användarnamn'}
                        </button>
                        {profile.username && (
                          <button
                            onClick={() => { setEditingUsername(false); setUsernameInput(''); setUsernameStatus('idle'); setUsernameHint('') }}
                            style={{
                              padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                              fontFamily: 'var(--f)', fontSize: 13, fontWeight: 500,
                              background: 'none', border: '1px solid var(--br)', color: 'var(--ts)',
                            }}
                          >
                            Avbryt
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="profile-val" style={{ color: 'var(--a)', fontWeight: 600, margin: 0 }}>@{profile.username}</div>
                      {canChangeUsername() ? (
                        <button
                          onClick={() => setEditingUsername(true)}
                          style={{
                            padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
                            fontFamily: 'var(--f)', fontSize: 12, fontWeight: 500,
                            background: 'none', border: '1px solid var(--br)', color: 'var(--ts)',
                          }}
                        >
                          Byt användarnamn
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--td)' }}>
                          Kan bytas {nextUsernameChangeDate()}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="profile-field">
                  <div className="profile-label">Bio <span style={{ fontSize: 11, color: 'var(--td)', fontWeight: 400 }}>({bio.length}/150)</span></div>
                  {editing ? (
                    <textarea className="profile-input" value={bio} onChange={e => e.target.value.length <= 150 && setBio(e.target.value)} placeholder="Berätta kort om dig själv..."
                      style={{ minHeight: 60, resize: 'vertical', fontFamily: 'var(--f)' }} />
                  ) : (
                    <div className="profile-val">{bio || 'Ej angivet'}</div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="profile-field">
                    <div className="profile-label">Förnamn <span style={{ fontSize: 11, color: 'var(--td)', fontWeight: 400 }}>(valfritt)</span></div>
                    {editing ? (
                      <input type="text" className="profile-input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Johan" />
                    ) : (
                      <div className="profile-val">{firstName || 'Ej angivet'}</div>
                    )}
                  </div>
                  <div className="profile-field">
                    <div className="profile-label">Efternamn <span style={{ fontSize: 11, color: 'var(--td)', fontWeight: 400 }}>(valfritt)</span></div>
                    {editing ? (
                      <input type="text" className="profile-input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Andersson" />
                    ) : (
                      <div className="profile-val">{lastName || 'Ej angivet'}</div>
                    )}
                  </div>
                </div>

                <div className="profile-field">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div className="profile-label" style={{ marginBottom: 2 }}>Visa mitt namn</div>
                      <div style={{ fontSize: 12, color: 'var(--td)' }}>Visa för- och efternamn på din publika profil</div>
                    </div>
                    <button
                      onClick={() => editing && setDisplayNamePublic(!displayNamePublic)}
                      disabled={!editing}
                      style={{
                        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: editing ? 'pointer' : 'default',
                        background: displayNamePublic ? 'var(--a)' : 'var(--br)',
                        position: 'relative', transition: 'background .2s', flexShrink: 0,
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: 2, left: displayNamePublic ? 22 : 2,
                        width: 20, height: 20, borderRadius: '50%', background: '#fff',
                        transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                      }} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="profile-field">
                    <div className="profile-label">Stad</div>
                    {editing ? (
                      <select className="profile-input" value={city} onChange={e => setCity(e.target.value)}
                        style={{ fontFamily: 'var(--f)', fontSize: 14 }}>
                        <option value="">Välj stad...</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (
                      <div className="profile-val">{city || 'Ej angivet'}</div>
                    )}
                  </div>
                  <div className="profile-field">
                    <div className="profile-label">Gym</div>
                    {editing ? (
                      <input type="text" className="profile-input" value={gym} onChange={e => setGym(e.target.value)} placeholder="T.ex. SATS Odenplan" />
                    ) : (
                      <div className="profile-val">{gym || 'Ej angivet'}</div>
                    )}
                  </div>
                </div>

                <div className="profile-field">
                  <div className="profile-label">Sporter <span style={{ fontSize: 11, color: 'var(--td)', fontWeight: 400 }}>(välj 1–5)</span></div>
                  {editing ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {SPORTS.map(s => (
                        <button key={s} onClick={() => toggleSport(s)} style={{
                          padding: '6px 12px', borderRadius: 20, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 500,
                          background: sports.includes(s) ? 'rgba(255,69,0,0.15)' : 'var(--b)',
                          border: sports.includes(s) ? '2px solid var(--a)' : '1px solid var(--br)',
                          color: sports.includes(s) ? 'var(--a)' : 'var(--t)',
                          opacity: !sports.includes(s) && sports.length >= 5 ? 0.4 : 1,
                          transition: 'all 0.2s',
                        }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {sports.length > 0 ? sports.map(s => (
                        <span key={s} style={{
                          padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                          background: 'rgba(255,69,0,0.1)', color: 'var(--a)', border: '1px solid rgba(255,69,0,0.2)',
                        }}>{s}</span>
                      )) : <div className="profile-val">Inga valda</div>}
                    </div>
                  )}
                </div>

                <div className="profile-field">
                  <div className="profile-label">E-post</div>
                  <div className="profile-val">{profile.email}</div>
                </div>

                <div className="profile-field">
                  <div className="profile-label">Kön</div>
                  {editing ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <SelectBtn selected={gender === 'man'} onClick={() => setGender('man')} label="Man" />
                      <SelectBtn selected={gender === 'kvinna'} onClick={() => setGender('kvinna')} label="Kvinna" />
                    </div>
                  ) : (
                    <div className="profile-val">{gender === 'man' ? 'Man' : gender === 'kvinna' ? 'Kvinna' : 'Ej angivet'}</div>
                  )}
                </div>

                <div className="profile-field">
                  <div className="profile-label">Ålder</div>
                  {editing ? (
                    <input type="number" className="profile-input" value={age} onChange={e => setAge(e.target.value)} placeholder="25" />
                  ) : (
                    <div className="profile-val">{age ? `${age} år` : 'Ej angivet'}</div>
                  )}
                </div>

                <div className="profile-field">
                  <div className="profile-label">Längd</div>
                  {editing ? (
                    <input type="number" className="profile-input" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" />
                  ) : (
                    <div className="profile-val">{height ? `${height} cm` : 'Ej angivet'}</div>
                  )}
                </div>

                <div className="profile-field">
                  <div className="profile-label">Nuvarande vikt</div>
                  {editing ? (
                    <input type="number" className="profile-input" value={weight} onChange={e => setWeight(e.target.value)} placeholder="75" />
                  ) : (
                    <div className="profile-val">{weight ? `${weight} kg` : 'Ej angivet'}</div>
                  )}
                </div>
              </div>

              <div className="profile-card">
                <h3>Kost & Hälsa</h3>

                <div className="profile-field">
                  <div className="profile-label">Kostrestriktioner</div>
                  {editing ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {DIET_TYPES.map(d => (
                        <SelectBtn key={d.id} selected={dietType === d.id} onClick={() => setDietType(d.id)} label={d.label} />
                      ))}
                    </div>
                  ) : (
                    <div className="profile-val">{DIET_TYPES.find(d => d.id === dietType)?.label || 'Ej angivet'}</div>
                  )}
                </div>

                <div className="profile-field">
                  <div className="profile-label">Allergier</div>
                  {editing ? (
                    <textarea className="profile-input" value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="T.ex. nötter, skaldjur, ägg..."
                      style={{ minHeight: 50, resize: 'vertical', fontFamily: 'var(--f)' }} />
                  ) : (
                    <div className="profile-val">{allergies || 'Inga'}</div>
                  )}
                </div>

                <div className="profile-field">
                  <div className="profile-label">Skador / begränsningar</div>
                  {editing ? (
                    <textarea className="profile-input" value={injuries} onChange={e => setInjuries(e.target.value)} placeholder="T.ex. ont i knät, skadad axel..."
                      style={{ minHeight: 50, resize: 'vertical', fontFamily: 'var(--f)' }} />
                  ) : (
                    <div className="profile-val">{injuries || 'Inga'}</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="profile-card" style={{ marginBottom: 24 }}>
                <h3>Träningsprofil</h3>

                <div className="profile-field">
                  <div className="profile-label">Mål</div>
                  {editing ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {GOALS.map(g => (
                        <SelectBtn key={g.id} selected={goal === g.id} onClick={() => setGoal(g.id)} label={g.label} />
                      ))}
                    </div>
                  ) : (
                    <div className="profile-val">{GOALS.find(g => g.id === goal)?.label || 'Ej angivet'}</div>
                  )}
                </div>

                <div className="profile-field">
                  <div className="profile-label">Erfarenhet</div>
                  {editing ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      {EXPERIENCE.map(e => (
                        <SelectBtn key={e.id} selected={experience === e.id} onClick={() => setExperience(e.id)} label={e.label} />
                      ))}
                    </div>
                  ) : (
                    <div className="profile-val">{EXPERIENCE.find(e => e.id === experience)?.label || 'Ej angivet'}</div>
                  )}
                </div>

                <div className="profile-field">
                  <div className="profile-label">Träningsdagar per vecka</div>
                  {editing ? (
                    <div>
                      <input type="range" min="2" max="7" value={trainingDays} onChange={e => setTrainingDays(parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--a)' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--td)' }}>
                        <span>2 dagar</span><span style={{ color: 'var(--a)', fontWeight: 600 }}>{trainingDays} dagar</span><span>7 dagar</span>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-val">{trainingDays ? `${trainingDays} dagar/vecka` : 'Ej angivet'}</div>
                  )}
                </div>

                <div className="profile-field">
                  <div className="profile-label">Utrustning</div>
                  {editing ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      {EQUIPMENT.map(e => (
                        <SelectBtn key={e.id} selected={equipment === e.id} onClick={() => setEquipment(e.id)} label={e.label} />
                      ))}
                    </div>
                  ) : (
                    <div className="profile-val">{EQUIPMENT.find(e => e.id === equipment)?.label || 'Ej angivet'}</div>
                  )}
                </div>

                <div className="profile-field">
                  <div className="profile-label">Övningar att undvika</div>
                  {editing ? (
                    <textarea className="profile-input" value={avoidExercises} onChange={e => setAvoidExercises(e.target.value)} placeholder="T.ex. marklyft, burpees..."
                      style={{ minHeight: 50, resize: 'vertical', fontFamily: 'var(--f)' }} />
                  ) : (
                    <div className="profile-val">{avoidExercises || 'Inga'}</div>
                  )}
                </div>

                <div className="profile-field">
                  <div className="profile-label">Övriga önskemål</div>
                  {editing ? (
                    <textarea className="profile-input" value={preferences} onChange={e => setPreferences(e.target.value)} placeholder="T.ex. vill träna på morgonen..."
                      style={{ minHeight: 50, resize: 'vertical', fontFamily: 'var(--f)' }} />
                  ) : (
                    <div className="profile-val">{preferences || 'Inga'}</div>
                  )}
                </div>
              </div>

              {profile.subscription_status === 'active' && (
                <div className="profile-card" style={{ marginBottom: 24 }}>
                  <h3>Prenumeration</h3>
                  <div style={{ background: 'rgba(255,69,0,0.1)', border: '1px solid rgba(255,69,0,0.2)', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Zap size={20} />
                        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--a)' }}>FORMA Pro</span>
                      </div>
                      <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: profile.subscription_cancel_at_period_end ? 'rgba(255,200,0,0.1)' : 'rgba(34,197,94,0.1)', color: profile.subscription_cancel_at_period_end ? '#f59e0b' : '#22c55e', fontWeight: 600 }}>
                        {profile.subscription_cancel_at_period_end ? 'Avslutas vid periodens slut' : 'Aktiv'}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ts)', marginBottom: 12 }}>
                      {profile.subscription_type === 'pro_yearly' ? '149 kr/mån (årsplan)' : '199 kr/mån'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ts)', lineHeight: 1.6 }}>
                      ✓ Nytt program varje månad<br/>
                      ✓ Träning + kost inkluderat<br/>
                      ✓ Automatisk progression
                    </div>
                    {!profile.subscription_cancel_at_period_end && (
                      <button onClick={async () => { if (confirm('Vill du avsluta din prenumeration? Den gäller till periodens slut.')) { try { await api.cancelSubscription(); const p = await api.getProfile(); setProfile(p) } catch(e) { alert(e.message) }}}} style={{
                        background: 'none', border: '1px solid var(--br)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
                        fontFamily: 'var(--f)', fontSize: 12, color: 'var(--td)', marginTop: 12,
                      }}>
                        Avsluta prenumeration
                      </button>
                    )}
                  </div>
                </div>
              )}

              {profile.has_discount && (
                <div className="profile-card" style={{ marginBottom: 24 }}>
                  <h3>Rabattstatus</h3>
                  <div style={{ background: 'rgba(255,69,0,0.1)', border: '1px solid rgba(255,69,0,0.2)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Zap size={24} />
                    <div><div style={{ fontWeight: 600, marginBottom: 2 }}>20% rabatt tillgänglig!</div><div style={{ fontSize: 13, color: 'var(--ts)' }}>Från slutfört program. Gäller nästa köp.</div></div>
                  </div>
                </div>
              )}

              {orders.length > 0 && (
                <div className="profile-card">
                  <h3>Orderhistorik</h3>
                  {orders.map((o, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < orders.length - 1 ? '1px solid var(--br)' : 'none' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--t)' }}>{PRODUCT_NAMES[o.product_type] || o.product_type}</div>
                        <div style={{ fontSize: 12, color: 'var(--td)' }}>{new Date(o.created_at).toLocaleDateString('sv-SE')}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontWeight: 600, color: 'var(--t)' }}>{o.amount_sek} SEK</span>
                        <span style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, background: o.payment_status === 'paid' ? 'rgba(34,197,94,0.1)' : 'rgba(255,69,0,0.1)', color: o.payment_status === 'paid' ? '#22c55e' : 'var(--a)' }}>
                          {o.payment_status === 'paid' ? 'Betald' : o.payment_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 48 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        )}

        {editing && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, paddingBottom: 48 }}>
            <button onClick={() => setEditing(false)} style={{
              padding: '12px 32px', borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 14, fontWeight: 600,
              background: 'var(--b)', border: '1px solid var(--br)', color: 'var(--ts)',
            }}>
              Avbryt
            </button>
            <button className="auth-btn" onClick={save} disabled={saving} style={{ maxWidth: 240 }}>
              {saving ? <span className="spinner" /> : '💾 Spara ändringar'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
