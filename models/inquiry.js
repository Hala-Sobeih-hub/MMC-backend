const mongoose = require('mongoose')

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Products'
    },
    inquiryDescription: { type: String, required: true }
  },
  { timestamps: true }
) // Adds createdAt & updatedAt timestamps

//inquiry model
module.exports = mongoose.model('Inquiry', inquirySchema)
