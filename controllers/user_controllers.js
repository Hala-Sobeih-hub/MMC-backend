const express = require('express')
const User = require('../models/user.js') // Import the User model
const bcrypt = require('bcrypt') // Import bcrypt for password hashing
const jwt = require('jsonwebtoken') // Import jsonwebtoken for token generation
const authMiddleware = require('../middleware/authMiddleware.js') // Import the authentication middleware
const isAdmin = require('../middleware/adminMiddleware.js')
const dotenv = require('dotenv') // Import dotenv for environment variables
const nodemailer = require('nodemailer') // Import nodemailer for sending emails

const router = express.Router()

router.post('/signup', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      username,
      password,
      deliveryAddress,
      phoneNumber
    } = req.body

    const passwordhashed = bcrypt.hashSync(password, +process.env.SALT)

    let newUser = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      username: username,
      password: passwordhashed,
      deliveryAddress: deliveryAddress,
      phoneNumber: phoneNumber
    })

    await newUser.save()

    // // Assign a token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1w'
    })
    console.log(token)

    res.status(200).json({
      Msg: 'Success! Account was created!',
      User: newUser,
      Token: token
    })
  } catch (err) {
    // console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({
        Error: 'User already exists. Try logging in.'
      })
    }

    res.status(500).json({
      Error:
        'An error occurred while creating the account. Please try again later.'
    })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    // Find the user by email
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      {
        expiresIn: '1w'
      }
    )

    // Exclude sensitive fields from the response
    const { password: _, ...userWithoutPassword } = user.toObject()

    res.status(200).json({
      Msg: 'Success! User logged in!',
      User: userWithoutPassword,
      Token: token
    })
  } catch (err) {
    console.error('Login Error:', err.message)
    res.status(500).json({
      message: 'An error occurred while logging in. Please try again later.'
    })
  }
})

