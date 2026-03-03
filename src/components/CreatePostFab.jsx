import { useState, useRef } from 'react'
import { api } from '../api'

const SPORT_OPTIONS = ['Styrketräning', 'Löpning', 'Cykling', 'Simning', 'Yoga', 'Crossfit', 'Kampsport', 'Fotboll', 'Tennis', 'Klättring']

function isVideo(file) {
  return file.type.startsWith('video/')
}

export default function CreatePostFab({ onCreated }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [sportTag, setSportTag] = useState('')
  const [posting, setPosting] = useState(false)
  const [imageFiles, setImageFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const fileRef = useRef(null)

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const vid = files.find(f => isVideo(f))
    if (vid) {
      // Video selected — clear images, set single video
      imageFiles.forEach((_, i) => previews[i] && URL.revokeObjectURL(previews[i]))
      setImageFiles([])
      setPreviews([])
      if (videoPreview) URL.revokeObjectURL(videoPreview)
      setVideoFile(vid)
      setVideoPreview(URL.createObjectURL(vid))
    } else {
      // Images selected — clear video, add images
      if (videoFile) {
        if (videoPreview) URL.revokeObjectURL(videoPreview)
        setVideoFile(null)
        setVideoPreview(null)
      }
      const combined = [...imageFiles, ...files.filter(f => !isVideo(f))].slice(0, 10)
      setImageFiles(combined)
      setPreviews(combined.map(f => URL.createObjectURL(f)))
    }
    e.target.value = ''
  }

  const removeImage = (i) => {
    URL.revokeObjectURL(previews[i])
    const newFiles = imageFiles.filter((_, idx) => idx !== i)
    setImageFiles(newFiles)
    setPreviews(newFiles.map(f => URL.createObjectURL(f)))
  }

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideoFile(null)
    setVideoPreview(null)
  }

  const handleSubmit = async () => {
    if (!text.trim()) return
    setPosting(true)
    try {
      const post = await api.createPost(text, sportTag || null, imageFiles, videoFile)
      onCreated?.(post)
      handleClose()
    } catch (err) {
      alert(err.message)
    }
    setPosting(false)
  }

  const handleClose = () => {
    setOpen(false)
    setText('')
    setSportTag('')
    setImageFiles([])
    previews.forEach(p => URL.revokeObjectURL(p))
    setPreviews([])
    removeVideo()
  }

  const mediaCount = imageFiles.length + (videoFile ? 1 : 0)
  const maxReached = imageFiles.length >= 10 || !!videoFile

  return (
    <>
      <button className="fab-create" onClick={() => setOpen(true)} aria-label="Skapa inlägg">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {open && (
        <div className="fab-overlay" onClick={handleClose}>
          <div className="fab-modal" onClick={e => e.stopPropagation()}>
            <div className="fab-modal-header">
              <h3 className="fab-modal-title">Nytt inlägg</h3>
              <button className="fab-modal-close" onClick={handleClose}>✕</button>
            </div>
            <div className="fab-modal-body">
              <textarea
                className="fab-textarea"
                placeholder="Vad tränade du idag?"
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={2000}
                autoFocus
              />
              <div className="fab-char-count">{text.length}/2000</div>

              {/* Image previews */}
              {previews.length > 0 && (
                <div className="fab-previews">
                  {previews.map((src, i) => (
                    <div key={i} className="fab-preview-item">
                      <img src={src} alt="" />
                      <button className="fab-preview-rm" onClick={() => removeImage(i)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Video preview */}
              {videoPreview && (
                <div className="fab-video-preview">
                  <video src={videoPreview} controls style={{ width: '100%', maxHeight: 200, borderRadius: 8, background: '#000' }} />
                  <button className="fab-preview-rm" onClick={removeVideo} style={{ position: 'absolute', top: 6, right: 6 }}>✕</button>
                </div>
              )}

              <div className="fab-sport-label">Sport (valfritt)</div>
              <div className="fab-sport-list">
                {SPORT_OPTIONS.map(s => (
                  <button key={s} className={`fab-sport-chip${sportTag === s ? ' active' : ''}`} onClick={() => setSportTag(sportTag === s ? '' : s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="fab-modal-footer">
              <input ref={fileRef} type="file" accept="image/*,video/mp4,video/quicktime" multiple hidden onChange={handleFiles} />
              <button className="fab-img-btn" onClick={() => fileRef.current?.click()} disabled={maxReached}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                {mediaCount > 0 && <span style={{ fontSize: 12 }}>{videoFile ? '1 video' : `${imageFiles.length}/10`}</span>}
              </button>
              <button className="fab-btn-post" onClick={handleSubmit} disabled={!text.trim() || posting}>
                {posting ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Publicera'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .fab-create {
          display: none;
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 90;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #ff4500;
          border: none;
          color: #fff;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(255,69,0,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .fab-create:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 28px rgba(255,69,0,0.5);
        }
        .fab-create:active {
          transform: scale(0.95);
        }
        @media (max-width: 768px) {
          .fab-create { display: flex; }
        }

        .fab-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6); display: flex;
          align-items: center; justify-content: center;
          z-index: 1000; padding: 20px;
        }
        .fab-modal {
          background: var(--c); border: 1px solid var(--br);
          border-radius: 16px; width: 100%; max-width: 520px;
          display: flex; flex-direction: column; overflow: hidden;
          max-height: 90vh;
        }
        .fab-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-bottom: 1px solid var(--br);
        }
        .fab-modal-title { margin: 0; font-size: 16px; font-weight: 700; color: var(--t); }
        .fab-modal-close {
          background: none; border: none; color: var(--ts);
          font-size: 18px; cursor: pointer; padding: 4px 8px;
        }
        .fab-modal-close:hover { color: var(--t); }
        .fab-modal-body { padding: 16px 20px; overflow-y: auto; }
        .fab-textarea {
          width: 100%; min-height: 120px; background: var(--s);
          border: 1px solid var(--br); border-radius: 12px;
          padding: 12px; font-family: var(--f); font-size: 15px;
          color: var(--t); resize: vertical; outline: none;
          box-sizing: border-box;
        }
        .fab-textarea::placeholder { color: var(--td); }
        .fab-textarea:focus { border-color: var(--a); }
        .fab-char-count {
          text-align: right; font-size: 11px; color: var(--td); margin-top: 4px;
        }
        .fab-sport-label {
          font-size: 13px; font-weight: 600; color: var(--ts);
          margin: 12px 0 8px;
        }
        .fab-sport-list {
          display: flex; flex-wrap: wrap; gap: 6px;
        }
        .fab-sport-chip {
          padding: 5px 12px; border-radius: 20px;
          font-family: var(--f); font-size: 12px; font-weight: 600;
          background: var(--s); border: 1px solid var(--br);
          color: var(--ts); cursor: pointer; transition: all 0.15s;
        }
        .fab-sport-chip:hover { border-color: var(--a); color: var(--a); }
        .fab-sport-chip.active {
          background: rgba(255,69,0,0.1); border-color: var(--a); color: var(--a);
        }
        .fab-modal-footer {
          padding: 12px 20px; border-top: 1px solid var(--br);
          display: flex; justify-content: flex-end;
        }
        .fab-btn-post {
          padding: 10px 28px; border-radius: 10px;
          font-family: var(--f); font-size: 14px; font-weight: 700;
          background: var(--a); border: none; color: #fff;
          cursor: pointer; transition: background 0.2s;
        }
        .fab-btn-post:hover { background: var(--ah); }
        .fab-btn-post:disabled { opacity: 0.5; cursor: default; }
        .fab-img-btn {
          display: flex; align-items: center; gap: 6px;
          background: none; border: 1px solid var(--br); border-radius: 10px;
          padding: 8px 14px; color: var(--ts); cursor: pointer; font-family: var(--f);
          margin-right: auto; transition: border-color 0.15s;
        }
        .fab-img-btn:hover { border-color: var(--a); color: var(--a); }
        .fab-img-btn:disabled { opacity: 0.4; cursor: default; }
        .fab-previews {
          display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;
        }
        .fab-preview-item {
          position: relative; width: 72px; height: 72px; border-radius: 8px; overflow: hidden;
        }
        .fab-preview-item img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .fab-preview-rm {
          position: absolute; top: 2px; right: 2px;
          width: 20px; height: 20px; border-radius: 50%;
          background: rgba(0,0,0,0.7); border: none; color: #fff;
          font-size: 12px; cursor: pointer; display: flex;
          align-items: center; justify-content: center;
        }
        .fab-video-preview {
          position: relative; margin-top: 12px;
        }
      `}</style>
    </>
  )
}
