const jwt = require('jsonwebtoken')
const User = require('../models/user.js')

const isAdmin = async (req, res, next) => {
  try {
    // Check if the Authorization header exists
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer')
    ) {
      return res.status(401).json({ error: 'Unauthorized. No token provided.' })
    }

    // Extract the token
    const token = req.headers.authorization.split(' ')[1]

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find the user by ID
    //const user = await User.findById(decoded.userId).select('-password')
    const user = await User.findById(decoded.id).select('-password')

    // Check if the user exists and is an admin
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admins only.' })
    }

    // Attach the user to the request object (optional)
    req.user = user

    // Proceed to the next middleware or route
    next()
  } catch (error) {
    console.error('Admin Middleware Error:', error.message)
    res.status(500).json({ error: 'Server error. Please try again later.' })
  }
}

// module.exports = { isAdmin }
module.exports = isAdmin
