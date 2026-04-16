import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const PORT = 3000;

  // Multiplayer logic
  const players = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (data) => {
      players.set(socket.id, {
        id: socket.id,
        position: data.position || [0, 0, 0],
        rotation: data.rotation || [0, 0, 0],
        status: 'flying',
      });
      socket.broadcast.emit('playerJoined', players.get(socket.id));
      socket.emit('currentPlayers', Array.from(players.values()));
    });

    socket.on('updatePosition', (data) => {
      const player = players.get(socket.id);
      if (player) {
        player.position = data.position;
        player.rotation = data.rotation;
        player.speed = data.speed;
        socket.broadcast.emit('playerMoved', player);
      }
    });

    socket.on('disconnect', () => {
      players.delete(socket.id);
      io.emit('playerLeft', socket.id);
      console.log('User disconnected:', socket.id);
    });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
