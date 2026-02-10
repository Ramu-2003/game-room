// server/index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());

const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React default port
    methods: ["GET", "POST"],
  },
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Simple Room Schema (Optional for Phase 1, but good for MERN structure)
const roomSchema = new mongoose.Schema({
  roomId: String,
  password: String,
  hostId: String,
  players: [String],
  timeLimit: Number,
  status: { type: String, default: 'waiting' }, // waiting, playing, finished
  createdAt: { type: Date, default: Date.now }
});
const Room = mongoose.model('Room', roomSchema);

// In-memory storage for active game states (Simpler for Phase 1 Real-time)
const gameRooms = {};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 1. CREATE ROOM
  socket.on("create_room", async (data) => {
    const { roomId, password, timeLimit } = data;
    
    // Save to DB (Optional persistence)
    const newRoom = new Room({ roomId, password, hostId: socket.id, players: [socket.id], timeLimit });
    await newRoom.save();

    // Setup In-Memory State
    gameRooms[roomId] = {
      players: [{ id: socket.id, finished: false, time: 0 }],
      timer: null,
      startTime: 0,
      timeLimit: timeLimit
    };

    socket.join(roomId);
    socket.emit("room_created", { roomId, password });
  });

  // 2. JOIN ROOM
  socket.on("join_room", async (data) => {
    const { roomId, password } = data;
    const room = await Room.findOne({ roomId, password });

    if (!room) {
      socket.emit("error_message", "Invalid Room ID or Password");
      return;
    }

    if (room.players.length >= 2) {
      socket.emit("error_message", "Room is full");
      return;
    }

    // Add player to DB
    await Room.updateOne({ _id: room._id }, { $push: { players: socket.id } });

    // Add player to Memory
    gameRooms[roomId].players.push({ id: socket.id, finished: false, time: 0 });

    socket.join(roomId);
    
    // Notify everyone in the room
    io.to(roomId).emit("update_players", { 
      count: gameRooms[roomId].players.length,
      players: gameRooms[roomId].players 
    });
  });

  // 3. START GAME (Host only)
  socket.on("start_game", (roomId) => {
    // Basic check if sender is host (skipped for brevity in Phase 1)
    io.to(roomId).emit("game_started");
  });

  // 4. CODE SUBMISSION & VALIDATION
  socket.on("submit_code", (data) => {
    const { roomId, code } = data;
    const expectedOutput = "Hello World\nThis is my first program in Game-Room"; // Exact match
    
    // Note: In real app, sanitize code. Here we do simple string compare.
    // We remove extra whitespace from ends for leniency.
    const cleanCode = code.trim();

    if (cleanCode === expectedOutput) {
      // CORRECT CODE
      const room = gameRooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        room.players[playerIndex].finished = true;
        room.players[playerIndex].time = Date.now(); // Record finish time
      }

      // Notify Player Success
      io.to(socket.id).emit("code_correct", true);

      // Check if First Winner
      const finishedPlayers = room.players.filter(p => p.finished);
      
      if (finishedPlayers.length === 1) {
        // First one to finish wins
        io.to(roomId).emit("game_over", { winnerId: socket.id });
      } 
      else if (finishedPlayers.length === 2) {
        // Tie logic (if both correct almost same time)
        // Sort by time
        finishedPlayers.sort((a, b) => a.time - b.time);
        if(finishedPlayers[0].time === finishedPlayers[1].time) {
             io.to(roomId).emit("game_over", { winnerId: "tie" });
        } else {
             io.to(roomId).emit("game_over", { winnerId: finishedPlayers[0].id });
        }
      }
    } else {
      // INCORRECT CODE
      io.to(socket.id).emit("code_correct", false);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    // Handle cleanup logic here (remove from DB/Memory) if needed
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});