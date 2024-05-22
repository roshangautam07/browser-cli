const client = require('../redis');

const {Server} = require('socket.io');
const { createAdapter } =  require('@socket.io/redis-adapter');
var sockets = {};
let socketIO;
 const socketRedis = (server)=>{
const socketIO = new Server(server, {
    // transports:[
    //     'websocket'
    //   ],
    cors: {
      origin: "*"
    }
  });
const pubClient = client;
const subClient = pubClient.duplicate();

socketIO.adapter(createAdapter(pubClient, subClient));

// socketIO.listen(3000);



return socketIO;

}

let socketIOInstance = null;


 const socketCommunication = (server)=>{
     socketIO = socketRedis(server);
    socketIO.on('connection', (socket) => {
        const user = { socketC: socket };
        console.log(`⚡: ${socket.id} user just connected!`);
        // socket.join(socket.id)
        socket.on('connected', (userId) => {
            console.log('IDS',userId);
            sockets[userId] = socket.id;
    
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
          });
        socket.on('loading',(data)=>{
            console.log('Loading....',data)
        })
        socket.on('dashboard',(data)=>{
            console.log('Dashboard of:',data)
        })
        socket.on('commandOutput',(data)=>{
            console.log('CLI',data)
        })
      
        socket.on('error', function(err) {
            console.log("Socket.IO Error");
            console.log(err.stack); // this is changed from your code in last comment
        });
    
    });
    return socketIO;
}
module.exports = {socketCommunication,socketRedis};