const router = require('express').Router() //Import express and create a new router
const mongoose = require('mongoose')

const Promotion = require('../models/promotion.js')
const authMiddleware = require('../middleware/authMiddleware.js') // Import the authentication middleware

//POST - 'localhost:8080/api/promotion - create a new promotion - Admin Only
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      //get the promotion data from the request body
      const { title, message, imageUrl, isActive } = req.body

      // if any of the fields are missing
      if (!title || !message || !imageUrl) {
        return res.status(400).json({
          message:
            'Missing required fields. Please fill in all required fields.' // Return a 401 status code and a message
        })
      }

      // if (isActive !== false || isActive !== true) {
      //   return res.status(400).json({
      //     message:
      //       'isActive Missing required fields. Please fill in all required fields.' // Return a 401 status code and a message
      //   })
      // }

      //create a new promotion object
      const newPromotion = new Promotion({
        title,
        message,
        imageUrl,
        isActive,
        createdBy: req.user._id
      })

      //save the new promotion to database
      await newPromotion.save()

      //return the successful response
      res.status(200).json({
        result: newPromotion,
        message: 'Promotion was created successfully!'
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

//GET All - 'localhost:8080/api/promotion - get all promotions - Admin Only
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const promotions = await Promotion.find()

      //if no promotions were found
      if (promotions.length === 0) {
        res.status(404).json({
          message: 'No Promotions were found!'
        })
      }

      res.status(200).json({
        //return a success message
        result: promotions,
        message: 'All Promotions are retrieved successfuly!'
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

//GET Active Only - 'localhost:8080/api/promotion/isActive' - display the active promotions - Any User
router.get('/isActive', async (req, res) => {
  try {
    //find the promotion by ID in the database
    const activePromotions = await Promotion.find({
      isActive: true
    }).sort({ createdAt: -1 })

    //if no promotion matches the given ID
    if (activePromotions.length === 0) {
      return res.status(404).json({
        message: 'No Active promotion was found!'
      })
    }

    //if promotion was found, return the successful response
    res.status(200).json({
      result: activePromotions,
      message: 'Active Promotion was retrieved successfully'
    })
  } catch (error) {
    //return a 500 stats code and an error message
    res.status(500).json({
      Error: `${error.message}`
    })
  }
})

//GET one - 'localhost:8080/api/promotion/:_id' - display one promotion by ID - Admin Only
router.get('/:_id', authMiddleware, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      //get the promotion ID from the request params
      const { _id } = req.params

      //find the promotion by ID in the database
      const promotion = await Promotion.findById(_id)

      //if no promotion matches the given ID
      if (!promotion) {
        return res.status(404).json({
          message: 'No promotion was found!'
        })
      }

      //if promotion was found, return the successful response
      res.status(200).json({
        result: promotion,
        message: 'Promotion was retrieved successfully'
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

//PUT one - 'localhost:8080/api/promotion/:_id' - update one promotion by ID - Admin Only
router.put('/:_id', authMiddleware, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      //get the promotion ID from the request params
      const { _id } = req.params

      //get the updated fields from the request body
      const { title, message, imageUrl, isActive } = req.body

      const promotionToBeUpdated = {
        title,
        message,
        imageUrl,
        isActive
      }

      //options: (Optional) An object specifying options such as new
      //new: If set to true, returns the modified document rather than the original. Defaults to false.
      const options = { new: true }

      //find the booking and update its fields
      const updatedPromotion = await Promotion.findByIdAndUpdate(
        _id,
        promotionToBeUpdated,
        options
      )

      //if no promotion matches the given ID
      if (!updatedPromotion) {
        return res.status(404).json({
          message: 'Promotion was not found!'
        })
      }
      //return the successful message
      res.status(200).json({
        result: updatedPromotion,
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
})

//Delete one - 'localhost:8080/api/promotion/:_id' - delete one promotion by ID - Admin Only
router.delete('/:_id', authMiddleware, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      //get the promotion ID from request params
      const { _id } = req.params

      //find the promotion by ID to be deleted.
      const deletedPromotion = await Promotion.findByIdAndDelete(_id)

      //if no promotion was found
      if (!deletedPromotion) {
        res.status(404).json({
          message: 'Promotion was not found!'
        })
      }
      //send successful response
      res.status(200).json({
        result: deletedPromotion,
        message: 'Promotion was deleted!'
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
