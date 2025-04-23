import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({


    firstName: {
        type: String, required: true
    },
    lastName: {
        type: String, required: true
    },
    username: {
        type: String, required: true, unique: true
    },
    email: {
        type: String, required: true, unique: true
    },
    password: {
        type: String, required: true
    },
    role: {
        type: String, enum: ['admin', 'user'], default: 'user'
    },
    deliveryAddress: {
        type: String, required: true

    },
    phoneNumber: {
        type: String, required: true
    },
    eventNotes: {
        type: String, required: true
    },
    isAdmin: {
        type: Boolean, default: false
    },
}, {
    timestamps: true // Automatically add createdAt and updatedAt timestamps 
});

export default mongoose.model('User', userSchema);
