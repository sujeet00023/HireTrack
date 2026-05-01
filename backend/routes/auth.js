const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { protect, generateToken } = require('../middleware/auth')

// ── POST /api/auth/register ──────────────────────────────
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg })
  }

  try {
    const { name, email, password } = req.body

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' })

    const user = await User.create({ name, email, password })
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      token,
      user: user.toPublic()
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── POST /api/auth/login ─────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Invalid credentials' })
  }

  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' })

    const isMatch = await user.matchPassword(password)
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' })

    user.lastLogin = Date.now()
    await user.save({ validateBeforeSave: false })

    const token = generateToken(user._id)
    res.json({ success: true, token, user: user.toPublic() })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── GET /api/auth/me ─────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user.toPublic() })
})

// ── PUT /api/auth/profile ────────────────────────────────
router.put('/profile', protect, [
  body('name').optional().trim().notEmpty().isLength({ max: 50 }),
  body('reminderDays').optional().isInt({ min: 1, max: 30 }),
], async (req, res) => {
  try {
    const updates = {}
    const allowed = ['name', 'reminderEnabled', 'reminderDays']
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f] })

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    res.json({ success: true, user: user.toPublic() })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── PUT /api/auth/password ───────────────────────────────
router.put('/password', protect, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password')
    const ok = await user.matchPassword(req.body.currentPassword)
    if (!ok) return res.status(400).json({ success: false, message: 'Current password is wrong' })

    user.password = req.body.newPassword
    await user.save()
    const token = generateToken(user._id)
    res.json({ success: true, token, message: 'Password updated' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
