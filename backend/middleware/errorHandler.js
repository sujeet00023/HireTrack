const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'Resource not found'
    return res.status(404).json({ success: false, message: error.message })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    return res.status(400).json({ success: false, message: error.message })
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(e => e.message).join(', ')
    return res.status(400).json({ success: false, message: error.message })
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }

  console.error('Server Error:', err)
  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  })
}

module.exports = errorHandler
