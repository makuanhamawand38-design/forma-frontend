import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { Zap, Chv, Star, Check, Target, Trophy } from '../components/Icons'

const HERO_BG = "https://images.unsplash.com/photo-1770513649465-2c60c8039806?auto=format&fit=crop&w=1920&q=80"

const REVIEWS = [
  { n: "Erik S.", t: "Äntligen ett program som faktiskt är anpassat för mig. Gick ner 8 kg på 6 veckor!", r: 5 },
  { n: "Anna L.", t: "Kostplanen var perfekt för min vegetariska livsstil. Enkel att följa och god mat!", r: 5 },
  { n: "Marcus K.", t: "Komplett-paketet var värt varje krona. Träningen + maten = resultat.", r: 5 },
  { n: "Sara J.", t: "Bästa investeringen jag gjort för min hälsa. Programmet anpassades efter min knäskada.", r: 5 },
  { n: "Johan P.", t: "FORMA Pro är genialt — varje månad ett nytt svårare program. Ser progress varje vecka!", r: 5 },
  { n: "Lisa M.", t: "Aldrig haft så bra koll på min kost. Inköpslistorna sparar så mycket tid!", r: 5 },
]

const EXAMPLE_DAY = {
  day: "Måndag — Bröst & Triceps",
  warmup: "5 min lätt cardio + dynamisk stretching",
  exercises: [
    { name: "Bench Press", sets: "4", reps: "8-10", rest: "90s", tip: "Håll skulderbladen ihopklämda" },
    { name: "Incline Dumbbell Press", sets: "3", reps: "10-12", rest: "90s", tip: "45° vinkel på bänken" },
    { name: "Cable Fly", sets: "3", reps: "12-15", rest: "60s", tip: "Squeeze i toppen" },
    { name: "Tricep Pushdown", sets: "3", reps: "10-12", rest: "60s", tip: "Armbågarna stilla" },
    { name: "Dips", sets: "3", reps: "8-12", rest: "60s", tip: "Luta dig framåt för bröstfokus" },
  ]
}

