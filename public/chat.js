// public/chat.js
const socket = io();
let currentRoom = null;
const username = prompt('Enter your name:') || 'Anonymous';
// In-memory history storage: map room name to array of messages
const chatHistory = {};

function joinRoom(room) {
  // Save current room messages to history
  if (currentRoom) {
    const msgs = Array.from(document.querySelectorAll('#messages .message'))
      .map(div => ({ user: div.dataset.user, text: div.dataset.text }));
    chatHistory[currentRoom] = msgs;
  }

  // Leave previous room
  if (currentRoom) {
    socket.emit('leaveRoom', currentRoom);
  }

  // Switch
  currentRoom = room;
  document.getElementById('currentRoom').textContent = room;
  const messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML = '';

  // Load history for new room (if any)
  if (chatHistory[room]) {
    chatHistory[room].forEach(({ user, text }) => {
      appendMessage(user, text);
    });
  }

  socket.emit('joinRoom', room);
}

socket.on('message', ({ user, text }) => {
  appendMessage(user, text);
});

function appendMessage(user, text) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.dataset.user = user;
  div.dataset.text = text;
  div.innerHTML = `<span class="user">${user}:</span> ${text}`;
  document.getElementById('messages').appendChild(div);
  document.getElementById('messages').scrollTop = 1e9;
}

function sendMessage() {
  const input = document.getElementById('msgInput');
  const text = input.value.trim();
  if (!text || !currentRoom) return;
  socket.emit('chatMessage', { room: currentRoom, user: username, text });
  input.value = '';
  input.focus();
}

// Auto-join default room
joinRoom('general');
