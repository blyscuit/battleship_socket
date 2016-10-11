var uuid = require('node-uuid');
var Timer = require('timer.js');

var Game = function(io){
  var playerCount = 0;
  var gameId = uuid.v4();
  var maxSea = 8;
  var hostName = "player1";
  var hostId = 0;
  var joinName = "player2";
  var joinId = 0;
  var inProgress = false;
  var sea = [];
  var maxPlayer = 2;



  var sea1 = []
  for(var i = 0; i<maxSea;i++){
    var a = [];
    for(var j = 0; j<maxSea;j++){
      a.push({ship:0});
    }
    sea1.push(a);
  }
  for (var i = 0; i < maxPlayer; i++) {
    sea.push(sea1);
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


    function join(socket,playerName){
      socket.join(gameId);
      playerCount++;
      // socket.broadcast.to(gameId).emit('playerJoined','hi');
      console.log('joiningGame');

      socket.on('submitPlan',function(atLocationArray,playerNumber){

        if(playerNumber == 0){

        }

        for (var i = 0; i < atLocationArray.length; i++) {
          var row = atLocationArray[i].row;
          var column = atLocationArray[i].column;
          var shipNum = atLocationArray[i].ship;
          sea[row][column] = {ship:shipNum};
        }
      });

      socket.on('disconnect',function(){
        playerCount--;
        socket.broadcast.to(gameId).emit('playerQuit');
      });

      socket.on('submitMove',function(move){
        if(socket.id == hostId){
          console.log('%s submit move',hostName);
          io.to(hostId).emit('result')
          io.to(joinId).emit('update map');
        }
        if(socket.id == joinId){
          console.log('%s submit move',joinName);
        }
        socket.broadcast.to(gameId).emit(move);
      });

      socket.on('playerJoined',function(hi){
        console.log('i know something is happened');
        myTimer.start(10); //start timer for 10 sec;
      });

      socket.on('playerQuit',function(){
        console.log('someone quit');
      });

      if(playerCount === 2){
        joinName = playerName;
        joinId = socket.id;
        io.to(hostId).emit('startGame',joinName);
        io.to(joinId).emit('startGame',hostName);
        //when this emit, people goes to next page, selection page

        myTimer.start(20); //start timer for 10 sec;
      }else{
        hostName = playerName;
        hostId = socket.id;
      }
    }

    /** Expose public methods */
    this.getGameID = function () { return gameId; };
    this.join = function (socket,playerName) { join(socket,playerName); };
    this.isFull = function () { if(inProgress)return true;return playerCount === 2; };

  };

  module.exports = Game;
