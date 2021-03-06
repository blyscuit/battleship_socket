// set up ======================================================================
var express  = require('express');
var app      = express();		// create our app w/ express
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var mongoose = require('mongoose'); 					// mongoose for mongodb
var port  	 = process.env.PORT || 8080; 				// set the port
var database = require('./config/database'); 			// load the database config
var morgan = require('morgan'); 		// log requests to the console (express4)
var bodyParser = require('body-parser'); 	// pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

//import GameRoomFactory
var gameModule = require('./game/battleShip');

// configuration ===============================================================
// mongoose.connect(database.url); 	// connect to mongoDB database on modulus.io

app.use(express.static(__dirname + '/public')); 				// set the static files location /public/img will be /img for users
app.use(morgan('dev')); 										// log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'})); 			// parse application/x-www-form-urlencoded
app.use(bodyParser.json()); 									// parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// routes ======================================================================
// require('./app/routes.js')(app);

// listen (start app with node server.js) ======================================
server.listen(port, function(){
  console.log("App listening on port " + port);
});

var numConnections = 0;

// init gameModule with the server's side io
gameModule.init(io);

io.on('connection',function(socket){
    io.emit('connected', {
        numUsers: ++numConnections,
        roomList: gameModule.getRoomList()
    });

    gameModule.bindSocket(socket);

    gameModule.bindAdmin(socket);

    socket.on('disconnect',function(){
        io.emit('connected', {
          numUsers: --numConnections,
          roomList: gameModule.getRoomList()
        });
        gameModule.onDisconnect(socket);
    });

    socket.on('registAdmin', function(){
      console.log("admin's here");
      io.emit('connected', {
        numUsers: --numConnections,
        roomList: gameModule.getRoomList()
      });

    });
    socket.on('deRegistAdmin', function(){
      console.log("admin's gone");
      io.emit('connected', {
        numUsers: ++numConnections,
        roomList: gameModule.getRoomList()
      });

    });

});



  //
  // socket.on('chat message', function(msg){
  //    io.emit('chat message', msg);
  //    console.log('message: ' + msg);
  //  });

  //
  // socket.on('finishMove', function(move,callback){
  //   var movObj = JSON.parse(move);
  //   socket.emit('move', movObj.type + movObj.pos);
  // });
  //
  // socket.on('updateBoard', function(board){
  //   var boardObj = JSON.parse(board);
  //   socket.emit('updateBoard', boardObj);
  // });
  //
  // socket.on('changeState', function(state){
  //   var stateObj = JSON.parse(state);
  //   console.log(mongoose.load(state));
  // });
  //
  // socket.on('updateOnline', function(){
  //   io.emit('online', io.socket.client().length());
  // });


process.on('SIGINT', function() {
  var quotes = ['All those moments will be lost in time, like tears in rain. Time to die.',
  'What have I done?','Holy Mary, Mother of God, pray for us sinners.','Abracadabra','Hasta la vista',
  'Be sure and tell them ... it was only a bloody game','I know now why you cry. But it\'s something I can never do',
  'Oh no!',' I\'m sorry ... I\'m so sorry...','...heaven, I\'m in heaven ...','This is funny',
  'No! I don\'t want to die! Oh, please! I don\'t want to die! Oh, please! Don\'t make me burn in hell. Oh, please let go of me! Please don\'t kill me! Oh, don\'t kill me, please!']
console.log('\n' + quotes[Math.floor(Math.random()*quotes.length)]);
process.exit();
});
