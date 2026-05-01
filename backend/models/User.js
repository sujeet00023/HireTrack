const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  // Email reminder preferences
  reminderEnabled: { type: Boolean, default: true },
  reminderDays: { type: Number, default: 5 },
  // Team / sharing
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  emailVerified: { type: Boolean, default: false },
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

// Hash password before saving
UserSchema.pre('save', async function (next) {
  
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) 
{
  return await bcrypt.compare(enteredPassword, this.password)
}

// Return public profile (no password)
UserSchema.methods.toPublic = function () {
  return {

    _id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    role: this.role,
    plan: this.plan,
    reminderEnabled: this.reminderEnabled,
    reminderDays: this.reminderDays,
    createdAt: this.createdAt

  }
  
}

module.exports = mongoose.model('User', UserSchema)
