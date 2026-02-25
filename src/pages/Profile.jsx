import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'
import { Zap } from '../components/Icons'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getProfile().then(p => { setProfile(p); setWeight(p.current_weight || '') }).catch(() => {})
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.updateProfile({ current_weight: parseFloat(weight) })
      alert('Profil uppdaterad!')
    } catch (err) { alert(err.message) }
    setSaving(false)
  }

  return (
    <div>
      <Nav />
      <div className="dash-main">
        <h1 className="dash-title">Mitt Konto</h1>
        {profile ? (
          <div className="profile-grid">
            <div className="profile-card">
              <h3>Personlig info</h3>
              <div className="profile-field"><div className="profile-label">E-post</div><div className="profile-val">{profile.email}</div></div>
              <div className="profile-field"><div className="profile-label">Kön</div><div className="profile-val">{profile.gender || 'Ej angivet'}</div></div>
              <div className="profile-field"><div className="profile-label">Ålder</div><div className="profile-val">{profile.age || 'Ej angivet'}</div></div>
              <div className="profile-field"><div className="profile-label">Längd</div><div className="profile-val">{profile.height ? `${profile.height} cm` : 'Ej angivet'}</div></div>
              <div className="profile-field"><div className="profile-label">Nuvarande vikt</div><input type="number" className="profile-input" value={weight} onChange={e => setWeight(e.target.value)} /></div>
              <button className="auth-btn" onClick={save} disabled={saving}>{saving ? <span className="spinner" /> : 'Spara ändringar'}</button>
            </div>
            <div>
              <div className="profile-card" style={{ marginBottom: 24 }}>
                <h3>Träningsprofil</h3>
                <div className="profile-field"><div className="profile-label">Mål</div><div className="profile-val">{profile.goal || 'Ej angivet'}</div></div>
                <div className="profile-field"><div className="profile-label">Erfarenhet</div><div className="profile-val">{profile.experience || 'Ej angivet'}</div></div>
                <div className="profile-field"><div className="profile-label">Träningsdagar</div><div className="profile-val">{profile.training_days ? `${profile.training_days} dagar/vecka` : 'Ej angivet'}</div></div>
                <div className="profile-field"><div className="profile-label">Utrustning</div><div className="profile-val">{profile.equipment || 'Ej angivet'}</div></div>
              </div>
              {profile.has_discount && (
                <div className="profile-card">
                  <h3>Rabattstatus</h3>
                  <div style={{ background: 'rgba(255,69,0,0.1)', border: '1px solid rgba(255,69,0,0.2)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Zap size={24} />
                    <div><div style={{ fontWeight: 600, marginBottom: 2 }}>20% rabatt tillgänglig!</div><div style={{ fontSize: 13, color: 'var(--ts)' }}>Från slutfört program. Gäller nästa köp.</div></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 48 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        )}
      </div>
    </div>
  )
}
