import React, { useState, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppsProvider } from './context/AppsContext'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import AppModal from './components/AppModal'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import Analytics from './pages/Analytics'
import Reminders from './pages/Reminders'
import Team from './pages/Team'
import Settings from './pages/Settings'
import { Spinner } from './components/UI'

// ── Page map ─────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard: 'Dashboard',
  applications: 'Applications',
  analytics: 'Analytics',
  reminders: 'Reminders',
  team: 'Team',
  settings: 'Settings',
}

// ── Protected shell ──────────────────────────────────────
function Shell() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editApp, setEditApp] = useState(null)

  // Derive active page from URL path
  const activePage = location.pathname.replace('/', '') || 'dashboard'

  const openAdd = useCallback(() => { setEditApp(null); setModalOpen(true) }, [])
  const openEdit = useCallback((app) => { setEditApp(app); setModalOpen(true) }, [])
  const closeModal = useCallback(() => { setModalOpen(false); setEditApp(null) }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
            <span style={{ color: 'var(--blue)' }}>Hire</span>Track
          </div>
          <Spinner size={28} />
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  function handleNav(page) {
    navigate(page === 'dashboard' ? '/' : `/${page}`)
    setSearch('')
  }

  return (
    <AppsProvider>
      <div className="app-shell">
        {/* Sidebar */}
        <Sidebar
          active={activePage}
          onNav={handleNav}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main */}
        <div className="main">
          <Topbar
            title={PAGE_TITLES[activePage] || 'HireTrack'}
            onMenuClick={() => setSidebarOpen(o => !o)}
            onSearch={setSearch}
            onAddApp={openAdd}
          />

          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard onAddApp={openAdd} onEdit={openEdit} />} />
              <Route path="/applications" element={<Applications search={search} onAdd={openAdd} onEdit={openEdit} />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reminders" element={<Reminders onEdit={openEdit} />} />
              <Route path="/team" element={<Team />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>

        {/* Add / Edit modal */}
        <AppModal open={modalOpen} onClose={closeModal} editApp={editApp} />
      </div>
    </AppsProvider>
  )
}

// ── Root App ─────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/*" element={<Shell />} />
      </Routes>
    </AuthProvider>
  )
}

// Redirect to dashboard if already logged in
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return children
}
