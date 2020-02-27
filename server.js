var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 3000;

server.listen(port, function() {
    console.log('Server listerning at port 3000');
});

app.use(express.static('public'));

io.on('connection', newConnection);

function newConnection(socket) {
    // console.log('new connection: ' + socket.id);

    // listen for incoming messgae
    socket.on('chat message', getMessage);
}

function getMessage(msg) {
    var today = new Date();
    var time = today.getHours() > 9? today.getHours() + ":" : "0" + today.getHours() + ":"; 
    time += today.getMinutes() > 9? today.getMinutes(): "0" + today.getMinutes();
    io.emit('chat message', {msg, time});
}