var express = require('express'),
    socketio = require('socket.io'),
    sqlite = require('sqlite3'),
    http = require('http');
    config = require('./middguard/config');

var app = express();
config.express(app);

var server = http.createServer(app);
var io = socketio(server);

var db = new sqlite.Database(config.settings.db);

io.on('connection', require('./middguard/socket'));

require('./middguard/routes')(app);

var port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log('Listening on port %d...', port);
});