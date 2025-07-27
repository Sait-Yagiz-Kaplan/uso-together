const socket = window.socket;

let roomId = null;
let userName = '';
let userCount = 0;

// YouTube API is now globally loaded, so just grab it
let player = window.player;

// Room
function createRoom() {
  roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  socket.emit('createRoom', roomId);
  document.getElementById('currentRoom').textContent = roomId;
  document.getElementById('controls').style.display = 'block';
  document.getElementById('chatSection').style.display = 'block';
  document.getElementById('roomSection').style.display = 'none';
}

function joinRoom() {
  const inputRoom = document.getElementById('roomInput').value.trim().toUpperCase();
  if (inputRoom === '') return;
  roomId = inputRoom;
  socket.emit('joinRoom', roomId);
  document.getElementById('currentRoom').textContent = roomId;
  document.getElementById('controls').style.display = 'block';
  document.getElementById('chatSection').style.display = 'block';
  document.getElementById('roomSection').style.display = 'none';
}

// Set video
function setVideo() {
  const videoInput = document.getElementById('videoInput').value;
  const videoId = extractVideoId(videoInput);
  if (!videoId || !window.player) return;
  window.player.loadVideoById(videoId);
  socket.emit('setVideo', { roomId, videoId });
}

function extractVideoId(input) {
  const regex = /(?:v=|\/)([0-9A-Za-z_-]{11})/;
  const match = input.match(regex);
  return match ? match[1] : input;
}

// Play/Pause
function playVideo() {
  if (window.player) window.player.playVideo();
  socket.emit('play', { roomId });
}

function pauseVideo() {
  if (window.player) window.player.pauseVideo();
  socket.emit('pause', { roomId });
}

// Socket Events
socket.on('setVideo', ({ videoId }) => {
  if (window.player) window.player.loadVideoById(videoId);
});

socket.on('play', () => {
  if (window.player) window.player.playVideo();
});

socket.on('pause', () => {
  if (window.player) window.player.pauseVideo();
});