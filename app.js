const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

const app = express()
require('dotenv').config()

const PORT = process.env.PORT || 8080

const authMiddleware = require('./middleware/authMiddleware.js')
const userRoutes = require('./routes/user_routes.js')

dotenv.config()

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

//* Routes
app.use('/api/cart', cartController)
app.use('/api/booking', bookingController)
app.use(authMiddleware)
app.use('/api/users', userRoutes)
app.use('/api/testimonials', require('./controllers/TestimonialsRoutes.js'))
app.use('/api/products', require('./controllers/ProductsRoutes.js'))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
