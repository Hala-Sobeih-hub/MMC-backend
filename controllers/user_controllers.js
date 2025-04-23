import express from 'express';
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const passwordhashed = bcrypt.hashSync(password, +process.env.SALT);

        let newUser = await User.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: passwordhashed,
        });

        // Assign a token
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        res.status(200).json({
            Msg: 'Success! Account was created!',
            User: newUser,
            Token: token,
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                Error: 'User already exists. Try logging in.',
            });
        }

        res.status(500).json({
            Error: 'An error occurred while creating the account. Please try again later.',
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        // Exclude sensitive fields from the response
        const { password: _, ...userWithoutPassword } = user.toObject();

        res.status(200).json({
            Msg: 'Success! User logged in!',
            User: userWithoutPassword,
            Token: token,
        });
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ message: 'An error occurred while logging in. Please try again later.' });
    }
});


router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized. Please log in.' });
        }

        // Check if the user is an admin or deleting their own account
        if (req.user.id !== id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. You can only delete your own account.' });
        }

        // Find and delete the user
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (err) {
        console.error('Delete User Error:', err.message);
        res.status(500).json({ message: 'An error occurred while deleting the user. Please try again later.' });
    }
});

router.get('/all', authMiddleware, async (req, res) => {
    try {
        // Check if the user is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const users = await User.find()
            .sort('firstName')
            .select({ firstName: 1, lastName: 1, email: 1 });

        res.status(200).json({
            AllUsers: users,
        });
    } catch (err) {
        console.error('Get All Users Error:', err.message);
        res.status(500).json({ message: 'An error occurred while fetching users. Please try again later.' });
    }
});

router.delete('/delete/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if the user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized. Please log in.' });
        }

        // Check if the user is an admin or deleting their own account
        if (req.user.id !== userId && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. You can only delete your own account.' });
        }

        // Find and delete the user
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (err) {
        console.error('Delete User Error:', err.message);
        res.status(500).json({ message: 'An error occurred while deleting the user. Please try again later.' });
    }
})

