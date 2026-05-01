import React, { useEffect } from 'react'
import { useApps } from '../context/AppsContext'
import { StatCard, ProgressBar, Spinner } from '../components/UI'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = {
  applied: '#4F8EF7',
  interview: '#FBBF24',
  offer: '#34D399',
  rejected: '#F87171',
}

const TooltipBox = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ color: 'var(--text3)', marginBottom: 3 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}{p.unit || ''}</strong>
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { apps, stats, statsLoading, fetchApps, fetchStats } = useApps()

  useEffect(() => {
    fetchApps({ limit: 200 })
    fetchStats()
  }, [])

  if (statsLoading && !stats) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={32} /></div>
  }

  // Weekly trend data
  const trendData = stats?.recentTrend?.length
    ? stats.recentTrend.map((t, i) => ({ name: `W${i + 1}`, count: t.count }))
    : Array.from({ length: 8 }, (_, i) => ({ name: `W${i + 1}`, count: 0 }))

  // Status breakdown
  const statusData = [
    { name: 'Applied', value: stats?.applied || 0, color: COLORS.applied },
    { name: 'Interview', value: stats?.interview || 0, color: COLORS.interview },
    { name: 'Offer', value: stats?.offer || 0, color: COLORS.offer },
    { name: 'Rejected', value: stats?.rejected || 0, color: COLORS.rejected },
  ]

  // Funnel data
  const total = stats?.total || 1
  const funnelData = [
    { stage: 'Applied', count: stats?.total || 0, pct: 100, color: COLORS.applied },
    { stage: 'Interview', count: stats?.interview || 0, pct: Math.round(((stats?.interview || 0) / total) * 100), color: COLORS.interview },
    { stage: 'Offer', count: stats?.offer || 0, pct: Math.round(((stats?.offer || 0) / total) * 100), color: COLORS.offer },
  ]

  // Avg salary by status (from apps)
  const salaryByStatus = ['applied', 'interview', 'offer', 'rejected'].map(s => {
    const filtered = apps.filter(a => a.status === s && (a.salary?.max || a.salary?.min))
    const avg = filtered.length
      ? Math.round(filtered.reduce((sum, a) => sum + (a.salary?.max || a.salary?.min || 0), 0) / filtered.length / 1000)
      : 0
    return { name: s[0].toUpperCase() + s.slice(1), avg, color: COLORS[s] }
  })

  // Day of week distribution
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayCounts = new Array(7).fill(0)
  apps.forEach(a => {
    if (a.appliedDate) dayCounts[new Date(a.appliedDate).getDay()]++
  })
  
  const dayData = DAYS.map((name, i) => ({ name, count: dayCounts[i] }))

  // Job type distribution
  const typeMap = {}
  apps.forEach(a => { typeMap[a.jobType || 'full-time'] = (typeMap[a.jobType || 'full-time'] || 0) + 1 })
  const typeData = Object.entries(typeMap).map(([k, v]) => ({ name: k, value: v }))

  const TYPE_COLORS = ['#4F8EF7', '#34D399', '#FBBF24', '#A78BFA', '#F87171']

  return (
    <div>
      {/* KPI row */}
      <div className="stats-grid fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        <StatCard label="Total Applied" value={stats?.total || 0} color="var(--blue)" accent="blue" meta="All time" />
        <StatCard label="Interview Rate" value={`${stats?.interviewRate || 0}%`} color="var(--amber)" accent="amber"
          meta={stats?.interviewRate > 20 ? '↑ Above average' : '→ Keep applying'} />
        <StatCard label="Offer Rate" value={`${stats?.successRate || 0}%`} color="var(--green)" accent="green"
          meta={stats?.offer > 0 ? '🎉 Great progress!' : 'Keep applying!'} />
        <StatCard label="Follow-ups Due" value={stats?.followUpNeeded || 0} color="var(--red)"
          meta="Applications need follow-up" />
      </div>

      {/* Row 1: Trend + Pie */}
      <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-head">
            <div><div className="card-title">Applications Over Time</div><div className="card-sub">Weekly trend for last 8 weeks</div></div>
          </div>
          <div style={{ padding: '16px 20px 12px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F8EF7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<TooltipBox />} />
                <Area type="monotone" dataKey="count" name="Apps" stroke="#4F8EF7" strokeWidth={2.5} fill="url(#grad1)"
                  dot={{ fill: '#4F8EF7', r: 4, stroke: 'var(--surface)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div><div className="card-title">Status Breakdown</div><div className="card-sub">All applications</div></div></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={statusData.filter(d => d.value > 0)} cx="50%" cy="50%"
                  innerRadius={42} outerRadius={62} dataKey="value" paddingAngle={3}>
                  {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip content={<TooltipBox />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 10 }}>
              {statusData.map(d => (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 9, height: 9, borderRadius: 2, background: d.color }} />
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>{d.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                    <strong style={{ color: 'var(--text)' }}>{d.value}</strong>
                    <span style={{ color: 'var(--text3)' }}>{total ? Math.round((d.value / total) * 100) : 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Funnel + Salary */}
      <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-head"><div><div className="card-title">Conversion Funnel</div><div className="card-sub">Applied → Interview → Offer</div></div></div>
          <div className="card-body">
            {funnelData.map((f, i) => (
              <div key={f.stage} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{f.stage}</span>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: f.color }}>{f.count}</span>
                    <span style={{ color: 'var(--text3)' }}>{f.pct}%</span>
                  </div>
                </div>
                <ProgressBar value={f.count} max={stats?.total || 1} color={f.color} />
                {i < funnelData.length - 1 && f.count > 0 && funnelData[i + 1].count > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                    → {Math.round((funnelData[i + 1].count / f.count) * 100)}% → {funnelData[i + 1].stage}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div><div className="card-title">Avg Salary by Status</div><div className="card-sub">In $k — from applications with salary data</div></div></div>
          <div style={{ padding: '16px 20px 12px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={salaryByStatus} barSize={36}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false}
                  tickFormatter={v => v ? `$${v}k` : '$0'} />
                <Tooltip content={<TooltipBox />} />
                <Bar dataKey="avg" name="Avg Salary" radius={[6, 6, 0, 0]}>
                  {salaryByStatus.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Day of week + Top companies */}
      <div className="fade-up-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-head"><div><div className="card-title">Applications by Day</div><div className="card-sub">Which days you apply most</div></div></div>
          <div style={{ padding: '16px 20px 12px' }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dayData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<TooltipBox />} />
                <Bar dataKey="count" name="Applications" fill="#A78BFA" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div><div className="card-title">Top Companies Applied</div><div className="card-sub">Ranked by application count</div></div></div>
          <div className="card-body">
            {(stats?.topCompanies || []).length === 0 ? (
              <p style={{ color: 'var(--text3)', fontSize: 13 }}>No data yet.</p>
            ) : (stats?.topCompanies || []).map(co => (
              <div key={co.name} style={{ marginBottom: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ fontWeight: 500 }}>{co.name}</span>
                  <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{co.count}</span>
                </div>
                <ProgressBar value={co.count} max={stats.topCompanies[0]?.count || 1} color="var(--blue)" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job type breakdown */}
      {typeData.length > 0 && (
        <div className="card fade-up-4">
          <div className="card-head"><div><div className="card-title">Job Type Distribution</div><div className="card-sub">Breakdown by employment type</div></div></div>
          <div style={{ padding: '16px 20px', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <ResponsiveContainer width={180} height={140}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" outerRadius={60} dataKey="value" paddingAngle={3}>
                  {typeData.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<TooltipBox />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {typeData.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 9, height: 9, borderRadius: 2, background: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                    <span style={{ color: 'var(--text2)', textTransform: 'capitalize' }}>{d.name}</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
