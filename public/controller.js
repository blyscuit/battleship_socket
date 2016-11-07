var simpleControllers = angular.module('simpleControllers', []);


simpleControllers.controller('GameCtrl', function($stateParams,$state,$scope,$rootScope, socket, $interval,$ngBootbox) {
  $scope.opponent = $rootScope.opponent;
  $scope.username = $rootScope.you;
  $scope.sea = $stateParams.myParam.sea;
  $scope.maxSea = $stateParams.myParam.maxSea;

  $scope.gameTime = ""+0;
  socket.on('timer',function(data){
    $scope.gameTime = ""+ Math.floor(data.time/1000);
  });

  $scope.turnName = $scope.username;

  $scope.gameTurn = $stateParams.myParam.turn;
  if($scope.gameTurn===false){
    $scope.turnName = $scope.opponent;
  }

  $scope.score = $rootScope.userScore;
  $scope.OppScore = $rootScope.oppScore;

  $scope.oppSea = [];
  for(var i = 0; i<$scope.maxSea;i++){
    var a = [];
    for(var j = 0; j<$scope.maxSea;j++){
      a.push({"length":0,"name":0});
    }
    $scope.oppSea.push(a);
  }

  $scope.shootAt = function(j,i){
    socket.emit("submitMove",[i,j]);
  }
  socket.on('roomReset', function () {
      alert("This game was reset by the server");
      $rootScope.userScore = 0;
      $rootScope.oppScore = 0;
      $state.go('gamePrepare',{});
  });
  socket.on('result',function(shotAt, score){
    $scope.turn = false;
    $scope.turnName = $scope.opponent;
    $scope.score = score;
    for (var i = 0; i < shotAt.length; i++) {
      var nn = shotAt[i];
        var row = nn[0];
        var column = nn[1];
        var re = nn[2];
        $scope.oppSea[row][column] = {"length":re,"name":re};
    }
  });
  socket.on('update map',function(shot,oppS){
    $scope.turn = true;
    $scope.OppScore = oppS;
    $scope.turnName = $scope.username;
    for (var i = 0; i < shot.length; i++) {
      var nn = shot[i];
        var row = nn[0];
        var column = nn[1];
        var ship = $scope.sea[row][column].name;
        if(ship<=5)
        $scope.sea[row][column] = {"length":ship+6,"name":ship+6};
    }
  });
  socket.on('gameOver',function(score,oppScore,didWin){
    $rootScope.userScore = score;
    $rootScope.oppScore = oppScore;
    $scope.score = $rootScope.userScore;
    $scope.OppScore = $rootScope.oppScore;
    if(didWin === 1){
    $ngBootbox.alert('You won! \n'+ $scope.username+':'+$scope.userScore+" "+$scope.opponent+":"+$scope.oppScore)
      .then(function() {
          // console.log('Alert closed');
          $state.go('gamePrepare',{});
        socket.emit('restartGame');
      });
    }else{
    $ngBootbox.alert('You lose :( \n'+ $scope.username+':'+$scope.userScore+" "+$scope.opponent+":"+$scope.oppScore)
      .then(function() {
          // console.log('Alert closed');
          $state.go('gamePrepare',{});
        socket.emit('restartGame');
      });
    }
  });
  socket.on('disconnectNotice', function(){
    $ngBootbox.alert('Your opponent quited.')
      .then(function() {
          // console.log('Alert closed');
          $state.go('lobby',{});
      });
  });
  socket.on('gameRestarted', function () {
      $state.go('gamePrepare', {});
  });

    socket.emit('requestImages');
    socket.on('shouldRequestImages', function () {
        socket.emit('requestImages');
    });
    socket.on('updateImages', function (myImgUrl, oppImgUrl) {
        $scope.myImage = myImgUrl;
        $scope.yourImage = oppImgUrl;
    });

});

