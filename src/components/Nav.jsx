import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Grid, LogOut, Trophy } from './Icons'

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
            {user ? (
              <>
                <Link to="/feed"><button className={`nav-btn ${path === '/feed' ? 'active' : ''}`}>Flöde</button></Link>
                <Link to="/explore"><button className={`nav-btn ${path === '/explore' ? 'active' : ''}`}>Utforska</button></Link>
                <Link to="/dashboard"><button className={`nav-btn ${path === '/dashboard' ? 'active' : ''}`}><Grid size={16} />Dashboard</button></Link>
                <Link to="/competitions"><button className={`nav-btn ${path === '/competitions' ? 'active' : ''}`}><Trophy size={16} />Tävlingar</button></Link>
                {(!user.subscription_type || user.subscription_type === 'free') && (
                  <Link to="/pricing"><button className="nav-btn-primary" style={{ padding: '6px 16px', fontSize: 13 }}><Zap size={14} />Uppgradera</button></Link>
                )}
                {user.username && <Link to={`/user/${user.username}`}><button className={`nav-btn ${path.startsWith('/user/') ? 'active' : ''}`} style={{ color: 'var(--a)', fontWeight: 600 }}>@{user.username}</button></Link>}
                <button className="nav-btn" onClick={logout}><LogOut size={16} /></button>
              </>
            ) : (
              <>
                <Link to="/explore"><button className={`nav-btn ${path === '/explore' ? 'active' : ''}`}>Utforska</button></Link>
                <Link to="/login"><button className="nav-btn-primary">Logga in</button></Link>
              </>
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
          {user ? (
            <>
              <Link to="/feed" onClick={closeMenu} style={{ textDecoration: 'none' }}>
                <div style={mobileLink(path === '/feed')}>Flöde</div>
              </Link>
              <Link to="/explore" onClick={closeMenu} style={{ textDecoration: 'none' }}>
                <div style={mobileLink(path === '/explore')}>Utforska</div>
              </Link>
              <Link to="/dashboard" onClick={closeMenu} style={{ textDecoration: 'none' }}>
                <div style={mobileLink(path === '/dashboard')}>
                  <Grid size={16} /> Dashboard
                </div>
              </Link>
              <Link to="/competitions" onClick={closeMenu} style={{ textDecoration: 'none' }}>
                <div style={mobileLink(path === '/competitions')}>
                  <Trophy size={16} /> Tävlingar
                </div>
              </Link>
              {(!user.subscription_type || user.subscription_type === 'free') && (
                <Link to="/pricing" onClick={closeMenu} style={{ textDecoration: 'none' }}>
                  <div style={{
                    ...mobileLink(path === '/pricing'),
                    background: 'rgba(255,69,0,0.1)', color: 'var(--a)', fontWeight: 600,
                  }}>
                    <Zap size={16} /> Uppgradera
                  </div>
                </Link>
              )}
              {user.username && (
                <Link to={`/user/${user.username}`} onClick={closeMenu} style={{ textDecoration: 'none' }}>
                  <div style={mobileLink(path.startsWith('/user/'))}>
                    <span style={{ color: 'var(--a)', fontWeight: 600 }}>@{user.username}</span>
                  </div>
                </Link>
              )}
              <div style={{ borderTop: '1px solid var(--br)', margin: '4px 0' }} />
              <button onClick={() => { logout(); closeMenu() }} style={{
                ...mobileLink(false), background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--f)', textAlign: 'left', width: '100%', color: '#ef4444',
              }}>
                <LogOut size={16} /> Logga ut
              </button>
            </>
          ) : (
            <>
              <Link to="/explore" onClick={closeMenu} style={{ textDecoration: 'none' }}>
                <div style={mobileLink(path === '/explore')}>Utforska</div>
              </Link>
              <Link to="/login" onClick={closeMenu} style={{ textDecoration: 'none' }}>
                <div style={{
                  ...mobileLink(false), background: 'var(--a)', color: '#fff',
                  borderRadius: 8, textAlign: 'center', fontWeight: 700,
                }}>
                  Logga in
                </div>
              </Link>
            </>
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