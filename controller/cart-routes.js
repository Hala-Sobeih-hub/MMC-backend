const router = require('express').Router() //Import express and create a new router

const Cart = require('../model/cart') //Import the Cart model

//POST - 'localhost:8080/api/cart - create a new cart - Any User
router.post('/', async (req, res) => {
  try {
    //get cart data from the request body
    const { userId, itemsList, deliveryAddress, eventNotes } = req.body

    //if any of the fields are missing
    if (!userId || !itemsList || !deliveryAddress || !eventNotes) {
      return res.status(401).json({
        message: 'All fields are Required!' // Return a 401 status code and a message
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
})

//GET one - 'localhost:8080/api/cart/:_id' - display one cart by ID - Any User
router.get('/:_id', async (req, res) => {
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
})

//PUT one- 'localhost:8080/api/cart/:_id - update one cart by ID - Any User
router.put('/:_id', async (req, res) => {
  try {
    //get the cart ID from request params
    const { _id } = req.params

    //get the updated fields (updated list of products) from the request body
    const { itemsList, deliveryAddress, eventNotes } = req.body

    const updatedCart = { itemsList, deliveryAddress, eventNotes }

    //find the cart and update its fields
    await Cart.findByIdAndUpdate(_id, updatedCart)

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
})

//Delete one - 'localhost:8080/api/cart/:_id' - delete one cart by ID - Any User
router.delete('/:_id', async (req, res) => {
  try {
    //get the cart ID from request params
    const { _id } = req.params

    //find the cart by ID to be deleted.
    const deletedCart = await Cart.findByIdAndDelete(_id)

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
})

module.exports = router
