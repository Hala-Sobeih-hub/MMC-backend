const router = require('express').Router() //Import express and create a new router

const Booking = require('../model/booking') //Import the Booking model

//POST - 'localhost:8080/api/booking - create a new booking - Any User
router.post('/', async (req, res) => {
  try {
    //get booking data from the request body
    const {
      userId,
      email,
      itemsList,
      totalPrice,
      rentalDate,
      deliveryAddress,
      eventNotes
    } = req.body

    //if any of the fields are missing
    if (
      !userId ||
      !email ||
      !itemsList ||
      !totalPrice ||
      !rentalDate ||
      !deliveryAddress
    ) {
      return res.status(401).json({
        message: 'All fields are Required!' // Return a 401 status code and a message
      })
    }

    //create a new booking object
    const newBooking = new Booking({
      userId,
      email,
      itemsList,
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

//GET one - 'localhost:8080/api/booking/:_id' - display one booking by ID - Any User
router.get('/:_id', async (req, res) => {
  try {
    //get the booking ID from the request params
    const { _id } = req.params

    //find the booking by ID in the database
    const booking = await Booking.findById(_id)

    //if no booking matches the given ID
    if (!booking) {
      return res.status(404).json({
        message:
          'Your booking has expired or was not found. Please start a new order.'
      })
    }

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

//PUT one- 'localhost:8080/api/booking/:_id - update one booking by ID - Admin Only
router.put(
  '/:_id',
  /* authenticateToken, */ async (req, res) => {
    try {
      //get the booking ID from request params
      const { _id } = req.params

      //get the updated fields (updated status) from the request body
      const { status } = req.body

      const updatedBooking = { status }

      //options: (Optional) An object specifying options such as new
      //new: If set to true, returns the modified document rather than the original. Defaults to false.
      const options = { new: true }

      //find the booking and update its fields
      await Booking.findByIdAndUpdate(_id, updatedBooking, options)

      //return the successful message
      res.status(200).json({
        result: updatedBooking,
        message: 'Booking was updated!'
      })
    } catch (error) {
      //return a 500 stats code and an error message
      res.status(500).json({
        Error: `${error.message}`
      })
    }
  }
)

//Delete one - 'localhost:8080/api/booking/:_id' - delete one booking by ID - Admin Only
router.delete(
  '/:_id',
  /* authenticateToken, */ async (req, res) => {
    try {
      //get the booking ID from request params
      const { _id } = req.params

      //find the booking by ID to be deleted.
      const deletedBooking = await Booking.findByIdAndDelete(_id)

      //send successful response
      res.status(200).json({
        result: deletedBooking,
        message: 'Booking was deleted!'
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
