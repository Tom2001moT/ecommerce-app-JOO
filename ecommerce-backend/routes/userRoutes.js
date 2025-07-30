/*
 * =================================================================
 * FILE: /routes/userRoutes.js (UPDATED)
 * =================================================================
 * This version reads a comma-separated list of main admin emails
 * from the .env file and protects all of them.
 */
import express from 'express';
const router = express.Router();
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// --- EXISTING ROUTES ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, token: generateToken(user._id) });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
});
router.post('/', async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }
    const user = await User.create({ name, email, password });
    if (user) {
        res.status(201).json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, token: generateToken(user._id) });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});
router.get('/', protect, admin, async (req, res) => {
    const users = await User.find({});
    res.json(users);
});
router.get('/:id', protect, admin, async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) { res.json(user); } else { res.status(404).json({ message: 'User not found' }); }
});


// --- UPDATED ADMIN ROUTES WITH MULTI-ADMIN SUPPORT ---

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        // THE FIX: Check if the user's email is in the main admin list
        const mainAdmins = process.env.MAIN_ADMIN_EMAILS ? process.env.MAIN_ADMIN_EMAILS.split(',') : [];
        if (mainAdmins.includes(user.email)) {
            res.status(400).json({ message: 'Cannot delete a main admin' });
            return;
        }
        if (String(user._id) === String(req.user._id)) {
            res.status(400).json({ message: 'Cannot delete your own admin account' });
            return;
        }
        await user.deleteOne({ _id: user._id });
        res.json({ message: 'User removed' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Update user (including admin status)
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        // THE FIX: Check if the user's email is in the main admin list
        const mainAdmins = process.env.MAIN_ADMIN_EMAILS ? process.env.MAIN_ADMIN_EMAILS.split(',') : [];
        if (mainAdmins.includes(user.email)) {
            res.status(400).json({ message: 'Cannot edit a main admin' });
            return;
        }
        if (String(user._id) === String(req.user._id) && user.isAdmin && req.body.isAdmin === false) {
            res.status(400).json({ message: 'Cannot remove your own admin privileges' });
            return;
        }
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.isAdmin !== undefined) {
            user.isAdmin = Boolean(req.body.isAdmin);
        }
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

export default router;
