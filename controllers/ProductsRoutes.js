const express = require('express')
const router = express.Router()
const Products = require('../models/Products.js')
const isAdmin = require('../middleware/authMiddleware.js')
const authMiddleware = require('../middleware/authMiddleware.js')

router.get('/', async (req, res) => {
  try {
    const products = await Products.find()

    res.status(200).json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})



router.get('/:id', async (req, res) => {
  try {
    const product = await Products.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.status(200).json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log("test")
    // Check if the user is an admin}

    if (req.user.isAdmin) {



      const { name, description, price, imageUrl, available, availableDate } =
        req.body

      if (!name || !description || !price || !imageUrl) {
        return res.status(400).json({ message: 'All fields are required' })
      }

      // Create a new product instance with default value for 'available'
      const newProduct = new Products({
        name,
        description,
        price,
        imageUrl,
        available: available !== undefined ? available : true, // Default to true if not provided
        availableDate: availableDate || null, // Set to null if not provided
        salePrice: price// Set salePrice only 
      })

      // Save the product to the database
      const savedProduct = await newProduct.save()

      // Respond with the created product
      res.status(201).json(savedProduct)

    } else {
      // if the user is not an admin
      return res.status(403).json({ error: 'Access denied. Admins only.' })
    }


  } catch (error) {
    console.error('Error creating product:', error)

    res.status(500).json({ message: 'Internal server error' })
  }
})


router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const { name, description, price, imageUrl, available, availableDate, salePrice, onSale } = req.body;

      const updatedProduct = await Products.findByIdAndUpdate(
        req.params.id,
        { name, description, price, imageUrl, available, availableDate, salePrice, onSale },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(200).json(updatedProduct);
    } else {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
  } catch (error) {
    console.log('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const deletedProduct = await Products.findByIdAndDelete(req.params.id);

      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(200).json({ message: 'Product deleted successfully' });
    } else {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router
