const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

const app = express()
require('dotenv').config()

const PORT = process.env.PORT || 8080

const authMiddleware = require('./middleware/authMiddleware.js')


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
const userController = require('./controllers/user_controllers.js')

//* Routes
app.use('/api/cart', cartController)
app.use(authMiddleware);

app.use('/api/testimonials', testimonialsController)
app.use('/api/products', productsController)

app.use('/api/users', userController);



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
