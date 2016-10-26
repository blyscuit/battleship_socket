function logCtrl ($scope,ngstomp,$location,$window,$http,$rootScope,$cookieStore,ModalService) {
	
	if($cookieStore.get('gol')=="GO"){
		view();
	}

	function view(){		
		
		$http({
			url: '/log/view',
			method: "GET",
//			data: { "username":$scope.userInfo.data.username},
//			headers: {
//				'Content-Type': 'application/json', 
//				'Accept': 'application/json' 
//			}
		})
		.then(function(response) {			
			$scope.logs = response.data;						
		});			
	};

	
}

angular.module('controller').controller('logCtrl', logCtrl);