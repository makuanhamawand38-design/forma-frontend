import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'

export default function NotFound() {
  const nav = useNavigate()

  return (
    <div>
      <Nav />
      <div style={{
        minHeight: '80vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: 24,
      }}>
        <div style={{ fontSize: 80, fontWeight: 900, color: 'var(--a)', lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--t)', marginTop: 12 }}>Sidan hittades inte</h1>
        <p style={{ fontSize: 15, color: 'var(--ts)', marginTop: 8, maxWidth: 400 }}>
          Sidan du letar efter finns inte eller har flyttats.
        </p>
        <button onClick={() => nav('/')} style={{
          marginTop: 24, background: 'var(--a)', color: '#fff', border: 'none',
          borderRadius: 10, padding: '12px 32px', fontSize: 15, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'var(--f)',
        }}>
          Gå till startsidan
        </button>
      </div>
    </div>
  )
}