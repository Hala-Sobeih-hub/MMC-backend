const mongoose = require('mongoose');

const TestimonialsSchema = new mongoose.Schema(
    {
        userId: { type: string , required: true },
        name: { type: String, required: true },
        reviews: { type: String, required: true },
        rating: { type: Number, required: true,
            min: [1, 'Rating must be at least 1 star'], // Minimum rating value
            max: [5, 'Rating cannot exceed 5 stars']// Maximum rating value
         },
        date: { type: Date, default: Date.now },
    }
);

module.exports = mongoose.model('Testimonials', TestimonialsSchema);