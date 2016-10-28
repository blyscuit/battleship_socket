// our main app, load modules here
var app = angular.module('mainApp', ['ngAnimate','ui.bootstrap','ui.router','simpleControllers','btford.socket-io','ang-drag-drop','ngBootbox']);

// socket
app.factory('socket', function (socketFactory) {
  var myIoSocket = io.connect('http://192.168.1.10:8080');
  socket = socketFactory({
    ioSocket: myIoSocket
  });
  return socket;
});

// route
app.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/")

  $stateProvider
      .state('lobby', {
          url:'/',
          templateUrl: '/partials/lobby.html',
          controller: 'LobbyController'
      })
      .state('landing', {
            url: '/landing',
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
