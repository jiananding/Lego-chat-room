var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 3001;

var current_user = new Map();
var fake_name = ["Stephen", "James", "David", "Richard", "Kenneth", "Edward", "Olivia", "Emma", "Sophica", "Isabella"];
var log_history = [];

server.listen(port, function() {
    console.log(`Server listerning at port ${port}`);
});

app.use(express.static('public'));

io.on('connect', newConnection);

function newConnection(socket) {
    // console.log('new connection: ' + socket.id);
    // initial setup for new user
    init_user(socket);

    // listen for incoming messgae
    socket.on('chat message', getMessage);

    // change nick name event
    socket.on('change nick name', changeNickName);

    // change nick name color event
    socket.on('change nick color', changeNickColor);

    // socket id
    var s_id = socket.id;
    socket.on('disconnect', function() {
        var temp = getKeyByValue(s_id);
        current_user.delete(temp);
        update_current_user();
    });
}

function getMessage(data) {
    var today = new Date();
    var time = today.getHours() > 9? today.getHours() + ":" : "0" + today.getHours() + ":"; 
    time += today.getMinutes() > 9? today.getMinutes(): "0" + today.getMinutes();
    var sender = data.sender;
    var msg = data.msg;
    var color = data.color;
    io.emit('chat message', {sender, msg, time, color});
    update_log(time, sender, msg, color);
}

function init_user(socket) {
    socket.emit('has cookie or not');
    socket.on('has cookie or not', function(data) {
        var r = Math.round(Math.random() * 255);
        var g = Math.round(Math.random() * 255);
        var b = Math.round(Math.random() * 255);
        var color = `rgb(${r}, ${g}, ${b})`
        var name;
        if (data.c_name == null) {
            name = fake_name[Math.round(Math.floor(Math.random()*10))];
            while (current_user.has(name)) {
                name = fake_name[Math.floor(Math.random()*10)];
            }
        } 
        else {
            name = data.c_name;
            // check if the name exist in the current user now, which mean check the cookie nickname was taken or not
            if (current_user.has(name)) {
                name = fake_name[Math.round(Math.floor(Math.random()*10))];
                while (current_user.has(name)) {
                    name = fake_name[Math.floor(Math.random()*10)];
                }
            }
        }
        current_user.set(name, [color, socket.id]);
        socket.emit('user name', {name, color});
        socket.emit('upload history', log_history);
        update_current_user()
    });
}

function changeNickName(data) {
    var sender = data.sender;
    var new_name = data.new_name;
    if (!current_user.has(new_name)) {
        var value = current_user.get(sender);
        current_user.delete(sender);
        current_user.set(new_name, value);
        io.emit('new user name', {new_name, sender});
        update_current_user()
    }
    else {
        io.emit('new user name fail', {new_name, sender});
    }
}

function changeNickColor(data) {
    var sender = data.sender;
    var new_color = data.new_color;
    var value = current_user.get(sender);
    value[0] = new_color;
    current_user.set(sender, value);
    new_color = current_user.get(sender);
    io.emit('new user name color', {sender, color: new_color[0]});
    update_current_user()
}

function getKeyByValue(id) {
    for (const [key, value] of current_user.entries()) {
        if (value[1] == id) {
            return key;
        }
    }
}

function update_current_user() {
    // console.log(current_user);
    // console.log("");
    var all_names = [];
    var all_color = [];
    for (const [key, value] of current_user.entries()) {
        all_names.push(key);
        all_color.push(value[0]);
    }
    io.sockets.emit('update current user', {all_names, all_color});
}

function update_log(time, sender, msg, color) {
    if (log_history.length >= 200) {
        log_history.shift();
    }
    log_history.push(`<li><div id='time_stamps'>${time}</div> <div id='user_name' style='color:${color}'>${sender}</div> <div id='msg'>${msg}</div></li>\n`);
}