export default function Home() {
  const nav = useNavigate()
  const { user } = useAuth()

  const handleSubscribe = async (productId) => {
    if (!user) {
      nav('/register')
      return
    }
    try {
      const data = await api.createCheckout(productId)
      window.location.href = data.checkout_url
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div>
      <Nav />

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url('${HERO_BG}')`, background: `url('${HERO_BG}') center/cover, linear-gradient(135deg,#1a1a2e,#0f1525)` }}>
          <div className="hero-overlay" style={{ background: "linear-gradient(to right,#0f0f10,rgba(15,15,16,0.9),transparent)" }} />
          <div className="hero-overlay" style={{ background: "linear-gradient(to top,#0f0f10,transparent,transparent)" }} />
        </div>
        <div className="hero-content">
          <div className="hero-inner animate">
            <div className="badges"><span className="badge-orange">100% Skräddarsytt</span><span className="badge-muted">Över 500 nöjda kunder</span></div>
            <h1>Ditt personliga<span>träningsprogram</span></h1>
            <p className="hero-desc">Professionella träningsprogram och kostplaner, helt anpassade efter dina mål, erfarenhet och förutsättningar. Nytt program varje månad.</p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>Se priser <Chv /></button>
              <button className="btn-outline" onClick={() => document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' })}>Se exempel</button>
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 32, flexWrap: 'wrap' }}>
              {[{ n: "500+", l: "Program skapade" }, { n: "4.9/5", l: "Snittbetyg" }, { n: "<3 min", l: "Leveranstid" }].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--a)' }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: 'var(--ts)' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== HUR DET FUNGERAR ===== */}
      <section id="how" className="section">
        <div className="section-inner">
          <div className="section-center" style={{ marginBottom: 64 }}>
            <h2 className="section-title">Hur det fungerar</h2>
            <p className="section-desc">Från registrering till personligt program på under 5 minuter</p>
          </div>
          <div className="grid-3">
            {[
              { s: "01", t: "Skapa konto", d: "Registrera dig och fyll i din profil — mål, erfarenhet, skador och kostpreferenser.", i: "📋" },
              { s: "02", t: "Starta Pro", d: "Välj månads- eller årsplan. Betala säkert med kort.", i: "💳" },
              { s: "03", t: "Få din plan", d: "Ditt helt unika program skapas på 1–3 minuter med övningsbeskrivningar och coach-tips.", i: "🎯" }
            ].map((x, i) => (
              <div key={i} className={`step-card animate delay-${i + 1}`}>
                <div className="step-header"><span className="step-emoji">{x.i}</span><span className="step-num">{x.s}</span></div>
                <h3 className="step-title">{x.t}</h3>
                <p className="step-desc">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="section">
        <div className="section-inner">
          <div className="grid-3">
            {[
              { ic: <Zap size={32} />, t: "Dela träning", d: "Visa dina sporter, ditt gym och din progress för andra i communityt" },
              { ic: <Target />, t: "Hitta partners", d: "Hitta träningspartners i din stad som delar dina mål och intressen" },
              { ic: <Trophy />, t: "Tävla & Nå dina mål", d: "XP, achievements och leaderboards — tävla mot dig själv och andra" }
            ].map((f, i) => (
              <div key={i} className={`feature-card animate delay-${i + 1}`}>
                <div className="feature-icon">{f.ic}</div>
                <h3 className="feature-title">{f.t}</h3>
                <p className="feature-desc">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PREVIEW ===== */}
      <section id="preview" className="section">
        <div className="section-inner">
          <div className="section-center" style={{ marginBottom: 48 }}>
            <h2 className="section-title">Se vad du får</h2>
            <p className="section-desc">Här är ett exempel på en träningsdag från ett FORMA-program</p>
          </div>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ background: 'rgba(255,69,0,0.08)', padding: '16px 20px', borderBottom: '1px solid var(--br)' }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--t)' }}>{EXAMPLE_DAY.day}</div>
                <div style={{ fontSize: 13, color: 'var(--a)', marginTop: 4 }}>🔥 {EXAMPLE_DAY.warmup}</div>
              </div>
              {EXAMPLE_DAY.exercises.map((ex, i) => (
                <div key={i} style={{ padding: '14px 20px', borderBottom: i < EXAMPLE_DAY.exercises.length - 1 ? '1px solid var(--br)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--t)' }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ts)', marginTop: 2 }}>{ex.sets} set × {ex.reps} — Vila: {ex.rest}</div>
                    <div style={{ fontSize: 12, color: 'var(--a)', marginTop: 2 }}>💡 {ex.tip}</div>
                  </div>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,69,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--a)', fontSize: 18, flexShrink: 0 }}>🏋️</div>
                </div>
              ))}
              <div style={{ padding: '14px 20px', background: 'rgba(100,149,237,0.05)' }}>
                <div style={{ fontSize: 13, color: '#6495ED' }}>🧘 Nedvarvning: 5 min stretching för bröst, axlar och triceps</div>
              </div>
            </div>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--td)' }}>
              Varje övning inkluderar detaljerad beskrivning, coach-tips och föreslagna vikter.
            </p>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="section">
        <div className="section-inner">
          <div className="section-center" style={{ marginBottom: 40 }}>
            <h2 className="section-title">Välj din plan</h2>
            <p className="section-desc">Nytt skräddarsytt program varje månad — träning och kost inkluderat</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 700, margin: '0 auto' }}>
            {/* Monthly */}
            <div style={{ background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 16, padding: 28, position: 'relative' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ts)', marginBottom: 4 }}>Månadsvis</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: 'var(--t)' }}>199</span>
                <span style={{ fontSize: 16, color: 'var(--ts)' }}>kr/mån</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--td)', marginBottom: 20 }}>Avsluta när du vill</div>
              {["Nytt program varje månad", "Träning + kost inkluderat", "Automatisk progression", "Viktloggning & progress", "Övningsbeskrivningar", "Coach-tips per övning"].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--ts)' }}>
                  <Check size={16} /> {f}
                </div>
              ))}
              <button className="btn-primary" style={{ width: '100%', marginTop: 20, padding: '14px 0', textAlign: 'center' }} onClick={() => handleSubscribe('pro_monthly')}>
                Starta Pro
              </button>
            </div>

            {/* Yearly */}
            <div style={{ background: 'var(--b)', border: '2px solid var(--a)', borderRadius: 16, padding: 28, position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--a)', color: '#fff', padding: '4px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                Spara 600 kr/år
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--a)', marginBottom: 4 }}>Årsplan</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: 'var(--t)' }}>149</span>
                <span style={{ fontSize: 16, color: 'var(--ts)' }}>kr/mån</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--td)', marginBottom: 20 }}>1 788 kr/år (faktureras årsvis)</div>
              {["Allt i månadsplanen", "Spara 600 kr per år", "Nytt program varje månad", "Träning + kost inkluderat", "Automatisk progression", "Prioriterad support"].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--ts)' }}>
                  <Check size={16} /> {f}
                </div>
              ))}
              <button className="btn-primary" style={{ width: '100%', marginTop: 20, padding: '14px 0', textAlign: 'center' }} onClick={() => handleSubscribe('pro_yearly')}>
                Starta Årsplan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== REVIEWS ===== */}
      <section className="section reviews-section">
        <div className="section-inner">
          <h2 className="section-title" style={{ textAlign: "center", marginBottom: 48 }}>Vad våra kunder säger</h2>
          <div className="grid-3">
            {REVIEWS.slice(0, 6).map((r, i) => (
              <div key={i} className={`review-card animate delay-${(i % 3) + 1}`}>
                <div className="review-stars">{[...Array(r.r)].map((_, j) => <Star key={j} size={20} filled />)}</div>
                <p className="review-text">"{r.t}"</p>
                <p className="review-name">{r.n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section" style={{ paddingBottom: 80 }}>
        <div className="section-inner">
          <div style={{ background: 'rgba(255,69,0,0.08)', border: '1px solid rgba(255,69,0,0.2)', borderRadius: 20, padding: '48px 32px', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--t)', marginBottom: 12 }}>Redo att förändra din träning?</h2>
            <p style={{ fontSize: 15, color: 'var(--ts)', marginBottom: 32, lineHeight: 1.6 }}>
              Starta idag och få ditt personliga program på under 3 minuter. Ingen bindningstid.
            </p>
            <button className="btn-primary" style={{ padding: '16px 40px', fontSize: 16 }} onClick={() => handleSubscribe('pro_monthly')}>
              Kom igång nu <Chv />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
