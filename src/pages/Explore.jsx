import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import Nav from '../components/Nav'

const AVATAR_COLORS = [
  ['#ff4500', '#ff6b35'], ['#6366f1', '#818cf8'], ['#ec4899', '#f472b6'],
  ['#14b8a6', '#2dd4bf'], ['#f59e0b', '#fbbf24'], ['#8b5cf6', '#a78bfa'],
  ['#06b6d4', '#22d3ee'], ['#ef4444', '#f87171'],
]

function avatarGradient(username) {
  let hash = 0
  for (let i = 0; i < (username || '').length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash)
  const pair = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
  return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`
}

function timeAgo(dateStr) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'just nu'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return new Date(dateStr).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}

function Avatar({ username, avatarUrl, size = 36, fontSize = 14 }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: avatarGradient(username), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
      {(username || '?')[0].toUpperCase()}
    </div>
  )
}

function ImageCarousel({ images }) {
  const [idx, setIdx] = useState(0)
  if (!images || images.length === 0) return null
  return (
    <div className="pc-images">
      <img src={images[idx]} alt="" className="pc-img" />
      {images.length > 1 && (
        <div className="pc-img-dots">
          {images.map((_, i) => (
            <span key={i} className={`pc-img-dot${i === idx ? ' active' : ''}`} onClick={() => setIdx(i)} />
          ))}
        </div>
      )}
      {images.length > 1 && idx > 0 && (
        <button className="pc-img-nav pc-img-prev" onClick={() => setIdx(idx - 1)}>‹</button>
      )}
      {images.length > 1 && idx < images.length - 1 && (
        <button className="pc-img-nav pc-img-next" onClick={() => setIdx(idx + 1)}>›</button>
      )}
    </div>
  )
}

function CommentSection({ postId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.getComments(postId, 50, 0)
      .then(data => setComments(data.comments))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [postId])

  const handleSubmit = async () => {
    if (!text.trim()) return
    setSubmitting(true)
    try {
      const comment = await api.addComment(postId, text)
      setComments(prev => [...prev, comment])
      setText('')
    } catch (err) { alert(err.message) }
    setSubmitting(false)
  }

  const handleDelete = async (commentId) => {
    try {
      await api.deleteComment(postId, commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch (err) { alert(err.message) }
  }

  return (
    <div className="cs-section">
      {loading ? (
        <div style={{ padding: 12, textAlign: 'center' }}><span className="spinner" style={{ width: 16, height: 16 }} /></div>
      ) : comments.map(c => (
        <div key={c.id} className="cs-comment">
          <Avatar username={c.user.username} avatarUrl={c.user.avatar_url} size={28} fontSize={11} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="cs-username">@{c.user.username}</span>
            <span className="cs-text">{c.text}</span>
            <div className="cs-meta">
              <span>{timeAgo(c.created_at)}</span>
              {user?.username === c.user.username && <button className="cs-delete" onClick={() => handleDelete(c.id)}>Ta bort</button>}
            </div>
          </div>
        </div>
      ))}
      {user && (
        <div className="cs-input-row">
          <input className="cs-input" placeholder="Skriv en kommentar..." value={text} onChange={e => setText(e.target.value)} maxLength={500} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          <button className="cs-send" onClick={handleSubmit} disabled={!text.trim() || submitting}>{submitting ? '...' : '→'}</button>
        </div>
      )}
    </div>
  )
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate', label: 'Olämpligt innehåll' },
  { value: 'harassment', label: 'Trakasserier' },
  { value: 'other', label: 'Annat' },
]

function ReportModal({ onClose, onReport }) {
  return (
    <div className="mod-overlay" onClick={onClose}>
      <div className="mod-modal" onClick={e => e.stopPropagation()}>
        <div className="mod-header">
          <h3 className="mod-title">Rapportera</h3>
          <button className="mod-close" onClick={onClose}>✕</button>
        </div>
        <div className="mod-body">
          <p className="mod-text">Välj en anledning:</p>
          {REPORT_REASONS.map(r => (
            <button key={r.value} className="mod-reason-btn" onClick={() => onReport(r.value)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ConfirmBlockModal({ username, onClose, onConfirm }) {
  return (
    <div className="mod-overlay" onClick={onClose}>
      <div className="mod-modal" onClick={e => e.stopPropagation()}>
        <div className="mod-header">
          <h3 className="mod-title">Blockera @{username}?</h3>
          <button className="mod-close" onClick={onClose}>✕</button>
        </div>
        <div className="mod-body">
          <p className="mod-text">
            Blockerade användare kan inte se dina inlägg, följa dig eller skicka meddelanden.
            Du kan avblockera när som helst.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="mod-btn-cancel" onClick={onClose}>Avbryt</button>
            <button className="mod-btn-block" onClick={onConfirm}>Blockera</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PostCard({ post, onBlock }) {
  const { user } = useAuth()
  const nav = useNavigate()
  const [liked, setLiked] = useState(post.is_liked)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [showComments, setShowComments] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)

  const handleLike = async () => {
    if (!user) return nav('/login')
    if (liked) {
      setLiked(false); setLikesCount(c => c - 1)
      try { await api.unlikePost(post.id) } catch { setLiked(true); setLikesCount(c => c + 1) }
    } else {
      setLiked(true); setLikesCount(c => c + 1)
      try { await api.likePost(post.id) } catch { setLiked(false); setLikesCount(c => c - 1) }
    }
  }

  const handleReport = async (reason) => {
    try {
      await api.reportContent('post', post.id, reason)
      alert('Rapporten har skickats')
    } catch (e) { alert(e.message) }
    setShowReportModal(false)
  }

  const handleBlock = async () => {
    try {
      await api.blockUser(post.user.username)
      setShowBlockConfirm(false)
      if (onBlock) onBlock(post.user.username)
    } catch (e) { alert(e.message) }
  }

  const isOwn = user?.username === post.user.username

  return (
    <div className="pc-card">
      <div className="pc-header">
        <div style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => nav(`/user/${post.user.username}`)}>
          <Avatar username={post.user.username} avatarUrl={post.user.avatar_url} size={36} fontSize={14} />
        </div>
        <div style={{ flex: 1 }}>
          <span className="pc-username" onClick={() => nav(`/user/${post.user.username}`)}>@{post.user.username}</span>
          <span className="pc-time">{timeAgo(post.created_at)}</span>
        </div>
        {user && (
          <div style={{ position: 'relative' }}>
            <button className="pc-menu-btn" onClick={() => setShowMenu(!showMenu)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
            {showMenu && (
              <div className="pc-dropdown" onClick={() => setShowMenu(false)}>
                {!isOwn && (
                  <>
                    <button className="pc-dropdown-item" onClick={() => setShowReportModal(true)}>Rapportera</button>
                    <button className="pc-dropdown-item pc-dropdown-danger" onClick={() => setShowBlockConfirm(true)}>Blockera @{post.user.username}</button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showReportModal && <ReportModal onClose={() => setShowReportModal(false)} onReport={handleReport} />}
      {showBlockConfirm && <ConfirmBlockModal username={post.user.username} onClose={() => setShowBlockConfirm(false)} onConfirm={handleBlock} />}
      <div className="pc-text">{post.text}</div>
      {post.images && post.images.length > 0 && <ImageCarousel images={post.images} />}
      {post.sport_tag && <span className="pc-sport">{post.sport_tag}</span>}
      <div className="pc-actions">
        <button className={`pc-action-btn${liked ? ' liked' : ''}`} onClick={handleLike}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? '#ef4444' : 'none'} stroke={liked ? '#ef4444' : 'currentColor'} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>{likesCount}</span>
        </button>
        <button className="pc-action-btn" onClick={() => setShowComments(!showComments)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>{post.comments_count}</span>
        </button>
      </div>
      {showComments && <CommentSection postId={post.id} />}
    </div>
  )
}

export default function Explore() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [total, setTotal] = useState(0)
  const observerRef = useRef(null)
  const sentinelRef = useRef(null)

  const loadPosts = useCallback(async (offset = 0, append = false) => {
    try {
      const data = await api.getExplore(20, offset)
      setPosts(prev => append ? [...prev, ...data.posts] : data.posts)
      setTotal(data.total)
    } catch { /* silently fail */ }
  }, [])

  useEffect(() => {
    loadPosts().finally(() => setLoading(false))
  }, [loadPosts])

  useEffect(() => {
    if (loading) return
    const sentinel = sentinelRef.current
    if (!sentinel) return
    observerRef.current = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && posts.length < total && !loadingMore) {
        setLoadingMore(true)
        await loadPosts(posts.length, true)
        setLoadingMore(false)
      }
    }, { threshold: 0.1 })
    observerRef.current.observe(sentinel)
    return () => observerRef.current?.disconnect()
  }, [loading, posts.length, total, loadingMore, loadPosts])

  return (
    <div>
      <Nav />
      <div className="feed-main">
        <div className="feed-container">
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t)', marginBottom: 24 }}>Utforska</h1>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <span className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64, color: 'var(--td)', fontSize: 15 }}>
              Inga inlägg ännu. Bli den första!
            </div>
          ) : (
            <>
              {posts.map(p => <PostCard key={p.id} post={p} onBlock={(username) => setPosts(prev => prev.filter(x => x.user.username !== username))} />)}
              <div ref={sentinelRef} style={{ height: 1 }} />
              {loadingMore && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <span className="spinner" style={{ width: 24, height: 24 }} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .feed-main { min-height: 100vh; padding: 24px 16px 48px; }
        .feed-container { max-width: 560px; margin: 0 auto; }
        .pc-card { background: var(--c); border: 1px solid var(--br); border-radius: 16px; margin-bottom: 16px; overflow: hidden; }
        .pc-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px 0; }
        .pc-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #fff; cursor: pointer; flex-shrink: 0; }
        .pc-username { font-size: 14px; font-weight: 600; color: var(--t); cursor: pointer; }
        .pc-username:hover { color: var(--a); }
        .pc-time { font-size: 12px; color: var(--td); margin-left: 8px; }
        .pc-text { padding: 12px 16px; font-size: 15px; color: var(--t); line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
        .pc-sport { display: inline-block; margin: 0 16px 12px; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: rgba(255,69,0,0.08); color: var(--a); border: 1px solid rgba(255,69,0,0.15); }
        .pc-actions { display: flex; gap: 4px; padding: 4px 8px; border-top: 1px solid var(--br); }
        .pc-action-btn { display: flex; align-items: center; gap: 6px; background: none; border: none; color: var(--td); font-family: var(--f); font-size: 13px; font-weight: 500; cursor: pointer; padding: 10px 12px; border-radius: 8px; transition: color 0.15s; }
        .pc-action-btn:hover { color: var(--t); }
        .pc-action-btn.liked { color: #ef4444; }
        .cs-section { border-top: 1px solid var(--br); padding: 8px 16px 12px; }
        .cs-comment { display: flex; gap: 8px; padding: 8px 0; }
        .cs-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .cs-username { font-size: 13px; font-weight: 600; color: var(--t); margin-right: 6px; }
        .cs-text { font-size: 13px; color: var(--ts); word-break: break-word; }
        .cs-meta { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--td); margin-top: 2px; }
        .cs-delete { background: none; border: none; color: var(--td); font-family: var(--f); font-size: 11px; cursor: pointer; padding: 0; }
        .cs-delete:hover { color: #ef4444; }
        .cs-input-row { display: flex; gap: 8px; margin-top: 8px; }
        .cs-input { flex: 1; background: var(--s); border: 1px solid var(--br); border-radius: 20px; padding: 8px 14px; font-family: var(--f); font-size: 13px; color: var(--t); outline: none; }
        .cs-input::placeholder { color: var(--td); }
        .cs-input:focus { border-color: var(--a); }
        .cs-send { background: var(--a); border: none; color: #fff; width: 34px; height: 34px; border-radius: 50%; font-size: 16px; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .cs-send:disabled { opacity: 0.4; cursor: default; }
        .pc-images { position: relative; }
        .pc-img { width: 100%; max-height: 500px; object-fit: cover; display: block; }
        .pc-img-dots { display: flex; gap: 6px; justify-content: center; padding: 8px 0; }
        .pc-img-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--br); cursor: pointer; transition: background 0.15s; }
        .pc-img-dot.active { background: var(--a); }
        .pc-img-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); border: none; color: #fff; width: 32px; height: 32px; border-radius: 50%; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .pc-img-prev { left: 8px; }
        .pc-img-next { right: 8px; }
        .pc-menu-btn { background: none; border: none; color: var(--td); cursor: pointer; padding: 4px; border-radius: 4px; }
        .pc-menu-btn:hover { color: var(--t); }
        .pc-dropdown { position: absolute; right: 0; top: 28px; z-index: 50; background: var(--c); border: 1px solid var(--br); border-radius: 10px; min-width: 180px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); overflow: hidden; }
        .pc-dropdown-item { display: block; width: 100%; padding: 10px 16px; text-align: left; background: none; border: none; font-family: var(--f); font-size: 13px; font-weight: 500; color: var(--t); cursor: pointer; }
        .pc-dropdown-item:hover { background: var(--s); }
        .pc-dropdown-danger { color: #ef4444; }
        .pc-dropdown-danger:hover { background: rgba(239,68,68,0.08); }
        .mod-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .mod-modal { background: var(--c); border: 1px solid var(--br); border-radius: 16px; width: 100%; max-width: 380px; overflow: hidden; }
        .mod-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--br); }
        .mod-title { margin: 0; font-size: 16px; font-weight: 700; color: var(--t); }
        .mod-close { background: none; border: none; color: var(--ts); font-size: 18px; cursor: pointer; padding: 4px 8px; }
        .mod-close:hover { color: var(--t); }
        .mod-body { padding: 16px 20px; }
        .mod-text { font-size: 14px; color: var(--ts); line-height: 1.6; margin: 0 0 12px; }
        .mod-reason-btn { display: block; width: 100%; padding: 10px 14px; margin-bottom: 6px; background: var(--s); border: 1px solid var(--br); border-radius: 8px; font-family: var(--f); font-size: 13px; font-weight: 500; color: var(--t); cursor: pointer; text-align: left; transition: border-color 0.15s; }
        .mod-reason-btn:hover { border-color: var(--a); }
        .mod-btn-cancel { flex: 1; padding: 10px; border-radius: 8px; font-family: var(--f); font-size: 14px; font-weight: 600; background: var(--s); border: 1px solid var(--br); color: var(--t); cursor: pointer; }
        .mod-btn-block { flex: 1; padding: 10px; border-radius: 8px; font-family: var(--f); font-size: 14px; font-weight: 600; background: #ef4444; border: none; color: #fff; cursor: pointer; }
        .mod-btn-block:hover { background: #dc2626; }
      `}</style>
    </div>
  )
}
