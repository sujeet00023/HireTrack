const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const Application = require('../models/Application')
const { protect } = require('../middleware/auth')

// ── Multer config for resume uploads ────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_PATH || './uploads'),
  filename: (req, file, cb) => {
    const unique = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`
    cb(null, unique)
  }
})
const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx']
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error('Only PDF and Word documents allowed'))
    }
    cb(null, true)
  }
})

// All routes require auth
router.use(protect)

// ── GET /api/applications ────────────────────────────────
// Query: ?status=interview&search=google&sort=date-desc&page=1&limit=20
router.get('/', async (req, res) => {
  try {
    const { status, search, sort = 'date-desc', page = 1, limit = 50, priority } = req.query
    const query = { user: req.user._id }

    if (status && status !== 'all') query.status = status
    if (priority) query.priority = priority
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } }
      ]
    }

    const sortMap = {
      'date-desc': { appliedDate: -1 },
      'date-asc': { appliedDate: 1 },
      'company': { company: 1 },
      'salary-desc': { 'salary.max': -1 },
      'updated': { updatedAt: -1 }
    }

    const total = await Application.countDocuments(query)
    const apps = await Application.find(query)
      .sort(sortMap[sort] || { appliedDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean()

    res.json({
      success: true,
      count: apps.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: apps
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── POST /api/applications ───────────────────────────────
router.post('/', async (req, res) => {
  try {
    const app = await Application.create({ ...req.body, user: req.user._id })
    res.status(201).json({ success: true, data: app })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── GET /api/applications/stats ──────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id

    const [statusCounts, recentTrend, topCompanies] = await Promise.all([
      // Status breakdown
      Application.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      // Last 8 weeks trend
      Application.aggregate([
        { $match: { user: userId, appliedDate: { $gte: new Date(Date.now() - 56 * 86400000) } } },
        {
          $group: {
            _id: { $week: '$appliedDate' },
            count: { $sum: 1 },
            week: { $first: '$appliedDate' }
          }
        },
        { $sort: { '_id': 1 } }
      ]),
      // Top companies
      Application.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$company', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ])
    ])

    const counts = { applied: 0, interview: 0, offer: 0, rejected: 0, withdrawn: 0 }
    statusCounts.forEach(s => { counts[s._id] = s.count })
    const total = Object.values(counts).reduce((a, b) => a + b, 0)

    // Avg salary
    const salaryAgg = await Application.aggregate([
      { $match: { user: userId, 'salary.max': { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$salary.max' } } }
    ])
    const avgSalary = salaryAgg[0]?.avg || 0

    // Follow-ups needed
    const followUpNeeded = await Application.countDocuments({
      user: userId,
      status: 'applied',
      followUpSent: false,
      appliedDate: { $lte: new Date(Date.now() - (req.user.reminderDays || 5) * 86400000) }
    })

    res.json({
      success: true,
      data: {
        total,
        ...counts,
        avgSalary: Math.round(avgSalary),
        successRate: total ? Math.round((counts.offer / total) * 100) : 0,
        interviewRate: total ? Math.round((counts.interview / total) * 100) : 0,
        followUpNeeded,
        recentTrend,
        topCompanies: topCompanies.map(c => ({ name: c._id, count: c.count }))
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── GET /api/applications/:id ────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, user: req.user._id })
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' })
    res.json({ success: true, data: app })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── PUT /api/applications/:id ────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' })
    res.json({ success: true, data: app })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── PATCH /api/applications/:id/status ──────────────────
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const valid = ['applied', 'interview', 'offer', 'rejected', 'withdrawn']
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true }
    )
    if (!app) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, data: app })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── POST /api/applications/:id/notes ────────────────────
router.post('/:id/notes', async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, user: req.user._id })
    if (!app) return res.status(404).json({ success: false, message: 'Not found' })
    app.notes.push({ text: req.body.text })
    await app.save()
    res.json({ success: true, data: app })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── POST /api/applications/:id/resume ───────────────────
router.post('/:id/resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' })
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { resumeFile: req.file.filename },
      { new: true }
    )
    if (!app) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, data: app, filename: req.file.filename })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── DELETE /api/applications/:id ────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const app = await Application.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!app) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, message: 'Application deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── DELETE /api/applications (bulk) ─────────────────────
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids)) return res.status(400).json({ success: false, message: 'ids array required' })
    await Application.deleteMany({ _id: { $in: ids }, user: req.user._id })
    res.json({ success: true, message: `${ids.length} applications deleted` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
