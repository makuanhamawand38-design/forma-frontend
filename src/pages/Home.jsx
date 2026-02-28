import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { Zap, Chv, Star, Check, Target, Trophy, productIcon, catBg } from '../components/Icons'

const HERO_BG = "https://images.unsplash.com/photo-1770513649465-2c60c8039806?auto=format&fit=crop&w=1920&q=80"

const ONE_TIME = [
  { id: "training", name: "Träningsprogram", desc: "4 veckors skräddarsytt träningsschema med övningsinstruktioner.", price: 349, weeks: "4 veckor", feat: ["Personlig träningsplan", "Övningsbeskrivningar & coach-tips", "Progression vecka för vecka", "Hemma eller gym"], cat: "training" },
  { id: "nutrition", name: "Kostschema", desc: "4 veckors matsedel med exakta gram, kalorier och inköpslistor.", price: 349, weeks: "4 veckor", feat: ["Veckomeny med exakta gram", "Inköpslista per vecka", "Kalorier & näringsvärden", "Meal prep-guide"], cat: "nutrition" },
  { id: "bundle", name: "Träning + Kost", desc: "Komplett 8 veckors fitness-paket med träning och kostschema.", price: 799, weeks: "8 veckor", feat: ["Allt i ett paket", "8 veckors plan", "Övningsbeskrivningar", "Premium kostplan"], cat: "bundle" },
]

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
  const [pricingTab, setPricingTab] = useState('pro')
useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash)
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300)
    }
  }, [])

  const handleBuy = (productId) => {
    nav(`/onboarding?product=${productId}`)
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
            <p className="hero-desc">Professionella träningsprogram och kostplaner, helt anpassade efter dina mål, erfarenhet och förutsättningar. Klart på 3 minuter.</p>
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
              { s: "01", t: "Berätta om dig", d: "Fyll i dina mål, erfarenhet, skador och kostpreferenser. Vi anpassar allt.", i: "📋" },
              { s: "02", t: "Välj & betala", d: "Välj engångsköp eller Pro-prenumeration. Betala säkert via kort eller Klarna.", i: "💳" },
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
              { ic: <Target />, t: "100% Personligt", d: "Anpassat efter dina mål, skador, kostrestriktioner och utrustning" },
              { ic: <Zap size={32} />, t: "Klart på minuter", d: "Ditt program skapas och levereras direkt i din dashboard" },
              { ic: <Trophy />, t: "Bevisade Resultat", d: "Progressiva program som blir svårare — du ser resultat varje vecka" }
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
          <div className="section-center" style={{ marginBottom: 32 }}>
            <h2 className="section-title">Välj din plan</h2>
            <p className="section-desc">Engångsköp eller prenumeration — du väljer</p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
            <button onClick={() => setPricingTab('pro')} style={{
              padding: '10px 24px', borderRadius: 20, fontFamily: 'var(--f)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: pricingTab === 'pro' ? 'var(--a)' : 'var(--b)', color: pricingTab === 'pro' ? '#fff' : 'var(--ts)',
              border: pricingTab === 'pro' ? 'none' : '1px solid var(--br)',
            }}>
              ⭐ Pro-prenumeration
            </button>
            <button onClick={() => setPricingTab('onetime')} style={{
              padding: '10px 24px', borderRadius: 20, fontFamily: 'var(--f)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: pricingTab === 'onetime' ? 'var(--a)' : 'var(--b)', color: pricingTab === 'onetime' ? '#fff' : 'var(--ts)',
              border: pricingTab === 'onetime' ? 'none' : '1px solid var(--br)',
            }}>
              Engångsköp
            </button>
          </div>

          {/* Pro pricing */}
          {pricingTab === 'pro' && (
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
                <button className="btn-primary" style={{ width: '100%', marginTop: 20, padding: '14px 0' }} onClick={() => handleBuy('pro_monthly')}>
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
                <button className="btn-primary" style={{ width: '100%', marginTop: 20, padding: '14px 0' }} onClick={() => handleBuy('pro_yearly')}>
                  Starta Årsplan
                </button>
              </div>
            </div>
          )}

          {/* One-time pricing */}
          {pricingTab === 'onetime' && (
            <div className="grid-3" style={{ marginTop: 0 }}>
              {ONE_TIME.map((p, i) => (
                <div key={p.id} className={`product-card animate delay-${i + 1} ${p.id === 'bundle' ? 'popular' : ''}`} onClick={() => handleBuy(p.id)}>
                  {p.id === 'bundle' && <div className="popular-badge">Populärast</div>}
<div className="product-img" style={{ background: `url('${p.cat === "training" ? "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80" : p.cat === "nutrition" ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80" : "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80"}') center/cover` }}>
                                      <div className="product-img-overlay" />
                    <div className="product-img-icon">{productIcon(p.cat)}</div>
                  </div>
                  <div className="product-body">
                    <h3 className="product-name">{p.name}</h3>
                    <p className="product-desc">{p.desc}</p>
                    <div style={{ fontSize: 12, color: 'var(--a)', fontWeight: 600, marginBottom: 8 }}>{p.weeks}</div>
                    <ul className="product-features">{p.feat.map((f, j) => <li key={j}><Star size={16} filled /> {f}</li>)}</ul>
                    <div className="product-footer">
                      <div className="product-price">{p.price}<span>SEK</span></div>
                      <button className="btn-primary btn-sm" onClick={e => { e.stopPropagation(); handleBuy(p.id) }}>Välj</button>
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="klarna-badge">Klarna.</span>
                      <span style={{ fontSize: 12, color: 'var(--td)' }}>Kort & Klarna</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Compare */}
          <div style={{ maxWidth: 600, margin: '48px auto 0', background: 'var(--b)', border: '1px solid var(--br)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)', marginBottom: 16, textAlign: 'center' }}>Varför välja Pro?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px 16px', fontSize: 13 }}>
              <div style={{ color: 'var(--ts)', fontWeight: 600 }}></div>
              <div style={{ color: 'var(--td)', fontWeight: 600, textAlign: 'center' }}>Engångsköp</div>
              <div style={{ color: 'var(--a)', fontWeight: 600, textAlign: 'center' }}>Pro</div>

              {[
                ["Personligt program", "✓", "✓"],
                ["Övningsbeskrivningar", "✓", "✓"],
                ["Nytt program varje månad", "✗", "✓"],
                ["Automatisk progression", "✗", "✓"],
                ["Träning + kost", "Separat", "Inkluderat"],
                ["Pris per månad", "349+ kr", "149 kr"],
              ].map(([label, basic, pro], i) => (
                <div key={i} style={{ display: 'contents' }}>
                  <div style={{ color: 'var(--ts)', padding: '6px 0', borderTop: i > 0 ? '1px solid var(--br)' : 'none' }}>{label}</div>
                  <div style={{ textAlign: 'center', padding: '6px 0', borderTop: i > 0 ? '1px solid var(--br)' : 'none', color: basic === '✗' ? 'var(--td)' : 'var(--ts)' }}>{basic}</div>
                  <div style={{ textAlign: 'center', padding: '6px 0', borderTop: i > 0 ? '1px solid var(--br)' : 'none', color: pro === '✓' || pro === 'Inkluderat' || pro === '149 kr' ? 'var(--a)' : 'var(--ts)', fontWeight: 600 }}>{pro}</div>
                </div>
              ))}
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
            <button className="btn-primary" style={{ padding: '16px 40px', fontSize: 16 }} onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              Kom igång nu <Chv />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}