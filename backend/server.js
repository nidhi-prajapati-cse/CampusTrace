const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000",             // For local development
  "https://campustrace.onrender.com"   // For deployed frontend
];
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ DB Connection Error:', err));


// Import Routes

const userRoutes = require('./routes/users');
const itemRoutes = require('./routes/items');
const flagRoutes = require('./routes/flags');
const messageRoutes = require('./routes/messages');


// Use Routes

app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/flags', flagRoutes);
app.use('/api/messages', messageRoutes);


//Chat - Socket.IO Setup

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
});

const Message = require("./models/Message");

io.on("connection", (socket) => {
  console.log("💬 New client connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`📦 Socket ${socket.id} joined room: ${roomId}`);
  });

  socket.on("sendMessage", async (msg) => {
    try {
      const { senderId, receiverId, message } = msg;
      const roomId = [senderId, receiverId].sort().join("_");
      const newMessage = new Message({ senderId, receiverId, message, roomId });
      await newMessage.save();
      io.to(roomId).emit("receiveMessage", newMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});



// Test Route
app.get('/', (req, res) => {
  res.send('CampusTrace Backend Running ✅');
});


// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));