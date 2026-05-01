import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApps } from '../context/AppsContext'
import toast from 'react-hot-toast'
import api from '../utils/api'

function Section({ title, subtitle, children }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-head">
        <div>
          <div className="card-title">{title}</div>
          {subtitle && <div className="card-sub">{subtitle}</div>}
        </div>
      </div>
      <div className="card-body">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: 42, height: 24, borderRadius: 12, cursor: 'pointer', transition: '.2s', background: value ? 'var(--blue)' : 'var(--border2)', position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: '#fff', top: 3, left: value ? 21 : 3, transition: '.2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
    </div>
  )
}

export default function Settings() {
  const { user, updateProfile, logout } = useAuth()
  const { apps } = useApps()

  const [name, setName]                   = useState(user?.name || '')
  const [reminderEnabled, setReminderEn]  = useState(user?.reminderEnabled ?? true)
  const [reminderDays, setReminderDays]   = useState(user?.reminderDays || 5)
  const [saving, setSaving]               = useState(false)
  const [pwForm, setPwForm]               = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwSaving, setPwSaving]           = useState(false)

  async function saveProfile() {
    setSaving(true)
    try {
      await updateProfile({ name, reminderEnabled, reminderDays: parseInt(reminderDays) })
      toast.success('Profile saved!')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  async function changePassword() {
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match')
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setPwSaving(true)
    try {
      await api.put('/auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password updated!')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update password')
    } finally { setPwSaving(false) }
  }

  function exportData() {
    const json = JSON.stringify(apps, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `hiretrack-export-${Date.now()}.json`; a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported!')
  }

  const inp = (val, setVal, props = {}) => (
    <input className="form-input" value={val} onChange={e => setVal(e.target.value)} {...props} />
  )

  return (
    <div style={{ maxWidth: 640 }}>

      {/* Profile */}
      <Section title="Profile" subtitle="Update your personal information">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Full Name</label>
            {inp(name, setName, { placeholder: 'Your name' })}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Email Address</label>
            <input className="form-input" value={user?.email || ''} disabled style={{ opacity: .6 }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>Member since {new Date(user?.createdAt).toLocaleDateString()}</span>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Email Reminders" subtitle="Get notified when applications need follow-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Enable email reminders</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Get daily emails about stalled applications</div>
          </div>
          <Toggle value={reminderEnabled} onChange={setReminderEn} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Follow-up after (days)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="range" min={1} max={30} value={reminderDays} onChange={e => setReminderDays(e.target.value)}
              style={{ flex: 1, accentColor: 'var(--blue)' }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: 'var(--blue)', minWidth: 30, textAlign: 'center' }}>{reminderDays}d</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
            Reminders trigger if no response after <strong>{reminderDays} days</strong>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={saving}>
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>
      </Section>

      {/* Password */}
      <Section title="Change Password" subtitle="Update your account password">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label className="form-label">Current Password</label>
            <input className="form-input" type="password" value={pwForm.currentPassword}
              onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} placeholder="••••••••" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Min. 6 chars" />
            </div>
            <div>
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat password" />
            </div>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={changePassword} disabled={pwSaving}>
          {pwSaving ? 'Updating…' : 'Update Password'}
        </button>
      </Section>

      {/* Plan */}
      <Section title="Plan & Billing" subtitle="Your current subscription">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>Free Plan</span>
              <span style={{ padding: '2px 8px', borderRadius: 20, background: 'var(--surface2)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)' }}>Current</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>Track up to 50 applications · Basic analytics</div>
          </div>
          <button className="btn btn-primary btn-sm">⭐ Upgrade to Pro</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {['Unlimited applications', 'AI follow-up drafts', 'Priority email support', 'Export to CSV / PDF', 'Resume upload & storage', 'Team sharing (unlimited)'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text2)' }}>
              <span style={{ color: 'var(--green)', fontWeight: 800 }}>✓</span> {f}
            </div>
          ))}
        </div>
      </Section>

      {/* Data */}
      <Section title="Data Management" subtitle="Export or delete your application data">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={exportData}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Export JSON
          </button>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>{apps.length} applications in your account</span>
          <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }}
            onClick={() => { if (window.confirm('Sign out from HireTrack?')) logout() }}>
            Sign Out
          </button>
        </div>
      </Section>
    </div>
  )
}