simpleControllers.controller('GameWaitCtrl', function($stateParams,$state,$scope,$rootScope, socket, $interval) {
  $scope.social = {
    twitterWaiting : "I just created a Room in BattleShip. My username is "+$stateParams.myParam.username+". Come join me!"
  };
$rootScope.userScore = 0;
$rootScope.oppScore = 0;
  $scope.username  = $stateParams.myParam.username;

    $scope.showParticles = true;
    socket.emit('joinGame',$stateParams.myParam.username);

  socket.on('startGame',function(name){
    $rootScope.opponent = name;
    $rootScope.you = $scope.username;
    $state.go('gamePrepare',{});
  });


  socket.on('connected', function(connected){
    $scope.online = connected.numUsers;
  })

  $scope.online = $stateParams.myParam.online;
  $scope.matching = "."
  var mm = 0;
  $interval(function() {
            if (mm==0) {$scope.matching = "..";mm++;} else if (mm==1) {$scope.matching = "...";mm++;
            } else if (mm==2) {
              $scope.matching = "....";
              mm++;
            } else if (mm==3) {
              $scope.matching = ".";
              mm=0;
            }
          }, 750);
});
simpleControllers.controller('GamePrepareCtrl', function($state,$scope,$rootScope, socket,$ngBootbox) {
  socket.on('roomReset', function (room) {
  $rootScope.userScore = 0;
  $rootScope.oppScore = 0;
    alert("This game was reset by the server");
      $state.go('gamePrepare',{});
  });

    $scope.opponent = $rootScope.opponent;
    console.log($rootScope.opponent);

      // $rootScope.userScore = $scope.score;
      // $rootScope.oppScore = $scope.oppScore;
      $scope.score = $rootScope.userScore;
      $scope.OppScore = $rootScope.oppScore;

  $scope.maxSea = 8
  $scope.sea = [];
  for(var i = 0; i<$scope.maxSea;i++){
    var a = [];
    for(var j = 0; j<$scope.maxSea;j++){
      a.push({"length":0,"layout":"null","name":0});
    }
    $scope.sea.push(a);
  }

  console.log($scope.sea);

  $scope.men = [
    {"length":4,"layout":"hor","name":1},
    {"length":4,"layout":"hor","name":2},
    {"length":4,"layout":"hor","name":3},
    {"length":4,"layout":"hor","name":4},
  ];

  $scope.addText = "";
  $scope.send = false;

  $scope.dropSuccessHandler = function($event,index,array){
    array.splice(index,1);
  };
  $scope.onDropPlace = function($event,$data,j,i,menArray){
    if($scope.send == true)return;

    // console.log($data+" "+a);
    var ship = $data;

    for(var a = 0;a<ship.length;a++){
      if(ship.layout=="ver"){
        console.log(i+","+(j+a));
        $scope.sea[i][j+a] = ship;
      }else{
        console.log((i+a)+","+j);
        $scope.sea[i+a][j] = ship;
      }
    }
    console.log($scope.sea);
  };

  console.log("wait room");
  $scope.dropValidateSpace = function($data,i,j) {
    if($scope.send == true)return;
    var ship = $data
    if(ship.layout=="ver"){
      if(i>$scope.maxSea-(ship.length)){
        // $scope.men.push(ship);
        return false;
      }
    }else{
      if(j>$scope.maxSea-(ship.length)){
        // $scope.men.push(ship);
        return false;
      }
    }
    for(var a = 0;a<ship.length;a++){
      if(ship.layout=="ver"){
        if($scope.sea[j][i+a].length != 0){
          // $scope.men.push(ship);
          return false;
        }
      }else{
        if($scope.sea[j+a][i].length != 0){
          // $scope.men.push(ship);
          return false;
        }
      }
    }
    return true;
  };
  $scope.turnShip = function(ship){
    if($scope.send == true)return;
    if(ship.layout == "hor"){
      ship.layout = "ver";
    }else{
      ship.layout = "hor"
    }
  };
  $scope.removeShip = function(ship){
    if($scope.send == true)return;
    for(var i = 0; i<$scope.maxSea;i++){
      var a = [];
      for(var j = 0; j<$scope.maxSea;j++){
        if($scope.sea[i][j]==ship){
          $scope.sea[i][j]={"length":0,"layout":"null","name":0};
        }
      }
    }
    $scope.men.push(ship);
  };

  $scope.submitButton = function(){
    if($scope.men.length>0||$scope.send == true){
      alert("Please put down all the ships");
    }else{
      //send ship via socket
      var a = [];
      for(var i = 0; i<$scope.maxSea;i++){
        for(var j = 0; j<$scope.maxSea;j++){
          if($scope.sea[i][j].length>0){
            var num = [i,j,$scope.sea[i][j].name];
            a.push(num);
          }
        }
      }

      socket.emit('submitPlan',a);
    }
  }
  socket.on('receivedPlan',function(){
    $scope.send = true;
  });
  socket.on('gameReady', function(_turn) {
    $state.go('gameTurn',{ myParam:{sea:$scope.sea,maxSea:$scope.maxSea,turn:_turn}});
  });

  socket.on('updatechat', function(data,datadata) {
    $scope.$apply(function () {
      console.log(datadata);
    });
  });

  socket.on('disconnectNotice', function(){
    $ngBootbox.alert('Your opponent quited.')
      .then(function() {
          // console.log('Alert closed');
          $state.go('lobby',{});
        socket.emit('restartGame');
      });
  });
});


