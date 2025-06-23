const socket = io();
let currentRoom = null;
const username = prompt('Enter your name:') || 'Anonymous';
const chatHistory = {};

function addChannel() {
  const input = document.getElementById('channelInput');
  const name = input.value.trim();
  if (!name) return;
  const list = document.getElementById('channel-list');
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.textContent = name;
  btn.onclick = () => joinRoom(name);
  li.appendChild(btn);
  list.appendChild(li);
  input.value = '';
}

function joinRoom(room) {
  if (currentRoom) {
    socket.emit('leaveRoom', currentRoom);
    // Save current messages
    const msgs = Array.from(document.querySelectorAll('#messages .message'))
      .map(div => ({ user: div.dataset.user, text: div.dataset.text }));
    chatHistory[currentRoom] = msgs;
  }
  currentRoom = room;
  document.getElementById('currentRoom').textContent = room;
  const messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML = '';
  // Load history
  if (chatHistory[room]) {
    chatHistory[room].forEach(({ user, text }) => appendMessage(user, text));
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

// Add event listeners for Enter key
document.getElementById('msgInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

document.getElementById('channelInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    addChannel();
  }
});
