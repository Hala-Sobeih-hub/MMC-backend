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

//* Routes
app.use('/api/cart', cartController)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
