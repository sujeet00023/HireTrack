import React, { useState, useEffect } from 'react'
import { Modal, FormField } from './UI'
import { useApps } from '../context/AppsContext'

const EMPTY = {
  company: '', role: '', status: 'applied',
  'salary.min': '', 'salary.max': '',
  location: '', remote: false, jobUrl: '',
  jobType: 'full-time', priority: 'medium',
  appliedDate: new Date().toISOString().split('T')[0],
  recruiterName: '', recruiterEmail: '', note: ''
}

export default function AppModal({ open, onClose, editApp }) {
  const { addApp, updateApp } = useApps()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editApp) {
      setForm({
        ...EMPTY,
        ...editApp,
        'salary.min': editApp.salary?.min || '',
        'salary.max': editApp.salary?.max || '',
        appliedDate: editApp.appliedDate ? editApp.appliedDate.split('T')[0] : EMPTY.appliedDate,
      })
    } else {
      setForm({ ...EMPTY, appliedDate: new Date().toISOString().split('T')[0] })
    }
    setErrors({})
  }, [open, editApp])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target?.value ?? e }))
  const setCheck = k => e => setForm(f => ({ ...f, [k]: e.target.checked }))

  function validate() {
    const e = {}
    if (!form.company.trim()) e.company = 'Required'
    if (!form.role.trim()) e.role = 'Required'
    setErrors(e)
    return !Object.keys(e).length
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        salary: { min: parseInt(form['salary.min']) || 0, max: parseInt(form['salary.max']) || 0 }
      }
      delete payload['salary.min']
      delete payload['salary.max']

      if (editApp) await updateApp(editApp._id, payload)
      else await addApp(payload)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const inp = (key, props = {}) => (
    <input className="form-input" value={form[key] || ''} onChange={set(key)} {...props} />
  )

  const sel = (key, options) => (
    <select className="form-input" value={form[key] || ''} onChange={set(key)}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  )

  return (
    <Modal open={open} onClose={onClose}
      title={editApp ? `Edit — ${editApp.company}` : 'Add Application'}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : editApp ? 'Update' : 'Save Application'}
        </button>
      </>}
    >
      {/* Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <FormField label="Company" required error={errors.company}>
          {inp('company', { placeholder: 'e.g. Stripe' })}
        </FormField>
        <FormField label="Role / Position" required error={errors.role}>
          {inp('role', { placeholder: 'e.g. Senior Engineer' })}
        </FormField>
        <FormField label="Status">
          {sel('status', [['applied','Applied'],['interview','Interview'],['offer','Offer'],['rejected','Rejected'],['withdrawn','Withdrawn']])}
        </FormField>
        <FormField label="Priority">
          {sel('priority', [['high','🔴 High'],['medium','🟡 Medium'],['low','⚪ Low']])}
        </FormField>
        <FormField label="Salary Min ($)">
          {inp('salary.min', { type: 'number', placeholder: '80000' })}
        </FormField>
        <FormField label="Salary Max ($)">
          {inp('salary.max', { type: 'number', placeholder: '120000' })}
        </FormField>
        <FormField label="Date Applied">
          {inp('appliedDate', { type: 'date' })}
        </FormField>
        <FormField label="Job Type">
          {sel('jobType', [['full-time','Full-time'],['part-time','Part-time'],['contract','Contract'],['internship','Internship'],['freelance','Freelance']])}
        </FormField>
        <FormField label="Location">
          {inp('location', { placeholder: 'New York, NY' })}
        </FormField>
        <FormField label="Remote?">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
            <input type="checkbox" id="remote-cb" checked={!!form.remote} onChange={setCheck('remote')} />
            <label htmlFor="remote-cb" style={{ fontSize: 13, color: 'var(--text2)' }}>Remote position</label>
          </div>
        </FormField>
      </div>
      <FormField label="Job URL">
        {inp('jobUrl', { type: 'url', placeholder: 'https://jobs.company.com/...' })}
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <FormField label="Recruiter Name">
          {inp('recruiterName', { placeholder: 'Sarah Smith' })}
        </FormField>
        <FormField label="Recruiter Email">
          {inp('recruiterEmail', { type: 'email', placeholder: 'sarah@company.com' })}
        </FormField>
      </div>
      <FormField label="Notes">
        <textarea className="form-input" value={form.note || ''} onChange={set('note')}
          placeholder="Referral details, interview notes, deadlines, impressions…" rows={3} />
      </FormField>
    </Modal>
  )
}
