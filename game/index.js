var uuid = require('node-uuid');
var Timer = require('timer.js');

var Game = function(io){
  var playerCount = 0;
  var gameId = uuid.v4();

  var myTimer = new Timer({
    tick    : 1, // how many sec per tick
    ontick  : function(sec) { console.log(sec + ' seconds left') },  //ms <-> sec
    onstart : function() { console.log('timer started') },
    onstop  : function() { console.log('timer stop') },
    onpause : function() { console.log('timer set on pause') },
    onend   : function() { console.log('timer ended normally') }
  });

  timer.start(10); //start timer for 10 sec;

  function join(socket){
    socket.join(gameId);
    playerCount++;
    socket.emit('playerJoined');

    socket.on('disconnect',function(){
      socket.broadcast.to(gameId).emit('playerQuit');
    });

    socket.on('submitMove',function(move){
      socket.broadcast.to(gameId).emit(move);
    });
  }
}
