import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Success from './pages/Success'
import Dashboard from './pages/Dashboard'
import Feed from './pages/Feed'
import Explore from './pages/Explore'
import ProgramView from './pages/ProgramView'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import Terms from './pages/Terms'
import Pricing from './pages/Pricing'
import Competitions from './pages/Competitions'
import Messages from './pages/Messages'
import CookieConsent from './components/CookieConsent'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" />
  return children
}

export default function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
      <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/program/:id" element={<ProtectedRoute><ProgramView /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/user/:username" element={<UserProfile />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/competitions" element={<ProtectedRoute><Competitions /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/villkor" element={<Terms />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <CookieConsent />
    </>
  )
}