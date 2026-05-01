import React, { useEffect, useState, useCallback } from 'react'
import { useApps } from '../context/AppsContext'
import { StatusPill, CompanyLogo, SalaryDisplay, PriorityTag, EmptyState, Spinner } from '../components/UI'
import toast from 'react-hot-toast'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

export default function Applications({ search, onEdit, onAdd }) {
  const { apps, stats, loading, fetchApps, changeStatus, deleteApp } = useApps()
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('date-desc')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    fetchApps({ status: filter === 'all' ? undefined : filter, search, sort })
  }, [filter, search, sort])

  function confirmDelete(app) {
    if (window.confirm(`Remove ${app.company} — ${app.role}?`)) deleteApp(app._id)
  }

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(f => {
            const cnt = f.value === 'all' ? stats?.total : stats?.[f.value]
            return (
              <div key={f.value} className={`chip${filter === f.value ? ' active' : ''}`}
                onClick={() => setFilter(f.value)}>
                {f.label} {cnt !== undefined && <span style={{ opacity: .7 }}>({cnt})</span>}
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ fontSize: 12, padding: '5px 10px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', outline: 'none' }}>
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="company">Company A–Z</option>
            <option value="salary-desc">Highest salary</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={onAdd}>+ Add</button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th><th>Role</th><th>Status</th><th>Priority</th>
                <th>Salary</th><th>Applied</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && apps.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32 }}><Spinner /></td></tr>
              ) : apps.length === 0 ? (
                <tr><td colSpan={7}>
                  <EmptyState icon="📋" title="No applications found"
                    desc={search ? 'Try a different search term.' : 'Start tracking your job search!'}
                    action={<button className="btn btn-primary btn-sm" onClick={onAdd}>Add Application</button>} />
                </td></tr>
              ) : apps.map(app => (
                <React.Fragment key={app._id}>
                  <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === app._id ? null : app._id)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CompanyLogo company={app.company} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{app.company}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{app.remote ? '🌐 Remote' : app.location}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{app.role}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{app.jobType}</div>
                    </td>
                    <td><StatusPill status={app.status} /></td>
                    <td><PriorityTag priority={app.priority} /></td>
                    <td><SalaryDisplay salary={app.salary} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                      {new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <button className="icon-btn" title="Edit" onClick={() => onEdit(app)}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <select defaultValue="" onChange={e => { if (e.target.value) changeStatus(app._id, e.target.value); e.target.value = '' }}
                          style={{ fontSize: 11, padding: '3px 6px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', outline: 'none' }}
                          onClick={e => e.stopPropagation()}>
                          <option value="" disabled>Move…</option>
                          {['applied','interview','offer','rejected','withdrawn'].map(s => (
                            <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                        <button className="icon-btn danger" title="Delete" onClick={() => confirmDelete(app)}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded detail */}
                  {expanded === app._id && (
                    <tr>
                      <td colSpan={7} style={{ background: 'var(--surface2)', padding: '16px 20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, fontSize: 13 }}>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Notes</div>
                            <div style={{ color: 'var(--text2)', lineHeight: 1.6 }}>{app.note || 'No notes.'}</div>
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Details</div>
                            <div style={{ color: 'var(--text2)', lineHeight: 1.8 }}>
                              {app.recruiterName && <div>👤 {app.recruiterName} {app.recruiterEmail && `<${app.recruiterEmail}>`}</div>}
                              <div>📅 {new Date(app.appliedDate).toLocaleDateString()}</div>
                              {app.jobUrl && <div><a href={app.jobUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)' }}>🔗 View Job Posting</a></div>}
                            </div>
                          </div>
                          {app.notes?.length > 0 && (
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Thread ({app.notes.length})</div>
                              {app.notes.slice(-3).map((n, i) => (
                                <div key={i} style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 5 }}>
                                  <span style={{ color: 'var(--text3)' }}>{new Date(n.createdAt).toLocaleDateString()} — </span>{n.text}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
