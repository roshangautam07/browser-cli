const client = require('../redis');
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const pty = require('node-pty');

const {Server} = require('socket.io');
const { createAdapter } =  require('@socket.io/redis-adapter');

let socketIO;
var sockets = {};
const terminals = {};
const logs = {};
 const socketRediss = (server)=>{
    const socks = new Server(server, {
        // transports:[
        //     'websocket'
        //   ],
        cors: {
          origin: "*"
        }
      });
    const pubClient = client;
    const subClient = pubClient.duplicate();
    
    socks.adapter(createAdapter(pubClient, subClient));
    
    socks.on('connection', socket => {
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

    
    // return socks;
    
    }
    socketRediss(server);

 const socketConnection = (server, app) => {
    socketIO = new Server(server, {
        cors: {
          origin: '*'
        }
      });
    // socketIO = socketRedis(server);
    socketIO.on('connection', (socket) => {
        const user = { socketC: socket };
        console.log(`⚡: ${socket.id} user just connected!`);
        // socket.join(socket.id)
        socket.on('connected', (userId) => {
            console.log('IDS',userId);
            sockets[userId] = socket.id;
            // Save the socket id to Redis so that all processes can access it.
            client.hmset('mastersocket', sockets, function(err) {
                if (err) {
                    throw err;
                }
                console.log(`Master socket is now${  socket.id}`);
            });
            console.log('UserIddd', userId);
            // The socket ID is stored along with the unique ID generated by the client
            app.set('sockets', sockets);

            //sockets.push(socket.id);
            console.log('socks', sockets);
            // console.log('socks users', getSocketUser());
            // The sockets object is stored in Express so it can be grabbed in a route
        });
        socket.on('success', (data) => {
            console.log('tttttttttttttttttttfyj', data.username);
            socket.broadcast.emit('login', data);
        });
        socket.on('disconnect', () => {
            console.log('🔥: A user disconnected');
            delete sockets[socket.id];
        });
        socket.on('Shutdown', () => {
            //exit(0);
        });
        socket.on('disconnected', (id) => {
            console.log(': A user disconnected' + id);
            delete sockets[socket.id];
            if (id) {
              client.hdel('mastersocket', [id ? id : 9], function (err) {
                if (err) {
                  throw err;
                }
                // client.hdel('loggedinip', [userid ? userid : 9], function (err) {
                //   if (err) {
                //     throw err;
                //   }
                // });
              });
            }
          });
        socket.on('loading',(data)=>{
            console.log('Loading....',data)
        })
        socket.on('billingError',(data)=>{
            console.log('Error....', data);
            socket.broadcast.emit('errorBill', data);
          
        })
        socket.on('dashboard',(data)=>{
            console.log('Dashboard of:',data)
        })
        socket.on('billing',(data)=>{
            console.log('Billing of:', data)
            socket.broadcast.emit('bill', data);
        })
        socket.on('print',(data)=>{
            console.log('Print of:',data)
        })
      
        socket.on('error', function(err) {
            console.log("Socket.IO Error");
            console.log(err.stack); // this is changed from your code in last comment
        });

    });
    // socketIO.use((socket, next) => {
    //     authSocketMiddleware(socket, next);
    // })
    app.set("io", socketIO);
    app.set('sockets', sockets);


    return socketIO;
};
 const getSocketIo = () => {
    return socketIO;
};

 const getSocketUser = (fn) => {
    // return sockets;
    client.hgetall('mastersocket', (err, obj) => {
        if (err) {
            throw err;
        }
        console.log('DEDIS', obj);
        fn(obj);
    });
};
 const notifyAll = (data) => {
    console.log(data);
    socketIO.socket.on('course', data);
};
module.exports = {
    socketConnection,
    socketRediss,

}