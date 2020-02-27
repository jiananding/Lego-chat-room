var socket = io();

$(function () {
    socket.connect('http://localhost:3000');

    $('form').submit(function(e){
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });

    socket.on('chat message', function(data) {
        $('#messages').append(`<li><div id=time_stamps>${data.time}</div> ${data.msg}</li>`);
    });
});