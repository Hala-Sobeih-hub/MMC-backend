const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const app = express()
require('dotenv').config()
const PORT = process.env.PORT || 8080

//connect to DB
const connectDB = require('./config/database.js')
connectDB()

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
