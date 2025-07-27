

const socket = io();

let player;
let roomId = null;
let userName = '';
let userCount = 0;

// YouTube API
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: '',
    events: {
      'onReady': onPlayerReady,
    }
  });
}

function onPlayerReady() {
  document.getElementById('videoControls').style.display = 'block';
}

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
  if (!videoId || !player) return;
  player.loadVideoById(videoId);
  socket.emit('setVideo', { roomId, videoId });
}

function extractVideoId(input) {
  const regex = /(?:v=|\/)([0-9A-Za-z_-]{11})/;
  const match = input.match(regex);
  return match ? match[1] : input;
}

// Play/Pause
function playVideo() {
  player.playVideo();
  socket.emit('play', { roomId });
}

function pauseVideo() {
  player.pauseVideo();
  socket.emit('pause', { roomId });
}

// Socket Events
socket.on('setVideo', ({ videoId }) => {
  if (player) player.loadVideoById(videoId);
});

socket.on('play', () => {
  if (player) player.playVideo();
});

socket.on('pause', () => {
  if (player) player.pauseVideo();
});