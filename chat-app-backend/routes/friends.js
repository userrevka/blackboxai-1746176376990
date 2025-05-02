const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Add friend by username
router.post('/add', async (req, res) => {
  try {
    const userId = req.userId;
    const { friendUsername } = req.body;
    if (!friendUsername) {
      return res.status(400).json({ message: 'Friend username is required' });
    }
    const user = await User.findById(userId);
    const friend = await User.findOne({ username: friendUsername });
    if (!friend) {
      return res.status(404).json({ message: 'Friend user not found' });
    }
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: 'User is already your friend' });
    }
    user.friends.push(friend._id);
    await user.save();
    return res.json({ message: 'Friend added successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get friend list
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate('friends', 'username');
    return res.json({ friends: user.friends });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
