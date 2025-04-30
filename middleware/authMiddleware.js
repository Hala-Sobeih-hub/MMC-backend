const jwt = require('jsonwebtoken')
const User = require('../models/user.js')

const authMiddleware = async (req, res, next) => {
  let token

  // Check if JWT_SECRET is defined
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in the environment variables.')
    return res.status(500).json({ message: 'Internal server error' })
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract and verify the token
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Find the user by ID
      req.user = await User.findById(decoded.id).select('-password')
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized, user not found' })
      }
      req.user = { id: user._id }
      next()
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res
          .status(401)
          .json({ message: 'Unauthorized, token has expired' })
      }
      res.status(401).json({ message: 'Unauthorized, invalid token' })
    }
  } else {
    res.status(401).json({ message: 'Unauthorized, no token' })
  }
}

module.exports = authMiddleware
