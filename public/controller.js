var simpleControllers = angular.module('simpleControllers', []);


simpleControllers.controller('GameCtrl', function($stateParams,$state,$scope,$rootScope, socket, $interval,$ngBootbox) {


  $scope.youPercent = 50;
  $scope.opponentPercent = 75;
  /*$scope.config1.circleColor = "#FF7777";
  $scope.config1.textColor = "#FF4444";
  $scope.config1.waveTextColor = "#FFAAAA";
  $scope.config1.waveColor = "#FFDDDD";
  config1.circleThickness = 0.2;
  config1.textVertPosition = 0.2;
  config1.waveAnimateTime = 1000;*/

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

    $scope.forfeit = function(){
  socket.emit("forfeit");
}



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

  $scope.randomShipPut = function(){
    for (i = 0; i < $scope.men.length; i++) {
      var sship = $scope.men[i];
      if(Math.floor((Math.random() * 2) + 0)===0){
        $scope.turnShip(sship);
      }
      var ii = Math.floor((Math.random() * $scope.maxSea) + 0);
      var jj = Math.floor((Math.random() * $scope.maxSea) + 0);
      while(!$scope.dropValidateSpace(sship,ii,jj)){
        ii = Math.floor((Math.random() * $scope.maxSea) + 0);
        jj = Math.floor((Math.random() * $scope.maxSea) + 0);
      }
      $scope.onDropPlace(null,sship,ii,jj);
    }
    $scope.men = [];
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

simpleControllers.directive('burble', function() {
	return {
		restrict: 'E',
		template: '<svg id="fillgauge1" width="20%" height="100"></svg>',
		scope: {
			percentage: '='
		},

		link: function(scope, elem, attrs) {


			//Falta el nombre
			scope.gauge1 = loadLiquidFillGauge("fillgauge1", 55);
			scope.config1 = liquidFillGaugeDefaultSettings();


			scope.$watch(function(){

				console.log();
				if(isNaN(scope.percentage)){
					scope.gauge1.update(NewValue(0));
				}
				else{
					scope.gauge1.update(NewValue(scope.percentage));
				}

			}
		);


		function liquidFillGaugeDefaultSettings(){
			return {
				minValue: 0, // The gauge minimum value.
				maxValue: 100, // The gauge maximum value.
				circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
				circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
				circleColor: "#178BCA", // The color of the outer circle.
				waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
				waveCount: 1, // The number of full waves per width of the wave circle.
				waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
				waveAnimateTime: 18000, // The amount of time in milliseconds for a full wave to enter the wave circle.
				waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
				waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
				waveAnimate: true, // Controls if the wave scrolls or is static.
				waveColor: "#178BCA", // The color of the fill wave.
				waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
				textVertPosition: .5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
				textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
				valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
				displayPercent: true, // If true, a % symbol is displayed after the value.
				textColor: "#045681", // The color of the value text when the wave does not overlap it.
				waveTextColor: "#A4DBf8" // The color of the value text when the wave overlaps it.
			};
		};

		function loadLiquidFillGauge (elementId, value, config) {
			if(config == null) config = liquidFillGaugeDefaultSettings();

			var gauge = d3.select("#" + elementId);
			var radius = Math.min(parseInt(gauge.style("width")), parseInt(gauge.style("height")))/2;
			var locationX = parseInt(gauge.style("width"))/2 - radius;
			var locationY = parseInt(gauge.style("height"))/2 - radius;
			var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value))/config.maxValue;

			var waveHeightScale;
			if(config.waveHeightScaling){
				waveHeightScale = d3.scale.linear()
				.range([0,config.waveHeight,0])
				.domain([0,50,100]);
			} else {
				waveHeightScale = d3.scale.linear()
				.range([config.waveHeight,config.waveHeight])
				.domain([0,100]);
			}

			var textPixels = (config.textSize*radius/2);
			var textFinalValue = parseFloat(value).toFixed(2);
			var textStartValue = config.valueCountUp?config.minValue:textFinalValue;
			var percentText = config.displayPercent?"%":"";
			var circleThickness = config.circleThickness * radius;
			var circleFillGap = config.circleFillGap * radius;
			var fillCircleMargin = circleThickness + circleFillGap;
			var fillCircleRadius = radius - fillCircleMargin;
			var waveHeight = fillCircleRadius*waveHeightScale(fillPercent*100);

			var waveLength = fillCircleRadius*2/config.waveCount;
			var waveClipCount = 1+config.waveCount;
			var waveClipWidth = waveLength*waveClipCount;

			// Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
			var textRounder = function(value){ return Math.round(value); };
			if(parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))){
				textRounder = function(value){ return parseFloat(value).toFixed(1); };
			}
			if(parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))){
				textRounder = function(value){ return parseFloat(value).toFixed(2); };
			}

			// Data for building the clip wave area.
			var data = [];
			for(var i = 0; i <= 40*waveClipCount; i++){
				data.push({x: i/(40*waveClipCount), y: (i/(40))});
			}

			// Scales for drawing the outer circle.
			var gaugeCircleX = d3.scale.linear().range([0,2*Math.PI]).domain([0,1]);
			var gaugeCircleY = d3.scale.linear().range([0,radius]).domain([0,radius]);

			// Scales for controlling the size of the clipping path.
			var waveScaleX = d3.scale.linear().range([0,waveClipWidth]).domain([0,1]);
			var waveScaleY = d3.scale.linear().range([0,waveHeight]).domain([0,1]);

			// Scales for controlling the position of the clipping path.
			var waveRiseScale = d3.scale.linear()
			// The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
			// such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
			// circle at 100%.
			.range([(fillCircleMargin+fillCircleRadius*2+waveHeight),(fillCircleMargin-waveHeight)])
			.domain([0,1]);
			var waveAnimateScale = d3.scale.linear()
			.range([0, waveClipWidth-fillCircleRadius*2]) // Push the clip area one full wave then snap back.
			.domain([0,1]);

			// Scale for controlling the position of the text within the gauge.
			var textRiseScaleY = d3.scale.linear()
			.range([fillCircleMargin+fillCircleRadius*2,(fillCircleMargin+textPixels*0.7)])
			.domain([0,1]);

			// Center the gauge within the parent SVG.
			var gaugeGroup = gauge.append("g")
			.attr('transform','translate('+locationX+','+locationY+')');

			// Draw the outer circle.
			var gaugeCircleArc = d3.svg.arc()
			.startAngle(gaugeCircleX(0))
			.endAngle(gaugeCircleX(1))
			.outerRadius(gaugeCircleY(radius))
			.innerRadius(gaugeCircleY(radius-circleThickness));
			gaugeGroup.append("path")
			.attr("d", gaugeCircleArc)
			.style("fill", config.circleColor)
			.attr('transform','translate('+radius+','+radius+')');

			// Text where the wave does not overlap.
			var text1 = gaugeGroup.append("text")
			.text(textRounder(textStartValue) + percentText)
			.attr("class", "liquidFillGaugeText")
			.attr("text-anchor", "middle")
			.attr("font-size", textPixels + "px")
			.style("fill", config.textColor)
			.attr('transform','translate('+radius+','+textRiseScaleY(config.textVertPosition)+')');

			// The clipping wave area.
			var clipArea = d3.svg.area()
			.x(function(d) { return waveScaleX(d.x); } )
			.y0(function(d) { return waveScaleY(Math.sin(Math.PI*2*config.waveOffset*-1 + Math.PI*2*(1-config.waveCount) + d.y*2*Math.PI));} )
			.y1(function(d) { return (fillCircleRadius*2 + waveHeight); } );
			var waveGroup = gaugeGroup.append("defs")
			.append("clipPath")
			.attr("id", "clipWave" + elementId);
			var wave = waveGroup.append("path")
			.datum(data)
			.attr("d", clipArea)
			.attr("T", 0);

			// The inner circle with the clipping wave attached.
			var fillCircleGroup = gaugeGroup.append("g")
			.attr("clip-path", "url(#clipWave" + elementId + ")");
			fillCircleGroup.append("circle")
			.attr("cx", radius)
			.attr("cy", radius)
			.attr("r", fillCircleRadius)
			.style("fill", config.waveColor);

			// Text where the wave does overlap.
			var text2 = fillCircleGroup.append("text")
			.text(textRounder(textStartValue) + percentText)
			.attr("class", "liquidFillGaugeText")
			.attr("text-anchor", "middle")
			.attr("font-size", textPixels + "px")
			.style("fill", config.waveTextColor)
			.attr('transform','translate('+radius+','+textRiseScaleY(config.textVertPosition)+')');

			// Make the value count up.
			if(config.valueCountUp){
				var textTween = function(){
					var i = d3.interpolate(this.textContent, textFinalValue);
					return function(t) { this.textContent = textRounder(i(t)) + percentText; }
				};
				text1.transition()
				.duration(config.waveRiseTime)
				.tween("text", textTween);
				text2.transition()
				.duration(config.waveRiseTime)
				.tween("text", textTween);
			}

			// Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
			var waveGroupXPosition = fillCircleMargin+fillCircleRadius*2-waveClipWidth;
			if(config.waveRise){
				waveGroup.attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(0)+')')
				.transition()
				.duration(config.waveRiseTime)
				.attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(fillPercent)+')')
				.each("start", function(){ wave.attr('transform','translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
			} else {
				waveGroup.attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(fillPercent)+')');
			}

			if(config.waveAnimate) animateWave();

			function animateWave() {
				wave.attr('transform','translate('+waveAnimateScale(wave.attr('T'))+',0)');
				wave.transition()
				.duration(config.waveAnimateTime * (1-wave.attr('T')))
				.ease('linear')
				.attr('transform','translate('+waveAnimateScale(1)+',0)')
				.attr('T', 1)
				.each('end', function(){
					wave.attr('T', 0);
					animateWave(config.waveAnimateTime);
				});
			}

			function GaugeUpdater(){
				this.update = function(value){
					var newFinalValue = parseFloat(value).toFixed(2);
					var textRounderUpdater = function(value){ return Math.round(value); };
					if(parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))){
						textRounderUpdater = function(value){ return parseFloat(value).toFixed(1); };
					}
					if(parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))){
						textRounderUpdater = function(value){ return parseFloat(value).toFixed(2); };
					}

					var textTween = function(){
						var i = d3.interpolate(this.textContent, parseFloat(value).toFixed(2));
						return function(t) { this.textContent = textRounderUpdater(i(t)) + percentText; }
					};

					text1.transition()
					.duration(config.waveRiseTime)
					.tween("text", textTween);
					text2.transition()
					.duration(config.waveRiseTime)
					.tween("text", textTween);

					var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value))/config.maxValue;
					var waveHeight = fillCircleRadius*waveHeightScale(fillPercent*100);
					var waveRiseScale = d3.scale.linear()
					// The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
					// such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
					// circle at 100%.
					.range([(fillCircleMargin+fillCircleRadius*2+waveHeight),(fillCircleMargin-waveHeight)])
					.domain([0,1]);
					var newHeight = waveRiseScale(fillPercent);
					var waveScaleX = d3.scale.linear().range([0,waveClipWidth]).domain([0,1]);
					var waveScaleY = d3.scale.linear().range([0,waveHeight]).domain([0,1]);
					var newClipArea;
					if(config.waveHeightScaling){
						newClipArea = d3.svg.area()
						.x(function(d) { return waveScaleX(d.x); } )
						.y0(function(d) { return waveScaleY(Math.sin(Math.PI*2*config.waveOffset*-1 + Math.PI*2*(1-config.waveCount) + d.y*2*Math.PI));} )
						.y1(function(d) { return (fillCircleRadius*2 + waveHeight); } );
					} else {
						newClipArea = clipArea;
					}

					var newWavePosition = config.waveAnimate?waveAnimateScale(1):0;
					wave.transition()
					.duration(0)
					.transition()
					.duration(config.waveAnimate?(config.waveAnimateTime * (1-wave.attr('T'))):(config.waveRiseTime))
					.ease('linear')
					.attr('d', newClipArea)
					.attr('transform','translate('+newWavePosition+',0)')
					.attr('T','1')
					.each("end", function(){
						if(config.waveAnimate){
							wave.attr('transform','translate('+waveAnimateScale(0)+',0)');
							animateWave(config.waveAnimateTime);
						}
					});
					waveGroup.transition()
					.duration(config.waveRiseTime)
					.attr('transform','translate('+waveGroupXPosition+','+newHeight+')')
				}
			}

			return new GaugeUpdater();
		};

		function NewValue(percentage){
			return percentage;
		}

	}
};
});

