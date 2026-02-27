import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { Zap, Sparkle } from '../components/Icons'

export default function Success() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  useEffect(() => {
    api.getPrograms().then(p => {
      setPrograms(p)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const pendingProgram = programs.find(p => p.status === 'pending')

  const handleGenerate = async () => {
    if (!pendingProgram) return
    setGenerating(true)
    try {
      await api.generateProgram(pendingProgram.id)
      setGenerated(true)
    } catch (err) {
      alert(err.message)
    }
    setGenerating(false)
  }

  return (
    <div className="auth-page">
      <div style={{ width: '100%', maxWidth: 520, padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40, cursor: 'pointer' }} onClick={() => nav('/')}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <div className="logo-icon"><Zap size={24} /></div>
            <span className="logo-text">FORMA</span>
          </div>
        </div>

        <div className="auth-box" style={{ maxWidth: 520, textAlign: 'center' }}>
          {!generated ? (
            <>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h1 className="auth-title" style={{ fontSize: 26 }}>Tack för ditt köp!</h1>
              <p className="auth-sub" style={{ maxWidth: 400, margin: '8px auto 32px' }}>
                Din betalning gick igenom. Nu är det dags att generera ditt personliga program!
              </p>

              {loading ? (
                <div style={{ padding: 24 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
              ) : pendingProgram ? (
                <>
                  <div style={{ background: 'rgba(255,69,0,0.05)', border: '1px solid rgba(255,69,0,0.15)', borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'left' }}>
                    <div style={{ fontSize: 13, color: 'var(--a)', fontWeight: 600, marginBottom: 4 }}>Ditt program</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)' }}>
                      {pendingProgram.product_type === 'training' && '4 Veckors Träningsprogram'}
                      {pendingProgram.product_type === 'nutrition' && '4 Veckors Kostschema'}
                      {pendingProgram.product_type === 'bundle' && '8 Veckors Träning + Kost'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ts)', marginTop: 4 }}>Version {pendingProgram.version_number}</div>
                  </div>

                  <button className="auth-btn" onClick={handleGenerate} disabled={generating} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    {generating ? (
                      <>
                        <span className="spinner" />
                        <span>Skapar ditt program...</span>
                      </>
                    ) : (
                      <>
                        <Sparkle size={20} />
                        <span>Generera mitt program</span>
                      </>
                    )}
                  </button>

                  {generating && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ background: 'var(--b)', borderRadius: 10, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <span className="spinner" style={{ width: 16, height: 16 }} />
                          <span style={{ fontSize: 13, color: 'var(--ts)' }}>Analyserar din profil...</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--td)', lineHeight: 1.6 }}>
                          Vi skapar ett helt unikt program baserat på dina mål, erfarenhet och preferenser. Det tar vanligtvis 1–3 minuter.
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p style={{ color: 'var(--ts)', fontSize: 14, marginBottom: 20 }}>Ditt program har redan genererats!</p>
                  <button className="auth-btn" onClick={() => nav('/dashboard')}>Gå till dashboard</button>
                </>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: 64, marginBottom: 16 }}>💪</div>
              <h1 className="auth-title" style={{ fontSize: 26 }}>Ditt program är klart!</h1>
              <p className="auth-sub" style={{ maxWidth: 400, margin: '8px auto 32px' }}>
                Ditt personliga program har skapats. Dags att börja träna!
              </p>

              <button className="auth-btn" onClick={() => nav(`/program/${pendingProgram.id}`)} style={{ marginBottom: 12 }}>
                🏋️ Öppna mitt program
              </button>

              <button onClick={() => nav('/dashboard')} style={{
                background: 'none', border: '1px solid var(--br)', borderRadius: 10, padding: '12px 24px', cursor: 'pointer',
                fontFamily: 'var(--f)', fontSize: 14, color: 'var(--ts)', width: '100%',
              }}>
                Gå till dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}