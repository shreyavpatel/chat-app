const cookieParser = require("cookie-parser");
var app = require('express')();
app.use(cookieParser());
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var counter = 0;
var users = [];
var messages = [];
var userNameCookie = "";
var userColorCookie = "";

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
    userNameCookie = req.cookies.user;
    userColorCookie = req.cookies.userColour;
});

app.get('/style.css', function (req, res) {
    res.sendFile(__dirname + "/" + "style.css");
});

app.get('/script.js', function (req, res) {
    res.sendFile(__dirname + "/" + "script.js");
});

io.on('connection', (socket) => {
    let userName = "";
    if (typeof userNameCookie !== 'undefined' && userNameCookie.length >=1 && users.indexOf(userNameCookie) === -1){
        userName = userNameCookie;
    }
    else{
        userName = "user"+counter;
        counter ++;
    }

    let userColour = "";
    if (typeof userColorCookie !== 'undefined' && userColorCookie.length >=1){
        userColour = userColorCookie;
    }
    else{
        userColour = "FFFFFF";
    }

    users.push(userName)
    socket.emit('user connected', {userName: userName, userColour: userColour, messages: messages});
    io.emit("all online users", {users: users})

    socket.on('chat message', (msg) => {

        if(msg.search(/\/name /i) === 0) {
            let newUserName = msg.replace(/\/name /i, "");
            let userIndex = users.indexOf(newUserName);
            if (userIndex !== -1){
                socket.emit('username already exists', {newUserName: newUserName});
            }
            else if(newUserName.length < 1 || newUserName.replace(/\s/g, "").length < 1){
                socket.emit('username invalid');
            }
            else {
                users[users.indexOf(userName)] = newUserName;
                for (i = 0; i < messages.length; i++) {
                    if (messages[i].userName === userName) {
                        messages[i] = {
                            text: messages[i].text,
                            timestamp: messages[i].timestamp,
                            userName: newUserName,
                            userColour: userColour
                        }
                    }
                }
                userName = newUserName;
                socket.emit('username updated', {newUserName: newUserName});
                io.emit("all online users", {users: users});
                io.emit('user updated messages', {messages: messages});
            }
        }
        else if(msg.search(/\/color /i) === 0){
            let newUserColour = msg.replace(/\/color /i, "");
            let hex_regexp = /^[0-9a-fA-F]+$/;
            if(hex_regexp.test(newUserColour)){
                for (i = 0; i < messages.length; i++) {
                    if (messages[i].userName === userName) {
                        messages[i] = {
                            text: messages[i].text,
                            timestamp: messages[i].timestamp,
                            userName: messages[i].userName,
                            userColour: newUserColour
                        }
                    }
                }
                userColour = newUserColour;
                socket.emit('user color update', {newUserColour: newUserColour});
                io.emit('user updated messages', {messages: messages});
            }
            else{
                socket.emit('username color error', {newUserColour: newUserColour});
            }
        }
        else{
            function getTime() {
                let minutes = new Date().getMinutes();
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                return new Date().getHours() + ":" + minutes;
            }
            let timestamp = getTime();

            msg = msg.replace(/\:\)/g, "&#128513;");
            msg = msg.replace(/\:\(/g, "&#128577;");
            msg = msg.replace(/\:o/g, "&#128562;");
            msg = msg.replace(/\:\//g, "&#128533;");
            msg = msg.replace(/B\)/g, "&#128526;");
            msg = msg.replace(/\:\*/g, "&#128536;");
            msg = msg.replace(/\:P/g, "&#128540;");
            msg = msg.replace(/\;\)/g, "&#128521;");
            msg = msg.replace(/\:\'\(/g, "&#128549;");
            msg = msg.replace(/\<3/g, "&#128151;");


            io.emit('chat message', msg, timestamp, userName, userColour);

            messages.push({
                text: msg,
                timestamp: timestamp,
                userName: userName,
                userColour: userColour
            });

            if (messages.length > 200) {
                messages.shift();
            }
        }
    });


    socket.on('disconnect', () => {
        users = users.filter(function(value, index, array) {
            return value !== userName;
        })
        io.emit('user disconnected', {users: users});
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});