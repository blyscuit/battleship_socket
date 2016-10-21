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
  var playerSubmit = 0;
  var shot = [];
  var shotAt = [];
  var turn = Math.floor(Math.random() * 2) + 0; //random 0-1

  var boardStatus;


  for (var k = 0; k < maxPlayer; k++) {
    var sea1 = []
    for(var i = 0; i<maxSea;i++){
      var a = [];
      for(var j = 0; j<maxSea;j++){
        a.push(0);
      }
      sea1.push(a);
    }
    sea.push(sea1);
    shot.push([]);
    shotAt.push([]);
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

      socket.on('submitPlan',function(atLocationArray){
        for (var i = 0; i < atLocationArray.length; i++) {
          var num = atLocationArray[i]
          var row = num[0];
          var column = num[1];
          var shipNum = num[2];
          if(socket.id == hostId){
            sea[0][row][column] = shipNum;
          }else{
            sea[1][row][column] = shipNum;
          }
        }

        io.to(socket.id).emit('receivedPlan');
        playerSubmit++;
        if(playerSubmit===maxPlayer){
          if(turn === 1){
            io.to(hostId).emit('gameReady',true);
            io.to(joinId).emit('gameReady',false);
          }else{
            io.to(hostId).emit('gameReady',false);
            io.to(joinId).emit('gameReady',true);
          }
          myTimer.start(10).on('end',function(){
            if(turn === 0){
              io.to(hostId).emit('result',shotAt[1]);
              io.to(joinId).emit('update map',shot[0]);
              turn = 1;
            }else if(turn ===1 ){
              io.to(joinId).emit('result',shotAt[0]);
              io.to(hostId).emit('update map',shot[1]);
              turn = 0;
            }
          });
        }
      });

      socket.on('disconnect',function(){
        playerCount--;
        socket.broadcast.to(gameId).emit('playerQuit');
      });

//WOODS check dead around here
//add score as a variable and send socket to end game with new score
// just work on game.html
// and controller.js
      socket.on('submitMove',function(move){
        if(socket.id == hostId && turn == 0||socket.id == joinId && turn == 1){
          var row = move[0];
          var column = move[1];
          var timeEnd;
          myTimer.stop();
          if(socket.id == hostId){
            console.log(row +" "+column+ " "+ sea[1][row][column]);
            console.log('%s submit move',hostName);
            shot[0].push([row,column]);
            var hit = 1;
            if(sea[1][row][column]>0){
              hit = 2;
            }
            shotAt[1].push([row,column,hit]);
            io.to(hostId).emit('result',shotAt[1]);
            io.to(joinId).emit('update map',shot[0]);
            turn = 1;
          }
          if(socket.id == joinId){
            console.log(row +" "+column+ " "+ sea[0][row][column]);
            console.log('%s submit move',joinName);
            shot[1].push([row,column]);
            var hit = 1;
            if(sea[0][row][column]>0){
              hit = 2;
            }
            shotAt[0].push([row,column,hit]);
            io.to(joinId).emit('result',shotAt[0]);
            io.to(hostId).emit('update map',shot[1]);
            turn = 0;
          }

          myTimer.start(10).on('end',function(){
            if(turn === 0){
              io.to(hostId).emit('result',shotAt[1]);
              io.to(joinId).emit('update map',shot[0]);
              turn = 1;
            }else if(turn ===1 ){
              io.to(joinId).emit('result',shotAt[0]);
              io.to(hostId).emit('update map',shot[1]);
              turn = 0;
            }
          });
          socket.broadcast.to(gameId).emit(move);
        }
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
        console.log("joining : %s : %s",joinId,playerName);
        io.to(hostId).emit('startGame',joinName);
        io.to(joinId).emit('startGame',hostName);
        //when this emit, people goes to next page, selection page

        myTimer.start(20); //start timer for 10 sec;
      }else{
        hostName = playerName;
        hostId = socket.id;
        console.log("joining : %s : %s",hostId,playerName);
      }
    }

    /** Expose public methods */
    this.getGameID = function () { return gameId; };
    this.join = function (socket,playerName) { join(socket,playerName); };
    this.isFull = function () { if(inProgress)return true;return playerCount === 2; };

  };

  module.exports = Game;
