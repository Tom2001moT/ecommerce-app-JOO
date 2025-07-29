import express from 'express';
const router = express.Router();
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, token: generateToken(user._id) });
  } else { res.status(401).json({ message: 'Invalid email or password' }); }
});
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) { res.status(400).json({ message: 'User already exists' }); return; }
  const user = await User.create({ name, email, password });
  if (user) {
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, token: generateToken(user._id) });
  } else { res.status(400).json({ message: 'Invalid user data' }); }
});
export default router;