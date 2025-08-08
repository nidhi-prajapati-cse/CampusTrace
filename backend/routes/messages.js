const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

//Get chat history between two users
router.get("/history/:userId/:otherUserId", async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const roomId = [userId, otherUserId].sort().join("_");

    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

//  Get all contacts a user has chatted with
router.get("/contacts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all messages where the user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate("senderId receiverId", "name email")
      .sort({ createdAt: -1 }); 

    const contactMap = new Map();

    messages.forEach((msg) => {
      const otherUser =
        msg.senderId._id.toString() === userId ? msg.receiverId : msg.senderId;

      const otherUserId = otherUser._id.toString();

      // Only keep the first (latest) message from each contact
      if (!contactMap.has(otherUserId)) {
        contactMap.set(otherUserId, {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          lastMessageAt: msg.createdAt, 
        });
      }
    });

    // Convert to array and sort by latest message
    const sortedContacts = Array.from(contactMap.values()).sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
    );

    res.json({ success: true, contacts: sortedContacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ success: false, error: "Failed to fetch contacts" });
  }
});



// Send a new message (optional if using only Socket.IO)
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;
    const roomId = [senderId, receiverId].sort().join("_");
    const newMessage = await Message.create({ senderId, receiverId, message, roomId });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Server error" });
  }
});
//fetch messages for a room
router.get("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    return res.status(200).json({
      success: true,
      messages: messages || [],
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
