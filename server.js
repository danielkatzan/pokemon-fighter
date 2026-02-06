const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Room management
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('create_room', () => {
    let code = generateRoomCode();
    while (rooms.has(code)) code = generateRoomCode();

    const room = {
      code,
      players: [{ id: socket.id, character: null, ready: false }],
      state: 'waiting', // waiting, selecting, fighting
      seed: Math.floor(Math.random() * 1000000)
    };
    rooms.set(code, room);
    socket.join(code);
    socket.roomCode = code;
    socket.playerNumber = 1;
    socket.emit('room_created', { code });
    console.log(`Room ${code} created by ${socket.id}`);
  });

  socket.on('join_room', ({ code }) => {
    const room = rooms.get(code);
    if (!room) {
      socket.emit('room_error', { message: 'Room not found' });
      return;
    }
    if (room.players.length >= 2) {
      socket.emit('room_error', { message: 'Room is full' });
      return;
    }
    if (room.state !== 'waiting') {
      socket.emit('room_error', { message: 'Game already in progress' });
      return;
    }

    room.players.push({ id: socket.id, character: null, ready: false });
    room.state = 'selecting';
    socket.join(code);
    socket.roomCode = code;
    socket.playerNumber = 2;

    socket.emit('room_joined', { playerNumber: 2 });
    socket.to(code).emit('opponent_joined', {});
    console.log(`${socket.id} joined room ${code}`);
  });

  socket.on('select_character', ({ character }) => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.character = character;
      socket.to(socket.roomCode).emit('opponent_selected', { character });
    }
  });

  socket.on('ready', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.ready = true;

      if (room.players.length === 2 && room.players.every(p => p.ready)) {
        room.state = 'fighting';
        io.to(socket.roomCode).emit('both_ready', { countdown: 3 });
        setTimeout(() => {
          io.to(socket.roomCode).emit('game_start', { seed: room.seed });
        }, 3000);
      }
    }
  });

  socket.on('game_input', (data) => {
    socket.to(socket.roomCode).emit('opponent_input', data);
  });

  socket.on('rematch_request', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.wantsRematch = true;
      socket.to(socket.roomCode).emit('rematch_requested', {});

      // If both want rematch, reset room and notify both
      if (room.players.length === 2 && room.players.every(p => p.wantsRematch)) {
        room.state = 'selecting';
        room.players.forEach(p => { p.ready = false; p.character = null; p.wantsRematch = false; });
        room.seed = Math.floor(Math.random() * 1000000);
        io.to(socket.roomCode).emit('rematch_accepted', {});
      }
    }
  });

  socket.on('rematch_accept', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.wantsRematch = true;

      if (room.players.length === 2 && room.players.every(p => p.wantsRematch)) {
        room.state = 'selecting';
        room.players.forEach(p => { p.ready = false; p.character = null; p.wantsRematch = false; });
        room.seed = Math.floor(Math.random() * 1000000);
        io.to(socket.roomCode).emit('rematch_accepted', {});
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    if (socket.roomCode) {
      const room = rooms.get(socket.roomCode);
      if (room) {
        socket.to(socket.roomCode).emit('opponent_disconnected', {});
        // Clean up room after delay
        setTimeout(() => {
          const currentRoom = rooms.get(socket.roomCode);
          if (currentRoom) {
            const stillConnected = currentRoom.players.filter(p => {
              const s = io.sockets.sockets.get(p.id);
              return s && s.connected;
            });
            if (stillConnected.length === 0) {
              rooms.delete(socket.roomCode);
              console.log(`Room ${socket.roomCode} deleted`);
            }
          }
        }, 10000);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Pokemon Fighter server running on port ${PORT}`);
});