simpleControllers.directive('burble2', function() {
	return {
		restrict: 'E',
		template: '<svg id="fillgauge2" width="20%" height="100"></svg>',
		scope: {
			percentage: '='
		},

		link: function(scope, elem, attrs) {


			//Falta el nombre
			scope.gauge1 = loadLiquidFillGauge("fillgauge2", 55);
			scope.config1 = liquidFillGaugeDefaultSettings();


			scope.$watch(function(){

				console.log();
				if(isNaN(scope.percentage)){
					scope.gauge1.update(NewValue(0));
				}
				else{
					scope.gauge1.update(NewValue(scope.percentage));
				}

			}
		);


		function liquidFillGaugeDefaultSettings(){
			return {
				minValue: 0, // The gauge minimum value.
				maxValue: 100, // The gauge maximum value.
				circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
				circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
				circleColor: "#178BCA", // The color of the outer circle.
				waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
				waveCount: 1, // The number of full waves per width of the wave circle.
				waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
				waveAnimateTime: 18000, // The amount of time in milliseconds for a full wave to enter the wave circle.
				waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
				waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
				waveAnimate: true, // Controls if the wave scrolls or is static.
				waveColor: "#178BCA", // The color of the fill wave.
				waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
				textVertPosition: .5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
				textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
				valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
				displayPercent: true, // If true, a % symbol is displayed after the value.
				textColor: "#045681", // The color of the value text when the wave does not overlap it.
				waveTextColor: "#A4DBf8" // The color of the value text when the wave overlaps it.
			};
		};

		function loadLiquidFillGauge (elementId, value, config) {
			if(config == null) config = liquidFillGaugeDefaultSettings();

			var gauge = d3.select("#" + elementId);
			var radius = Math.min(parseInt(gauge.style("width")), parseInt(gauge.style("height")))/2;
			var locationX = parseInt(gauge.style("width"))/2 - radius;
			var locationY = parseInt(gauge.style("height"))/2 - radius;
			var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value))/config.maxValue;

			var waveHeightScale;
			if(config.waveHeightScaling){
				waveHeightScale = d3.scale.linear()
				.range([0,config.waveHeight,0])
				.domain([0,50,100]);
			} else {
				waveHeightScale = d3.scale.linear()
				.range([config.waveHeight,config.waveHeight])
				.domain([0,100]);
			}

			var textPixels = (config.textSize*radius/2);
			var textFinalValue = parseFloat(value).toFixed(2);
			var textStartValue = config.valueCountUp?config.minValue:textFinalValue;
			var percentText = config.displayPercent?"%":"";
			var circleThickness = config.circleThickness * radius;
			var circleFillGap = config.circleFillGap * radius;
			var fillCircleMargin = circleThickness + circleFillGap;
			var fillCircleRadius = radius - fillCircleMargin;
			var waveHeight = fillCircleRadius*waveHeightScale(fillPercent*100);

			var waveLength = fillCircleRadius*2/config.waveCount;
			var waveClipCount = 1+config.waveCount;
			var waveClipWidth = waveLength*waveClipCount;

			// Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
			var textRounder = function(value){ return Math.round(value); };
			if(parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))){
				textRounder = function(value){ return parseFloat(value).toFixed(1); };
			}
			if(parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))){
				textRounder = function(value){ return parseFloat(value).toFixed(2); };
			}

			// Data for building the clip wave area.
			var data = [];
			for(var i = 0; i <= 40*waveClipCount; i++){
				data.push({x: i/(40*waveClipCount), y: (i/(40))});
			}

			// Scales for drawing the outer circle.
			var gaugeCircleX = d3.scale.linear().range([0,2*Math.PI]).domain([0,1]);
			var gaugeCircleY = d3.scale.linear().range([0,radius]).domain([0,radius]);

			// Scales for controlling the size of the clipping path.
			var waveScaleX = d3.scale.linear().range([0,waveClipWidth]).domain([0,1]);
			var waveScaleY = d3.scale.linear().range([0,waveHeight]).domain([0,1]);

			// Scales for controlling the position of the clipping path.
			var waveRiseScale = d3.scale.linear()
			// The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
			// such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
			// circle at 100%.
			.range([(fillCircleMargin+fillCircleRadius*2+waveHeight),(fillCircleMargin-waveHeight)])
			.domain([0,1]);
			var waveAnimateScale = d3.scale.linear()
			.range([0, waveClipWidth-fillCircleRadius*2]) // Push the clip area one full wave then snap back.
			.domain([0,1]);

			// Scale for controlling the position of the text within the gauge.
			var textRiseScaleY = d3.scale.linear()
			.range([fillCircleMargin+fillCircleRadius*2,(fillCircleMargin+textPixels*0.7)])
			.domain([0,1]);

			// Center the gauge within the parent SVG.
			var gaugeGroup = gauge.append("g")
			.attr('transform','translate('+locationX+','+locationY+')');

			// Draw the outer circle.
			var gaugeCircleArc = d3.svg.arc()
			.startAngle(gaugeCircleX(0))
			.endAngle(gaugeCircleX(1))
			.outerRadius(gaugeCircleY(radius))
			.innerRadius(gaugeCircleY(radius-circleThickness));
			gaugeGroup.append("path")
			.attr("d", gaugeCircleArc)
			.style("fill", config.circleColor)
			.attr('transform','translate('+radius+','+radius+')');

			// Text where the wave does not overlap.
			var text1 = gaugeGroup.append("text")
			.text(textRounder(textStartValue) + percentText)
			.attr("class", "liquidFillGaugeText")
			.attr("text-anchor", "middle")
			.attr("font-size", textPixels + "px")
			.style("fill", config.textColor)
			.attr('transform','translate('+radius+','+textRiseScaleY(config.textVertPosition)+')');

			// The clipping wave area.
			var clipArea = d3.svg.area()
			.x(function(d) { return waveScaleX(d.x); } )
			.y0(function(d) { return waveScaleY(Math.sin(Math.PI*2*config.waveOffset*-1 + Math.PI*2*(1-config.waveCount) + d.y*2*Math.PI));} )
			.y1(function(d) { return (fillCircleRadius*2 + waveHeight); } );
			var waveGroup = gaugeGroup.append("defs")
			.append("clipPath")
			.attr("id", "clipWave" + elementId);
			var wave = waveGroup.append("path")
			.datum(data)
			.attr("d", clipArea)
			.attr("T", 0);

			// The inner circle with the clipping wave attached.
			var fillCircleGroup = gaugeGroup.append("g")
			.attr("clip-path", "url(#clipWave" + elementId + ")");
			fillCircleGroup.append("circle")
			.attr("cx", radius)
			.attr("cy", radius)
			.attr("r", fillCircleRadius)
			.style("fill", config.waveColor);

			// Text where the wave does overlap.
			var text2 = fillCircleGroup.append("text")
			.text(textRounder(textStartValue) + percentText)
			.attr("class", "liquidFillGaugeText")
			.attr("text-anchor", "middle")
			.attr("font-size", textPixels + "px")
			.style("fill", config.waveTextColor)
			.attr('transform','translate('+radius+','+textRiseScaleY(config.textVertPosition)+')');

			// Make the value count up.
			if(config.valueCountUp){
				var textTween = function(){
					var i = d3.interpolate(this.textContent, textFinalValue);
					return function(t) { this.textContent = textRounder(i(t)) + percentText; }
				};
				text1.transition()
				.duration(config.waveRiseTime)
				.tween("text", textTween);
				text2.transition()
				.duration(config.waveRiseTime)
				.tween("text", textTween);
			}

			// Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
			var waveGroupXPosition = fillCircleMargin+fillCircleRadius*2-waveClipWidth;
			if(config.waveRise){
				waveGroup.attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(0)+')')
				.transition()
				.duration(config.waveRiseTime)
				.attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(fillPercent)+')')
				.each("start", function(){ wave.attr('transform','translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
			} else {
				waveGroup.attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(fillPercent)+')');
			}

			if(config.waveAnimate) animateWave();

			function animateWave() {
				wave.attr('transform','translate('+waveAnimateScale(wave.attr('T'))+',0)');
				wave.transition()
				.duration(config.waveAnimateTime * (1-wave.attr('T')))
				.ease('linear')
				.attr('transform','translate('+waveAnimateScale(1)+',0)')
				.attr('T', 1)
				.each('end', function(){
					wave.attr('T', 0);
					animateWave(config.waveAnimateTime);
				});
			}

			function GaugeUpdater(){
				this.update = function(value){
					var newFinalValue = parseFloat(value).toFixed(2);
					var textRounderUpdater = function(value){ return Math.round(value); };
					if(parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))){
						textRounderUpdater = function(value){ return parseFloat(value).toFixed(1); };
					}
					if(parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))){
						textRounderUpdater = function(value){ return parseFloat(value).toFixed(2); };
					}

					var textTween = function(){
						var i = d3.interpolate(this.textContent, parseFloat(value).toFixed(2));
						return function(t) { this.textContent = textRounderUpdater(i(t)) + percentText; }
					};

					text1.transition()
					.duration(config.waveRiseTime)
					.tween("text", textTween);
					text2.transition()
					.duration(config.waveRiseTime)
					.tween("text", textTween);

					var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value))/config.maxValue;
					var waveHeight = fillCircleRadius*waveHeightScale(fillPercent*100);
					var waveRiseScale = d3.scale.linear()
					// The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
					// such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
					// circle at 100%.
					.range([(fillCircleMargin+fillCircleRadius*2+waveHeight),(fillCircleMargin-waveHeight)])
					.domain([0,1]);
					var newHeight = waveRiseScale(fillPercent);
					var waveScaleX = d3.scale.linear().range([0,waveClipWidth]).domain([0,1]);
					var waveScaleY = d3.scale.linear().range([0,waveHeight]).domain([0,1]);
					var newClipArea;
					if(config.waveHeightScaling){
						newClipArea = d3.svg.area()
						.x(function(d) { return waveScaleX(d.x); } )
						.y0(function(d) { return waveScaleY(Math.sin(Math.PI*2*config.waveOffset*-1 + Math.PI*2*(1-config.waveCount) + d.y*2*Math.PI));} )
						.y1(function(d) { return (fillCircleRadius*2 + waveHeight); } );
					} else {
						newClipArea = clipArea;
					}

					var newWavePosition = config.waveAnimate?waveAnimateScale(1):0;
					wave.transition()
					.duration(0)
					.transition()
					.duration(config.waveAnimate?(config.waveAnimateTime * (1-wave.attr('T'))):(config.waveRiseTime))
					.ease('linear')
					.attr('d', newClipArea)
					.attr('transform','translate('+newWavePosition+',0)')
					.attr('T','1')
					.each("end", function(){
						if(config.waveAnimate){
							wave.attr('transform','translate('+waveAnimateScale(0)+',0)');
							animateWave(config.waveAnimateTime);
						}
					});
					waveGroup.transition()
					.duration(config.waveRiseTime)
					.attr('transform','translate('+waveGroupXPosition+','+newHeight+')')
				}
			}

			return new GaugeUpdater();
		};

		function NewValue(percentage){
			return percentage;
		}

	}
};
});
