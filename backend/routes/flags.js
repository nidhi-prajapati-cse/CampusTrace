const express = require('express');
const router = express.Router();
const FlaggedItem = require('../models/FlaggedItem');
const Item = require('../models/Item');
const User = require('../models/User');

// Flag an item
router.post('/', async (req, res) => {
  try {
    const { itemId, reportedBy, flaggedBy, reason } = req.body;

    // Validate required fields
    if (!itemId || !reportedBy || !flaggedBy || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Check if reporter and flagger exist
    const reporter = await User.findById(reportedBy);
    const flagger = await User.findById(flaggedBy);
    if (!reporter || !flagger) return res.status(404).json({ message: 'User not found' });

    // Create flagged item entry
    const newFlag = new FlaggedItem({
      itemId,
      reportedBy,
      flaggedBy,
      reason
    });

    const savedFlag = await newFlag.save();
    res.status(201).json({ message: 'Item flagged successfully', flag: savedFlag });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  Get all flagged items (Admin view)
// routes/flaggedItems.js
router.get('/', async (req, res) => {
  try {
    const flags = await FlaggedItem.find()
      .populate({
        path: 'itemId',
        select: 'itemName itemType description location image dateOfReport createdAt userId',
        populate: {
          path: 'userId',
          select: 'name email phone'
        }
      })
      .populate('reportedBy', 'name email phone')
      .populate('flaggedBy', 'name email phone');

    res.json(flags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const flag = await FlaggedItem.findByIdAndDelete(req.params.id);
    if (!flag) return res.status(404).json({ message: 'Flag not found' });

    res.status(200).json({ message: 'Flag removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
