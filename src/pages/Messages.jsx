import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import Nav from '../components/Nav'
import Paywall from '../components/Paywall'
import { Mail, Back } from '../components/Icons'

const AVATAR_COLORS = [
  ['#ff4500', '#ff6b35'],
  ['#6366f1', '#818cf8'],
  ['#ec4899', '#f472b6'],
  ['#14b8a6', '#2dd4bf'],
  ['#f59e0b', '#fbbf24'],
  ['#8b5cf6', '#a78bfa'],
  ['#06b6d4', '#22d3ee'],
  ['#ef4444', '#f87171'],
]

function avatarGradient(username) {
  let hash = 0
  for (let i = 0; i < (username || '').length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash)
  const pair = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
  return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'nu'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(dateStr).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}

export default function Messages() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [msgLoading, setMsgLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  const isPremium = user && user.subscription_type && user.subscription_type !== 'free'

  // Check if opened with ?to=username
  useEffect(() => {
    if (!isPremium) return
    const toUser = searchParams.get('to')
    if (toUser) {
      api.startConversation(toUser)
        .then(res => {
          setActiveConv(res.conversation_id)
          loadConversations()
        })
        .catch(() => {})
    } else {
      loadConversations()
    }
  }, [isPremium])

  const loadConversations = () => {
    api.getConversations()
      .then(data => setConversations(data.conversations || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  // Load messages when activeConv changes
  useEffect(() => {
    if (!activeConv) return
    setMsgLoading(true)
    loadMessages()
  }, [activeConv])

  const loadMessages = () => {
    if (!activeConv) return
    api.getMessages(activeConv)
      .then(data => {
        setMessages(data.messages || [])
        setOtherUser(data.other_user || null)
        setMsgLoading(false)
        // Also refresh conversation list to update unread counts
        api.getConversations()
          .then(d => setConversations(d.conversations || []))
          .catch(() => {})
      })
      .catch(() => setMsgLoading(false))
  }

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!activeConv) return
    pollRef.current = setInterval(() => {
      api.getMessages(activeConv).then(data => {
        setMessages(data.messages || [])
        setOtherUser(data.other_user || null)
      }).catch(() => {})
    }, 5000)
    return () => clearInterval(pollRef.current)
  }, [activeConv])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const msg = await api.sendMessage(activeConv, text.trim())
      setMessages(prev => [...prev, msg])
      setText('')
      // Update conversation list
      loadConversations()
    } catch (e) {
      alert(e.message)
    }
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const openConversation = (conv) => {
    setActiveConv(conv.id)
    setMessages([])
    setOtherUser({ username: conv.username, first_name: conv.first_name })
  }

  if (!isPremium) {
    return (
      <div>
        <Nav />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
              background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#8b5cf6',
            }}>
              <Mail size={36} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Direktmeddelanden</h2>
            <p style={{ color: 'var(--ts)', fontSize: 15, marginBottom: 24 }}>
              Uppgradera till Premium för att skicka meddelanden till andra användare.
            </p>
            <button
              onClick={() => setShowPaywall(true)}
              style={{
                padding: '12px 32px', borderRadius: 999, fontSize: 15, fontWeight: 700,
                background: '#8b5cf6', color: '#fff', border: 'none', cursor: 'pointer',
              }}
            >
              Uppgradera till Premium
            </button>
          </div>
        </div>
        {showPaywall && <Paywall requiredLevel="premium" onClose={() => setShowPaywall(false)} />}
      </div>
    )
  }

  // Chat view (mobile-friendly: show either list or chat)
  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 900, margin: '0 auto', height: 'calc(100vh - 60px)', display: 'flex', overflow: 'hidden' }}>
        {/* Conversation list */}
        <div style={{
          width: activeConv ? undefined : '100%',
          maxWidth: activeConv ? 340 : '100%',
          minWidth: activeConv ? 280 : undefined,
          borderRight: activeConv ? '1px solid var(--br)' : 'none',
          display: activeConv ? undefined : 'block',
          flexShrink: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }} className={activeConv ? 'dm-list-desktop' : ''}>
          <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--br)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Meddelanden</h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <span className="spinner" style={{ width: 24, height: 24 }} />
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--td)' }}>
              <Mail size={40} />
              <p style={{ marginTop: 12, fontSize: 14 }}>Inga konversationer ännu</p>
            </div>
          ) : (
            <div>
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                    cursor: 'pointer', transition: 'background 0.15s',
                    background: activeConv === conv.id ? 'rgba(255,69,0,0.06)' : 'transparent',
                    borderLeft: activeConv === conv.id ? '3px solid var(--a)' : '3px solid transparent',
                  }}
                >
                  {conv.avatar_url ? (
                    <img src={conv.avatar_url} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                      background: avatarGradient(conv.username),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 700, color: '#fff',
                    }}>
                      {conv.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: conv.unread_count > 0 ? 700 : 500, color: 'var(--t)' }}>
                        @{conv.username}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--td)', flexShrink: 0 }}>
                        {timeAgo(conv.last_message_at)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <span style={{
                        fontSize: 13, color: conv.unread_count > 0 ? 'var(--t)' : 'var(--td)',
                        fontWeight: conv.unread_count > 0 ? 600 : 400,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                      }}>
                        {conv.last_message_text || 'Ny konversation'}
                      </span>
                      {conv.unread_count > 0 && (
                        <span style={{
                          minWidth: 20, height: 20, borderRadius: 999, background: 'var(--a)',
                          color: '#fff', fontSize: 11, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px',
                        }}>
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat view */}
        {activeConv && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%', overflow: 'hidden' }}>
            {/* Chat header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              borderBottom: '1px solid var(--br)',
            }}>
              <button
                onClick={() => { setActiveConv(null); setMessages([]) }}
                style={{ background: 'none', border: 'none', color: 'var(--ts)', cursor: 'pointer', padding: 4 }}
                className="dm-back-btn"
              >
                <Back size={20} />
              </button>
              {otherUser && (
                <>
                  {otherUser.avatar_url ? (
                    <img src={otherUser.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: avatarGradient(otherUser.username),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: '#fff',
                    }}>
                      {otherUser.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--t)' }}>@{otherUser.username}</div>
                    {otherUser.first_name && (
                      <div style={{ fontSize: 12, color: 'var(--td)' }}>{otherUser.first_name}</div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {msgLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <span className="spinner" style={{ width: 24, height: 24 }} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--td)', fontSize: 14 }}>
                  Inga meddelanden ännu. Säg hej!
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: msg.is_mine ? 'flex-end' : 'flex-start',
                      marginBottom: 2,
                    }}
                  >
                    <div style={{
                      maxWidth: '75%',
                      padding: '10px 14px',
                      borderRadius: msg.is_mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.is_mine ? 'var(--a)' : 'var(--c)',
                      color: msg.is_mine ? '#fff' : 'var(--t)',
                      fontSize: 14,
                      lineHeight: 1.5,
                      wordBreak: 'break-word',
                    }}>
                      <div>{msg.text}</div>
                      <div style={{
                        fontSize: 10, marginTop: 4, textAlign: 'right',
                        color: msg.is_mine ? 'rgba(255,255,255,0.6)' : 'var(--td)',
                      }}>
                        {new Date(msg.created_at).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '12px 16px', borderTop: '1px solid var(--br)',
              display: 'flex', gap: 8, alignItems: 'flex-end',
            }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Skriv ett meddelande..."
                rows={1}
                style={{
                  flex: 1, resize: 'none', padding: '10px 14px', borderRadius: 12,
                  background: 'var(--c)', border: '1px solid var(--br)', color: 'var(--t)',
                  fontFamily: 'var(--f)', fontSize: 14, outline: 'none',
                  maxHeight: 120, overflow: 'auto',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                style={{
                  padding: '10px 20px', borderRadius: 12, border: 'none',
                  background: text.trim() ? 'var(--a)' : 'var(--br)',
                  color: '#fff', fontFamily: 'var(--f)', fontSize: 14, fontWeight: 600,
                  cursor: text.trim() ? 'pointer' : 'default',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                {sending ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Skicka'}
              </button>
            </div>
          </div>
        )}

        {/* Empty state when no conversation selected (desktop) */}
        {!activeConv && !loading && conversations.length > 0 && (
          <div className="dm-empty-desktop" style={{
            flex: 1, display: 'none', alignItems: 'center', justifyContent: 'center',
            color: 'var(--td)', fontSize: 14,
          }}>
            Välj en konversation
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 640px) {
          .dm-list-desktop { display: block !important; }
          .dm-back-btn { display: none !important; }
          .dm-empty-desktop { display: flex !important; }
        }
        @media (max-width: 639px) {
          .dm-list-desktop { display: ${activeConv ? 'none' : 'block'} !important; }
        }
      `}</style>
    </div>
  )
}
