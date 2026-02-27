import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'
import { Zap } from '../components/Icons'

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

  useEffect(() => {
    api.getProfile().then(p => {
      setProfile(p)
      setFirstName(p.first_name || '')
      setLastName(p.last_name || '')
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

  const save = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const data = {
        first_name: firstName || undefined,
        last_name: lastName || undefined,
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="profile-field">
                    <div className="profile-label">Förnamn</div>
                    {editing ? (
                      <input type="text" className="profile-input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Johan" />
                    ) : (
                      <div className="profile-val">{firstName || 'Ej angivet'}</div>
                    )}
                  </div>
                  <div className="profile-field">
                    <div className="profile-label">Efternamn</div>
                    {editing ? (
                      <input type="text" className="profile-input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Andersson" />
                    ) : (
                      <div className="profile-val">{lastName || 'Ej angivet'}</div>
                    )}
                  </div>
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