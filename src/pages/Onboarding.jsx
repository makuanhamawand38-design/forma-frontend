import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { Zap, Chv, productIcon } from '../components/Icons'

const PRODUCTS = {
  training: { name: "4 Veckors Träningsprogram", price: 349, weeks: 4 },
  nutrition: { name: "4 Veckors Kostschema", price: 349, weeks: 4 },
  bundle: { name: "8 Veckors Träning + Kost", price: 799, weeks: 8 },
}

const GOALS = [
  { id: "muscle", label: "Bygga muskler", desc: "Öka muskelmassa och styrka" },
  { id: "weight_loss", label: "Gå ner i vikt", desc: "Bränna fett och bli smalare" },
  { id: "endurance", label: "Uthållighet", desc: "Förbättra kondition och energi" },
  { id: "health", label: "Allmän hälsa", desc: "Må bättre och bli starkare" },
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

export default function Onboarding() {
  const nav = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const params = new URLSearchParams(location.search)
  const productId = params.get('product') || 'training'
  const product = PRODUCTS[productId] || PRODUCTS.training
  const isGuest = !user

  const [gender, setGender] = useState('man')
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [goal, setGoal] = useState('')
  const [experience, setExperience] = useState('')
  const [trainingDays, setTrainingDays] = useState(4)
  const [equipment, setEquipment] = useState('gym')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const canProceedStep1 = gender && age && weight && height
  const canProceedStep2 = goal && experience && equipment
  const canPay = isGuest ? (canProceedStep2 && email) : canProceedStep2

  const handleCheckout = async () => {
    if (!canPay) return
    setLoading(true)
    try {
      // Save profile data first (if logged in)
      if (user) {
        await api.updateProfile({
          gender,
          age: parseInt(age),
          current_weight: parseFloat(weight),
          height: parseFloat(height),
          goal,
          experience,
          training_days: trainingDays,
          equipment,
        })
        const data = await api.createCheckout(productId)
        window.location.href = data.checkout_url
      } else {
        // Guest checkout - store profile in metadata via backend
        const data = await api.guestCheckoutWithProfile(productId, email, {
          gender,
          age: parseInt(age),
          current_weight: parseFloat(weight),
          height: parseFloat(height),
          goal,
          experience,
          training_days: trainingDays,
          equipment,
        })
        window.location.href = data.checkout_url
      }
    } catch (err) {
      alert(err.message)
    }
    setLoading(false)
  }

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

        {/* Back button */}
        <button onClick={() => step === 1 ? nav(-1) : setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--ts)', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: 0 }}>
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

        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--a)' }} />
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: step >= 2 ? 'var(--a)' : 'var(--br)' }} />
        </div>

        <div className="auth-box" style={{ maxWidth: 560 }}>
          {step === 1 ? (
            <>
              <h1 className="auth-title" style={{ fontSize: 22 }}>Anpassa ditt program</h1>
              <p className="auth-sub">Berätta om dig så skapar vi det perfekta programmet</p>

              {/* Dina uppgifter */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--br)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--t)', marginBottom: 16 }}>Dina uppgifter</h3>

                {/* Kön */}
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

                {/* Ålder & Vikt */}
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

                {/* Längd */}
                <div>
                  <label style={{ fontSize: 13, color: 'var(--ts)', marginBottom: 6, display: 'block' }}>Längd (cm)</label>
                  <input type="number" className="auth-input" placeholder="175" value={height} onChange={e => setHeight(e.target.value)} style={{ margin: 0 }} />
                </div>
              </div>

              <button className="auth-btn" onClick={() => canProceedStep1 && setStep(2)} disabled={!canProceedStep1} style={{ opacity: canProceedStep1 ? 1 : 0.5 }}>
                Fortsätt <span style={{ marginLeft: 4 }}>→</span>
              </button>
            </>
          ) : (
            <>
              <h1 className="auth-title" style={{ fontSize: 22 }}>Dina träningsmål</h1>
              <p className="auth-sub">Steg 2 av 2 — vi är nästan klara!</p>

              {/* Mål */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)', marginBottom: 12, display: 'block' }}>Vad är ditt mål?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {GOALS.map(g => (
                    <button key={g.id} onClick={() => setGoal(g.id)} style={{
                      padding: '16px 12px', borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--f)', textAlign: 'left',
                      background: goal === g.id ? 'rgba(255,69,0,0.15)' : 'var(--b)',
                      border: goal === g.id ? '2px solid var(--a)' : '1px solid var(--br)',
                      color: 'var(--t)',
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{g.label}</div>
                      <div style={{ fontSize: 12, color: goal === g.id ? 'var(--a)' : 'var(--ts)', lineHeight: 1.3 }}>{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Erfarenhet */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)', marginBottom: 12, display: 'block' }}>Din erfarenhetsnivå</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {EXPERIENCE.map(e => (
                    <button key={e.id} onClick={() => setExperience(e.id)} style={{
                      padding: '16px 8px', borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--f)', textAlign: 'center',
                      background: experience === e.id ? 'rgba(255,69,0,0.15)' : 'var(--b)',
                      border: experience === e.id ? '2px solid var(--a)' : '1px solid var(--br)',
                      color: 'var(--t)',
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{e.label}</div>
                      <div style={{ fontSize: 11, color: experience === e.id ? 'var(--a)' : 'var(--ts)', lineHeight: 1.3 }}>{e.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Träningsdagar */}
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

              {/* Utrustning */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)', marginBottom: 12, display: 'block' }}>Utrustning</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {EQUIPMENT.map(e => (
                    <button key={e.id} onClick={() => setEquipment(e.id)} style={{
                      padding: '16px 8px', borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--f)', textAlign: 'center',
                      background: equipment === e.id ? 'rgba(255,69,0,0.15)' : 'var(--b)',
                      border: equipment === e.id ? '2px solid var(--a)' : '1px solid var(--br)',
                      color: 'var(--t)',
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{e.label}</div>
                      <div style={{ fontSize: 11, color: equipment === e.id ? 'var(--a)' : 'var(--ts)', lineHeight: 1.3 }}>{e.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* E-post för gäster */}
              {isGuest && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)', marginBottom: 8, display: 'block' }}>E-post för leverans</label>
                  <input type="email" className="auth-input" placeholder="din@email.com" value={email} onChange={e => setEmail(e.target.value)} style={{ margin: 0 }} />
                </div>
              )}

              {/* Klarna badge */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <span className="klarna-badge">Klarna.</span>
                <span style={{ fontSize: 12, color: 'var(--td)', display: 'flex', alignItems: 'center' }}>Betala med kort eller Klarna</span>
              </div>

              <button className="auth-btn" onClick={handleCheckout} disabled={loading || !canPay} style={{ opacity: canPay ? 1 : 0.5 }}>
                {loading ? <span className="spinner" /> : `Betala ${product.price} SEK`}
              </button>

              <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--td)' }}>
                Säker betalning via Stripe. Direkt leverans efter köp.
              </p>
            </>
          )}
        </div>

        {/* Login link for guests */}
        {isGuest && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--td)' }}>Har du konto? </span>
            <a onClick={() => nav('/login')} style={{ fontSize: 13, color: 'var(--a)', cursor: 'pointer' }}>Logga in</a>
          </div>
        )}
      </div>
    </div>
  )
}