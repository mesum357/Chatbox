const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static client files
app.use(express.static('public'));

io.on('connection', socket => {
  console.log(`User connected: ${socket.id}`);

  // join a room
  socket.on('joinRoom', room => {
    socket.join(room);

    socket.to(room).emit('message', { user: 'System', text: `A user joined ${room}.` });
  });

  // leave a room (optional)
  socket.on('leaveRoom', room => {
    socket.leave(room);
    socket.to(room).emit('message', { user: 'System', text: `A user left ${room}.` });
  });

  // handle incoming chat
  socket.on('chatMessage', ({ room, user, text }) => {
    // broadcast to everyone in the room
    io.to(room).emit('message', { user, text });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
