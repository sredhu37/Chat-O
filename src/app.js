import express from 'express';
import http from 'http';
import socketIo from 'socket.io';
import path from 'path';
import chalk from 'chalk';
import debug from 'debug';

const expressApp = express();
const httpServer = http.createServer(expressApp);
const io = socketIo(httpServer);

const debugLog = debug('chat-app: app.js');
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';
let socketCount = 0;
const MAX_SOCK_ALLOWED = 5;
// expressApp.use('./views/');

expressApp.route('/')
  .get((req, res) => {
    res.sendFile(path.join(__dirname, './views/index.html'));
  });

io.on('connection', (socket) => {
  // debugLog(chalk.green('User is connected'));
  let nickname = '';

  socket.on('login', (name) => {
    if (socketCount < MAX_SOCK_ALLOWED) {
      if (name) {
        nickname = name;
        const message = `Welcom to Chat-O: ${nickname}`;
        socket.emit('chatMessage', message);
        // debugLog(chalk.green(message));
        socketCount += 1;
      } else {
        const message = 'No nickname entered! Closed the connection!';
        socket.emit('chatMessage', message);
        // debugLog(chalk.red(message));
        socket.disconnect(true);
        socketCount -= 1;
      }
    } else {
      const message = 'Number of sockets exceeding the allowed number';
      // debugLog(chalk.red(message));
      socket.emit('chatMessage', message);
      socket.disconnect(true);
    }
  });

  socket.on('chatMessage', (msg) => {
    const message = `${nickname}: ${msg}`;
    // debugLog(chalk.green(message));
    io.emit('chatMessage', message);
  });

  socket.on('disconnect', () => {
    debugLog(chalk.green('User disconnected'));
  });
});

httpServer.listen(port, host, () => {
  debugLog(chalk.green(`Connect to http://${host}:${port}`));
});
