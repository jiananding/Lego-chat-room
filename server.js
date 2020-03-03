var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 3001;

var current_user = new Map();
var fake_name = ["Stephen", "James", "David", "Richard", "Kenneth", "Edward", "Olivia", "Emma", "Sophica", "Isabella"];

server.listen(port, function() {
    console.log(`Server listerning at port ${port}`);
});

app.use(express.static('public'));

io.on('connection', newConnection);

function newConnection(socket) {
    console.log('new connection: ' + socket.id);
    // initial setup for new user
    init_user(socket);

    // listen for incoming messgae
    socket.on('chat message', getMessage);

    // change nick name event
    socket.on('change nick name', changeNickName);
}

function getMessage(data) {
    var today = new Date();
    var time = today.getHours() > 9? today.getHours() + ":" : "0" + today.getHours() + ":"; 
    time += today.getMinutes() > 9? today.getMinutes(): "0" + today.getMinutes();
    var sender = data.sender;
    var msg = data.msg;
    var color = data.color;
    io.emit('chat message', {sender, msg, time, color});
}

function init_user(socket) {
    // check cookie?
    // if (document.cookie) {
        var r = Math.round(Math.random() * 255);
        var g = Math.round(Math.random() * 255);
        var b = Math.round(Math.random() * 255);
        
        var num = Math.round(Math.floor(Math.random()*10));
        var name = fake_name[num];
        while (current_user.has(name)) {
            name = fake_name[Math.floor(Math.random()*10)];
        }
        var color = `rgb(${r}, ${g}, ${b})`
        current_user.set(name, color);
        socket.emit('user name', {name, color});
    // }
}

function changeNickName(data) {
    var new_name = data.new_name;
    var sender = data.sender;
    if (!current_user.has(new_name)) {
        var color = current_user.get(sender);
        current_user.delete(sender);
        current_user.set(new_name, color);
        // socket.emit('user name', {name, color});
    }
    else {
        // new name exist in current user map
    }
}