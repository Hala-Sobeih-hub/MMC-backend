const mongoose = require('mongoose');

const ProductsSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, type: String, required: true },
        imageUrl: { type: String, required: true },

        available: { type: Boolean, default: true }, // Indicates if the product is available
        
        // The date when the product will be available for purchase    
        availableDate: {
            type: Date, 
            validate: {
                validator: function (value) {
                    const now = new Date(); 
                    const maxDate = new Date();
                    maxDate.setDate(now.getDate() + 120); // 120 days from now
                    return value >= now && value <= maxDate;
                },
                message: 'Available date must be between now and 120 days from now.'
            },
        },

        //Sale-related fields
    onSale: { type: Boolean, default: false },
        salePrice: { type: Number, 
            validate: {
                validator: function (value) {
                    // Ensure salePrice is less than the original price
                    return value < this.price;
                },
                message: 'Sale price must be less than the original price.'
            }

        }

    },
    { timestamps: true }
);

module.exports = mongoose.model('Products', ProductsSchema);
