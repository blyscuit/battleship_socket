var app = angular.module('sampleApp', ['ngAnimate','ui.bootstrap','ui.router','simpleControllers','btford.socket-io','ang-drag-drop']);
app.factory('socket', function (socketFactory) {
  var myIoSocket = io.connect('http://localhost:8080');

  socket = socketFactory({
    ioSocket: myIoSocket
  });

  return socket;
});
// app.factory('socket', ['$rootScope', function($rootScope) {
//   var socket = io.connect();
//
//   return {
//     on: function(eventName, callback){
//       socket.on(eventName, callback);
//     },
//     emit: function(eventName, data) {
//       socket.emit(eventName, data);
//     }
//   };
// }]);
app.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/")

  $stateProvider
      .state('lobby', {
            url: '/',
        templateUrl: '/partials/lobbyGame.html',
        controller: 'LandingCtrl'
        // controller: 'GamePrepareCtrl'
      })
      .state('gamePrepare', {
            // url: '/game/:room/+',
        templateUrl: '/partials/gamePrepare.html',
        controller: 'GamePrepareCtrl',
        params:{myParam: null}
      })
      .state('gameTurn', {
            // url: '/game/:room/+',
        templateUrl: '/partials/game.html',
        controller: 'GameCtrl',
        params:{myParam: null}
      })
      .state('gameEnd', {
            // url: '/game/:room/+',
        templateUrl: '/partials/game.html',
        controller: 'GameEndCtrl',
        params:{myParam: null}
      })
      .state('gameWait', {
            // url: '/game/:room',
        templateUrl: '/partials/game.waiting.html',
        controller: 'GameWaitCtrl',
        params:{myParam: null}
      })

  }]);
