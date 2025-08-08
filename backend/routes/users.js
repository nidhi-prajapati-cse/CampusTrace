const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // ✅ Added
const mongoose = require('mongoose');



// MULTER CONFIG for profile image

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profile/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });


//Signup Route

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, gender } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      gender: gender?.toLowerCase() || 'other',
      lastLogin: new Date()
    });

    await newUser.save();
    const { password: _, ...userWithoutPassword } = newUser.toObject();
    res.json({ success: true, message: 'User registered successfully', user: userWithoutPassword });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// Login Route

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    
    user.lastLogin = new Date();
    await user.save();

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ success: true, message: 'Login successful', user: userWithoutPassword });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/bulk', async (req, res) => {
  try {
    const rawIds = req.query.ids;
    if (!rawIds) {
      return res.status(400).json({ success: false, message: 'No user IDs provided' });
    }

    const ids = rawIds.split(',').filter(Boolean);

    const isValid = ids.every(id => mongoose.Types.ObjectId.isValid(id));
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'One or more invalid ObjectIDs' });
    }

    const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

    const users = await User.find({ _id: { $in: objectIds } }).select('_id name image');
    return res.status(200).json({ success: true, userDetails: users });

  } catch (error) {
    console.error('Error fetching users in bulk:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Get User by ID (Profile)

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});



//  Update User Profile with Image Upload

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    if (req.body.removeImage === 'true') {
      const user = await User.findById(userId);
      if (user && user.image) {
        const oldImagePath = path.join(__dirname, '..', user.image); 
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath); 
      }
      updateData.image = ''; 
    }

    if (req.file) {
      updateData.image = `/uploads/profile/${req.file.filename}`;
    }
    if (updateData.password) delete updateData.password;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Get All Users

router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // exclude password
    res.json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// Delete User by ID

router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;