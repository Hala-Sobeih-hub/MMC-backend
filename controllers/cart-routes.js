const router = require('express').Router() //Import express and create a new router

const Cart = require('../models/cart') //Import the Cart model
const Product = require('../models/Products')
const authMiddleware = require('../middleware/authMiddleware.js') // Import the authentication middleware

// // POST - 'localhost:8080/api/cart/add-item' - Add or update an item in cart - Logged in User
// router.post('/add-item', authMiddleware, async (req, res) => {
//   try {
//     const { _id } = req.user
//     const { productId, quantity, rentalDate } = req.body

//     if (!productId || !quantity || !rentalDate) {
//       return res
//         .status(400)
//         .json({ message: 'Product, quantity, and rental date are required.' })
//     }

//     // Fetch the product details to get the current price
//     const product = await Product.findById(productId)
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found.' })
//     }

//     const price = product.onSale ? product.salePrice : product.price

//     // Check if the user already has a cart
//     let cart = await Cart.findOne({ userId })

//     if (!cart) {
//       // If no cart, create a new one
//       cart = new Cart({
//         userId,
//         itemsList: [{ productId, quantity, price }],
//         deliveryAddress: 'TBD', // You can set this dynamically in frontend or another step
//         eventNotes: '',
//         status: 'active'
//       })
//     } else {
//       // If cart exists, check if the product is already in the cart
//       const existingItemIndex = cart.itemsList.findIndex(
//         item => item.productId.toString() === productId
//       )

//       if (existingItemIndex !== -1) {
//         // Update quantity
//         cart.itemsList[existingItemIndex].quantity += quantity
//       } else {
//         // Add new product to itemsList
//         cart.itemsList.push({ productId, quantity, price })
//       }
//     }

//     await cart.save()

//     res.status(200).json({
//       result: cart,
//       message: 'Cart updated successfully.'
//     })
//   } catch (error) {
//     res.status(500).json({
//       Error: error.message
//     })
//   }
// })

//POST - 'localhost:8080/api/cart - create a new cart - Logged in User
router.post('/', authMiddleware, async (req, res) => {
  try {
    //get the user ID from the request params
    const { _id } = req.user

    //get cart data from the request body
    const {
      userId,
      itemsList,
      totalPrice,
      rentalDate,
      deliveryAddress,
      eventNotes
    } = req.body

    //if any of the fields are missing (except for eventNotes which is optional)
    // if (!itemsList || !deliveryAddress) {
    if (!itemsList) {
      return res.status(400).json({
        message: 'All fields are Required!' // Return a 400 status code and a message
      })
    }

    //create a new cart object
    const newCart = new Cart({
      userId,
      itemsList,
      totalPrice,
      rentalDate,
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

//GET all - 'localhost:8080/api/cart/' - display all carts - Admin Only
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      //get All carts from database
      const carts = await Cart.find()
        .sort({ createdAt: -1 })
        .populate({
          path: 'userId',
          select: 'firstName lastName email phoneNumber'
        })
        .populate({
          path: 'itemsList.productId',
          select: 'name imageUrl price'
        })

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
    } else {
      // if the user is not an admin
      return res.status(403).json({ error: 'Access denied. Admins only.' })
    }
  } catch (error) {
    //return a 500 status code and an error message
    res.status(500).json({
      Error: error.message
    })
  }
})

//GET cart by User ID - 'localhost:8080/api/cart/user/' - display one cart by UserID - Logged in User
router.get('/user/', authMiddleware, async (req, res) => {
  try {
    //get the user ID from the request params
    const { _id } = req.user

    // console.log(req.user)
    //find the cart by user ID in the database
    const cart = await Cart.findOne({ userId: _id })
      .populate({
        path: 'userId',
        select: 'firstName lastName email phoneNumber'
      })
      .populate({
        path: 'itemsList.productId',
        select: 'name imageUrl price'
      })

    // console.log(cart.userId.email)
    // console.log(cart.itemsList[0].productId.name)

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

//GET one - 'localhost:8080/api/cart/:_id' - display one cart by ID - Logged in User
router.get('/:_id', authMiddleware, async (req, res) => {
  try {
    //get the cart ID from the request params
    const { _id } = req.params

    //find the cart by ID in the database
    const cart = await Cart.findById(_id)
      .populate({
        path: 'userId',
        select: 'firstName lastName email phoneNumber'
      })
      .populate({
        path: 'itemsList.productId',
        select: 'name imageUrl price'
      })

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

//PUT one- 'localhost:8080/api/cart/:_id - update one cart by ID - Logged In User
router.put('/:_id', authMiddleware, async (req, res) => {
  try {
    //get the cart ID from request params
    const { _id } = req.params

    //get the updated fields (updated list of products) from the request body
    const { itemsList, totalPrice, rentalDate, deliveryAddress, eventNotes } =
      req.body

    const cartToBeUpdated = {
      itemsList,
      totalPrice,
      rentalDate,
      deliveryAddress,
      eventNotes
    }

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
})

//Delete one - 'localhost:8080/api/cart/:_id' - delete one cart by ID - Logged in User
router.delete('/:_id', authMiddleware, async (req, res) => {
  try {
    //get the cart ID from request params
    const { _id } = req.params

    //find the cart by ID to be deleted.
    const deletedCart = await Cart.findByIdAndDelete(_id)

    //if no cart was found by that ID
    if (!deletedCart) {
      return res.status(404).json({
        message: 'Cart not found. It may have already been deleted or expired.'
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
})

module.exports = router
