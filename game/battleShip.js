var uuid = require('node-uuid');
var Timer = require('timer.js');
var ImagesClient = require('google-images');
var client = new ImagesClient('014187161452568699414:yh-hz5utvi8', 'AIzaSyAOCzQYhZw10lh2-Qx16Rrp4iNLh7tdZ00');

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
  var playerScore = [];
  var playerLife = [];
  var boardStatus;
  var maxLife = 16;
  var playerImage = [];
  var playing = false;

  function setUpRoom(){
    playerScore = [];
    playerImage = [];
    for (var k = 0; k < maxPlayer; k++) {
      playerScore.push(0);
      playerImage.push("");
    }
    setUpGame();
  }

  function setUpGame(){
    playerSubmit = 0;
    playing = false;
    sea = [];
    shot = [];
    shotAt = [];
    playerLife = [];
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
      playerLife.push(0);
    }

  }



  var myTimer = new Timer({
    tick    : 0.5, // how many sec per tick
    ontick  : function(ms) {
      io.sockets.in(gameId).emit('timer', { time: ms });
      console.log(ms + ' ms left') },  //ms <-> sec
      onstart : function() { console.log('timer started') },
      onstop  : function() { console.log('timer stop') },
      onpause : function() { console.log('timer set on pause') },
      onend   : function() { console.log('timer ended normally') }
    });

    function startTimeTicking(){
      myTimer.stop();
      myTimer.start(11).on('end',function(){
        io.sockets.in(gameId).emit('timer', { time: 10000 });
        if(turn === 0){
          io.to(hostId).emit('result',shotAt[1]);
          io.to(joinId).emit('update map',shot[0]);
          turn = 1;
        }else if(turn ===1 ){
          io.to(joinId).emit('result',shotAt[0]);
          io.to(hostId).emit('update map',shot[1]);
          turn = 0;
        }
        startTimeTicking();
      });
    }
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
          playing = true;
          if(turn === 1){
            io.to(hostId).emit('gameReady',false,playerImage[0],playerImage[1]);
            io.to(joinId).emit('gameReady',true,playerImage[1],playerImage[0]);
          }else{
            io.to(hostId).emit('gameReady',true,playerImage[0],playerImage[1]);
            io.to(joinId).emit('gameReady',false,playerImage[1],playerImage[0]);
          }
          startTimeTicking();
        }
      });
      socket.on('disconnect',function(){
        playerCount--;
        myTimer.stop();
        socket.broadcast.to(gameId).emit('playerQuit');
        io.to(joinId).emit('gameOver',playerScore[1],playerScore[0],1);
      });

      socket.on('forfeit',function(){
        if(socket.id == hostId){
          playerScore[1]++;
          io.to(hostId).emit('gameOver',playerScore[0],playerScore[1],0);
          io.to(joinId).emit('gameOver',playerScore[1],playerScore[0],1);
        }else if(socket.id == joinId){
          playerScore[0]++;
          io.to(hostId).emit('gameOver',playerScore[0],playerScore[1],1);
          io.to(joinId).emit('gameOver',playerScore[1],playerScore[0],0);
        }
        myTimer.stop();
        setUpGame();
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
            shot[0].push([row,column]);
            var hit = 1;
            if(sea[1][row][column]>0){
              hit = 2;
              playerLife[0]+=1;
              if(playerLife[0]>=maxLife){
                playerScore[0]++;
                turn = 3;
                io.to(hostId).emit('gameOver',playerScore[0],playerScore[1],1);
                io.to(joinId).emit('gameOver',playerScore[1],playerScore[0],0);
              }
            }
            shotAt[1].push([row,column,hit]);
            io.to(hostId).emit('result',shotAt[1]);
            io.to(joinId).emit('update map',shot[0]);
            turn = 1;
          }
          if(socket.id == joinId){
            shot[1].push([row,column]);
            var hit = 1;
            if(sea[0][row][column]>0){
              hit = 2;
              playerLife[1]+=1;
              if(playerLife[1]>=maxLife){
                playerScore[1]++;
                turn = 3;
                io.to(hostId).emit('gameOver',playerScore[0],playerScore[1],0);
                io.to(joinId).emit('gameOver',playerScore[1],playerScore[0],1);
              }
            }
            shotAt[0].push([row,column,hit]);
            io.to(joinId).emit('result',shotAt[0]);
            io.to(hostId).emit('update map',shot[1]);
            turn = 0;
          }

          startTimeTicking();
          socket.broadcast.to(gameId).emit(move);
        }
      });

      socket.on('playerJoined',function(hi){
        console.log('i know something is happened');
        myTimer.start(10); //start timer for 10 sec;
      });

      if(playerCount === 2){
        setUpRoom();
        joinName = playerName;
        joinId = socket.id;
        console.log("joining : %s : %s",joinId,playerName);
        io.to(hostId).emit('startGame',joinName);
        io.to(joinId).emit('startGame',hostName);

        client.search(hostName)
        .then(function (images) {
          playerImage[0] = images[0].url;
          if(playing){
            io.to(hostId).emit('myImage',images[0].url);
            io.to(joinId).emit('yourImage',images[0].url);
          }
          console.log("host image = "+images[0].url);
        });
        client.search(joinName)
        .then(function (images) {
          playerImage[1] = images[0].url;
          if(playing){
            io.to(joinId).emit('myImage',images[0].url);
            io.to(hostId).emit('yourImage',images[0].url);
          }

          console.log("join image = "+images[0].url);
        });
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
