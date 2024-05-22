    /* eslint-disable no-undef */
    const  { createClient } = require("redis");
    const client = createClient({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || '6379'
    });
    client.on('error', function(error) {
        console.log('\x1b[41m', 'Fail to connect Redis', '\x1b[0m');
        process.exit(1);
    });
    client.on('ready', function(error) {
        console.log('\x1b[46m', 'Ready', '\x1b[0m');
    });
    client.on('connect', function(error) {
        console.log('\x1b[44m', 'Redis Connected', '\x1b[0m');
    });
    client.on('reconnecting', function(error) {
        console.error('Reconnecting');
    });
    client.on('end', function(error) {
        console.error('Redis connectiton closed');
    });
    // await client.connect();
    module.exports =  client;
    // client.set("key", "values", redis.print);
    // client.get("key", redis.print);