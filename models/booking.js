const mongoose = require('mongoose')

//
const bookingSchema = new mongoose.Schema(
  {
    // Reference to the User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
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

    status: {
      type: String,
      enum: ['confirmed', 'completed', 'canceled'],
      default: 'confirmed'
    }
  },
  {
    timestamps: true
  }
)

const Booking = mongoose.model('Booking', bookingSchema)
module.exports = Booking
