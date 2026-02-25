import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { Zap, Chv, Star, Check, Target, Trophy, productIcon, catBg } from '../components/Icons'

const PRODUCTS = [
  { id: "training", name: "4 Veckors Träningsprogram", desc: "Skräddarsytt träningsschema med progression vecka 1–4 och animerade övningsinstruktioner.", price: 349, image: "https://images.unsplash.com/photo-1693214674451-d6bd02e642d1?auto=format&fit=crop&w=800&q=80", feat: ["Personlig träningsplan", "4 veckors progression", "Animerade övningar (GIF)", "Hemma eller gym"], cat: "training" },
  { id: "nutrition", name: "4 Veckors Kostschema", desc: "Komplett matsedel med exakta gram, kalorier, inköpslistor och meal prep-guide.", price: 349, image: "https://images.unsplash.com/photo-1628025114288-1693ac3bcac1?auto=format&fit=crop&w=800&q=80", feat: ["Veckomeny med exakta gram", "Inköpslista per vecka", "Kalorier & näringsvärden", "Meal prep-guide"], cat: "nutrition" },
  { id: "bundle", name: "8 Veckors Träning + Kost", desc: "Komplett fitness-paket: träningsprogram och kostschema i 8 veckor.", price: 799, image: "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=800&q=80", feat: ["Allt i ett paket", "8 veckors plan", "Animerade övningar", "Premium kostplan"], cat: "bundle", pop: true },
]
const HERO_BG = "https://images.unsplash.com/photo-1770513649465-2c60c8039806?auto=format&fit=crop&w=1920&q=80"
const REVIEWS = [
  { n: "Erik S.", t: "Äntligen ett program som faktiskt är anpassat för mig. Gick ner 8 kg på 6 veckor!" },
  { n: "Anna L.", t: "Kostplanen var perfekt för min vegetariska livsstil. Enkel att följa och god mat!" },
  { n: "Marcus K.", t: "Komplett-paketet var värt varje krona. Träningen + maten = resultat." },
]

export default function Home() {
  const nav = useNavigate()
  const { user } = useAuth()

  const handleBuy = (productId) => {
    nav(`/onboarding?product=${productId}`)
  }

  return (
    <div>
      <Nav />
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url('${HERO_BG}')`, background: `url('${HERO_BG}') center/cover, linear-gradient(135deg,#1a1a2e,#0f1525)` }}>
          <div className="hero-overlay" style={{ background: "linear-gradient(to right,#0f0f10,rgba(15,15,16,0.9),transparent)" }} />
          <div className="hero-overlay" style={{ background: "linear-gradient(to top,#0f0f10,transparent,transparent)" }} />
        </div>
        <div className="hero-content">
          <div className="hero-inner animate">
            <div className="badges"><span className="badge-orange">100% Skräddarsytt</span><span className="badge-muted">Resultatgaranti</span></div>
            <h1>Förverkliga din<span>fulla potential</span></h1>
            <p className="hero-desc">Professionella träningsprogram och kostplaner, skräddarsydda för just dig med animerade övningsinstruktioner.</p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>Se program <Chv /></button>
              <button className="btn-outline" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>Hur det fungerar</button>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="section">
        <div className="section-inner">
          <div className="section-center" style={{ marginBottom: 64 }}>
            <h2 className="section-title">Hur det fungerar</h2>
            <p className="section-desc">Från registrering till personligt program på under 5 minuter</p>
          </div>
          <div className="grid-3">
            {[{ s: "01", t: "Skapa konto", d: "Registrera dig och berätta om dina mål, erfarenhet och förutsättningar.", i: "📝" }, { s: "02", t: "Välj & betala", d: "Välj program och betala säkert via kort eller Klarna. Inga prenumerationer.", i: "🔒" }, { s: "03", t: "Få din plan", d: "Generera ditt personliga program i din dashboard – med animerade övningar!", i: "🎯" }].map((x, i) => (
              <div key={i} className={`step-card animate delay-${i + 1}`}>
                <div className="step-header"><span className="step-emoji">{x.i}</span><span className="step-num">{x.s}</span></div>
                <h3 className="step-title">{x.t}</h3>
                <p className="step-desc">{x.d}</p>
              </div>
            ))}
          </div>
          <div className="center-btn"><button className="btn-primary" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>Kom igång nu <Chv /></button></div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="grid-3">
            {[{ ic: <Target />, t: "Personligt Anpassat", d: "Varje detalj skräddarsys efter dina mål och förutsättningar" }, { ic: <Zap size={32} />, t: "Direkt Leverans", d: "Ditt program genereras direkt i din dashboard" }, { ic: <Trophy />, t: "Bevisade Resultat", d: "Vetenskapligt baserade metoder för maximal effekt" }].map((f, i) => (
              <div key={i} className={`feature-card animate delay-${i + 1}`}>
                <div className="feature-icon">{f.ic}</div>
                <h3 className="feature-title">{f.t}</h3>
                <p className="feature-desc">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="section">
        <div className="section-inner">
          <div style={{ marginBottom: 16 }}>
            <h2 className="section-title">Välj ditt program</h2>
            <p className="section-desc">Varje program skapas unikt för just dig. Alla priser är engångsbetalningar – inga prenumerationer.</p>
          </div>
          <div className="grid-3" style={{ marginTop: 48 }}>
            {PRODUCTS.map((p, i) => (
              <div key={p.id} className={`product-card animate delay-${i + 1} ${p.pop ? 'popular' : ''}`} onClick={() => handleBuy(p.id)}>
                {p.pop && <div className="popular-badge">Populärast</div>}
                <div className="product-img" style={{ background: catBg(p.cat) }}>
                  <img src={p.image} alt={p.name} onError={e => { e.target.style.display = 'none' }} />
                  <div className="product-img-overlay" />
                  <div className="product-img-icon">{productIcon(p.cat)}</div>
                </div>
                <div className="product-body">
                  <h3 className="product-name">{p.name}</h3>
                  <p className="product-desc">{p.desc}</p>
                  <ul className="product-features">{p.feat.slice(0, 3).map((f, j) => <li key={j}><Star size={16} filled /> {f}</li>)}</ul>
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
        </div>
      </section>

      <section className="section reviews-section">
        <div className="section-inner">
          <h2 className="section-title" style={{ textAlign: "center", marginBottom: 48 }}>Vad våra kunder säger</h2>
          <div className="grid-3">
            {REVIEWS.map((r, i) => (
              <div key={i} className={`review-card animate delay-${i + 1}`}>
                <div className="review-stars">{[...Array(5)].map((_, j) => <Star key={j} size={20} filled />)}</div>
                <p className="review-text">"{r.t}"</p>
                <p className="review-name">{r.n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}