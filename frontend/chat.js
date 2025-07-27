const chatBox = document.getElementById('chat');
const chatInput = document.getElementById('chatInput');
const socket = window.socket;

let anonId = null;

socket.on('assignUsername', (name) => {
  anonId = name;
});

function sendMessage() {
  const message = chatInput.value.trim();
  if (!message || !roomId || !anonId) return;

  socket.emit('chatMessage', {
    roomId,
    user: anonId,
    message
  });

  chatInput.value = '';
}

socket.on('chatMessage', ({ user, message }) => {
  const msgElem = document.createElement('div');
  msgElem.innerHTML = `<strong>${user}:</strong> ${message}`;
  chatBox.appendChild(msgElem);
  chatBox.scrollTop = chatBox.scrollHeight;
});