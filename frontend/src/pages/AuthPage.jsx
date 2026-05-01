import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
        toast.success('Welcome back!')
      } else {
        if (!form.name.trim()) { toast.error('Name is required'); return }
        await register(form.name, form.email, form.password)
        toast.success('Account created!')
      }
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Quick demo login
  async function demoLogin() {
    setLoading(true)
    try {
      await login('demo@hiretrack.app', 'demo1234')
      toast.success('Logged in as demo user!')
      navigate('/')
    } catch {
      toast.error('Demo account not set up yet — register instead!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-up">
        {/* Logo */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div className="logo-mark" style={{ fontSize: 24, marginBottom: 6 }}>
            <span className="ht">Hire</span>Track
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 'var(--r)', padding: 3, marginBottom: 24, border: '1px solid var(--border)' }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ flex: 1, padding: '7px', border: 'none', cursor: 'pointer', borderRadius: 6,
                background: mode === m ? 'var(--surface)' : 'transparent',
                color: mode === m ? 'var(--text)' : 'var(--text3)',
                fontWeight: mode === m ? 600 : 400, fontSize: 13, transition: '.15s',
                fontFamily: 'var(--font)',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.2)' : 'none'
              }}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={set('name')} placeholder="Alex Johnson" required />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
          </div>
          <div style={{ marginBottom: 22 }}>
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={set('password')} placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 14 }} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: 12 }}>
          <button onClick={demoLogin} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }} disabled={loading}>
            ⚡ Try Demo Account
          </button>
        </div>

        {/* Features list */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          {[
            '✦ Track unlimited job applications',
            '✦ Analytics dashboard & charts',
            '✦ Smart follow-up reminders',
            '✦ Team collaboration & sharing',
          ].map(f => (
            <div key={f} style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 5 }}>{f}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
