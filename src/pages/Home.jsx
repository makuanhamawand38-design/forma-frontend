import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { Zap, Target, Trophy, Chv } from '../components/Icons'

const SPORTS = [
  "Gym", "Löpning", "Fotboll", "Cykling", "Basket", "Simning",
  "Padel", "Kampsport", "Klättring", "Tennis", "Yoga", "CrossFit",
  "Dans", "Vandring", "Skidåkning", "Annat",
]

const ShareIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)

const UsersIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

export default function Home() {
  const nav = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) nav('/dashboard', { replace: true })
  }, [user, loading, nav])

  if (loading || user) return null

  return (
    <div>
      <Nav />

      {/* ===== HERO ===== */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', padding: '120px 20px 80px',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(255,69,0,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(255,69,0,0.05) 0%, transparent 50%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, opacity: 0.03,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 700 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 32,
            background: 'rgba(255,69,0,0.08)', border: '1px solid rgba(255,69,0,0.2)',
            borderRadius: 30, padding: '8px 20px',
          }}>
            <Zap size={18} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--a)' }}>FORMA</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 7vw, 64px)', fontWeight: 800, color: 'var(--t)',
            lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '-0.02em',
          }}>
            Gå med i Sveriges<br />
            <span style={{ color: 'var(--a)' }}>träningscommunity</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'var(--ts)', lineHeight: 1.6,
            margin: '0 auto 40px', maxWidth: 500,
          }}>
            För alla sporter. Alla nivåer.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <button className="btn-primary" style={{
              padding: '16px 48px', fontSize: 17, fontWeight: 700, borderRadius: 14,
            }} onClick={() => nav('/register')}>
              Skapa konto <Chv />
            </button>
            <Link to="/login" style={{ fontSize: 14, color: 'var(--ts)', textDecoration: 'none' }}>
              Har du redan ett konto? <span style={{ color: 'var(--a)', fontWeight: 600 }}>Logga in</span>
            </Link>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 56, flexWrap: 'wrap' }}>
            {[
              { n: "1 000+", l: "Medlemmar" },
              { n: "16", l: "Sporter" },
              { n: "100%", l: "Gratis" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--a)' }}>{s.n}</div>
                <div style={{ fontSize: 12, color: 'var(--td)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'var(--t)', textAlign: 'center', marginBottom: 12 }}>
            Allt du behöver för din träning
          </h2>
          <p style={{ fontSize: 16, color: 'var(--ts)', textAlign: 'center', marginBottom: 56 }}>
            En plats att dela, motivera och växa — tillsammans
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {[
              { ic: <ShareIcon />, t: "Dela träning", d: "Visa din progress, dina sporter och ditt gym för communityt" },
              { ic: <UsersIcon />, t: "Hitta partners", d: "Hitta andra som tränar samma sport i din stad" },
              { ic: <Trophy />, t: "Tävla", d: "XP, achievements och leaderboards — pusha varandra framåt" },
              { ic: <Target />, t: "Nå dina mål", d: "Sätt mål, logga framsteg och fira varje milstolpe" },
            ].map((f, i) => (
              <div key={i} style={{
                background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 16, padding: 28,
                transition: 'border-color 0.2s, transform 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,69,0,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--br)'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,69,0,0.08)', color: 'var(--a)', marginBottom: 16,
                }}>
                  {f.ic}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--t)', margin: '0 0 8px' }}>{f.t}</h3>
                <p style={{ fontSize: 14, color: 'var(--ts)', lineHeight: 1.6, margin: 0 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SPORTER ===== */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'var(--t)', marginBottom: 12 }}>
            Alla sporter. En plattform.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--ts)', marginBottom: 40 }}>
            Oavsett vad du tränar — du hör hemma här
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {SPORTS.map(s => (
              <span key={s} style={{
                padding: '10px 20px', borderRadius: 30, fontSize: 14, fontWeight: 600,
                background: 'rgba(255,69,0,0.06)', border: '1px solid rgba(255,69,0,0.15)',
                color: 'var(--t)', transition: 'all 0.2s', cursor: 'default',
              }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 20, padding: '48px 32px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--bg)',
                  background: `hsl(${i * 60 + 10}, 70%, 40%)`,
                  marginLeft: i > 0 ? -12 : 0, position: 'relative', zIndex: 5 - i,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: '#fff',
                }}>
                  {['E', 'A', 'M', 'S', 'J'][i]}
                </div>
              ))}
              <div style={{
                width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--bg)',
                background: 'rgba(255,69,0,0.15)', marginLeft: -12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'var(--a)',
              }}>
                999+
              </div>
            </div>

            <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--t)', marginBottom: 12 }}>
              Gå med tusentals som redan tränar med FORMA
            </h3>
            <p style={{ fontSize: 15, color: 'var(--ts)', lineHeight: 1.6, marginBottom: 0 }}>
              Från nybörjare till elitidrottare — alla är välkomna i communityt
            </p>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ padding: '40px 20px 100px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'rgba(255,69,0,0.06)', border: '1px solid rgba(255,69,0,0.15)',
            borderRadius: 20, padding: '56px 32px',
          }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: 'var(--t)', marginBottom: 12 }}>
              Redo att börja?
            </h2>
            <p style={{ fontSize: 16, color: 'var(--ts)', marginBottom: 32, lineHeight: 1.6 }}>
              Skapa ditt konto gratis och bli en del av communityt idag.
            </p>
            <button className="btn-primary" style={{ padding: '16px 48px', fontSize: 17, fontWeight: 700, borderRadius: 14 }} onClick={() => nav('/register')}>
              Skapa ditt konto gratis <Chv />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
