const express = require('express')
const dotenv = require('dotenv') // Import dotenv to manage environment variables
dotenv.config() // Load environment variables from .env file
const nodemailer = require('nodemailer') // Import nodemailer for sending emails
const router = express.Router()

//const Inquiry = require('../models/inquiry') // Import the Inquiry model

// Route to handle inquiries
//POST - localhost:8080/api/inquiry
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address, productName, inquiryDescription } =
      req.body

    // Create a new inquiry
    const newInquiry = {
      name,
      email,
      phone,
      address,
      productName,
      inquiryDescription
    }

    console.log('New Inquiry:', newInquiry)
    // Send an email notification to the admin
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS // Your email password or app password
      }
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // Admin's email address
      subject: 'New Inquiry Received',
      text: `You have received a new inquiry from ${name} (${email}).
      \n\Phone:\n${phone}
      \n\Address:\n${address}
      \n\Product Name:\n${productName}
      \n\nDescription:\n${inquiryDescription}`
    }

    await transporter.sendMail(mailOptions)

    res.status(201).json({ message: 'Inquiry submitted successfully' })
  } catch (error) {
    console.error('Error submitting inquiry:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})
module.exports = router
