const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const app = express()
require('dotenv').config()
const PORT = process.env.PORT || 8080

app.use(express.json())

//connect to DB
const connectDB = require('./config/database.js')
connectDB()

//* Imports for controllers
const cartController = require('./controllers/cart-routes.js')
const bookingController = require('./controllers/booking-routes.js')

//* Routes
app.use('/api/cart', cartController)
app.use('/api/booking', bookingController)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
