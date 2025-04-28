const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user'
        },
        deliveryAddress: {
            streetAddress: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            postalCode: {
                type: String,
                required: true
            },
        },
        phoneNumber: {
            type: String, required: true
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        deletionRequest: { type: Boolean, default: false }
    },

    {
        timestamps: true // Automatically add createdAt and updatedAt timestamps
    }
)

module.exports = mongoose.model('User', userSchema);
