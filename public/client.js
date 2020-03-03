var socket = io();
var name;
var color = [0, 0, 0];
$(function () {
    // socket.connect('http://localhost:3000');

    $('form').submit(function(e){
        e.preventDefault(); // prevents page reloading
        var msg = $('#m').val();

        if (msg.charAt(0) == '/') {
            if (msg.slice(0, 6) == "/nickc") {
                $('#messages').append(`<li><b style="color: white;">Your are ${name} now.</b></li>`);
            }
            else if (msg.slice(0, 7) == "/nick <"){
                var new_name = msg.slice(7, msg.length-1);
                socket.emit('change nick name', {sender: name, new_name});
            }
            else {
                $('#messages').append(`<li><b style="color: white;">Undefine command, please try again.</b></li>`);
            }
        }
        else {
            socket.emit('chat message', {msg, sender: name, color});
        }
        $('#m').val('');
        return false;
    });

    socket.on('user name', function(data) {
        name = data.name;
        color = data.color;
        $('#messages').append(`<li><b style="color: white;">Your are <div id=user_name style="color:${color}">${name}</div> now.</b></li>`);
    });

    socket.on('chat message', function(data) {
        if (data.sender != name) {
            $('#messages').append(`<li><div id=time_stamps>${data.time}</div> <div id=user_name style="color:${data.color}">${data.sender}</div> <div id=msg>${data.msg}<div/></li>`);
        }
        else if (data.sender == name) {
            $('#messages').append(`<li><div id=time_stamps>${data.time}</div> <div id=user_name style="color:${color}">${data.sender}</div> <b id=msg>${data.msg}</b></li>`);
        }
    });

    socket.on('new user name', function(data) {
        if (name == data.sender) {
            name = data.new_name;
            $('#messages').append(`<li><b style="color: white;">Your are <div id=user_name style="color:${color}">${name}</div> now.</b></li>`);
        }
    });

    socket.on('new user name fail', function(data) {
        if (name == data.sender) {
            $('#messages').append(`<li><b style="color: white;">User name <div id=user_name style="color:${color}">${data.new_name}</div> already exist, please try a new one.</b></li>`);
        }
    })
});