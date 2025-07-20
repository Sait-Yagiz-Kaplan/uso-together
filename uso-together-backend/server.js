const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

const rooms = {};  // roomId: { videoId, isPlaying, timestamp }

io.on('connection', (socket) => {
    console.log('Bir kullanıcı bağlandı:', socket.id);

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        if (rooms[roomId]) {
            socket.emit('syncState', rooms[roomId]);
        }
    });

    socket.on('setVideo', ({ roomId, videoId }) => {
        if (!rooms[roomId]) rooms[roomId] = {};
        rooms[roomId].videoId = videoId;
        io.to(roomId).emit('setVideo', videoId);
    });

    socket.on('playPause', ({ roomId, isPlaying, timestamp }) => {
        if (!rooms[roomId]) return;
        rooms[roomId].isPlaying = isPlaying;
        rooms[roomId].timestamp = timestamp;
        io.to(roomId).emit('playPause', { isPlaying, timestamp });
    });

    socket.on('disconnect', () => {
        console.log('Kullanıcı ayrıldı:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Backend ${PORT} portunda çalışıyor.`);
});