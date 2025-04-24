const mongoose = require('mongoose');

const ProductsSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        imageUrl: { type: String, required: true },
        addedUsers: [{ type: String }],
        available: { type: Boolean, default: true }, // Indicates if the product is available
        
        // The date when the product will be available for purchase    
        availableDate: {
            type: Date, 
            validate: {
                validator: function (value) {
                    const now = new Date(); 
                    const maxDate = new Date();
                    maxDate.setDate(now.getDate() + 60); // 60 days from now
                    return value >= now && value <= maxDate;
                },
                message: 'Available date must be between now and 60 days from now.'
            }
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Products', ProductsSchema);
