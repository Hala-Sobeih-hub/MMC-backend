const router = require('express').Router() //Import express and create a new router

const Cart = require('../models/cart') //Import the Cart model
const Product = require('../models/Products')

//POST - 'localhost:8080/api/cart - create a new cart - Logged in User
router.post(
  '/',
  /* authenticateToken,*/ async (req, res) => {
    try {
      //get cart data from the request body
      const { userId, itemsList, deliveryAddress, eventNotes } = req.body

      //if any of the fields are missing (except for eventNotes which is optional)
      if (!userId || !itemsList || !deliveryAddress) {
        return res.status(400).json({
          message: 'All fields are Required!' // Return a 400 status code and a message
        })
      }

      //create a new cart object
      const newCart = new Cart({
        userId,
        itemsList,
        deliveryAddress,
        eventNotes,
        status: 'active'
      })

      //save new cart to database
      await newCart.save()

      //return the successful response
      res.status(200).json({
        result: newCart,
        message: 'Cart was created successfully!'
      })
    } catch (error) {
      //return a 500 stats code and an error message
      res.status(500).json({
        Error: `${error.message}`
      })
    }
  }
)

//GET all - 'localhost:8080/api/cart/' - display all carts - Admin Only
router.get(
  '/',
  /* authenticateToken, adminMiddleware, */ async (req, res) => {
    try {
      //get All carts from database
      const carts = await Cart.find()

      if (carts.length === 0) {
        //no carts are found in the database
        return res.status(400).json({
          message: 'No Carts are found!'
        })
      }
      res.status(200).json({
        //return a 200 status code and the carts
        result: carts,
        message: 'All carts are retrieved successfully' //return a success message
      })
    } catch (error) {
      //return a 500 status code and an error message
      res.status(500).json({
        Error: error.message
      })
    }
  }
)

//GET one - 'localhost:8080/api/cart/:_id' - display one cart by ID - Logged in User
router.get(
  '/:_id',
  /* authenticateToken, */ async (req, res) => {
    try {
      //get the cart ID from the request params
      const { _id } = req.params

      //find the cart by ID in the database
      const cart = await Cart.findById(_id)
      // .populate({
      //   path: 'itemsList.productId',
      //   select: 'name imageUrl price'
      // })

      //if no cart matches the given ID
      if (!cart) {
        return res.status(404).json({
          message:
            'Your cart has expired or was not found. Please start a new order.'
        })
      }

      //if cart was found, return the successful response
      res.status(200).json({
        result: cart,
        message: 'Cart was retrieved successfully'
      })
    } catch (error) {
      //return a 500 stats code and an error message
      res.status(500).json({
        Error: `${error.message}`
      })
    }
  }
)

//PUT one- 'localhost:8080/api/cart/:_id - update one cart by ID - Logged In User
router.put(
  '/:_id',
  /* authenticateToken, */ async (req, res) => {
    try {
      //get the cart ID from request params
      const { _id } = req.params

      //get the updated fields (updated list of products) from the request body
      const { itemsList, deliveryAddress, eventNotes } = req.body

      const cartToBeUpdated = { itemsList, deliveryAddress, eventNotes }

      //options: (Optional) An object specifying options such as new
      //new: If set to true, returns the modified document rather than the original. Defaults to false.
      const options = { new: true }

      //find the cart and update its fields
      const updatedCart = await Cart.findByIdAndUpdate(
        _id,
        cartToBeUpdated,
        options
      )

      //if no cart was found
      if (!updatedCart) {
        res.status(400).json({
          message: 'Cart was not found!'
        })
      }
      //return the successful message
      res.status(200).json({
        result: updatedCart,
        message: 'Cart was updated!'
      })
    } catch (error) {
      //return a 500 stats code and an error message
      res.status(500).json({
        Error: `${error.message}`
      })
    }
  }
)

//Delete one - 'localhost:8080/api/cart/:_id' - delete one cart by ID - Logged in User
router.delete(
  '/:_id',
  /* authenticateToken, */ async (req, res) => {
    try {
      //get the cart ID from request params
      const { _id } = req.params

      //find the cart by ID to be deleted.
      const deletedCart = await Cart.findByIdAndDelete(_id)

      //if no cart was found by that ID
      if (!deletedCart) {
        return res.status(404).json({
          message:
            'Cart not found. It may have already been deleted or expired.'
        })
      }

      //send successful response
      res.status(200).json({
        result: deletedCart,
        message: 'Cart was deleted!'
      })
    } catch (error) {
      //return a 500 stats code and an error message
      res.status(500).json({
        Error: `${error.message}`
      })
    }
  }
)

module.exports = router
