var socket = io();
var name;
var color = [0, 0, 0];
$(function () {
    // socket.connect('http://localhost:3000');

    $('form').submit(function(e){
        e.preventDefault(); // prevents page reloading
        var msg = $('#m').val();
        socket.emit('chat message', {msg, sender: name});
        $('#m').val('');
        return false;
    });

    socket.on('user name', function(data) {
        name = data.name;
        color = data.color;
    });

    socket.on('chat message', function(data) {
        console.log(color);
        if (data.sender != name) {
            $('#messages').append(`<li><div id=time_stamps>${data.time}</div> <div id=user_name color=rgb(100, 200, 300)>${data.sender}</div> <div id=msg>${data.msg}<div/></li>`);
        } else if (data.sender == name) {
            $('#messages').append(`<li><div id=time_stamps>${data.time}</div> <div id=user_name color=${color}>${data.sender}</div> <b id=msg>${data.msg}</b></li>`);
        }
    });

});
// color=rgb(${color[0]}, ${color[1]}, ${color[2]}