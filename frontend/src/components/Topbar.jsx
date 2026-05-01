import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  applications: 'Applications',
  analytics: 'Analytics',
  reminders: 'Reminders',
  team: 'Team',
  settings: 'Settings',
}

export default function Topbar({ activePage, onSearch, onAddApp, onHamburger }) {
  const { user } = useAuth()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState([
    { id: 1, msg: 'Welcome to HireTrack! Start adding applications.', type: 'info', time: new Date() },
  ])
  const notifRef = useRef(null)

  useEffect(() => {
    const handler = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function clearAll() { setNotifs([]); setNotifOpen(false) }

  const TYPE_COLOR = { success: 'var(--green)', error: 'var(--red)', info: 'var(--blue)', warning: 'var(--amber)' }

  return (
    <div className="topbar">
      {/* Hamburger — mobile only */}
      <button id="hamburger" className="icon-btn" onClick={onHamburger} title="Menu"
        style={{ display: 'none' }}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div className="topbar-title">{PAGE_TITLES[activePage] || 'HireTrack'}</div>

      {/* Search */}
      <div className="search-wrap">
        <span className="search-ico">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </span>
        <input className="search-input" placeholder="Search companies, roles…" onChange={e => onSearch(e.target.value)} />
      </div>

      {/* Notification bell */}
      <div style={{ position: 'relative' }} ref={notifRef}>
        <button className="icon-btn" style={{ position: 'relative' }}
          onClick={() => setNotifOpen(o => !o)} title="Notifications">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          {notifs.length > 0 && <span className="bell-dot" />}
        </button>

        {notifOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 42, width: 310, zIndex: 50,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)', boxShadow: '0 16px 48px rgba(0,0,0,.5)',
            overflow: 'hidden', animation: 'modalIn .15s ease',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Notifications {notifs.length > 0 && `(${notifs.length})`}</span>
              <button onClick={clearAll} style={{ fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {notifs.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                  All caught up! 🎉
                </div>
              ) : notifs.map(n => (
                <div key={n.id} style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: TYPE_COLOR[n.type] || 'var(--blue)', marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text)' }}>{n.msg}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add application button */}
      <button className="btn btn-primary" onClick={onAddApp}>
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>Add Application</span>
      </button>
    </div>
  )
}
