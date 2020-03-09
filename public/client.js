var socket = io();
var name;
var color = "rgb(0, 0, 0)";
$(function () {
    $('button').click(function(e) {
        e.preventDefault(); // prevents page reloading
        var msg = $('#message-to-send').val();

        if (msg.charAt(0) == '/') {
            if (msg.slice(0, 15) == "/nickcolor rgb(") {
                var new_color = msg.slice(11, msg.length);
                socket.emit('change nick color', {sender: name, new_color});
            }
            else if (msg.slice(0, 7) == "/nick <"){
                var new_name = msg.slice(7, msg.length-1);
                socket.emit('change nick name', {sender: name, new_name});
            }
            else {
                $('#chat-msg').append(`<li class="clearfix"><div style='font-weight: bold;color: black;'>Undefine command, please try again.</div></li>`);
            }
        }
        else {
            socket.emit('chat message', {msg, sender: name, color});
        }
        $('#message-to-send').val('');
        $('.chat-history').scrollTop($('.chat-history')[0].scrollHeight);
        return false;
    });

    $('#message-to-send').bind('keypress', function(e) {
        if (e.keyCode == 13) {
            var msg = $('#message-to-send').val();

            if (msg.charAt(0) == '/') {
                if (msg.slice(0, 15) == "/nickcolor rgb(") {
                    var new_color = msg.slice(11, msg.length);
                    socket.emit('change nick color', {sender: name, new_color});
                }
                else if (msg.slice(0, 7) == "/nick <"){
                    var new_name = msg.slice(7, msg.length-1);
                    socket.emit('change nick name', {sender: name, new_name});
                }
                else {
                    $('#chat-msg').append(`<li class="clearfix"><div style='font-weight: bold;color: black;'>Undefine command, please try again.</div></li>`);
                }
            }
            else {
                socket.emit('chat message', {msg, sender: name, color});
            }
            $('#message-to-send').val('');
            $('.chat-history').scrollTop($('.chat-history')[0].scrollHeight);
            return false;
        }
    });

    socket.on('user name', function(data) {
        name = data.name;
        color = data.color;
        document.cookie = `name=${name}`;
        $('#chat-msg').append(`<li class="clearfix"><div style='font-weight: bold; color: black; text-align: center; font-size: large;'>You are ${data.name} now.</div></li>`);
    });

    socket.on('chat message', function(data) {
        if (data.sender != name) {
            $('#chat-msg').append(`<li><div class="message-data"><span class="message-data-name" style="color: ${data.color}">${data.sender}</span><span class="message-data-time"${data.time}</span></div><div class="message other-message">${data.msg}</div></li>`);
        }
        else if (data.sender == name) {
            $('#chat-msg').append(`<li class="clearfix"><div class="message-data align-right"><span class="message-data-time" >${data.time}</span> &nbsp; &nbsp;<span class="message-data-name" style="color: ${data.color}">${data.sender}</span></div><div class="message my-message float-right">${data.msg}</div></li>`);
        }
        $('.chat-history').scrollTop($('.chat-history')[0].scrollHeight);
    });

    socket.on('new user name', function(data) {
        if (name == data.sender) {
            name = data.new_name;
            $('#chat-msg').append(`<li class="clearfix"><div style='font-weight: bold; color: black; text-align: center; font-size: large;'>You are ${name} now.</div></li>`);
        }
    });

    socket.on('new user name fail', function(data) {
        if (name == data.sender) {
            $('#chat-msg').append(`<li class="clearfix"><div style='font-weight: bold;color: black; text-align: center; font-size: large;'>User name <div id=user_name style='color:${color}; display: inline;'>${data.new_name}</div> already exist, please try a new one.</div></li>`);
        }
    });

    socket.on('new user name color', function(data) {
        if (name == data.sender) {
            color = data.color;
            $('#chat-msg').append(`<li class="clearfix"><div style='font-weight: bold;color: black; text-align: center; font-size: large;'>Your user name color has been change to <div id=user_name style='color:${color}; display: inline;'>${data.color}</div></li>`);
        }
    });

    socket.on('has cookie or not', function() {
        var value = getCookie("name");
        if (value){
            socket.emit('has cookie or not', {c_name: value})
        }
        else {
            socket.emit('has cookie or not', {c_name: null})
        }
    });

    // reference: javascript.info/cookie
    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    socket.on('update current user', function(data) {
        $('#online-list').empty();
        for (let i = 0; i < data.all_names.length; i++) {
            if (data.all_names[i] == name) {
                $('#online-list').append(`<li class="clearfix"><img src="https://image.flaticon.com/icons/svg/1674/1674453.svg" alt="avatar" style="width: 25%; height: auto;"/><div class="about"><div style="color:${data.all_color[i]}">${data.all_names[i]} (you)</div></div></li>`);
            }
            else {
                $('#online-list').append(`<li class="clearfix"><img src="https://image.flaticon.com/icons/svg/1674/1674453.svg" alt="avatar" style="width: 25%; height: auto;"/><div class="about"><div style="color:${data.all_color[i]}">${data.all_names[i]}</div></div></li>`);
            }
        }
    });

    socket.on('upload history', function(log) {
        for (let i = 0; i < log.length; i++) {
            $('#chat-msg').append(log[i]);
        }
    });
});