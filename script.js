$(function () {
    var socket = io();
    var clientUsername = "";
    var clientColor = "";

    $('form').submit(function(e){
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });

    socket.on('chat message', function(msg, time, userName, userColour){
        if (userName !== clientUsername){
            $('#messages').append($('<li>'+
                '<div class="message">'
                + '<div class="userAndTimestamp">'
                + '<div class="username" style="color:#'+ userColour +';">'+ userName  + '</div>'
                + '<div class="timestamp">'+ time  + '</div>'
                + '</div>'
                + '<div class="text">' + msg + '</div>'
                + '</div>'));
        }
        else{
            $('#messages').append($('<li>'+
                '<div class="message myMessage">'
                + '<div class="text myText">' + msg + '</div>'
                + '<div class="userAndTimestamp">'
                + '<div class="username myUsername" style="color:#'+ userColour +'";">'+ userName  + '</div>'
                + '<div class="timestamp myTimestamp">'+ time  + '</div>'
                + '</div>'
                + '</div>'));
        }

        $('.messageBoard').scrollTop($('.messageBoard').height());
    });

    socket.on('user connected', function(msg){
        clientUsername = msg.userName;
        document.cookie = "user="+ clientUsername +"; max-age=3600";
        clientColor = msg.userColour;
        document.cookie = "userColour="+ clientColor +"; max-age=3600";

        msg.messages.forEach(function (value){
            if (value.userName !== clientUsername){
                $('#messages').append($('<li>'+
                    '<div class="message">'
                    + '<div class="userAndTimestamp">'
                    + '<div class="username" style="color:#'+ value.userColour +';">'+ value.userName  + '</div>'
                    + '<div class="timestamp">'+ value.timestamp  + '</div>'
                    + '</div>'
                    + '<div class="text">' + value.text + '</div>'
                    + '</div>'));
            }
            else{
                $('#messages').append($('<li>'+
                    '<div class="message myMessage">'
                    + '<div class="text myText">' + value.text + '</div>'
                    + '<div class="userAndTimestamp">'
                    + '<div class="username myUsername" style="color:#'+ value.userColour +';">'+ value.userName  + '</div>'
                    + '<div class="timestamp myTimestamp">'+ value.timestamp  + '</div>'
                    + '</div>'
                    + '</div>'));
            }
        });
    });

    socket.on('all online users', function(msg){
        $('#users').empty();
        $('#users').append($('<li>').text(clientUsername + " (You)"));
        msg.users.forEach(function(value) {
            if (value !== clientUsername){
                $('#users').append($('<li>').text(value));
            }
        });
    });

    socket.on('user disconnected', function(msg){
        $('#users').empty();
        $('#users').append($('<li>').text(clientUsername + " (You)"));
        msg.users.forEach(function(value) {
            if (value !== clientUsername){
                $('#users').append($('<li>').text(value));
            }
        });
    });

    socket.on('username already exists', function(msg){
        $('#messages').append($('<li>'+
            '<div class="notification">'
            + 'The username '
            + msg.newUserName
            + ' is already taken. Please try again with a different username.'
            + '</div>'));
    });

    socket.on('username invalid', function(){
        $('#messages').append($('<li>'+
            '<div class="notification">'
            + 'The username entered was not valid. Please try again.'
            + '</div>'));
    });

    socket.on('username updated', function(msg){
        clientUsername = msg.newUserName;
        document.cookie = "user="+ clientUsername +"; max-age=3600";
    });

    socket.on('user updated messages', function(msg){
        $('#messages').empty();

        msg.messages.forEach(function (value){
            if (value.userName !== clientUsername){
                $('#messages').append($('<li>'+
                    '<div class="message">'
                    + '<div class="userAndTimestamp">'
                    + '<div class="username" style="color:#'+ value.userColour +';">'+ value.userName  + '</div>'
                    + '<div class="timestamp">'+ value.timestamp  + '</div>'
                    + '</div>'
                    + '<div class="text">' + value.text + '</div>'
                    + '</div>'));
            }
            else{
                $('#messages').append($('<li>'+
                    '<div class="message myMessage">'
                    + '<div class="text myText">' + value.text + '</div>'
                    + '<div class="userAndTimestamp">'
                    + '<div class="username myUsername" style="color:#'+ value.userColour +';">'+ value.userName  + '</div>'
                    + '<div class="timestamp myTimestamp">'+ value.timestamp  + '</div>'
                    + '</div>'
                    + '</div>'));
            }
        });
    });

    socket.on('username color error', function(msg){
        $('#messages').append($('<li>'+
            '<div class="notification">'
            + 'The color '
            + msg.newUserColour
            + ' is not a valid hexidecimal color. Please try again.'
            + '</div>'));
    });

    socket.on('user color update', function(msg){
        clientColor = msg.newUserColour;
        document.cookie = "userColour="+ clientColor +"; max-age=3600";
    });
});
