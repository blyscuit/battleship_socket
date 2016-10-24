var app = angular.module('controller');

app.controller('ModalController', ['$scope', 'close','userTo','allUsers','$rootScope','ngstomp', function($scope, close,userTo,allUsers,$rootScope,ngstomp) {
	$scope.userToSend = [userTo.username];
	$scope.userTo = [userTo];
	$scope.users = allUsers;
	$scope.oldFiles = $rootScope.fileHistory
	$scope.close = function(result) {
		close(result); // close, but give 500ms for bootstrap to animate
	};
	$scope.keyCallback = function($event) {
////		console.log("press");
		close();
	}

	$scope.addUserTo = function(user) {
		var index = -1;
		index = $scope.userTo.indexOf(user);
		if(index>=0){
			$scope.userToSend.splice(index, 1);
			$scope.userTo.splice(index, 1);
		}else{
			$scope.userToSend.push(user.username);
			$scope.userTo.push(user);
		}
	};
	$scope.sendHistory = function(fI) {
		fI.user=$scope.userInfo.data;
		var userTo = $scope.userTo;
		for(var i=0;i<userTo.length;i++){
			ngstomp.send("/app/file/"+userTo[i].username, fI,{});
////			console.log(userTo[i].username);
		}
	};
	
}]);