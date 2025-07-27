

const rooms = {};

function joinRoom(socket, roomId, username) {
  if (!rooms[roomId]) {
    rooms[roomId] = [];
  }

  rooms[roomId].push({ id: socket.id, username });
  socket.join(roomId);

  // Odaya katıldığını bildir
  socket.to(roomId).emit('user-joined', { id: socket.id, username });

  console.log(`${username} odaya katıldı: ${roomId}`);
}

function leaveRoom(socket, roomId) {
  if (!rooms[roomId]) return;

  rooms[roomId] = rooms[roomId].filter(user => user.id !== socket.id);
  socket.leave(roomId);

  // Odadan ayrıldığını bildir
  socket.to(roomId).emit('user-left', { id: socket.id });

  if (rooms[roomId].length === 0) {
    delete rooms[roomId];
  }

  console.log(`${socket.id} odadan ayrıldı: ${roomId}`);
}

module.exports = {
  joinRoom,
  leaveRoom
};