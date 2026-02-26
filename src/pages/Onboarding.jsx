import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { Zap, productIcon } from '../components/Icons'

const PRODUCTS = {
  training: { name: "4 Veckors Träningsprogram", price: 349, weeks: 4 },
  nutrition: { name: "4 Veckors Kostschema", price: 349, weeks: 4 },
  bundle: { name: "8 Veckors Träning + Kost", price: 799, weeks: 8 },
}

const GOALS = [
  { id: "muscle", label: "Bygga muskler", desc: "Öka muskelmassa och styrka", icon: "💪" },
  { id: "weight_loss", label: "Gå ner i vikt", desc: "Bränna fett och bli smalare", icon: "🔥" },
  { id: "endurance", label: "Uthållighet", desc: "Förbättra kondition och energi", icon: "🏃" },
  { id: "health", label: "Allmän hälsa", desc: "Må bättre och bli starkare", icon: "❤️" },
]

const EXPERIENCE = [
  { id: "beginner", label: "Nybörjare", desc: "0–1 år träning" },
  { id: "intermediate", label: "Mellan", desc: "1–3 år träning" },
  { id: "advanced", label: "Avancerad", desc: "3+ år träning" },
]

const EQUIPMENT = [
  { id: "gym", label: "Gym", desc: "Tillgång till fullt gym" },
  { id: "home", label: "Hemma", desc: "Hantlar och basredskap" },
  { id: "minimal", label: "Minimal", desc: "Endast kroppsvikt" },
]

const DIET_TYPES = [
  { id: "none", label: "Inga restriktioner", desc: "Jag äter allt" },
  { id: "vegetarian", label: "Vegetarian", desc: "Ingen kött eller fisk" },
  { id: "vegan", label: "Vegan", desc: "Helt växtbaserat" },
  { id: "lactose_free", label: "Laktosfri", desc: "Undviker mjölkprodukter" },
  { id: "gluten_free", label: "Glutenfri", desc: "Undviker gluten" },
]

