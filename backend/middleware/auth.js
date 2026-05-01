const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  let token

  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

    token = req.headers.authorization.split(' ')[1]

  }

  if (!token) {

    return res.status(401).json({ success: false, message: 'Not authorized, no token' })
  }


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }

    next()
    

  } catch (err) {

    return res.status(401).json({ success: false, message: 'Token invalid or expired' })

  }

}

// Admin only
const adminOnly = (req, res, next) => {

  if (req.user && req.user.role === 'admin') return next()

  res.status(403).json({ success: false, message: 'Admin access required' })
}

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' }) //expiry in 7d
}

module.exports = { protect, adminOnly, generateToken }
