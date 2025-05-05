const router = require('express').Router() //Import express and create a new router
const mongoose = require('mongoose')

const Booking = require('../models/booking') //Import the Booking model
const authMiddleware = require('../middleware/authMiddleware.js') // Import the authentication middleware

//POST - 'localhost:8080/api/booking - create a new booking - Logged in User
router.post('/', authMiddleware, async (req, res) => {
  try {
    //get booking data from the request body
    const {
      //userId,  //should come from the token!!
      email,
      itemsList,
      totalPrice,
      rentalDate,
      deliveryAddress,
      eventNotes
    } = req.body

    //if any of the fields are missing, except for eventNotes which is optional
    if (
      //!userId ||
      !email ||
      !itemsList ||
      !totalPrice ||
      !rentalDate ||
      !deliveryAddress
    ) {
      return res.status(400).json({
        message: 'Missing required fields. Please fill in all required fields.' // Return a 401 status code and a message
      })
    }

    const itemsListIds = itemsList.map(item => {
      return {
        ...item,
        productId: new mongoose.Types.ObjectId(item.productId)
      }
    })

    //console.log(`itemsListIds = ${itemsListIds.length}`)
    //create a new booking object
    const newBooking = new Booking({
      userId: req.user.id,
      email,
      itemsList: itemsListIds,
      totalPrice,
      rentalDate,
      deliveryAddress,
      eventNotes,
      status: 'confirmed'
    })

    //save new booking to database
    await newBooking.save()

    //return the successful response
    res.status(200).json({
      result: newBooking,
      message: 'Booking was created successfully!'
    })
  } catch (error) {
    //return a 500 stats code and an error message
    res.status(500).json({
      Error: `${error.message}`
    })
  }
})

//GET All - 'localhost:8080/api/booking/my-bookings' - display All bookings belonging to the logged in User - Logged in User
router.get('/my-bookings', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: 'Unauthorized. No user data found.' })
    }

    //const userId = new mongoose.Types.ObjectId(req.user.id)
    const userId = req.user.id // Assuming JWT stores this (should be req.user.id)
    console.log(`Type of UserId = ${typeof req.user.id}`) // 'string' vs 'object'
    console.log(`userId from bookings routes= ${userId}`)

    console.log('userId from req.user:', req.user.id)
    const bookings = await Booking.find({ userId: userId })
      .populate({
        path: 'userId',
        select: 'firstName lastName email phoneNumber'
      })
      .populate({
        path: 'itemsList.productId',
        select: 'name imageUrl price'
      })
    console.log('Booking Query Result:', bookings)

    // const bookings = await Booking.find({ userId: userId })
    //   .sort({ createdAt: -1 })
    //   .populate({
    //     path: 'userId',
    //     select: 'firstName lastName email phoneNumber'
    //   })
    //   .populate({
    //     path: 'itemsList.productId',
    //     select: 'name imageUrl price'
    //   })

    //if no bookings were found
    if (bookings.length === 0) {
      return res.status(404).json({
        message: 'No Bookings were found for this user!'
      })
    }

    return res.status(200).json({
      //return a success message
      result: bookings,
      message: 'All Bookings are retrieved successfuly!'
    })
  } catch (error) {
    //return a 500 stats code and an error message
    res.status(500).json({
      Error: `${error.message}`
    })
  }
})

//GET one - 'localhost:8080/api/booking/:_id' - display one booking by ID - Logged in User
router.get('/:_id', authMiddleware, async (req, res) => {
  try {
    //get the booking ID from the request params
    const { _id } = req.params

    //find the booking by ID in the database
    const booking = await Booking.findById(_id)
      .populate({
        path: 'userId',
        select: 'firstName lastName email phoneNumber'
      })
      .populate({
        path: 'itemsList.productId',
        select: 'name imageUrl price'
      })

    //if no booking matches the given ID
    if (!booking) {
      return res.status(404).json({
        message:
          'Your booking has expired or was not found. Please start a new order.'
      })
    }

    //Total Price Validation
    // const calculatedTotal = itemsList.reduce((sum, item) => {
    //   return sum + item.quantity * item.price
    // }, 0)

    // if (calculatedTotal !== totalPrice) {
    //   return res.status(400).json({
    //     message: 'Total price mismatch. Please verify the cart total.'
    //   })
    // }

    //if booking was found, return the successful response
    res.status(200).json({
      result: booking,
      message: 'Booking was retrieved successfully'
    })
  } catch (error) {
    //return a 500 stats code and an error message
    res.status(500).json({
      Error: `${error.message}`
    })
  }
})

