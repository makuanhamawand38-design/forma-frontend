import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { Zap, Sparkle, Check } from './Icons'

const PLANS = {
  premium: {
    name: 'Premium',
    price: 49,
    productType: 'premium_monthly',
    color: '#8b5cf6',
    icon: Zap,
    features: ['Direktmeddelanden', 'Tävlingar & utmaningar', 'Hitta träningspartner', 'Referral-program'],
  },
  pro: {
    name: 'Pro',
    price: 199,
    productType: 'pro_monthly',
    color: '#FF4500',
    icon: Sparkle,
    features: ['Personliga träningsprogram', 'Personliga kostscheman', 'Byt övningar & måltider', 'Exportera PDF'],
  },
}

export default function Paywall({ requiredLevel = 'premium', onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(null)

  const currentLevel = user?.subscription_type || 'free'
  const levels = { free: 0, premium: 1, pro: 2 }

  // Show plans that are higher than current level
  const visiblePlans = Object.entries(PLANS).filter(
    ([key]) => levels[key] > levels[currentLevel]
  )

  const handleCheckout = async (plan) => {
    if (!user) {
      navigate('/register')
      return
    }
    setLoading(plan.productType)
    try {
      const { checkout_url } = await api.createCheckout(plan.productType)
      window.location.href = checkout_url
    } catch (e) {
      alert(e.message)
      setLoading(null)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
    }} onClick={onClose}>
      <div
        style={{
          background: 'var(--c)', border: '1px solid var(--br)', borderRadius: 24,
          padding: 40, maxWidth: 480, width: '90%', position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
            color: 'var(--ts)', fontSize: 24, cursor: 'pointer', lineHeight: 1,
          }}
        >
          &times;
        </button>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
            background: 'rgba(255,69,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--a)',
          }}>
            <Zap size={32} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Uppgradera din plan
          </h2>
          <p style={{ color: 'var(--ts)', fontSize: 15 }}>
            Den här funktionen kräver {requiredLevel === 'pro' ? 'Pro' : 'Premium'}.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {visiblePlans.map(([key, plan]) => {
            const Icon = plan.icon
            return (
              <div
                key={key}
                style={{
                  background: 'var(--b)', border: `1px solid ${key === requiredLevel ? plan.color + '60' : 'var(--br)'}`,
                  borderRadius: 16, padding: 24,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: plan.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: plan.color,
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 17 }}>{plan.name}</span>
                    <span style={{ color: 'var(--ts)', fontSize: 14, marginLeft: 8 }}>{plan.price} kr/mån</span>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px' }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 14, color: 'var(--ts)' }}>
                      <Check size={14} /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(plan)}
                  disabled={loading === plan.productType}
                  style={{
                    width: '100%', padding: 12, borderRadius: 999, fontSize: 15, fontWeight: 700,
                    background: plan.color, color: '#fff', border: 'none', cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                >
                  {loading === plan.productType ? <span className="spinner" /> : `Uppgradera till ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => { onClose(); navigate('/pricing') }}
          style={{
            display: 'block', width: '100%', textAlign: 'center', marginTop: 16,
            background: 'none', border: 'none', color: 'var(--ts)', fontSize: 14,
            cursor: 'pointer', padding: 8,
          }}
        >
          Jämför alla planer
        </button>
      </div>
    </div>
  )
}
