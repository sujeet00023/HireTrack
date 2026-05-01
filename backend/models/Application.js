const mongoose = require('mongoose')

const NoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

const ApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Shared team access (optional)
  sharedWith: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: { type: String, enum: ['view', 'edit'], default: 'view' }
  }],
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['applied', 'interview', 'offer', 'rejected', 'withdrawn'],
    default: 'applied',
    index: true
  },
  salary: {
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    currency: { type: String, default: 'USD' }
  },
  location: { type: String, trim: true },
  remote: { type: Boolean, default: false },
  jobUrl: { type: String, trim: true },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    default: 'full-time'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  appliedDate: { type: Date, default: Date.now },

  // Interview tracking
  interviewDate: { type: Date, default: null },
  interviewType: {
    type: String,
    enum: ['phone', 'video', 'onsite', 'technical', 'hr', null],
    default: null
  },

  // Resume used
  resumeFile: { type: String, default: null },

  // Notes array (multiple notes per application)
  notes: [NoteSchema],


  // Simple note string (legacy compat)
  note: { type: String, default: '' },


  // Recruiter contact
  recruiterName: { type: String, default: '' },
  recruiterEmail: { type: String, default: '' },


  // Follow-up tracking
  followUpSent: { type: Boolean, default: false },
  followUpDate: { type: Date, default: null },


  // Email reminder sent flag
  reminderSent: { type: Boolean, default: false },
}, { timestamps: true })



// Virtual: days since applied
ApplicationSchema.virtual('daysSinceApplied').get(function () {
  return Math.floor((Date.now() - new Date(this.appliedDate)) / 86400000)
})




// Index for fast queries
ApplicationSchema.index({ user: 1, status: 1 })
ApplicationSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('Application', ApplicationSchema)
