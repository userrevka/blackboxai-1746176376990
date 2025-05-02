const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const friendRoutes = require('./routes/friends');
const { verifyJWT } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp';

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/friends', verifyJWT, friendRoutes);

// Serve frontend build static files
app.use(express.static(path.join(__dirname, '../chat-app-frontend/build')));

// Catch-all route to serve index.html for React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../chat-app-frontend/build', 'index.html'));
});

// Socket.IO for real-time chat
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    // Here you can verify token and attach user info to socket
    // For simplicity, skipping detailed verification
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log("User " + socket.id + " joined room " + room);
  });

  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    console.log("User " + socket.id + " left room " + room);
  });

  socket.on('chatMessage', ({ room, message, sender }) => {
    io.to(room).emit('chatMessage', { message, sender, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
