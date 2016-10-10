var uuid = require('node-uuid');
var Timer = require('timer.js');

var Game = function(io){
  var playerCount = 0;
  var gameId = uuid.v4();
  var maxSea = 8;
  var sea = [];
  var sea1 = []
  var maxPlayer = 2;
  for (var i = 0; i < maxPlayer; i++) {
    for(var i = 0; i<maxSea;i++){
      var a = [];
      for(var j = 0; j<maxSea;j++){
        a.push(0);
      }
      sea1.push(a);
    }
  }

  var myTimer = new Timer({
    tick    : 1, // how many sec per tick
    ontick  : function(ms) {
      io.sockets.in(gameId).emit('timer', { time: ms });
      console.log(ms + ' ms left') },  //ms <-> sec
      onstart : function() { console.log('timer started') },
      onstop  : function() { console.log('timer stop') },
      onpause : function() { console.log('timer set on pause') },
      onend   : function() { console.log('timer ended normally') }
    });


    function join(socket){
      socket.join(gameId);
      playerCount++;
      // socket.broadcast.to(gameId).emit('playerJoined','hi');
      console.log('joiningGame');

      socket.on('disconnect',function(){
        playerCount--;
        socket.broadcast.to(gameId).emit('playerQuit');
      });

      socket.on('submitMove',function(move){
        socket.broadcast.to(gameId).emit(move);
      });

      socket.on('playerJoined',function(hi){
        console.log('i know something is happened');
        myTimer.start(10); //start timer for 10 sec;
      });

      socket.on('playerQuit',function(){
        console.log('someone quit');
      })

      if(playerCount === 2){
        io.to(gameId).emit('playerJoined','hi');
        //when this emit, people goes to next page, selection page

        myTimer.start(20); //start timer for 10 sec;
      }
    }

    /** Expose public methods */
    this.getGameID = function () { return gameId; };
    this.join = function (socket) { join(socket); };
    this.isFull = function () { return playerCount === 2; };

  };

  module.exports = Game;
