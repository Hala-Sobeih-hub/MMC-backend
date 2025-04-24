const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const authMiddleware = require('./middleware/authMiddleware.js')

dotenv.config()

const app = express()

// Middleware
app.use(express.json())
app.use(cors())


// Verify environment variables
const PORT = process.env.PORT || 8080

//connect to DB
const connectDB = require('./config/database.js')
connectDB()

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Routes
app.use(authMiddleware);