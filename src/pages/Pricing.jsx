import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { Check, Zap, Sparkle } from '../components/Icons'

const plans = [
  {
    key: 'free',
    name: 'Gratis',
    price: 0,
    period: '',
    description: 'Kom igång med grunderna',
    features: [
      'Profil & inställningar',
      'Flöde & utforska',
      'Gilla & kommentera',
      'Följa andra användare',
      'Grundleaderboard & XP',
    ],
  },
  {
    key: 'premium',
    name: 'Premium',
    price: 49,
    yearlyPrice: 37,
    period: '/mån',
    description: 'Mer social funktionalitet',
    popular: false,
    productType: 'premium_monthly',
    yearlyProductType: 'premium_yearly',
    features: [
      'Allt i Gratis',
      'Direktmeddelanden',
      'Tävlingar & utmaningar',
      'Hitta träningspartner',
      'Referral-program',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 199,
    yearlyPrice: 149,
    period: '/mån',
    description: 'Komplett träningsupplevelse',
    popular: true,
    productType: 'pro_monthly',
    yearlyProductType: 'pro_yearly',
    features: [
      'Allt i Premium',
      'Personliga träningsprogram',
      'Personliga kostscheman',
      'Byt övningar & måltider',
      'Exportera PDF',
    ],
  },
]

export default function Pricing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(null)
  const [yearly, setYearly] = useState(false)

  const currentLevel = user?.subscription_type || 'free'
  const levels = { free: 0, premium: 1, pro: 2 }

  const handleCheckout = async (plan) => {
    if (!user) {
      navigate('/register')
      return
    }
    const productType = yearly && plan.yearlyProductType ? plan.yearlyProductType : plan.productType
    setLoading(plan.key)
    try {
      const { checkout_url } = await api.createCheckout(productType)
      window.location.href = checkout_url
    } catch (e) {
      alert(e.message)
      setLoading(null)
    }
  }

  return (
    <>
      <Nav />
      <div style={{ minHeight: '100vh', padding: '80px 24px 96px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, letterSpacing: -1, marginBottom: 12 }}>
            Välj din plan
          </h1>
          <p style={{ color: 'var(--ts)', fontSize: 18, marginBottom: 40, maxWidth: 520, margin: '0 auto 40px' }}>
            Uppgradera för att låsa upp fler funktioner och nå dina mål snabbare.
          </p>

          {/* Yearly toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 48 }}>
            <span style={{ fontSize: 15, color: !yearly ? 'var(--t)' : 'var(--ts)', fontWeight: !yearly ? 600 : 400 }}>Månadsvis</span>
            <button
              onClick={() => setYearly(!yearly)}
              style={{
                width: 52, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
                background: yearly ? 'var(--a)' : 'var(--br)', position: 'relative', transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3, left: yearly ? 27 : 3, transition: 'left 0.2s',
              }} />
            </button>
            <span style={{ fontSize: 15, color: yearly ? 'var(--t)' : 'var(--ts)', fontWeight: yearly ? 600 : 400 }}>
              Årsvis
            </span>
            {yearly && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--suc)', background: 'rgba(34,197,94,0.15)', padding: '4px 10px', borderRadius: 999 }}>Billigare!</span>}
          </div>

          {/* Plan cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>
            {plans.map(plan => {
              const isCurrentPlan = currentLevel === plan.key
              const isLowerPlan = levels[plan.key] < levels[currentLevel]
              const displayPrice = yearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price
              const savingsPercent = yearly && plan.yearlyPrice ? Math.round((1 - plan.yearlyPrice / plan.price) * 100) : 0

              return (
                <div
                  key={plan.key}
                  style={{
                    background: 'var(--c)', border: plan.popular ? '2px solid var(--a)' : '1px solid var(--br)',
                    borderRadius: 20, padding: 32, position: 'relative', textAlign: 'left',
                    transform: plan.popular ? 'scale(1.02)' : 'none',
                    boxShadow: plan.popular ? '0 0 40px rgba(255,69,0,0.15)' : 'none',
                    transition: 'border-color 0.3s',
                  }}
                >
                  {plan.popular && (
                    <div style={{
                      position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                      background: 'var(--a)', color: '#fff', padding: '5px 16px', borderRadius: 999,
                      fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                    }}>
                      Populärast
                    </div>
                  )}

                  <div style={{ marginBottom: 24 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: plan.key === 'pro' ? 'rgba(255,69,0,0.15)' : plan.key === 'premium' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                      color: plan.key === 'pro' ? 'var(--a)' : plan.key === 'premium' ? '#8b5cf6' : 'var(--ts)',
                    }}>
                      {plan.key === 'pro' ? <Sparkle size={24} /> : plan.key === 'premium' ? <Zap size={24} /> : <Zap size={24} />}
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
                    <p style={{ color: 'var(--ts)', fontSize: 14 }}>{plan.description}</p>
                  </div>

                  <div style={{ marginBottom: 28 }}>
                    <span style={{ fontSize: 42, fontWeight: 700 }}>{displayPrice}</span>
                    <span style={{ color: 'var(--ts)', fontSize: 16, marginLeft: 4 }}>kr{plan.period}</span>
                    {yearly && plan.yearlyPrice && (
                      <>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--suc)', background: 'rgba(34,197,94,0.15)', padding: '3px 8px', borderRadius: 999, marginLeft: 8 }}>
                          Spara {savingsPercent}%
                        </span>
                        <div style={{ fontSize: 13, color: 'var(--ts)', marginTop: 4 }}>
                          Faktureras {plan.yearlyPrice * 12} kr/år
                        </div>
                      </>
                    )}
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32 }}>
                    {plan.features.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', fontSize: 15, color: 'var(--ts)' }}>
                        <Check size={16} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {plan.key === 'free' ? (
                    isCurrentPlan ? (
                      <div style={{
                        width: '100%', padding: 14, borderRadius: 999, fontSize: 15, fontWeight: 600,
                        textAlign: 'center', background: 'rgba(255,255,255,0.05)', color: 'var(--ts)',
                      }}>
                        Nuvarande plan
                      </div>
                    ) : (
                      <button
                        onClick={() => !user ? navigate('/register') : null}
                        style={{
                          width: '100%', padding: 14, borderRadius: 999, fontSize: 15, fontWeight: 600,
                          background: 'rgba(255,255,255,0.05)', color: 'var(--t)', border: '1px solid var(--br)',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        {user ? 'Nuvarande plan' : 'Kom igång gratis'}
                      </button>
                    )
                  ) : isCurrentPlan ? (
                    <div style={{
                      width: '100%', padding: 14, borderRadius: 999, fontSize: 15, fontWeight: 600,
                      textAlign: 'center', background: 'rgba(255,69,0,0.1)', color: 'var(--a)',
                    }}>
                      Nuvarande plan
                    </div>
                  ) : isLowerPlan ? (
                    <div style={{
                      width: '100%', padding: 14, borderRadius: 999, fontSize: 15, fontWeight: 600,
                      textAlign: 'center', background: 'rgba(255,255,255,0.05)', color: 'var(--td)',
                    }}>
                      Inkluderat i din plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCheckout(plan)}
                      disabled={loading === plan.key}
                      style={{
                        width: '100%', padding: 14, borderRadius: 999, fontSize: 15, fontWeight: 700,
                        background: plan.popular ? 'var(--a)' : 'transparent', color: '#fff',
                        border: plan.popular ? 'none' : '1px solid var(--a)',
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: plan.popular ? '0 0 25px rgba(255,69,0,0.3)' : 'none',
                      }}
                    >
                      {loading === plan.key ? <span className="spinner" /> : `Uppgradera till ${plan.name}`}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
