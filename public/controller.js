var simpleControllers = angular.module('simpleControllers', []);


simpleControllers.controller('GameCtrl', function($stateParams,$state,$scope,$rootScope, socket, $interval) {
  $scope.opponent = $rootScope.opponent;
  $scope.sea = $stateParams.myParam.sea;
  $scope.maxSea = $stateParams.myParam.maxSea;

  $scope.gameTime = ""+0;
  socket.on('timer',function(data){
    $scope.gameTime = ""+ Math.floor(data.time/1000);
  });

  $scope.turnName = "You";

  $scope.gameTurn = $stateParams.myParam.turn;
  if($scope.gameTurn===false){
    $scope.turnName = $scope.opponent;
  }

  $scope.score = 0;
  $scope.OppScore = 0;

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

  socket.on('result',function(shotAt){
    $scope.turn = false;
    $scope.turnName = $scope.opponent;
    for (var i = 0; i < shotAt.length; i++) {
      var nn = shotAt[i];
        var row = nn[0];
        var column = nn[1];
        var re = nn[2];
        $scope.oppSea[row][column] = {"length":re,"name":re};
    }
  });
  socket.on('update map',function(shot){
    $scope.turn = true;
    $scope.turnName = "You";
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
    $scope.score = score;
    $scope.OppScore = oppScore;
    if(didWin == 1){
      alert("You won!");
    }else{
      alert("You lose :(");
    }
  });

});

simpleControllers.controller('GameWaitCtrl', function($stateParams,$state,$scope,$rootScope, socket, $interval) {

  $scope.username  = $stateParams.myParam.username;

    $scope.showParticles = true;
  // if(!$stateParams.myParam){
  //   $state.go("lobby");
  // }
    // alert($stateParams.myParam.username);
    // socket.emit('joinGame',$scope.username);
    socket.emit('joinGame',$stateParams.myParam.username);

  socket.on('startGame',function(name){
    $rootScope.opponent = name;
    $state.go('gamePrepare',{});
  });
  ////////IMPORTANT REMOVE THIS
  // $state.go('gamePrepare',{});
  ////////

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
simpleControllers.controller('GamePrepareCtrl', function($state,$scope,$rootScope, socket) {
    $scope.opponent = $rootScope.opponent;
    console.log($rootScope.opponent);

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
      // $scope.newCustomers.push(datadata);
      console.log(datadata);
    });
  });
});

simpleControllers.controller('LandingCtrl', function($state,$scope, socket) {
  socket.on('connected', function(connected){
    $scope.online = connected.numUsers;
  })

  //Game start here
  $scope.playButton = function() {
  $state.go('gameWait',{ myParam:{username:$scope.username,online:$scope.online}});
  };
  $scope.online = 0;
  socket.on('updatechat', function(data,datadata) {
    $scope.$apply(function () {
      // $scope.newCustomers.push(datadata);
      console.log(datadata);
    });
  });
});
