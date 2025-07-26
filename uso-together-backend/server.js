const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

io.on('connection', (socket) => {
  console.log('Bir kullanıcı bağlandı:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    socket.roomId = roomId;
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit('ready', socket.id);
  });

  socket.on('setVideo', ({ roomId, videoId }) => {
    socket.to(roomId).emit('setVideo', videoId);
  });

  socket.on('playPause', ({ roomId, isPlaying, timestamp }) => {
    socket.to(roomId).emit('playPause', { isPlaying, timestamp });
  });

  socket.on('syncState', ({ roomId, state }) => {
    socket.to(roomId).emit('syncState', state);
  });

  // WebRTC signaling events
  socket.on('offer', ({ target, offer }) => {
    io.to(target).emit('offer', { socketId: socket.id, offer });
  });

  socket.on('answer', ({ target, answer }) => {
    io.to(target).emit('answer', { socketId: socket.id, answer });
  });

  socket.on('ice-candidate', ({ target, candidate }) => {
    io.to(target).emit('ice-candidate', { socketId: socket.id, candidate });
  });

  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı:', socket.id);
    if (socket.roomId) {
      socket.to(socket.roomId).emit('userDisconnected', socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Backend ${PORT} portunda çalışıyor.`);
});