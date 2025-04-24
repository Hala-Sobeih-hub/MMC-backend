const express = require('express');
const router = express.Router();
const Products = require('../Models/Products.js');


router.get('/', async (req, res) => {
    try { 
        const products = await Products.find()

        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal server error' });

    }
    })


router.get('/:id', async (req, res) => {
    try {
        const product = await Products.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
)
    router.post('/create', isAdmin, async (req, res) => {
        try {
            const { name, description, price, imageUrl, available, availableDate } = req.body;

            if (!name || !description || !price || !imageUrl) {
                return res.status(400).json({ message: 'All fields are required' });
            }

              // Create a new product instance with default value for 'available'
        const newProduct = new Products({
            name,
            description,
            price,
            imageUrl,
            available: available !== undefined ? available : true, // Default to true if not provided
            availableDate: availableDate || null // Set to null if not provided
        });

        // Save the product to the database
        const savedProduct = await newProduct.save();

        // Respond with the created product
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/:id', isAdmin, async (req, res) => {
    try {
        const { name, description, price, imageUrl, available, availableDate } = req.body;

        const updatedProduct = await Products.findByIdAndUpdate(
            req.params.id,
            { name, description, price, imageUrl, available, availableDate },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/:id', isAdmin, async (req, res) => { 
    try {
        const deletedProduct = await Products.findByIdAndDelete(req.params.id);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});