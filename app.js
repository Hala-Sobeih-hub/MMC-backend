const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const cors = require('cors')
const nodemailer = require('nodemailer')

// Send the password reset email
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

const app = express()

const PORT = process.env.PORT || 8080

// const authMiddleware = require('./middleware/authMiddleware.js')


// Middleware
app.use(express.json())
app.use(cors())

//connect to DB
const connectDB = require('./config/database.js')
connectDB()

//* Imports for controllers
const cartController = require('./controllers/cart-routes.js')
const bookingController = require('./controllers/booking-routes.js')
const testimonialsController = require('./controllers/TestimonialsRoutes.js')
const productsController = require('./controllers/ProductsRoutes.js')
const userController = require('./controllers/user_controllers.js')
const promotionController = require('./controllers/promotion-routes.js')

//* Routes
// app.use(authMiddleware);
app.use('/api/booking', bookingController)
app.use('/api/cart', cartController)
app.use('/api/users', userController)
// app.use(authMiddleware);

app.use('/api/testimonials', testimonialsController)
app.use('/api/products', productsController)
app.use('/api/promotion', promotionController)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
