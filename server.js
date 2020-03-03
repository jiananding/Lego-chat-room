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

    // change nick name color event
    socket.on('change nick color', changeNickColor);
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
    socket.emit('has cookie or not');
    socket.on('has cookie or not', function(data) {
        console.log("init user socket on ");
        var r = Math.round(Math.random() * 255);
        var g = Math.round(Math.random() * 255);
        var b = Math.round(Math.random() * 255);
        var color = `rgb(${r}, ${g}, ${b})`
        var name;
        if (data.c_name == null) {
            console.log("client does not have the name cookie");    
            name = fake_name[Math.round(Math.floor(Math.random()*10))];
            while (current_user.has(name)) {
                name = fake_name[Math.floor(Math.random()*10)];
            }
        } 
        else {
            console.log("client have the name cookie");
            name = data.c_name;
            // check if the name exist in the current user now, which mean check the nickname was taken or not
            if (current_user.has(name)) {
                name = fake_name[Math.round(Math.floor(Math.random()*10))];
                while (current_user.has(name)) {
                    name = fake_name[Math.floor(Math.random()*10)];
                }
            }
        }
        current_user.set(name, color);
        socket.emit('user name', {name, color});
    });
}

function changeNickName(data) {
    var sender = data.sender;
    var new_name = data.new_name;
    if (!current_user.has(new_name)) {
        var color = current_user.get(sender);
        current_user.delete(sender);
        current_user.set(new_name, color);
        console.log(current_user);
        // better change this
        io.emit('new user name', {new_name, sender});
    }
    else {
        io.emit('new user name fail', {new_name, sender});
    }
}

function changeNickColor(data) {
    var sender = data.sender;
    var new_color = data.new_color;

    current_user.set(sender, new_color);
    new_color = current_user.get(sender);
    io.emit('new user name color', {sender, color: new_color});
}