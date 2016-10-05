var simpleControllers = angular.module('simpleControllers', []);
simpleControllers.controller('LobbyCtrl', function($state,$scope, socket) {
  $scope.newCustomers = [];
  $scope.currentCustomer = {};


  socket.on('updatechat', function(data,datadata) {
    $scope.$apply(function () {
      $scope.newCustomers.push(datadata);
      console.log(datadata);
    });
  });
});

simpleControllers.controller('GameCtrl', function($stateParams,$state,$scope, socket) {
  $scope.space = [
    [1, 2, 3],
    [3, 1, 2],
    [3, 2, 1]
  ];
  $scope.clickGrid = function(data){
    console.log(data);
  }
  // $scope.newCustomers = [];
  // $scope.currentCustomer = {};
  //
  // $scope.activePlayer = $stateParams.myParam['activePlayer'];
  //
  // // alert($stateParams.myParamGame['room']);
  //
  // if(!$stateParams.myParam){
  //   // $state.go("lobby");
  //   $state.go('gameQuickJoin',{room:$stateParams.room});
  // }
  //
  // $scope.join = function() {
  //   socket.emit('sendchat', $scope.currentCustomer);
  // };
  //
  // $scope.gameAction = function(data){
  //     socket.emit('gamePress',data);
  // };
  //
  // $scope.gameStart = function(){
  //     socket.emit('startGame',$stateParams.room);
  // };
  //
  // socket.on('updatechat', function(data,datadata) {
  //   $scope.$apply(function () {
  //     $scope.newCustomers.push(datadata);
  //   //   $scope.messages.push({
  //   //   user: 'chatroom',
  //   //   text: 'User ' + data.name + ' has left.'
  //   // });
  //     console.log(datadata);
  //   });
  // });
});

simpleControllers.controller('GameWaitCtrl', function($stateParams,$state,$scope, socket) {

  $scope.roomName  = $stateParams.room;

  $scope.newCustomers = [];
  $scope.currentCustomer = {};

  // if(!$stateParams.myParam){
  //   $state.go("lobby");
  // }
  if($stateParams.myParam){
    socket.emit('checkPlayerInRoom',$stateParams.myParam['username'],$stateParams.room);
  }

  $scope.join = function() {
    socket.emit('sendchat', $scope.currentCustomer);
  };

  $scope.gameAction = function(data){
    // alert(data);
      socket.emit('gamePress',data);
  };

  $scope.gameStart = function(){
      socket.emit('startGame',$stateParams.room);
  };

  socket.on('receieveStartGame',function(data,datadata){
    $scope.$apply(function(){
      $state.go('game', { room: datadata,myParam:{username:data,activePlayer:true}});
    });
  });

  socket.on('playerList', function(data,dataBool) {
    $scope.$apply(function () {
      		$scope.newCustomers = data;
          $scope.roomOK = dataBool;
    });
  });

  socket.on('continueGame',function(newroom){
    $scope.$apply(function(){
      $state.go('game', { room: newroom,myParam:{username:$stateParams.myParam['username'],activePlayer:false}});
    });
  });

});
simpleControllers.controller('GamePrepareCtrl', function($state,$scope, socket) {

    $scope.sea = [];
    for(var i = 0; i<8;i++){
      var a = [];
      for(var j = 0; j<8;j++){
        a.push("a");
      }
      $scope.sea.push(a);
    }

    console.log($scope.sea);

    $scope.men = [
      {"length":3,"layout":"hor"},
      {"length":2,"layout":"hor"},
      {"length":4,"layout":"hor"},
      {"length":5,"layout":"hor"},
          ];

          $scope.addText = "";


          $scope.dropSuccessHandler = function($event,index,array){
              array.splice(index,1);
          };

          $scope.onDrop = function($event,$data,array){
              array.push($data);
          };
          $scope.onDropPlace = function($event,$data,i,j){
            // console.log($data+" "+a);
            var ship = $data;
            console.log(ship + $data);
            for(var a = 0;a<ship.length;a++){
              if($data.layout=="hor"){
                $scope.sea[j][i+a] = ship.length;
              }else{
                $scope.sea[j+a][i] = ship.length;
              }
            }
            $scope.sea[j][i] = $data;
          };

console.log("wait room");

    $scope.turnShip = function(ship){
      if(ship.layout == "hor"){
        ship.layout = "ver";
      }else{
        ship.layout = "hor"
      }
    }

    $scope.playButton = function() {
      socket.emit('sendchat', $scope.currentCustomer);
      $state.go('gameWait',{});
    };
  socket.on('updatechat', function(data,datadata) {
    $scope.$apply(function () {
      // $scope.newCustomers.push(datadata);
      console.log(datadata);
    });
  });
});

simpleControllers.controller('LandingCtrl', function($state,$scope, socket) {

    $scope.playButton = function() {
      socket.emit('sendchat', $scope.currentCustomer);
      $state.go('gameWait',{});
    };
  socket.on('updatechat', function(data,datadata) {
    $scope.$apply(function () {
      // $scope.newCustomers.push(datadata);
      console.log(datadata);
    });
  });
});
