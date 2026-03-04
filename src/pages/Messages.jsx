import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSearchParams, useNavigate } from 'react-router-dom'
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
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [activeConvData, setActiveConvData] = useState(null)
  const [messages, setMessages] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [groupInfo, setGroupInfo] = useState(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [msgLoading, setMsgLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  const isPremium = user && user.subscription_type && user.subscription_type !== 'free'

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
        if (data.type === 'group') {
          setGroupInfo({
            group_name: data.group_name,
            group_image: data.group_image,
            admin_id: data.admin_id,
            member_count: data.member_count,
            members: data.members || [],
          })
          setOtherUser(null)
        } else {
          setOtherUser(data.other_user || null)
          setGroupInfo(null)
        }
        setMsgLoading(false)
        api.getConversations()
          .then(d => setConversations(d.conversations || []))
          .catch(() => {})
      })
      .catch(() => setMsgLoading(false))
  }

  useEffect(() => {
    if (!activeConv) return
    pollRef.current = setInterval(() => {
      api.getMessages(activeConv).then(data => {
        setMessages(data.messages || [])
        if (data.type === 'group') {
          setGroupInfo({
            group_name: data.group_name,
            group_image: data.group_image,
            admin_id: data.admin_id,
            member_count: data.member_count,
            members: data.members || [],
          })
        } else {
          setOtherUser(data.other_user || null)
        }
      }).catch(() => {})
    }, 5000)
    return () => clearInterval(pollRef.current)
  }, [activeConv])

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
    setActiveConvData(conv)
    setMessages([])
    if (conv.type === 'group') {
      setGroupInfo({ group_name: conv.name, member_count: conv.member_count, members: [], admin_id: conv.admin_id })
      setOtherUser(null)
    } else {
      setOtherUser({ username: conv.username, first_name: conv.first_name, avatar_url: conv.avatar_url })
      setGroupInfo(null)
    }
    setShowGroupInfo(false)
  }

  const handleLeaveGroup = async () => {
    if (!confirm('Vill du lämna gruppen?')) return
    try {
      await api.leaveGroup(activeConv)
      setActiveConv(null)
      setGroupInfo(null)
      setShowGroupInfo(false)
      loadConversations()
    } catch (e) {
      alert(e.message)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Ta bort denna medlem?')) return
    try {
      await api.updateGroup(activeConv, { remove_user_id: userId })
      loadMessages()
    } catch (e) {
      alert(e.message)
    }
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
            <button onClick={() => setShowPaywall(true)} style={{
              padding: '12px 32px', borderRadius: 999, fontSize: 15, fontWeight: 700,
              background: '#8b5cf6', color: '#fff', border: 'none', cursor: 'pointer',
            }}>
              Uppgradera till Premium
            </button>
          </div>
        </div>
        {showPaywall && <Paywall requiredLevel="premium" onClose={() => setShowPaywall(false)} />}
      </div>
    )
  }

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
          <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Meddelanden</h2>
            <button onClick={() => setShowCreateGroup(true)} style={{
              background: 'var(--a)', color: '#fff', border: 'none', borderRadius: 10,
              padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--f)', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 16 }}>👥</span> Ny grupp
            </button>
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
                  {conv.type === 'group' ? (
                    <GroupAvatar conv={conv} size={44} />
                  ) : conv.avatar_url ? (
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
                        {conv.type === 'group' ? conv.name : `@${conv.username}`}
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
                        {conv.type === 'group' && (
                          <span style={{ color: 'var(--td)', fontSize: 11, marginRight: 4 }}>
                            {conv.member_count} medl. ·{' '}
                          </span>
                        )}
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
                onClick={() => { setActiveConv(null); setMessages([]); setGroupInfo(null); setShowGroupInfo(false) }}
                style={{ background: 'none', border: 'none', color: 'var(--ts)', cursor: 'pointer', padding: 4 }}
                className="dm-back-btn"
              >
                <Back size={20} />
              </button>

              {groupInfo ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, cursor: 'pointer' }}
                  onClick={() => setShowGroupInfo(!showGroupInfo)}>
                  <GroupAvatar conv={activeConvData || { name: groupInfo.group_name, members_preview: groupInfo.members?.slice(0, 4)?.map(m => ({ username: m.username })) }} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--t)' }}>{groupInfo.group_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--td)' }}>{groupInfo.member_count} medlemmar</div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--td)', cursor: 'pointer' }}>ℹ️</span>
                </div>
              ) : otherUser && (
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
                  <div style={{ cursor: 'pointer' }} onClick={() => nav(`/user/${otherUser.username}`)}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--t)' }}>@{otherUser.username}</div>
                    {otherUser.first_name && (
                      <div style={{ fontSize: 12, color: 'var(--td)' }}>{otherUser.first_name}</div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Group info panel */}
            {showGroupInfo && groupInfo && (
              <div style={{
                borderBottom: '1px solid var(--br)', padding: 16, background: 'var(--b)',
                maxHeight: 300, overflowY: 'auto',
              }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--ts)' }}>
                  Medlemmar ({groupInfo.member_count})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {groupInfo.members.map(m => (
                    <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {m.avatar_url ? (
                        <img src={m.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: avatarGradient(m.username),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, color: '#fff',
                        }}>
                          {m.username?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--t)', cursor: 'pointer' }}
                          onClick={() => nav(`/user/${m.username}`)}>
                          @{m.username}
                        </span>
                        {m.is_admin && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--a)', marginLeft: 6, background: 'rgba(255,69,0,0.1)', padding: '2px 6px', borderRadius: 6 }}>
                            Admin
                          </span>
                        )}
                      </div>
                      {groupInfo.admin_id === user?.id && !m.is_admin && m.user_id !== user?.id && (
                        <button onClick={() => handleRemoveMember(m.user_id)} style={{
                          background: 'none', border: 'none', color: 'var(--td)', cursor: 'pointer',
                          fontSize: 12, padding: 4,
                        }}>✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={handleLeaveGroup} style={{
                  marginTop: 16, width: '100%', padding: 10, borderRadius: 10,
                  border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)',
                  color: '#ef4444', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)',
                }}>
                  Lämna grupp
                </button>
              </div>
            )}

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
                messages.map((msg) => {
                  if (msg.is_system) {
                    return (
                      <div key={msg.id} style={{
                        textAlign: 'center', padding: '8px 0', fontSize: 12, color: 'var(--td)',
                        fontStyle: 'italic',
                      }}>
                        {msg.text}
                      </div>
                    )
                  }
                  return (
                    <div key={msg.id} style={{
                      display: 'flex', justifyContent: msg.is_mine ? 'flex-end' : 'flex-start',
                      marginBottom: 2,
                    }}>
                      <div style={{ maxWidth: '75%' }}>
                        {groupInfo && !msg.is_mine && msg.sender_username && (
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--a)', marginBottom: 2, marginLeft: 14 }}>
                            @{msg.sender_username}
                          </div>
                        )}
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: msg.is_mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: msg.is_mine ? 'var(--a)' : 'var(--c)',
                          color: msg.is_mine ? '#fff' : 'var(--t)',
                          fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word',
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
                    </div>
                  )
                })
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
                  transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                {sending ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Skicka'}
              </button>
            </div>
          </div>
        )}

        {/* Empty state desktop */}
        {!activeConv && !loading && conversations.length > 0 && (
          <div className="dm-empty-desktop" style={{
            flex: 1, display: 'none', alignItems: 'center', justifyContent: 'center',
            color: 'var(--td)', fontSize: 14,
          }}>
            Välj en konversation
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreated={(convId) => {
            setShowCreateGroup(false)
            setActiveConv(convId)
            loadConversations()
          }}
        />
      )}

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


function GroupAvatar({ conv, size = 44 }) {
  const members = conv.members_preview || []
  if (members.length === 0) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.4, fontWeight: 700, color: '#fff',
      }}>
        👥
      </div>
    )
  }

  if (members.length === 1) {
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: avatarGradient(members[0].username),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.38, fontWeight: 700, color: '#fff',
        }}>
          {members[0].username?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: size * 0.4, height: size * 0.4, borderRadius: '50%',
          background: '#6366f1', border: '2px solid var(--c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.2,
        }}>
          👥
        </div>
      </div>
    )
  }

  const s = size * 0.7
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: s, height: s, borderRadius: '50%',
        background: avatarGradient(members[0].username),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: s * 0.4, fontWeight: 700, color: '#fff',
        border: '2px solid var(--c)', zIndex: 1,
      }}>
        {members[0].username?.[0]?.toUpperCase() || '?'}
      </div>
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: s, height: s, borderRadius: '50%',
        background: avatarGradient(members[1].username),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: s * 0.4, fontWeight: 700, color: '#fff',
        border: '2px solid var(--c)',
      }}>
        {members[1].username?.[0]?.toUpperCase() || '?'}
      </div>
    </div>
  )
}


function CreateGroupModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState([])
  const [creating, setCreating] = useState(false)
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = search.trim()
    if (!q || q.length < 2) { setResults([]); return }
    setSearching(true)
    debounceRef.current = setTimeout(() => {
      api.searchUsers(q, 10)
        .then(data => setResults((data.users || data || []).filter(u => !selected.find(s => s.username === u.username))))
        .catch(() => setResults([]))
        .finally(() => setSearching(false))
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [search, selected])

  const addUser = (u) => {
    if (!selected.find(s => s.username === u.username)) {
      setSelected([...selected, u])
    }
    setSearch('')
    setResults([])
  }

  const removeUser = (username) => {
    setSelected(selected.filter(s => s.username !== username))
  }

  const handleCreate = async () => {
    if (!name.trim() || selected.length === 0) return
    setCreating(true)
    try {
      const res = await api.createGroup(name.trim(), selected.map(s => s.username))
      onCreated(res.conversation_id)
    } catch (e) {
      alert(e.message)
    }
    setCreating(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--c)', borderRadius: 20, width: '100%', maxWidth: 440,
        maxHeight: '80vh', overflow: 'auto', padding: 28,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Ny grupp</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 22, color: 'var(--td)', cursor: 'pointer',
          }}>✕</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts)', display: 'block', marginBottom: 6 }}>Gruppnamn</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="T.ex. Gymgänget"
            maxLength={50}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--br)',
              background: 'var(--b)', color: 'var(--t)', fontFamily: 'var(--f)', fontSize: 15,
              outline: 'none', boxSizing: 'border-box',
            }} />
        </div>

        {selected.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {selected.map(u => (
              <div key={u.username} style={{
                display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,69,0,0.1)',
                border: '1px solid rgba(255,69,0,0.2)', borderRadius: 20, padding: '5px 12px',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--a)' }}>@{u.username}</span>
                <button onClick={() => removeUser(u.username)} style={{
                  background: 'none', border: 'none', color: 'var(--td)', cursor: 'pointer',
                  fontSize: 14, padding: 0, lineHeight: 1,
                }}>✕</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ts)', display: 'block', marginBottom: 6 }}>Lägg till medlemmar</label>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sök användarnamn..."
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--br)',
              background: 'var(--b)', color: 'var(--t)', fontFamily: 'var(--f)', fontSize: 15,
              outline: 'none', boxSizing: 'border-box',
            }} />
          {(results.length > 0 || searching) && (
            <div style={{
              border: '1px solid var(--br)', borderRadius: 12, marginTop: 8,
              background: 'var(--b)', overflow: 'hidden', maxHeight: 200, overflowY: 'auto',
            }}>
              {searching ? (
                <div style={{ padding: 16, textAlign: 'center' }}>
                  <span className="spinner" style={{ width: 16, height: 16 }} />
                </div>
              ) : (
                results.map(u => (
                  <div key={u.username} onClick={() => addUser(u)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    cursor: 'pointer', borderBottom: '1px solid var(--br)',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--c)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: avatarGradient(u.username),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#fff',
                    }}>
                      {u.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--t)' }}>@{u.username}</div>
                      {u.city && <div style={{ fontSize: 12, color: 'var(--td)' }}>{u.city}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button onClick={handleCreate} disabled={creating || !name.trim() || selected.length === 0} style={{
          width: '100%', padding: 14, borderRadius: 14, border: 'none',
          background: (!name.trim() || selected.length === 0) ? 'var(--br)' : 'var(--a)',
          color: '#fff', fontSize: 16, fontWeight: 700,
          cursor: (!name.trim() || selected.length === 0) ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--f)',
        }}>
          {creating ? 'Skapar...' : `Skapa grupp (${selected.length} ${selected.length === 1 ? 'medlem' : 'medlemmar'})`}
        </button>
      </div>
    </div>
  )
}
