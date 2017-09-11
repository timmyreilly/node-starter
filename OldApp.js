var url = require('url');
var request = require('request');
var express = require('express');
var redis = require('redis');
var express = require('express');
var server = require('http').createServer(app);
var socket = require('socket.io');
var io = socket.listen(server);
var redis = require('redis');
var logger = require('./logger');
var bodyParser = require('body-parser'); 
var parseUrlencoded = bodyParser.urlencoded({ extended : false }); 
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

var options = {
    protocol: "http:",
    host: "search.twitter.com",
    pathname: '/search.json',
    query: {
        q: "codeschool"
    }
};

var searchURL = url.format(options);

client.set("name", "tim");
client.get("name", function (error, data) {
    console.log(data);
});

var question1 = "Where is the dog?";

client.lpush('questions', question1, function (error, value) {
    console.log(value);
});

// get all questions: 
client.lrange('questions', 0, -1, function (error, messages) {
    console.log(messages);
});

app.get('/searchURL', function (req, res) {
    request(searchURL).pipe(res);
});

app.get('/', function (request, response) {

})

app.get('/redirect', function (request, response) {
    response.redirect(301, '/blocks');
});

app.get('/blocks', function (request, response) {
    response.json(Object.keys(blocks));
});



// param - intercept parameters from request 
app.param('name', function(request, response, next){
    var name = request.params.name;
    var block = name[0].toUpperCase() + name.slice(1).toLowerCase(); 

    request.blockName = block; 

    next(); 
});

// Dynamic Routes! 
// $ curl -i http://localhost:3001/blocks/Movable 
app.get('/blocks/:name', function (request, response) {
    var description = blocks[request.blockName];
    if (!description) {
       response.status(404).json('No description found for: ' + request.params.name); 
    } else {
        response.json(description);
    }
});

app.get('/locations/:name', function(request, response){
    var location = blocks[request.blockName]; 
    if(!location){
        response.status(404).json('No location found for: ' + request.params.name);
    }else{
        response.json(location); 
    }
});

app.post('/blocks', parseUrlencoded, function(request, response){
    var newBlock = request.body; 
    blocks[newBlock.name] = newBlock.description;

    response.status(201).json(newBlock.name); 
});

app.delete('/blocks/:name', function(request, response){
    delete blocks[request.blockName];
    response.sendStatus(200); 

}); 

var blocksRoute = app.route('blocks'); 
blocksRoute.get(function(request, response){

});

app.route('/blocks')
.get(function(request, response){
    response.send("Hello lad"); 
})
.post(parseUrlencoded, function(request, response){
    // do some data intake 
    response.statusCode(200); 
}); 

app.route('/blocks/:name')
.get(function(request, response){

})
.delete(function(request, response){

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