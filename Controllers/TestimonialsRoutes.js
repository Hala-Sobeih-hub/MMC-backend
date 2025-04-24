const express = require('express');
const router = express.Router();
const Testimonials = require('../models/Testimonials.js');


router.get('/', async (req, res) => {
    try {
        const Testimonials = await Testimonials.find() // Fetch all testimonials from the database
        res.status(200).json(Testimonials); // Send the testimonials as a JSON response
    } catch (error) {
        console.error('Error fetching testimonials:', error); // Log any errors that occur
        res.status(500).json({ message: 'Internal server error' }); // Send a 500 status with an error message
    }
})

router.post('/create', async (req, res) => {
    try {
        const { userId, name, reviews, rating } = req.body; // Destructure the request body to get testimonial data

        if (!userId || !name || !reviews || !rating) { // Check if all required fields are provided
            return res.status(400).json({ message: 'All fields are required' }); // Send a 400 status with an error message
        }

        // Create a new testimonial instance
        const newTestimonial = new Testimonials({
            userId,
            name,
            reviews,
            rating
        });

        // Save the testimonial to the database
        const savedTestimonial = await newTestimonial.save();

        // Respond with the created testimonial
        res.status(201).json(savedTestimonial);
    } catch (error) {
        console.error('Error creating testimonial:', error); // Log any errors that occur
        res.status(500).json({ message: 'Internal server error' }); // Send a 500 status with an error message
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const testimonial = await Testimonials.findByIdAndDelete(req.params.id); // Find and delete the testimonial by ID
        if (!testimonial) {
            return res.status(404).json({ message: 'Testimonial not found' }); // Send a 404 status if not found
        }
        res.status(200).json({ message: 'Testimonial deleted successfully' }); // Send a success message
    } catch (error) {
        console.error('Error deleting testimonial:', error); // Log any errors that occur
        res.status(500).json({ message: 'Internal server error' }); // Send a 500 status with an error message
    }
})

router.put('/:id', async (req, res) => {
    try {
        const { userId, name, reviews, rating } = req.body; // Destructure the request body to get testimonial data

        if (!userId || !name || !reviews || !rating) { // Check if all required fields are provided
            return res.status(400).json({ message: 'All fields are required' }); // Send a 400 status with an error message
        }

        // Update the testimonial by ID
        const updatedTestimonial = await Testimonials.findByIdAndUpdate(
            req.params.id,
            { userId, name, reviews, rating },
            { new: true } // Return the updated document
        );

        if (!updatedTestimonial) {
            return res.status(404).json({ message: 'Testimonial not found' }); // Send a 404 status if not found
        }

        res.status(200).json(updatedTestimonial); // Send the updated testimonial as a JSON response
    } catch (error) {
        console.error('Error updating testimonial:', error); // Log any errors that occur
        res.status(500).json({ message: 'Internal server error' }); // Send a 500 status with an error message
    }
});

module.exports = router; 