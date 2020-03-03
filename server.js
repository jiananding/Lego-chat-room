var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 3000;

var current_user = new Map();
var fake_name = ["Stephen", "James", "David", "Richard", "Kenneth", "Edward", "Olivia", "Emma", "Sophica", "Isabella"];

server.listen(port, function() {
    console.log('Server listerning at port 3000');
});

app.use(express.static('public'));

io.on('connection', newConnection);

function newConnection(socket) {
    console.log('new connection: ' + socket.id);
    var name = init_user();
    var color = current_user.get(name);
    socket.emit('user name', {name, color});
    // listen for incoming messgae
    socket.on('chat message', getMessage);
}

function getMessage(data) {
    var today = new Date();
    var time = today.getHours() > 9? today.getHours() + ":" : "0" + today.getHours() + ":"; 
    time += today.getMinutes() > 9? today.getMinutes(): "0" + today.getMinutes();
    var sender = data.sender;
    var msg = data.msg;
    io.emit('chat message', {sender, msg, time});
}

function init_user() {

    // if (document.cookie) {
        var r = Math.random() * 255;
        var g = Math.random() * 255;
        var b = Math.random() * 255;
        
        var name = fake_name[Math.floor(r*10)];
        while (current_user.has(name)) {
            name = fake_name[Math.floor(Math.random()*10)];
        }

        var color = `rgb(${r}, ${g}, ${b})`
        current_user.set(name, color);
        return name;
    // }
}