simpleControllers.controller('LobbyController', function($state,$scope, $rootScope, socket){
    $scope.social = {
      twitterLobby : "I love battleship."
    };
    $scope.rooms = [];


    socket.on('connected', function(c){
        $scope.online = c.numUsers;
        $scope.rooms = c.roomList;
    })

    socket.on('roomListUpdated', function (list) {
        $scope.rooms = list;
    })

    $scope.createRoom = function () {
        var username = $scope.username;
        // Guard against empty name
        if (typeof username === 'undefined' || username.length <= 0)return;
        socket.emit('createGameRoom', username);
        socket.on('roomCreated', function (room) {
            $state.go('gameWait',{ myParam:{username:room.hostName,online:$scope.online}});
        });
    }

    $scope.joinRoom = function (room) {
        console.log(room);
        var username = $scope.username;
        // Guard against empty name
        if (typeof username === 'undefined' || username.length <= 0)return;

        socket.on('startGame',function(name){
            $rootScope.opponent = name;
            $rootScope.you = username;
            $state.go('gamePrepare',{});
        });

        socket.emit("joinRoom", room, username);

    }

});

simpleControllers.controller('AdminCtrl', function($state,$scope, $rootScope, socket,$window){

    $scope.rooms = [];


    socket.on('connected', function(c){
        $scope.online = c.numUsers;
        $scope.rooms = c.roomList;
    })

    socket.on('roomListUpdated', function (list) {
        $scope.rooms = list;
    })

    socket.emit('registAdmin');

    $scope.createRoom = function () {
        var username = $scope.username;
        // Guard against empty name
        if (typeof username === 'undefined' || username.length <= 0)return;
        socket.emit('createGameRoom', username);
        socket.on('roomCreated', function (room) {
            $state.go('gameWait',{ myParam:{username:room.hostName,online:$scope.online}});
        });
    }

    $scope.resetRoom = function (room) {
        // var username = $scope.username;
        // // Guard against empty name
        // if (typeof username === 'undefined' || username.length <= 0)return;
        //
        // socket.on('startGame',function(name){
        //     $rootScope.opponent = name;
        //     $rootScope.you = username;
        //     $state.go('gamePrepare',{});
        // });
        //
        // socket.emit("joinRoom", room, username);
//Reset room here

        socket.emit("resetRoom",room);
    }
    $scope.onExit = function() {
      socket.emit('deRegistAdmin');
    };

   $window.onbeforeunload =  $scope.onExit;
});


simpleControllers.controller('LandingCtrl', function($state,$scope, socket,$ngBootbox) {
  socket.on('connected', function(connected){
    $scope.online = connected.numUsers;
  })



  //GameRoomFactory start here
  $scope.playButton = function() {
      // Guard against empty name
      var username = $scope.username;
      if (typeof username === 'undefined' || username.length <= 0)return;
      // $state.go('gameWait',{ myParam:{username:$scope.username,online:$scope.online}});

      socket.emit('createGameRoom', username);

  }

});
