const router = require('express').Router() //Import express and create a new router

const Cart = require('../models/cart') //Import the Cart model

//POST - 'localhost:8080/api/cart - create a new cart - Any User
router.post('/', async (req, res) => {
  try {
    //get request body
    const { userId, itemsList } = req.body

    if (!userId || !itemsList) {
      //if any of the fields are missing
      return res.status(401).json({
        message: 'All fields are Required!' // Return a 401 status code and a message
      })
    }

    //create a new cart object
    const newCart = new Cart({ userId, itemsList })

    //save new cart to database
    await newCart.save()

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
})

//GET one - 'localhost:8080/api/cart/:id' - display one cart by ID - Any User
router.get('/:id', async (req, res) => {
  try {
    //get the cart ID from the request params
    const { _id } = req.params

    //find the cart by ID in the database
    const cart = await Cart.findById(_id)

    //if no cart matches the given ID
    if (!cart) {
      return res.status(404).json({
        message:
          'Your cart has expired or was not found. Please start a new order.'
      })
    }

    //if cart was found
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
})

//PUT one- 'localhost:8080/api/cart/:id - update one cart by ID - Any User
router.put('/:id', async (req, res) => {
  try {
  } catch (error) {
    //return a 500 stats code and an error message
    res.status(500).json({
      Error: `${error.message}`
    })
  }
})

//Delete one - 'localhost:8080/api/cart/:id' - delete one cart by ID - Any User
router.delete('/:id', async (req, res) => {
  try {
  } catch (error) {
    //return a 500 stats code and an error message
    res.status(500).json({
      Error: `${error.message}`
    })
  }
})

module.exports = router
