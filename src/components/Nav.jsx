import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, User, Grid, LogOut } from './Icons'

export default function Nav() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const path = location.pathname

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="logo">
          <div className="logo-icon"><Zap size={24} /></div>
          <span className="logo-text">FORMA</span>
        </Link>
        <div className="nav-links">
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
      </div>
    </nav>
  )
}
