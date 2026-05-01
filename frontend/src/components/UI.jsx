import React from 'react'

// ── Status Pill ──────────────────────────────────────────
const STATUS_CFG = {
  applied:   { label: 'Applied',   cls: 'pill-applied' },
  interview: { label: 'Interview', cls: 'pill-interview' },
  offer:     { label: 'Offer',     cls: 'pill-offer' },
  rejected:  { label: 'Rejected',  cls: 'pill-rejected' },
  withdrawn: { label: 'Withdrawn', cls: 'pill-withdrawn' },
}
export function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.applied
  return (
    <span className={`pill ${cfg.cls}`}>
      <span className="pill-dot" />{cfg.label}
    </span>
  )
}

// ── Priority tag ─────────────────────────────────────────
export function PriorityTag({ priority }) {
  if (!priority) return null
  return <span className={`priority-${priority}`}>{priority}</span>
}

// ── Company Logo ─────────────────────────────────────────
const PALETTES = [
  ['rgba(79,142,247,.15)', '#4F8EF7'],
  ['rgba(52,211,153,.15)', '#34D399'],
  ['rgba(251,191,36,.15)', '#FBBF24'],
  ['rgba(167,139,250,.15)', '#A78BFA'],
  ['rgba(248,113,113,.15)', '#F87171'],
  ['rgba(14,165,233,.15)', '#38BDF8'],
]
export function CompanyLogo({ company = 'NA', size = 34 }) {
  const [bg, color] = PALETTES[company.charCodeAt(0) % PALETTES.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, flexShrink: 0,
      background: bg, color, border: `1px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 700, letterSpacing: '-.5px'
    }}>
      {company.slice(0, 2).toUpperCase()}
    </div>
  )
}

// ── Salary display ───────────────────────────────────────
export function SalaryDisplay({ salary }) {
  if (!salary?.max && !salary?.min) return <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>
  const fmt = n => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`
  if (salary.min && salary.max) return <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>{fmt(salary.min)}–{fmt(salary.max)}</span>
  return <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>{fmt(salary.max || salary.min)}</span>
}

// ── Card ─────────────────────────────────────────────────
export function Card({ children, style, className = '' }) {
  return <div className={`card ${className}`} style={style}>{children}</div>
}

// ── Modal ────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer, width = 560 }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: width }}>
        <div style={{ padding: '18px 22px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15 }}>{title}</h2>
          <button className="icon-btn" onClick={onClose}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ padding: '20px 22px' }}>{children}</div>
        {footer && <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>}
      </div>
    </div>
  )
}

// ── Form Field ───────────────────────────────────────────
export function FormField({ label, children, error, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="form-label">{label}{required && <span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>}</label>
      {children}
      {error && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 3 }}>{error}</div>}
    </div>
  )
}

// ── Stat Card ────────────────────────────────────────────
export function StatCard({ label, value, meta, color = 'var(--text)', accent, icon }) {
  return (
    <div className={`stat-card ${accent || ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div className="stat-label">{label}</div>
        {icon && <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>{icon}</div>}
      </div>
      <div className="stat-value" style={{ color }}>{value}</div>
      {meta && <div className="stat-meta">{meta}</div>}
    </div>
  )
}

// ── Progress Bar ─────────────────────────────────────────
export function ProgressBar({ value, max, color = 'var(--blue)' }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0
  return <div className="prog-bar"><div className="prog-fill" style={{ width: `${pct}%`, background: color }} /></div>
}

// ── Spinner ──────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ animation: 'spin 1s linear infinite', color: 'var(--blue)' }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

// ── Empty State ──────────────────────────────────────────
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="empty fade-up">
      {icon && <div style={{ fontSize: 36, marginBottom: 12, opacity: .6 }}>{icon}</div>}
      {title && <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 5, color: 'var(--text2)' }}>{title}</div>}
      {desc && <div style={{ fontSize: 13, marginBottom: action ? 16 : 0 }}>{desc}</div>}
      {action}
    </div>
  )
}
