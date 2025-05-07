const mongoose = require('mongoose')

const promotionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String // Will store Cloudinary or other hosted URL
    },
    isActive: {
      type: Boolean,
      //default: true, // Only show active promotions to users
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
)

const Promotion = mongoose.model('Promotion', promotionSchema)
module.exports = Promotion
