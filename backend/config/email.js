const nodemailer = require('nodemailer')

// ── Transporter ──────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
}

// ── Base HTML template ───────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #F4F3EF; color: #1A1917; }
    .wrapper { max-width: 580px; margin: 32px auto; background: #fff; border-radius: 14px; overflow: hidden; border: 1px solid #E2E0D8; }
    .header { background: #2563EB; padding: 28px 32px; }
    .logo { font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .logo span { opacity: 0.7; }
    .body { padding: 28px 32px; }
    .body h2 { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #1A1917; }
    .body p { font-size: 14px; line-height: 1.7; color: #6B6860; margin-bottom: 14px; }
    .app-card { background: #F9F8F5; border: 1px solid #E2E0D8; border-radius: 10px; padding: 16px 18px; margin: 16px 0; }
    .app-card .company { font-size: 16px; font-weight: 700; color: #1A1917; }
    .app-card .role { font-size: 13px; color: #6B6860; margin-top: 3px; }
    .app-card .meta { font-size: 12px; color: #9E9C96; margin-top: 8px; }
    .pill { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .pill-applied { background: #EFF4FF; color: #2563EB; }
    .pill-interview { background: #FFFBEB; color: #D97706; }
    .pill-offer { background: #F0FDF4; color: #16A34A; }
    .pill-rejected { background: #FEF2F2; color: #DC2626; }
    .btn { display: inline-block; background: #2563EB; color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; margin: 8px 0; }
    .footer { padding: 18px 32px; border-top: 1px solid #E2E0D8; font-size: 12px; color: #9E9C96; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Hire<span>Track</span></div>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      © ${new Date().getFullYear()} HireTrack · You're receiving this because you enabled reminders.<br>
      <a href="#" style="color: #9E9C96;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>
`

// ── Send follow-up reminder ──────────────────────────────
const sendFollowUpReminder = async ({ to, name, applications }) => {
  const transporter = createTransporter()

  const appCards = applications.map(app => `
    <div class="app-card">
      <div class="company">${app.company}</div>
      <div class="role">${app.role}</div>
      <div class="meta">
        <span class="pill pill-applied">Applied</span>
        &nbsp; Applied ${app.daysSince} days ago · ${app.location || 'Remote/Unknown'}
      </div>
    </div>
  `).join('')

  const content = `
    <h2>👋 Hey ${name}, time to follow up!</h2>
    <p>You have <strong>${applications.length} application${applications.length > 1 ? 's' : ''}</strong> that haven't received a response in ${applications[0]?.daysSince || 5}+ days. A polite follow-up email can significantly boost your response rate.</p>
    ${appCards}
    <p style="margin-top: 18px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/reminders" class="btn">
        View Reminders →
      </a>
    </p>
    <p style="font-size: 13px; color: #9E9C96; margin-top: 16px;">
      💡 Tip: Keep follow-up emails short — 2-3 sentences expressing continued interest is perfect.
    </p>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `⏰ Follow up on ${applications.length} job application${applications.length > 1 ? 's' : ''} — HireTrack`,
    html: baseTemplate(content)
  })
}

// ── Send welcome email ───────────────────────────────────
const sendWelcomeEmail = async ({ to, name }) => {
  const transporter = createTransporter()

  const content = `
    <h2>Welcome to HireTrack, ${name}! 🎉</h2>
    <p>Your job search just got a lot more organized. HireTrack helps you track every application, never miss a follow-up, and land your dream job faster.</p>
    <p><strong>Here's what you can do:</strong></p>
    <div class="app-card">
      <div class="company">📋 Track Applications</div>
      <div class="role">Add every job you apply to with company, role, salary, and status</div>
    </div>
    <div class="app-card">
      <div class="company">📊 Analytics Dashboard</div>
      <div class="role">See your interview rate, success rate, and application trends</div>
    </div>
    <div class="app-card">
      <div class="company">🔔 Smart Reminders</div>
      <div class="role">Get emailed when it's time to follow up on applications</div>
    </div>
    <p style="margin-top: 18px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="btn">
        Start Tracking →
      </a>
    </p>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Welcome to HireTrack — Let's land that job 🚀`,
    html: baseTemplate(content)
  })
}

// ── Send status change notification ─────────────────────
const sendStatusUpdate = async ({ to, name, company, role, oldStatus, newStatus }) => {
  const transporter = createTransporter()

  const emoji = { interview: '🤝', offer: '🎉', rejected: '😔', applied: '📋' }
  const msg = newStatus === 'offer'
    ? `Congratulations! You received an offer from ${company}!`
    : newStatus === 'interview'
    ? `Great news! You have an interview at ${company}!`
    : `Your application to ${company} has been updated.`

  const content = `
    <h2>${emoji[newStatus] || '📋'} Application Update</h2>
    <p>Hey ${name}, ${msg}</p>
    <div class="app-card">
      <div class="company">${company}</div>
      <div class="role">${role}</div>
      <div class="meta">
        <span class="pill pill-${oldStatus}">${oldStatus}</span>
        &nbsp;→&nbsp;
        <span class="pill pill-${newStatus}">${newStatus}</span>
      </div>
    </div>
    <p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="btn">
        Open HireTrack →
      </a>
    </p>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `${emoji[newStatus]} ${company} — Status updated to ${newStatus} | HireTrack`,
    html: baseTemplate(content)
  })
}

module.exports = { sendFollowUpReminder, sendWelcomeEmail, sendStatusUpdate }