//GET All - 'localhost:8080/api/booking/user/:userId' - display All bookings belonging to that specific user - Admin Only
router.get(
  '/user/:userId',
  authMiddleware,

  async (req, res) => {
    try {
      if (req.user.isAdmin) {
        //get the userId from request params
        const { userId } = req.params

        const bookings = await Booking.find({ userId })
          .sort({ createdAt: -1 })
          .populate({
            path: 'userId',
            select: 'firstName lastName email phoneNumber'
          })
          .populate({
            path: 'itemsList.productId',
            select: 'name imageUrl price'
          })

        //if no bookings were found
        if (bookings.length === 0) {
          res.status(404).json({
            message: 'No Bookings were found for this user!'
          })
        }

        res.status(200).json({
          //return a success message
          result: bookings,
          message: 'All Bookings are retrieved successfuly!'
        })
      } else {
        // if the user is not an admin
        return res.status(403).json({ error: 'Access denied. Admins only.' })
      }
    } catch (error) {
      //return a 500 stats code and an error message
      res.status(500).json({
        Error: `${error.message}`
      })
    }
  }
)

//GET All - 'localhost:8080/api/booking' - display All bookings from all users - Admin Only
router.get(
  '/',
  authMiddleware,

  async (req, res) => {
    try {
      if (req.user.isAdmin) {
        const bookings = await Booking.find()
          .populate({
            path: 'userId',
            select: 'firstName lastName email phoneNumber'
          })
          .populate({
            path: 'itemsList.productId',
            select: 'name imageUrl price'
          })

        //if no bookings were found
        if (bookings.length === 0) {
          res.status(404).json({
            message: 'No Bookings were found for this user!'
          })
        }

        res.status(200).json({
          //return a success message
          result: bookings,
          message: 'All Bookings are retrieved successfuly!'
        })
      } else {
        // if the user is not an admin
        return res.status(403).json({ error: 'Access denied. Admins only.' })
      }
    } catch (error) {
      //return a 500 stats code and an error message
      res.status(500).json({
        Error: `${error.message}`
      })
    }
  }
)

//PUT one- 'localhost:8080/api/booking/:_id - update one booking by ID - Admin Only
router.put(
  '/:_id',
  authMiddleware,

  async (req, res) => {
    try {
      if (req.user.isAdmin) {
        //get the booking ID from request params
        const { _id } = req.params

        //get the updated fields (updated status) from the request body
        const { status } = req.body

        const bookingToBeUpdated = { status }

        //options: (Optional) An object specifying options such as new
        //new: If set to true, returns the modified document rather than the original. Defaults to false.
        const options = { new: true }

        //find the booking and update its fields
        const updatedBooking = await Booking.findByIdAndUpdate(
          _id,
          bookingToBeUpdated,
          options
        )

        //if no booking was found
        if (!updatedBooking) {
          res.status(404).json({
            message: 'Booking was not found!'
          })
        }
        //return the successful message
        res.status(200).json({
          result: updatedBooking,
          message: 'Booking was updated!'
        })
      } else {
        // if the user is not an admin
        return res.status(403).json({ error: 'Access denied. Admins only.' })
      }
    } catch (error) {
      //return a 500 stats code and an error message
      res.status(500).json({
        Error: `${error.message}`
      })
    }
  }
)

//Delete one - 'localhost:8080/api/booking/:_id' - delete one booking by ID - Admin Only
router.delete('/:_id', authMiddleware, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      //get the booking ID from request params
      const { _id } = req.params

      //find the booking by ID to be deleted.
      const deletedBooking = await Booking.findByIdAndDelete(_id)

      //if no booking was found
      if (!deletedBooking) {
        res.status(404).json({
          message: 'Booking was not found!'
        })
      }
      //send successful response
      res.status(200).json({
        result: deletedBooking,
        message: 'Booking was deleted!'
      })
    } else {
      // if the user is not an admin
      return res.status(403).json({ error: 'Access denied. Admins only.' })
    }
  } catch (error) {
    //return a 500 stats code and an error message
    res.status(500).json({
      Error: `${error.message}`
    })
  }
})

module.exports = router
