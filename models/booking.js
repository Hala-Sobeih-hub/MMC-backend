const mongoose = require('mongoose')
const User = require('../models/user')

//
const bookingSchema = new mongoose.Schema(
  {
    // Reference to the User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    itemsList: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Products',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        // I kept the price
        //  It avoids an extra database call to the Product collection every time you display a cart or booking.
        price: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],

    totalPrice: {
      type: Number,
      required: true
    },

    rentalDate: {
      type: Date,
      required: true
    },

    deliveryAddress: {
      type: String,
      required: true
    },

    eventNotes: {
      type: String
    },

    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Canceled'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
)

const Booking = mongoose.model('Booking', bookingSchema)
module.exports = Booking
