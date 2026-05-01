const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inviteCode: {
    type: String,
    unique: true,
    default: () => uuidv4().split('-')[0].toUpperCase()
  },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

module.exports = mongoose.model('Team', TeamSchema)
