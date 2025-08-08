const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/item/'), // Folder for uploaded images
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

//  Add new lost/found item with image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { itemName, itemType, description, dateOfReport,location, userId } = req.body;

    // Validate required fields
    if (!itemName || !itemType || !description || !userId) {
      return res.status(400).json({ message: 'Item name, type, description, and userId are required' });
    }

    // Save image path if uploaded
    const image = req.file ? req.file.filename : null;

    // Create and save new item
    const newItem = new Item({
      itemName,
      itemType,
      description,
      dateOfReport,
      location,
      image,        
      userId,
      
    });

    const savedItem = await newItem.save();
    res.status(201).json({ success: true, message: 'Item added successfully', item: savedItem });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all items

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const sortOrder = req.query.sort === 'desc' ? -1 : 1;

    const items = await Item.find()
      .populate('userId', 'name email phone')
      .sort({ dateOfReport: sortOrder })
      .limit(limit);

   
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


//  Get items for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const items = await Item.find({ userId: req.params.userId })
      .populate('userId', 'name email phone'); // ✅ populate user info

    res.json({ success: true, reports: items });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete item by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
