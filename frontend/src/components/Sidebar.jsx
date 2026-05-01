import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useApps } from '../context/AppsContext'

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: GridIcon },
  { id: 'applications', label: 'Applications', icon: ListIcon, badge: 'total' },
  { id: 'analytics', label: 'Analytics', icon: ChartIcon },
  { id: 'reminders', label: 'Reminders', icon: BellIcon, badge: 'followUpNeeded' },
  { id: 'team', label: 'Team', icon: TeamIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar({ active, onNav, open, onClose }) {
  const { user, logout } = useAuth()
  const { stats } = useApps()

  return (
    <>
      <div className={`sidebar-overlay${open ? ' visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark"><span className="ht">Hire</span>Track</div>
          <div className="logo-tagline">Job Application Manager</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label">Main</div>
          {PAGES.slice(0, 5).map(p => {
            const Icon = p.icon
            const badgeVal = p.badge && stats ? stats[p.badge] : 0
            return (
              <button key={p.id} className={`nav-btn${active === p.id ? ' active' : ''}`}
                onClick={() => { onNav(p.id); onClose() }}>
                <Icon className="icon" />
                {p.label}
                {badgeVal > 0 && <span className="nav-badge">{badgeVal}</span>}
              </button>
            )
          })}
          <div className="nav-group-label" style={{ marginTop: 8 }}>Account</div>
          {PAGES.slice(5).map(p => {
            const Icon = p.icon
            return (
              <button key={p.id} className={`nav-btn${active === p.id ? ' active' : ''}`}
                onClick={() => { onNav(p.id); onClose() }}>
                <Icon className="icon" />
                {p.label}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-user">
          <div className="user-chip">
            <div className="user-av">{user?.name?.slice(0, 2).toUpperCase() || 'U'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{user?.plan === 'pro' ? '⭐ Pro' : 'Free Plan'}</div>
            </div>
            <button className="icon-btn" onClick={logout} title="Logout" style={{ width: 26, height: 26 }}>
              <LogoutIcon style={{ width: 13, height: 13 }} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function GridIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
}
function ListIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
}
function ChartIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
}
function BellIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
}
function TeamIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
}
function SettingsIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
}
function LogoutIcon({ style }) {
  return <svg style={style} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
}