export default function Onboarding() {
  const nav = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const params = new URLSearchParams(location.search)
  const productId = params.get('product') || 'training'
  const product = PRODUCTS[productId] || PRODUCTS.training
  const isNutrition = productId === 'nutrition' || productId === 'bundle'
  const isTraining = productId === 'training' || productId === 'bundle'

  const [gender, setGender] = useState('man')
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [goal, setGoal] = useState('')
  const [experience, setExperience] = useState('')
  const [trainingDays, setTrainingDays] = useState(4)
  const [equipment, setEquipment] = useState('gym')
  const [injuries, setInjuries] = useState('')
  const [avoidExercises, setAvoidExercises] = useState('')
  const [dietType, setDietType] = useState('none')
  const [allergies, setAllergies] = useState('')
  const [preferences, setPreferences] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [guestMode, setGuestMode] = useState(false)

  const canStep1 = gender && age && weight && height
  const canStep2 = goal && experience && equipment
  const canPayLoggedIn = canStep2
  const canPayGuest = canStep2 && email

  const profileData = {
    gender,
    age: parseInt(age),
    current_weight: parseFloat(weight),
    height: parseFloat(height),
    goal,
    experience,
    training_days: trainingDays,
    equipment,
    injuries: injuries || null,
    avoid_exercises: avoidExercises || null,
    diet_type: dietType,
    allergies: allergies || null,
    preferences: preferences || null,
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      if (user) {
        await api.updateProfile(profileData)
        const data = await api.createCheckout(productId)
        window.location.href = data.checkout_url
      } else {
        const data = await api.guestCheckoutWithProfile(productId, email, profileData)
        window.location.href = data.checkout_url
      }
    } catch (err) {
      alert(err.message)
    }
    setLoading(false)
  }

  const SelectCard = ({ selected, onClick, label, desc, icon, small }) => (
    <button onClick={onClick} style={{
      padding: small ? '14px 8px' : '16px 12px', borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--f)', textAlign: 'center',
      background: selected ? 'rgba(255,69,0,0.15)' : 'var(--b)',
      border: selected ? '2px solid var(--a)' : '1px solid var(--br)',
      color: 'var(--t)', transition: 'all 0.2s',
    }}>
      {icon && <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>}
      <div style={{ fontWeight: 600, fontSize: small ? 13 : 14, marginBottom: desc ? 4 : 0 }}>{label}</div>
      {desc && <div style={{ fontSize: small ? 11 : 12, color: selected ? 'var(--a)' : 'var(--ts)', lineHeight: 1.3 }}>{desc}</div>}
    </button>
  )

  // Determine total steps: 4 if not logged in (extra account step), 3 if logged in
  const totalSteps = user ? 3 : 4
  const progressStep = step

  return (
    <div className="auth-page">
      <div style={{ width: '100%', maxWidth: 560, padding: '0 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32, cursor: 'pointer' }} onClick={() => nav('/')}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <div className="logo-icon"><Zap size={24} /></div>
            <span className="logo-text">FORMA</span>
          </div>
        </div>

        {/* Back */}
        <button onClick={() => {
          if (step === 1) nav(-1)
          else if (step === 4 && !guestMode) setStep(3)
          else if (step === 4 && guestMode) { setGuestMode(false); setStep(3) }
          else setStep(step - 1)
        }} style={{ background: 'none', border: 'none', color: 'var(--ts)', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: 0 }}>
          ← Tillbaka
        </button>

        {/* Product badge */}
        <div style={{ background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,69,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--a)' }}>{productIcon(productId, 20)}</div>
            <div><div style={{ fontWeight: 600, color: 'var(--t)' }}>{product.name}</div><div style={{ fontSize: 13, color: 'var(--ts)' }}>{product.price} SEK</div></div>
          </div>
          <button onClick={() => nav('/')} style={{ background: 'none', border: 'none', color: 'var(--ts)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--f)' }}>Ändra</button>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: progressStep >= i + 1 ? 'var(--a)' : 'var(--br)' }} />
          ))}
        </div>

        <div className="auth-box" style={{ maxWidth: 560 }}>

          {/* ========== STEG 1: Personlig info ========== */}
          {step === 1 && (
            <>
              <h1 className="auth-title" style={{ fontSize: 22 }}>Anpassa ditt program</h1>
              <p className="auth-sub">Steg 1 av {totalSteps} — Berätta om dig</p>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--br)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--t)', marginBottom: 16 }}>Dina uppgifter</h3>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, color: 'var(--ts)', marginBottom: 8, display: 'block' }}>Kön</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['man', 'kvinna'].map(g => (
                      <button key={g} onClick={() => setGender(g)} style={{
                        flex: 1, padding: '12px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 14, fontWeight: 500,
                        background: gender === g ? 'rgba(255,69,0,0.15)' : 'var(--b)',
                        border: gender === g ? '2px solid var(--a)' : '1px solid var(--br)',
                        color: gender === g ? 'var(--a)' : 'var(--t)',
                      }}>
                        {g === 'man' ? 'Man' : 'Kvinna'}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, color: 'var(--ts)', marginBottom: 6, display: 'block' }}>Ålder</label>
                    <input type="number" className="auth-input" placeholder="25" value={age} onChange={e => setAge(e.target.value)} style={{ margin: 0 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: 'var(--ts)', marginBottom: 6, display: 'block' }}>Vikt (kg)</label>
                    <input type="number" className="auth-input" placeholder="75" value={weight} onChange={e => setWeight(e.target.value)} style={{ margin: 0 }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, color: 'var(--ts)', marginBottom: 6, display: 'block' }}>Längd (cm)</label>
                  <input type="number" className="auth-input" placeholder="175" value={height} onChange={e => setHeight(e.target.value)} style={{ margin: 0 }} />
                </div>
              </div>

              <button className="auth-btn" onClick={() => canStep1 && setStep(2)} disabled={!canStep1} style={{ opacity: canStep1 ? 1 : 0.5 }}>
                Fortsätt <span style={{ marginLeft: 4 }}>→</span>
              </button>
            </>
          )}

          {/* ========== STEG 2: Träningsmål ========== */}
          {step === 2 && (
            <>
              <h1 className="auth-title" style={{ fontSize: 22 }}>Dina träningsmål</h1>
              <p className="auth-sub">Steg 2 av {totalSteps} — Mål och erfarenhet</p>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)', marginBottom: 12, display: 'block' }}>Vad är ditt mål?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {GOALS.map(g => (
                    <SelectCard key={g.id} selected={goal === g.id} onClick={() => setGoal(g.id)} label={g.label} desc={g.desc} icon={g.icon} />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)', marginBottom: 12, display: 'block' }}>Din erfarenhetsnivå</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {EXPERIENCE.map(e => (
                    <SelectCard key={e.id} selected={experience === e.id} onClick={() => setExperience(e.id)} label={e.label} desc={e.desc} small />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)', marginBottom: 12, display: 'block' }}>
                  Träningsdagar per vecka: <span style={{ color: 'var(--a)' }}>{trainingDays}</span>
                </label>
                <input type="range" min="2" max="7" value={trainingDays} onChange={e => setTrainingDays(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--a)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--td)', marginTop: 4 }}>
                  <span>2 dagar</span><span>7 dagar</span>
                </div>
              </div>

              {isTraining && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)', marginBottom: 12, display: 'block' }}>Utrustning</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    {EQUIPMENT.map(e => (
                      <SelectCard key={e.id} selected={equipment === e.id} onClick={() => setEquipment(e.id)} label={e.label} desc={e.desc} small />
                    ))}
                  </div>
                </div>
              )}

              <button className="auth-btn" onClick={() => canStep2 && setStep(3)} disabled={!canStep2} style={{ opacity: canStep2 ? 1 : 0.5 }}>
                Fortsätt <span style={{ marginLeft: 4 }}>→</span>
              </button>
            </>
          )}

          {/* ========== STEG 3: Anpassningar ========== */}
          {step === 3 && (
            <>
              <h1 className="auth-title" style={{ fontSize: 22 }}>Sista anpassningar</h1>
              <p className="auth-sub">Steg 3 av {totalSteps} — Nästan klart!</p>

              {isTraining && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)', marginBottom: 8, display: 'block' }}>Har du några skador eller begränsningar?</label>
                  <p style={{ fontSize: 12, color: 'var(--ts)', marginBottom: 8 }}>T.ex. "Ont i knät", "Skadad axel" — lämna tomt om nej</p>
                  <textarea className="auth-input" placeholder="Beskriv eventuella skador..." value={injuries} onChange={e => setInjuries(e.target.value)}
                    style={{ margin: 0, minHeight: 70, resize: 'vertical', fontFamily: 'var(--f)' }} />
                </div>
              )}

              {isTraining && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)', marginBottom: 8, display: 'block' }}>Övningar du vill undvika?</label>
                  <p style={{ fontSize: 12, color: 'var(--ts)', marginBottom: 8 }}>T.ex. "Marklyft", "Burpees" — lämna tomt om inga</p>
                  <textarea className="auth-input" placeholder="Övningar att undvika..." value={avoidExercises} onChange={e => setAvoidExercises(e.target.value)}
                    style={{ margin: 0, minHeight: 70, resize: 'vertical', fontFamily: 'var(--f)' }} />
                </div>
              )}

              {isNutrition && (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)', marginBottom: 12, display: 'block' }}>Kostrestriktioner</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {DIET_TYPES.map(d => (
                        <SelectCard key={d.id} selected={dietType === d.id} onClick={() => setDietType(d.id)} label={d.label} desc={d.desc} small />
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)', marginBottom: 8, display: 'block' }}>Allergier eller matintoleranser?</label>
                    <textarea className="auth-input" placeholder="T.ex. nötter, skaldjur, ägg..." value={allergies} onChange={e => setAllergies(e.target.value)}
                      style={{ margin: 0, minHeight: 60, resize: 'vertical', fontFamily: 'var(--f)' }} />
                  </div>
                </>
              )}

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)', marginBottom: 8, display: 'block' }}>Övriga önskemål</label>
                <p style={{ fontSize: 12, color: 'var(--ts)', marginBottom: 8 }}>Något annat vi bör veta? T.ex. "Jag jobbar natt", "Vill träna på morgonen"</p>
                <textarea className="auth-input" placeholder="Valfritt..." value={preferences} onChange={e => setPreferences(e.target.value)}
                  style={{ margin: 0, minHeight: 60, resize: 'vertical', fontFamily: 'var(--f)' }} />
              </div>

              {/* If logged in: go straight to payment summary */}
              {user ? (
                <>
                  {/* Sammanfattning */}
                  <div style={{ background: 'rgba(255,69,0,0.05)', border: '1px solid rgba(255,69,0,0.15)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--a)', marginBottom: 8 }}>Din profil</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 13, color: 'var(--ts)' }}>
                      <span>{gender === 'man' ? '👤 Man' : '👤 Kvinna'}, {age} år</span>
                      <span>⚖️ {weight} kg, {height} cm</span>
                      <span>🎯 {GOALS.find(g => g.id === goal)?.label}</span>
                      <span>📊 {EXPERIENCE.find(e => e.id === experience)?.label}</span>
                      <span>📅 {trainingDays} dagar/vecka</span>
                      <span>🏋️ {EQUIPMENT.find(e => e.id === equipment)?.label}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <span className="klarna-badge">Klarna.</span>
                    <span style={{ fontSize: 12, color: 'var(--td)', display: 'flex', alignItems: 'center' }}>Betala med kort eller Klarna</span>
                  </div>
                  <button className="auth-btn" onClick={handleCheckout} disabled={loading || !canPayLoggedIn} style={{ opacity: canPayLoggedIn ? 1 : 0.5 }}>
                    {loading ? <span className="spinner" /> : `Betala ${product.price} SEK`}
                  </button>
                  <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--td)' }}>Säker betalning via Stripe. Ditt program genereras direkt.</p>
                </>
              ) : (
                /* If NOT logged in: go to step 4 (account choice) */
                <button className="auth-btn" onClick={() => setStep(4)}>
                  Fortsätt <span style={{ marginLeft: 4 }}>→</span>
                </button>
              )}
            </>
          )}

          {/* ========== STEG 4: Konto-val (bara för utloggade) ========== */}
          {step === 4 && !user && (
            <>
              {!guestMode ? (
                <>
                  <h1 className="auth-title" style={{ fontSize: 22 }}>Hur vill du fortsätta?</h1>
                  <p className="auth-sub">Steg 4 av 4 — Välj ett alternativ</p>

                  {/* Option 1: Logga in / Skapa konto */}
                  <div onClick={() => nav(`/login?redirect=/onboarding?product=${productId}`)} style={{
                    background: 'rgba(255,69,0,0.08)', border: '2px solid rgba(255,69,0,0.3)', borderRadius: 14, padding: 20, marginBottom: 16, cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 28 }}>👤</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--t)' }}>Logga in eller skapa konto</div>
                        <div style={{ fontSize: 13, color: 'var(--a)', fontWeight: 600 }}>Rekommenderat</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ts)', lineHeight: 1.5, paddingLeft: 40 }}>
                      ✓ Följ din progress och logga vikter<br/>
                      ✓ Se ditt program i din dashboard<br/>
                      ✓ Få 20% rabatt på nästa köp<br/>
                      ✓ Köp nya svårare program efter avklarat
                    </div>
                  </div>

                  {/* Option 2: Köp som gäst */}
                  <div onClick={() => setGuestMode(true)} style={{
                    background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 14, padding: 20, cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 28 }}>📧</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--t)' }}>Köp som gäst</div>
                        <div style={{ fontSize: 13, color: 'var(--ts)' }}>Få programmet via mejl</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--td)', lineHeight: 1.5, paddingLeft: 40 }}>
                      Programmet skickas direkt till din e-post efter betalning.
                    </div>
                  </div>
                </>
              ) : (
                /* Guest mode: show email + payment */
                <>
                  <h1 className="auth-title" style={{ fontSize: 22 }}>Köp som gäst</h1>
                  <p className="auth-sub">Steg 4 av 4 — Ange din e-post</p>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)', marginBottom: 8, display: 'block' }}>E-post för leverans</label>
                    <input type="email" className="auth-input" placeholder="din@email.com" value={email} onChange={e => setEmail(e.target.value)} style={{ margin: 0 }} />
                  </div>

                  {/* Sammanfattning */}
                  <div style={{ background: 'rgba(255,69,0,0.05)', border: '1px solid rgba(255,69,0,0.15)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--a)', marginBottom: 8 }}>Din profil</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 13, color: 'var(--ts)' }}>
                      <span>{gender === 'man' ? '👤 Man' : '👤 Kvinna'}, {age} år</span>
                      <span>⚖️ {weight} kg, {height} cm</span>
                      <span>🎯 {GOALS.find(g => g.id === goal)?.label}</span>
                      <span>📊 {EXPERIENCE.find(e => e.id === experience)?.label}</span>
                      <span>📅 {trainingDays} dagar/vecka</span>
                      <span>🏋️ {EQUIPMENT.find(e => e.id === equipment)?.label}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <span className="klarna-badge">Klarna.</span>
                    <span style={{ fontSize: 12, color: 'var(--td)', display: 'flex', alignItems: 'center' }}>Betala med kort eller Klarna</span>
                  </div>

                  <button className="auth-btn" onClick={handleCheckout} disabled={loading || !canPayGuest} style={{ opacity: canPayGuest ? 1 : 0.5 }}>
                    {loading ? <span className="spinner" /> : `Betala ${product.price} SEK`}
                  </button>

                  <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--td)' }}>
                    Programmet skickas till din e-post efter betalning.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}