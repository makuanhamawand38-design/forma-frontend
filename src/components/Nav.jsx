import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, User, Grid, LogOut } from './Icons'

export default function Nav() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const path = location.pathname
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="logo" onClick={closeMenu}>
            <div className="logo-icon"><Zap size={24} /></div>
            <span className="logo-text">FORMA</span>
          </Link>

          {/* Desktop nav */}
          <div className="nav-links nav-desktop">
            <Link to="/#products"><button className={`nav-btn ${path === '/shop' ? 'active' : ''}`}>Program</button></Link>
            {user ? (
              <>
                <Link to="/dashboard"><button className={`nav-btn ${path === '/dashboard' ? 'active' : ''}`}><Grid size={16} />Dashboard</button></Link>
                <Link to="/profile"><button className={`nav-btn ${path === '/profile' ? 'active' : ''}`}><User size={16} />Mitt konto</button></Link>
                <button className="nav-btn" onClick={logout}><LogOut size={16} /></button>
              </>
            ) : (
              <Link to="/login"><button className="nav-btn-primary">Logga in</button></Link>
            )}
          </div>

          {/* Hamburger button */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Meny">
            <span style={{
              display: 'block', width: 22, height: 2, background: 'var(--t)',
              transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translateY(6px)' : 'none',
            }} />
            <span style={{
              display: 'block', width: 22, height: 2, background: 'var(--t)',
              transition: 'all 0.3s', opacity: menuOpen ? 0 : 1, margin: '5px 0',
            }} />
            <span style={{
              display: 'block', width: 22, height: 2, background: 'var(--t)',
              transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none',
            }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, bottom: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        }} onClick={closeMenu} />
      )}

      {/* Mobile menu */}
      <div style={{
        position: 'fixed', top: 60, right: 0, zIndex: 1000,
        background: '#1a1a2e', border: '1px solid var(--br)',
        borderRadius: '0 0 0 14px', padding: menuOpen ? '16px 24px' : '0',
        maxHeight: menuOpen ? 400 : 0, overflow: 'hidden',
        transition: 'all 0.3s ease', width: 220,
        boxShadow: menuOpen ? '0 8px 30px rgba(0,0,0,0.5)' : 'none',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link to="/#products" onClick={closeMenu} style={{ textDecoration: 'none' }}>
            <div style={mobileLink(false)}>Program</div>
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={closeMenu} style={{ textDecoration: 'none' }}>
                <div style={mobileLink(path === '/dashboard')}>
                  <Grid size={16} /> Dashboard
                </div>
              </Link>
              <Link to="/profile" onClick={closeMenu} style={{ textDecoration: 'none' }}>
                <div style={mobileLink(path === '/profile')}>
                  <User size={16} /> Mitt konto
                </div>
              </Link>
              <div style={{ borderTop: '1px solid var(--br)', margin: '4px 0' }} />
              <button onClick={() => { logout(); closeMenu() }} style={{
                ...mobileLink(false), background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--f)', textAlign: 'left', width: '100%', color: '#ef4444',
              }}>
                <LogOut size={16} /> Logga ut
              </button>
            </>
          ) : (
            <Link to="/login" onClick={closeMenu} style={{ textDecoration: 'none' }}>
              <div style={{
                ...mobileLink(false), background: 'var(--a)', color: '#fff',
                borderRadius: 8, textAlign: 'center', fontWeight: 700,
              }}>
                Logga in
              </div>
            </Link>
          )}
        </div>
      </div>

      <style>{`
        .nav-desktop { display: flex; }
        .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 8px; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .hamburger { display: flex; flex-direction: column; align-items: center; justify-content: center; }
        }
      `}</style>
    </>
  )
}

const mobileLink = (active) => ({
  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 8px',
  borderRadius: 8, fontSize: 15, fontWeight: 500, color: active ? 'var(--a)' : 'var(--t)',
  background: active ? 'rgba(255,69,0,0.08)' : 'transparent',
})