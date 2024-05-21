const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const pty = require('node-pty');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const terminals = {};
const logs = {};

app.use('/xterm', express.static(path.join(__dirname, 'node_modules', 'xterm', 'lib')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', socket => {
  console.log('Client connected');

  socket.on('createTerminal', () => {
    const term = pty.spawn('bash', [], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: process.env.HOME,
      env: process.env
    });

    console.log(`Created terminal with PID: ${term.pid}`);

    terminals[socket.id] = term;
    logs[socket.id] = '';

    term.on('data', data => {
      logs[socket.id] += data;
      socket.emit('output', data);
    });
  });

  socket.on('input', data => {
    const term = terminals[socket.id];
    term.write(data);
  });

  socket.on('resize', size => {
    const term = terminals[socket.id];
    term.resize(size.cols, size.rows);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    const term = terminals[socket.id];
    if (term) {
      term.kill();
      delete terminals[socket.id];
      delete logs[socket.id];
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server listening on port ${port}`));
