require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')
const { startReminderCron } = require('./config/cron')
const fs = require('fs')

// ── Connect to MongoDB ───────────────────────────────────
connectDB()

const app = express()

// ── Create uploads directory ─────────────────────────────
const uploadDir = process.env.UPLOAD_PATH || './uploads'
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

// ── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173'
  ],
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Rate Limiting ────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later' }
})

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
})

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/auth'))
app.use('/api/applications', apiLimiter, require('./routes/applications'))
app.use('/api/teams', apiLimiter, require('./routes/teams'))

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// ── 404 handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// ── Error handler ────────────────────────────────────────
app.use(errorHandler)

// ── Start server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`\n🚀 HireTrack API running on port ${PORT}`)
  console.log(`📍 Health: http://localhost:${PORT}/api/health`)
  console.log(`🌍 Env: ${process.env.NODE_ENV || 'development'}\n`)
})

// Start cron jobs
if (process.env.NODE_ENV !== 'test') {
  startReminderCron()
}

module.exports = app
