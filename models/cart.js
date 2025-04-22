const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema(
  {
    // Reference to the User
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Set the type of the userId field to ObjectId
      ref: 'User', // Set the reference of the userId field to the User model
      required: [true, 'User is required']
    },

    // Array of items (productId, quantity, price)
    itemsList: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Product is required']
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1']
        },
        // I kept the price
        //  It avoids an extra database call to the Product collection every time you display a cart or booking.
        price: {
          type: Number,
          required: [true, 'Price is required'],
          min: [0, 'Price must be a positive number']
        }
      }
    ],

    // Optional status field to track cart progress
    status: {
      type: String,
      enum: ['active', 'pending'],
      default: 'active'
    },

    // Auto-delete the cart after 15 minutes using MongoDB TTL index
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000),
      index: { expires: 0 } // 0 means expire exactly at the time of the date
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields automatically
  }
)

const Cart = mongoose.model('Cart', cartSchema)
module.exports = Cart
