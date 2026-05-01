import React, { useEffect } from 'react'
import { useApps } from '../context/AppsContext'
import { useAuth } from '../context/AuthContext'
import { StatCard, CompanyLogo, StatusPill, SalaryDisplay, ProgressBar, Spinner, EmptyState } from '../components/UI'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'

const COLORS = { applied: '#4F8EF7', interview: '#FBBF24', offer: '#34D399', rejected: '#F87171' }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ color: 'var(--text3)', marginBottom: 2 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color || 'var(--blue)' }}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </div>
  )
}

export default function Dashboard({ onAddApp, onEdit }) {
  const { user } = useAuth()
  const { apps, stats, loading, statsLoading, fetchApps, fetchStats } = useApps()

  useEffect(() => {
    fetchApps({ limit: 8, sort: 'date-desc' })
    fetchStats()
  }, [])

  const recent = apps.slice(0, 6)
  const donutData = stats ? [
    { name: 'Applied', value: stats.applied, color: COLORS.applied },
    { name: 'Interview', value: stats.interview, color: COLORS.interview },
    { name: 'Offer', value: stats.offer, color: COLORS.offer },
    { name: 'Rejected', value: stats.rejected, color: COLORS.rejected },
  ].filter(d => d.value > 0) : []

  // Build 8-week trend from API
  const trendData = stats?.recentTrend?.length
    ? stats.recentTrend.map((t, i) => ({ name: `W${i + 1}`, count: t.count }))
    : Array.from({ length: 8 }, (_, i) => ({ name: `W${i + 1}`, count: 0 }))

  if (loading && !stats) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={32} /></div>
  }

  return (
    <div>
      {/* Greeting */}
      <div className="fade-up" style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.4px' }}>
          Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
          You have <strong style={{ color: 'var(--amber)' }}>{stats?.interview || 0} active interviews</strong> and <strong style={{ color: 'var(--red)' }}>{stats?.followUpNeeded || 0} follow-ups</strong> needed.
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid fade-up-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        <StatCard label="Total Applied" value={stats?.total || 0} meta="All time" color="var(--blue)" accent="blue"
          icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/></svg>}
        />
        <StatCard label="Interviews" value={stats?.interview || 0} meta={`${stats?.interviewRate || 0}% interview rate`} color="var(--amber)" accent="amber"
          icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
        />
        <StatCard label="Offers" value={stats?.offer || 0} meta={`🎉 ${stats?.successRate || 0}% success rate`} color="var(--green)" accent="green"
          icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
        />
        <StatCard label="Avg Salary" value={stats?.avgSalary ? `$${Math.round(stats.avgSalary / 1000)}k` : '—'} meta="Across applications" color="var(--purple)" accent="purple"
          icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
        />
      </div>

      {/* Charts */}
      <div className="chart-grid fade-up-3" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 22 }}>
        {/* Trend */}
        <div className="card">
          <div className="card-head">
            <div><div className="card-title">Weekly Applications</div><div className="card-sub">Applications sent per week</div></div>
          </div>
          <div style={{ padding: '16px 20px 12px' }}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F8EF7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Apps" stroke="#4F8EF7" strokeWidth={2} fill="url(#blueGrad)" dot={{ fill: '#4F8EF7', r: 4, strokeWidth: 2, stroke: 'var(--surface)' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut */}
        <div className="card">
          <div className="card-head"><div><div className="card-title">Status Breakdown</div><div className="card-sub">All applications</div></div></div>
          <div className="card-body">
            {donutData.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px 0', fontSize: 13 }}>No data yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={65}
                      dataKey="value" paddingAngle={3}>
                      {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {donutData.map(d => (
                    <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                        <span style={{ color: 'var(--text2)' }}>{d.name}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Top companies */}
      {stats?.topCompanies?.length > 0 && (
        <div className="card fade-up-4" style={{ marginBottom: 22 }}>
          <div className="card-head"><div className="card-title">Top Companies Applied</div></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
              {stats.topCompanies.slice(0, 6).map(c => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CompanyLogo company={c.name} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    <ProgressBar value={c.count} max={stats.topCompanies[0]?.count || 1} color="var(--blue)" />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', minWidth: 16 }}>{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent table */}
      <div className="card fade-up-4">
        <div className="card-head">
          <div><div className="card-title">Recent Applications</div><div className="card-sub">Latest {recent.length} applications</div></div>
          <button className="btn btn-ghost btn-sm" onClick={onAddApp}>+ Add New</button>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Company</th><th>Role</th><th>Status</th><th>Salary</th><th>Applied</th><th>Actions</th></tr></thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon="📋" title="No applications yet" desc="Add your first job application to get started." action={<button className="btn btn-primary btn-sm" onClick={onAddApp}>Add Application</button>} /></td></tr>
              ) : recent.map(app => (
                <tr key={app._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CompanyLogo company={app.company} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{app.company}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{app.location || (app.remote ? 'Remote' : '')}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{app.role}</td>
                  <td><StatusPill status={app.status} /></td>
                  <td><SalaryDisplay salary={app.salary} /></td>
                  <td style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  <td>
                    <button className="icon-btn" onClick={() => onEdit(app)} title="Edit">
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
