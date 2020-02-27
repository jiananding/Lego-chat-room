var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendFile('/home/ugc/jianan.ding1/Desktop/Chat/public' + '/index.html');
});

io.on('connection', connected_id);

http.listen(3000, function() {
    console.log('listening on *:3000');
});

function connected_id(socket) {
    // console.log('new connection: ' + socket.id);

    socket.on('chat message', function(msg) {
        io.emit('chat message', msg);
    });
}