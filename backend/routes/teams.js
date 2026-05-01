const express = require('express')
const router = express.Router()
const Team = require('../models/Team')
const User = require('../models/User')
const Application = require('../models/Application')
const { protect } = require('../middleware/auth')

router.use(protect)

// ── POST /api/teams ──────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const team = await Team.create({
      name: req.body.name,
      description: req.body.description || '',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    })
    await User.findByIdAndUpdate(req.user._id, { $push: { teams: team._id } })
    const populated = await team.populate('members.user', 'name email avatar')
    res.status(201).json({ success: true, data: populated })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── GET /api/teams ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email avatar')
      .populate('owner', 'name email')
    res.json({ success: true, data: teams })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── POST /api/teams/join ─────────────────────────────────
router.post('/join', async (req, res) => {
  try {
    const { inviteCode } = req.body
    const team = await Team.findOne({ inviteCode: inviteCode.toUpperCase() })
    if (!team) return res.status(404).json({ success: false, message: 'Invalid invite code' })

    const alreadyMember = team.members.some(m => m.user.toString() === req.user._id.toString())
    if (alreadyMember) return res.status(400).json({ success: false, message: 'Already a member' })

    team.members.push({ user: req.user._id, role: 'member' })
    await team.save()
    await User.findByIdAndUpdate(req.user._id, { $push: { teams: team._id } })

    const populated = await team.populate('members.user', 'name email avatar')
    res.json({ success: true, data: populated, message: `Joined team "${team.name}"` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── GET /api/teams/:id ───────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'name email avatar')
      .populate('owner', 'name email')
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' })

    const isMember = team.members.some(m => m.user._id.toString() === req.user._id.toString())
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a team member' })

    res.json({ success: true, data: team })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── GET /api/teams/:id/applications ─────────────────────
// Get all applications from all team members
router.get('/:id/applications', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' })

    const isMember = team.members.some(m => m.user.toString() === req.user._id.toString())
    if (!isMember) return res.status(403).json({ success: false, message: 'Not authorized' })

    const memberIds = team.members.map(m => m.user)
    const apps = await Application.find({ user: { $in: memberIds } })
      .populate('user', 'name email avatar')
      .sort({ appliedDate: -1 })

    res.json({ success: true, data: apps })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── DELETE /api/teams/:id/members/:userId ────────────────
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' })

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only owner can remove members' })
    }

    team.members = team.members.filter(m => m.user.toString() !== req.params.userId)
    await team.save()
    res.json({ success: true, message: 'Member removed' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
