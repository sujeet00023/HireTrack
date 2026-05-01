import React, { useEffect, useState } from 'react'
import { CompanyLogo, StatusPill, Spinner, EmptyState } from '../components/UI'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Team() {
  const [teams, setTeams]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [creating, setCreating]   = useState(false)
  const [joining, setJoining]     = useState(false)
  const [teamApps, setTeamApps]   = useState([])
  const [activeTeam, setActiveTeam] = useState(null)
  const [appsLoading, setAppsLoading] = useState(false)

  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamDesc, setNewTeamDesc] = useState('')
  const [inviteCode, setInviteCode]   = useState('')

  useEffect(() => { loadTeams() }, [])

  async function loadTeams() {
    setLoading(true)
    try {
      const { data } = await api.get('/teams')
      setTeams(data.data)
      if (data.data.length > 0 && !activeTeam) {
        setActiveTeam(data.data[0])
        loadTeamApps(data.data[0]._id)
      }
    } catch { toast.error('Failed to load teams') }
    finally { setLoading(false) }
  }

  async function loadTeamApps(teamId) {
    setAppsLoading(true)
    try {
      const { data } = await api.get(`/teams/${teamId}/applications`)
      setTeamApps(data.data)
    } catch { toast.error('Failed to load team applications') }
    finally { setAppsLoading(false) }
  }

  async function createTeam() {
    if (!newTeamName.trim()) return toast.error('Team name required')
    setCreating(true)
    try {
      const { data } = await api.post('/teams', { name: newTeamName, description: newTeamDesc })
      setTeams(prev => [...prev, data.data])
      setActiveTeam(data.data)
      loadTeamApps(data.data._id)
      setNewTeamName(''); setNewTeamDesc('')
      toast.success(`Team "${data.data.name}" created! Share invite code: ${data.data.inviteCode}`)
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create team') }
    finally { setCreating(false) }
  }

  async function joinTeam() {
    if (!inviteCode.trim()) return toast.error('Invite code required')
    setJoining(true)
    try {
      const { data } = await api.post('/teams/join', { inviteCode })
      setTeams(prev => [...prev, data.data])
      setActiveTeam(data.data)
      loadTeamApps(data.data._id)
      setInviteCode('')
      toast.success(data.message)
    } catch (e) { toast.error(e.response?.data?.message || 'Invalid invite code') }
    finally { setJoining(false) }
  }

  async function selectTeam(team) {
    setActiveTeam(team)
    loadTeamApps(team._id)
  }

  const statusCounts = teamApps.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {})

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={32} /></div>

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Team Collaboration</h2>
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>
          Create a team to share your job search progress with friends or study groups.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: teams.length ? '280px 1fr' : '1fr', gap: 16 }}>

        {/* Left panel — create / join + team list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Create team */}
          <div className="card fade-up">
            <div className="card-head"><div className="card-title">Create Team</div></div>
            <div className="card-body">
              <div style={{ marginBottom: 10 }}>
                <label className="form-label">Team Name</label>
                <input className="form-input" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="e.g. FAANG Hunters" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">Description (optional)</label>
                <input className="form-input" value={newTeamDesc} onChange={e => setNewTeamDesc(e.target.value)} placeholder="What's this team about?" />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={createTeam} disabled={creating}>
                {creating ? 'Creating…' : '+ Create Team'}
              </button>
            </div>
          </div>

          {/* Join team */}
          <div className="card fade-up-2">
            <div className="card-head"><div className="card-title">Join a Team</div></div>
            <div className="card-body">
              <div style={{ marginBottom: 10 }}>
                <label className="form-label">Invite Code</label>
                <input className="form-input" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A1B2C3" maxLength={8} style={{ letterSpacing: 2, fontFamily: 'var(--mono)' }} />
              </div>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={joinTeam} disabled={joining}>
                {joining ? 'Joining…' : '→ Join Team'}
              </button>
            </div>
          </div>

          {/* Team list */}
          {teams.length > 0 && (
            <div className="card fade-up-3">
              <div className="card-head"><div className="card-title">My Teams</div></div>
              <div style={{ padding: '8px 10px' }}>
                {teams.map(t => (
                  <button key={t._id}
                    onClick={() => selectTeam(t)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '9px 10px', border: 'none', cursor: 'pointer',
                      borderRadius: 'var(--r)', marginBottom: 2, textAlign: 'left',
                      background: activeTeam?._id === t._id ? 'var(--blue-bg)' : 'transparent',
                      color: activeTeam?._id === t._id ? 'var(--blue)' : 'var(--text2)',
                      transition: '.15s', fontFamily: 'var(--font)',
                    }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                      {t.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: 11, opacity: .7 }}>{t.members?.length || 1} member{t.members?.length !== 1 ? 's' : ''}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right panel — team details */}
        {activeTeam && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Team header */}
            <div className="card fade-up">
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 3 }}>{activeTeam.name}</h3>
                    {activeTeam.description && <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>{activeTeam.description}</div>}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {Object.entries(statusCounts).map(([s, c]) => (
                        <div key={s} style={{ fontSize: 12, color: 'var(--text2)', padding: '3px 10px', borderRadius: 20, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                          {s}: <strong>{c}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Invite Code</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: 'var(--blue)', letterSpacing: 3 }}>{activeTeam.inviteCode}</div>
                    <button className="btn btn-ghost btn-xs" style={{ marginTop: 6 }}
                      onClick={() => { navigator.clipboard.writeText(activeTeam.inviteCode); toast.success('Code copied!') }}>
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="card fade-up-2">
              <div className="card-head"><div className="card-title">Members ({activeTeam.members?.length || 0})</div></div>
              <div style={{ padding: '10px 12px' }}>
                {(activeTeam.members || []).map(m => (
                  <div key={m.user?._id || m._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 8px', borderRadius: 'var(--r)', marginBottom: 4, background: 'var(--surface2)' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--blue-bg)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                      {(m.user?.name || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{m.user?.name || 'Unknown'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{m.user?.email}</div>
                    </div>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: m.role === 'admin' ? 'var(--purple-bg)' : 'var(--surface)', color: m.role === 'admin' ? 'var(--purple)' : 'var(--text3)', border: '1px solid var(--border)', fontWeight: 600 }}>
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team applications */}
            <div className="card fade-up-3">
              <div className="card-head">
                <div><div className="card-title">Team Applications</div><div className="card-sub">All members' job applications</div></div>
              </div>
              <div className="tbl-wrap">
                {appsLoading ? (
                  <div style={{ padding: 32, textAlign: 'center' }}><Spinner /></div>
                ) : teamApps.length === 0 ? (
                  <EmptyState icon="📋" title="No applications yet" desc="Team members haven't added applications yet." />
                ) : (
                  <table>
                    <thead>
                      <tr><th>Member</th><th>Company</th><th>Role</th><th>Status</th><th>Applied</th></tr>
                    </thead>
                    <tbody>
                      {teamApps.map(app => (
                        <tr key={app._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--blue-bg)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                                {(app.user?.name || 'U').slice(0, 2).toUpperCase()}
                              </div>
                              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{app.user?.name || '—'}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <CompanyLogo company={app.company} size={26} />
                              <span style={{ fontWeight: 600, fontSize: 13 }}>{app.company}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: 13 }}>{app.role}</td>
                          <td><StatusPill status={app.status} /></td>
                          <td style={{ fontSize: 12, color: 'var(--text3)' }}>
                            {new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No teams yet */}
        {teams.length === 0 && !loading && (
          <div className="card fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <EmptyState icon="👥" title="No teams yet" desc="Create a team or join one with an invite code to collaborate with others." />
          </div>
        )}
      </div>
    </div>
  )
}
