import { Zap } from './Icons'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-logo">
          <div className="footer-logo-icon"><Zap size={16} /></div>
          <span style={{ fontWeight: 600 }}>FORMA</span>
        </div>
        <p className="footer-copy">© 2026 FORMA. Träna. Dela. Tävla. formafitness.se</p>
      </div>
    </footer>
  )
}
