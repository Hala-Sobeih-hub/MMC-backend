const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const app = express()
require('dotenv').config()

const PORT = process.env.PORT || 8080

app.use(express.json())


const dotenv = require('dotenv')
const cors = require('cors')
const authMiddleware = require('./middleware/authMiddleware.js')
const userRoutes = require('./routes/user_routes.js')

dotenv.config()

const app = express()

// Middleware
app.use(express.json())
app.use(cors())


//connect to DB
const connectDB = require('./config/database.js')
connectDB()

//* Imports for controllers
const cartController = require('./controllers/cart-routes.js')

//* Routes
app.use('/api/cart', cartController)
app.use(authMiddleware);
app.use('/api/users', userRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})





