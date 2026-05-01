import React, { useEffect, useState } from 'react'
import { useApps } from '../context/AppsContext'
import { useAuth } from '../context/AuthContext'
import { CompanyLogo, StatusPill, Card, Spinner } from '../components/UI'
import toast from 'react-hot-toast'
import api from '../utils/api'

function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000)
}

function urgencyConfig(days) {
  if (days >= 14) return { label: 'Overdue!', color: 'var(--red)', bg: 'var(--red-bg)' }
  if (days >= 7)  return { label: 'Follow up now', color: 'var(--amber)', bg: 'var(--amber-bg)' }
  return { label: 'Follow up soon', color: 'var(--blue)', bg: 'var(--blue-bg)' }
}

export default function Reminders() {
  const { apps, stats, fetchApps, fetchStats, changeStatus } = useApps()
  const { user } = useAuth()
  const [sending, setSending] = useState(null)

  useEffect(() => {
    fetchApps({ limit: 200 })
    fetchStats()
  }, [])

  const reminderDays = user?.reminderDays || 5

  const followUp = apps
    .filter(a => a.status === 'applied' && daysSince(a.appliedDate) >= reminderDays)
    .sort((a, b) => daysSince(b.appliedDate) - daysSince(a.appliedDate))

  const interviews = apps.filter(a => a.status === 'interview')
  const offers     = apps.filter(a => a.status === 'offer')

  async function sendTestEmail() {
    setSending('test')
    try {
      await api.post('/auth/test-reminder')
      toast.success('Test reminder email sent! Check your inbox.')
    } catch {
      toast.error('Email not configured yet — set EMAIL_USER in backend .env')
    } finally {
      setSending(null)
    }
  }

  async function markInterviewed(app) {
    await changeStatus(app._id, 'interview')
  }

  const Section = ({ title, count, children }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.7px' }}>
          {title}
        </div>
        <span style={{ background: 'var(--surface2)', color: 'var(--text3)', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, border: '1px solid var(--border)' }}>
          {count}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Smart Reminders</h2>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>
            Follow-up reminders trigger after <strong style={{ color: 'var(--text2)' }}>{reminderDays} days</strong> of no response.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ padding: '6px 14px', borderRadius: 20, background: 'var(--red-bg)', color: 'var(--red)', fontSize: 12, fontWeight: 600 }}>
            🔔 {followUp.length} follow-up{followUp.length !== 1 ? 's' : ''} needed
          </div>
          <div style={{ padding: '6px 14px', borderRadius: 20, background: 'var(--amber-bg)', color: 'var(--amber)', fontSize: 12, fontWeight: 600 }}>
            🤝 {interviews.length} interview{interviews.length !== 1 ? 's' : ''} active
          </div>
          <button className="btn btn-ghost btn-sm" onClick={sendTestEmail} disabled={sending === 'test'}>
            {sending === 'test' ? 'Sending…' : '✉️ Test Email'}
          </button>
        </div>
      </div>

      {/* Follow-ups */}
      {followUp.length > 0 && (
        <Section title="Follow-up Needed" count={followUp.length}>
          {followUp.map(app => {
            const days = daysSince(app.appliedDate)
            const urg  = urgencyConfig(days)
            return (
              <div key={app._id} className="card fade-up">
                <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <CompanyLogo company={app.company} />
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{app.company} — {app.role}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>
                      Applied {new Date(app.appliedDate).toLocaleDateString()} · {days} days ago
                      {app.location ? ` · ${app.location}` : ''}
                      {app.recruiterName ? ` · 👤 ${app.recruiterName}` : ''}
                    </div>
                    {app.note && (
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 5, fontStyle: 'italic', padding: '4px 8px', background: 'var(--surface2)', borderRadius: 6, display: 'inline-block' }}>
                        "{app.note.slice(0, 90)}{app.note.length > 90 ? '…' : ''}"
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ padding: '4px 11px', borderRadius: 20, background: urg.bg, color: urg.color, fontSize: 11, fontWeight: 600 }}>
                      ⏰ {urg.label}
                    </span>
                    {app.recruiterEmail && (
                      <a
                        href={`mailto:${app.recruiterEmail}?subject=Following up on ${app.role} application&body=Hi ${app.recruiterName || 'there'},%0A%0AI wanted to follow up on my application for the ${app.role} position at ${app.company}. I remain very interested and would love to discuss next steps.%0A%0AThank you!`}
                        className="btn btn-ghost btn-sm"
                        target="_blank" rel="noreferrer"
                      >
                        📧 Draft Email
                      </a>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => markInterviewed(app)}>
                      Got Interview ✓
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </Section>
      )}

      {/* Active Interviews */}
      {interviews.length > 0 && (
        <Section title="Active Interviews" count={interviews.length}>
          {interviews.map(app => (
            <div key={app._id} className="card fade-up">
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <CompanyLogo company={app.company} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{app.company} — {app.role}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>
                    {app.interviewType ? `${app.interviewType} interview` : 'Interview stage'}
                    {app.interviewDate ? ` · Scheduled: ${new Date(app.interviewDate).toLocaleDateString()}` : ''}
                  </div>
                  {app.note && (
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 5 }}>{app.note.slice(0, 100)}</div>
                  )}
                </div>
                <StatusPill status="interview" />
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Offers */}
      {offers.length > 0 && (
        <Section title="🎉 Offers" count={offers.length}>
          {offers.map(app => (
            <div key={app._id} className="card fade-up" style={{ borderLeft: '3px solid var(--green)' }}>
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <CompanyLogo company={app.company} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{app.company} — {app.role}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>
                    {app.salary?.max ? `💰 $${app.salary.max.toLocaleString()} / year · ` : ''}
                    {app.location || ''}
                  </div>
                  {app.note && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 5 }}>{app.note.slice(0, 100)}</div>}
                </div>
                <StatusPill status="offer" />
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* All clear */}
      {followUp.length === 0 && interviews.length === 0 && offers.length === 0 && (
        <div className="card fade-up">
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🎯</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>All caught up!</div>
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>No follow-ups needed right now. Keep applying and track your progress!</div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card fade-up" style={{ marginTop: 24 }}>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>💡 Follow-up Tips</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {[
              { icon: '📅', tip: 'Follow up after 5–7 business days of no response.' },
              { icon: '📧', tip: 'Keep it short — 2-3 sentences of continued interest.' },
              { icon: '🔗', tip: 'Connect with the hiring manager on LinkedIn first.' },
              { icon: '📝', tip: 'Reference something specific about the role or company.' },
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'var(--surface2)', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
                <span style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{t.tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
