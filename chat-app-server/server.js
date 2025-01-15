import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv'

dotenv.config()

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = new Map();

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', (username) => {
    users.set(socket.id, username);
    io.emit('userJoined', { username, message: `${username} has joined the chat` });
  });

  socket.on('message', (message) => {
    const username = users.get(socket.id);
    io.emit('message', {
      username,
      text: message,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    if (username) {
      users.delete(socket.id);
      io.emit('userLeft', { username, message: `${username} has left the chat` });
    }
  });
});

const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