router.post('/password/forgot', async (req, res) => {
  try {
    console.log('Request Body:', req.body) // Log the request body

    const { email } = req.body

    // Validate input
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    // Find the user by email or phone number
    const user = await User.findOne({ $or: [{ email }] })
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    // Generate a password reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h' // Token expires in 1 hour
    })

    // Generate the reset link
    const resetLink = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`

    // Send the password reset email
    if (email) {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Use your email service
        auth: {
          user: process.env.EMAIL_USER, // Your email address
          pass: process.env.EMAIL_PASS // Your email password
        }
      })

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'MMC Inflatables Password Reset',
        html: `
                    <p>You requested a password reset. Click the link below to reset your password:</p>
                    <a href="${resetLink}">Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                `
      }

      await transporter.sendMail(mailOptions)
      console.log('Password reset email sent to:', email)
    }

    res
      .status(200)
      .json({ message: 'Password reset instructions sent successfully.' })
  } catch (err) {
    console.error('Forgot Password Error:', err.message)
    res.status(500).json({
      message:
        'An error occurred while sending the password reset instructions. Please try again later.'
    })
  }
})

router.post('/password/reset/:token', async (req, res) => {
  try {
    const { newPassword } = req.body
    const { token } = req.params

    // Validate input
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Token and new password are required.' })
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find the user by ID
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    // // Check if the token has already been used
    // if (user.passwordResetTokenUsed) {
    //     return res.status(400).json({ message: 'This reset token has already been used.' });
    // }

    // Check if the new password matches the old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return res.status(400).json({
        message: 'New password cannot be the same as the old password.'
      })
    }

    // Validate password complexity
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
      })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the user's password and mark the token as used
    user.password = hashedPassword
    user.passwordResetTokenUsed = true // Mark the token as used
    await user.save()

    res.status(200).json({ message: 'Password updated successfully.' })
  } catch (err) {
    console.error('Reset Password Error:', err.message)
    res.status(500).json({
      message:
        'An error occurred while resetting the password. Please try again later.'
    })
  }
})

// User updates their profile
router.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' })
    }

    // Check if the user is an admin or deleting their own account
    if (req.user.id !== id && !req.user.isAdmin) {
      return res.status(403).json({
        message: 'Access denied. You can only delete your own account.'
      })
    }

    // Find and delete the user
    const user = await User.findByIdAndDelete(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    res.status(200).json({ message: 'User deleted successfully.' })
  } catch (err) {
    console.error('Delete User Error:', err.message)
    res.status(500).json({
      message:
        'An error occurred while deleting the user. Please try again later.'
    })
  }
})
// Admin views all users
router.get('/all', authMiddleware, async (req, res) => {
  try {
    // Check if the user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' })
    }

    const users = await User.find()
      .sort('firstName')
      .select({ firstName: 1, lastName: 1, email: 1, role: 1, isAdmin: 1 })

    res.status(200).json({
      AllUsers: users
    })
  } catch (err) {
    console.error('Get All Users Error:', err.message)
    res.status(500).json({
      message: 'An error occurred while fetching users. Please try again later.'
    })
  }
})

// router.delete('/delete/:userId', authMiddleware, async (req, res) => {
//     try {
//         const { userId } = req.params;

//         // Check if the user is authenticated
//         if (!req.user) {
//             return res.status(401).json({ message: 'Unauthorized. Please log in.' });
//         }

//         // Check if the user is an admin or deleting their own account
//         if (req.user.id !== userId && !req.user.isAdmin) {
//             return res.status(403).json({ message: 'Access denied. You can only delete your own account.' });
//         }

//         // Find and delete the user
//         const user = await User.findByIdAndDelete(userId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found.' });
//         }

//         res.status(200).json({ message: 'User deleted successfully.' });
//     } catch (err) {
//         console.error('Delete User Error:', err.message);
//         res.status(500).json({ message: 'An error occurred while deleting the user. Please try again later.' });
//     }
// });

// User requests account deletion
router.post('/request-deletion', authMiddleware, async (req, res) => {
  try {
    // Check if the user already has a pending deletion request
    if (req.user.deletionRequest) {
      return res
        .status(400)
        .json({ message: 'You already have a pending deletion request.' })
    }

    // Update the user's deletionRequest field
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { deletionRequest: true },
      { new: true }
    )

    res.status(200).json({
      message:
        'Your deletion request has been submitted and is pending approval.',
      user
    })
  } catch (err) {
    console.error('Request Deletion Error:', err.message)
    res.status(500).json({
      message:
        'An error occurred while submitting your deletion request. Please try again later.'
    })
  }
})

// Admin views all pending deletion requests
router.get(
  '/deletion-requests',
  /*authMiddleware,*/ isAdmin,
  async (req, res) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admins only.' })
      }

      const pendingRequests = await User.find({ deletionRequest: true }).select(
        'firstName lastName email deletionRequest'
      )

      res.status(200).json({
        pendingRequests
      })
    } catch (err) {
      console.error('Get Deletion Requests Error:', err.message)
      res.status(500).json({
        message:
          'An error occurred while fetching deletion requests. Please try again later.'
      })
    }
  }
)

// Admin approves or rejects a deletion request
router.patch(
  '/deletion-requests/:userId',
  /*authMiddleware,*/ async (req, res) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admins only.' })
      }

      const { userId } = req.params
      const { action } = req.body // 'approve' or 'reject'

      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ message: 'User not found.' })
      }

      if (!user.deletionRequest) {
        return res
          .status(400)
          .json({ message: 'This user has not requested account deletion.' })
      }

      if (action === 'approve') {
        // Delete the user
        await User.findByIdAndDelete(userId)

        res.status(200).json({
          message: 'Deletion request approved and user account deleted.'
        })
      } else if (action === 'reject') {
        // Update the user's deletionRequest field
        user.deletionRequest = false
        await user.save()

        res.status(200).json({ message: 'Deletion request rejected.' })
      } else {
        res
          .status(400)
          .json({ message: 'Invalid action. Use "approve" or "reject".' })
      }
    } catch (err) {
      console.error('Process Deletion Request Error:', err.message)
      res.status(500).json({
        message:
          'An error occurred while processing the deletion request. Please try again later.'
      })
    }
  }
)

// Admin sends an invitation to a potential admin
router.post('/invite-admin', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { email } = req.body

    // Validate email
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User with this email already exists.' })
    }

    // Generate a unique invitation token
    const invitationToken = jwt.sign(
      { email, role: 'Admin' },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d' // Token expires in 1 day
      }
    )

    // Send the invitation email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email service
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS // Your email password
      }
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Admin Invitation',
      html: `
                <p>You have been invited to join as an admin on our platform.</p>
                <p>Click the link below to accept the invitation:</p>
                <a href="${process.env.FRONTEND_URL}/accept-invitation?token=${invitationToken}">Accept Invitation</a>
                <p>This link will expire in 24 hours.</p>
            `
    }

    await transporter.sendMail(mailOptions)

    res.status(200).json({ message: 'Invitation email sent successfully.' })
  } catch (err) {
    console.error('Error sending admin invitation:', err.message)
    res.status(500).json({
      message: 'An error occurred while sending the invitation email.'
    })
  }
})

router.post('/accept-invitation', async (req, res) => {
  try {
    const { token, password } = req.body

    // Validate input
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: 'Token and password are required.' })
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if the user already exists
    const existingUser = await User.findOne({ email: decoded.email })
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User with this email already exists.' })
    }

    // Create the new admin user
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await User.create({
      email: decoded.email,
      password: hashedPassword,
      role: decoded.role // Set role to 'Admin'
    })

    res
      .status(201)
      .json({ message: 'Admin account created successfully.', user: newUser })
  } catch (err) {
    console.error('Error accepting admin invitation:', err.message)
    res
      .status(500)
      .json({ message: 'An error occurred while accepting the invitation.' })
  }
})

router.patch(
  '/update-role/:userId',
  authMiddleware,
  isAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params
      const { role } = req.body

      // Validate input
      if (!role) {
        return res.status(400).json({ message: 'Role is required.' })
      }

      // Find the user by ID
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ message: 'User not found.' })
      }
      if (role == 'Admin') {
        user.isAdmin = true
      } else {
        user.isAdmin = false
      }
      // Update the user's role
      user.role = role
      await user.save()

      res.status(200).json({ message: 'User role updated successfully.', user })
    } catch (err) {
      console.error('Error updating user role:', err.message)
      res
        .status(500)
        .json({ message: 'An error occurred while updating the user role.' })
    }
  }
)

//Hala made this change
// User gets their own profile
router.get('/my-profile', authMiddleware, async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' })
    }

    // Find the user by ID
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    res.status(200).json(user)
  } catch (err) {
    console.error('Get Profile Error:', err.message)
    res.status(500).json({
      message:
        'An error occurred while fetching the profile. Please try again later.'
    })
  }
})

module.exports = router
