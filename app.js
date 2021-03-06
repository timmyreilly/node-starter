var url = require('url');
var request = require('request');
var express = require('express');
var server = require('http').createServer(app);
var socket = require('socket.io');
var io = socket.listen(server);
var redis = require('redis');
var logger = require('./logger');
require("dotenv").config();


var app = express();
app.use(logger);
app.use(express.static('public'));

var blocks = require('./routes/blocks'); 
app.use('/blocks', blocks); 

process.env.REDIS_SERVER_HOST

var client = redis.createClient(6380, 'timIsRed.redis.cache.windows.net',
    {
        auth_pass: process.env.AUTH_PASS,
        tls: { servername: 'timIsRed.redis.cache.windows.net' }
    }

);


client.set("name", "tim");
client.get("name", function (error, data) {
    console.log(data);
});

var question1 = "Where is the dog?";

// client.lpush('questions', question1, function (error, value) {
//     console.log(value);
// });

client.lpop('questions', function(error, value){
    console.log(value); 
})

// get all questions: 
client.lrange('questions', 0, -1, function (error, messages) {
    console.log(messages);
});

app.get('/searchURL', function (req, res) {
    request(searchURL).pipe(res);
});


io.sockets.on('connection', function (client) {
    client.on('answer', function (question, answer) {
        client.broadcast.emit('answer', question, answer);
    });

    client.on('question', function (question) {
        if (!client.question_asked) {
            client.question_asked = true;
            client.broadcast.emit('question', question);
            // add the question to the list here
            redisClient.lpush('questions', question);
        }
    });
});



app.listen(3001, function () {
    console.log("Listening on Port 3001");
}); 