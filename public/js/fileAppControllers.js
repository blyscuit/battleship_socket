function fileCtrl ($scope,ngstomp,$location,$window,$http,$rootScope,$cookieStore,ModalService) {		
	var lat=0;var lng=0;
	if(!$cookieStore.get('username')||!$cookieStore.get('GUID')){
		$location.path( "/" );
		return;
	}
	$scope.userInfo = $cookieStore.get('username');
	
////	console.log($scope.userInfo.data);
	
	checkSameUser();
	function checkSameUser(){
		$http({
			url: '/user/checkSame',
			method: "PUT",
			data: { "username":$scope.userInfo.data.username,"UDID":$cookieStore.get('GUID')},
			headers: {
				'Content-Type': 'application/json', 
				'Accept': 'application/json' 
			}
		})
		.then(function(response) {
////			console.log(response);
			if(response.data.message=="OK"){
				successLogInLoad();
			}else{
				$cookieStore.put('username',null);
				$cookieStore.put('GUID',null);
				$location.path( "/" );
			}

		});
	}
	function successLogInLoad(){
		ngstomp
		.subscribeTo('/topic/file') 
		.callback(prepareReceiveModal)
		.bindTo($scope)
		.connect();
		ngstomp
		.subscribeTo('/topic/file/'+$scope.userInfo.data.username+$cookieStore.get('GUID'))
		.callback(prepareReceiveModalSecure)
		.bindTo($scope)
		.connect();
		ngstomp
		.subscribeTo('/topic/userin') 
		.callback(alertUserIn)
		.bindTo($scope)
		.connect();
		ngstomp
		.subscribeTo('/topic/userout') 
		.callback(alertUserOut)
		.bindTo($scope)
		.connect();
////		console.log('socket connected');
		
		$window.onbeforeunload =  $scope.onExit;
		geoMine();
	}
	function getAllUsers(){
		if(!$scope.userInfo||!$cookieStore.get('username')){
			$location.path( "/" );
		}
//		$http({
//			url: '/user/all',
//			method: "GET",
//			headers: {
//				'Content-Type': 'application/json', 
//				'Accept': 'application/json' 
//			}
//		})
//		.then(function(response) {
//			console.log(response);
//			$scope.users = response.data;
//
//			getUsersLocation();
//		});
//		$http({
//			url: '/user/alle',
//			method: "PUT",
//	        data: { "username":$scope.userInfo.data.username},
//			headers: {
//				'Content-Type': 'application/json', 
//				'Accept': 'application/json' 
//			}
//		})
//		.then(function(response) {
//			console.log(response);
//			$scope.users = response.data;
//
//			getUsersLocation();
//		});
		$http({
			url: '/user/location',
			method: "PUT",
			data: { "username":$scope.userInfo.data.username,"lat":$scope.lat,"lng":$scope.lng},
			headers: {
				'Content-Type': 'application/json', 
				'Accept': 'application/json' 
			}
		})
		.then(function(response) {
////			console.log(response);
			$scope.users = response.data;

			getUsersLocation();
		});
	}
	function getUsersLocation(){
		for (var i =0;i<$scope.users.length;i++){
			if($scope.users[i].position){
				$scope.users[i].distance = getDistanceFromLatLonInKm($scope.lat,$scope.lng,$scope.users[i].position[0],$scope.users[i].position[1]).toFixed(3) + " km";
			}else{
				$scope.users[i].distance = "not available";
			}
			$scope.users[i].bgColor = getRandomColor();
		}
	}
	function getRandomColor () {
		  var hex = Math.floor(Math.random() * 0xFFFFFF);
		  return "#" + ("000000" + hex.toString(16)).substr(-6);
		}

	

	function downloadFileIn(fI) {
//		var fI = JSON.parse(message.body)
//		console.log(fI.link);
		$.fileDownload("/f"+"/"+fI.name)
		.done(function () { alert('File download a success!'); })
		.fail(function () { alert('File download failed!'); });
	}

	function alertUserIn(message) {
		var body = JSON.parse(message.body);
		if($scope.userInfo.data.username!=body.username.data.username){
			$scope.users.push(body.username.data);
		}
		getAllUsers();
////		console.log(body);
	}
	function alertUserOut(message) {
		var body = JSON.parse(message.body);
////		console.log($scope.users[0].username);
		for (var i =0;i<$scope.users.length;i++){
			if($scope.users[i].username==body.username.data.username){

//				alert(i);
				$scope.users.splice(i, 1);     
				return;
			}

		}

		$timeout(getAllUsers(), 100);

////		console.log(body.username);
	}



	$scope.partialDownloadLink = 'http://localhost:8080/download?filename=';
	$scope.filename = '';

	$scope.uploadFile = function() {
		$scope.processDropzone();
	};

	$scope.reset = function() {
		$scope.resetDropzone();
	};
	$scope.onExit = function() {
		$http({
			url: '/user/logout',
			method: "POST",
			data: { "username":$scope.userInfo.data.username},
			headers: {
				'Content-Type': 'application/json', 
				'Accept': 'application/json' 
			}
		})
		.then(function(response) {
////			console.log("bye");
			return response;
		});
		ngstomp.send("/topic/userout", {"message":"logout","username":$scope.userInfo},{});

//		return "loging out";
	};


	$scope.showCustom = function(fI) {
		ModalService.showModal({
			templateUrl: "web/modal.html",
			controller: "ModalController",
			inputs: {
				userTo: fI,
				allUsers: $scope.users,
				ngstomp:ngstomp
			}
		}).then(function(modal) {
			modal.close.then(function(result) {
				$scope.customResult = "All good!";
			});
		});

	};

	function prepareReceiveModal(message){
		var fI = JSON.parse(message.body);
////		console.log(fI);
		for (var i =0;i<fI.userTo.length;i++){
////			console.log(fI.userTo[i].username);
			if(fI.userTo[i].username==$scope.userInfo.data.username){
				var title = "\""+fI.user.username+"\"" + " would like to share " + fI.realName;
				showReceiveModal(title,fI);
			}
		}
		
	}
	
	function prepareReceiveModalSecure(message){
		var fI = JSON.parse(message.body);
////		console.log(fI);
				var title = "\""+fI.user.username+"\"" + " would like to share " + fI.realName;
				showReceiveModal(title,fI);
		
	}

	function showReceiveModal(title,link){
		ModalService.showModal({
			templateUrl: "web/confirmModal.html",
			controller: "ConfirmModalController",
			inputs: {
				title: title
			}
		}).then(function(modal) {
//			modal.element.modal();
			modal.close.then(function(result) {
				if(result){
					downloadFileIn(link);
				}
			});
		});
	}

	function geoMine() {

		if (!navigator.geolocation){
			output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
			return;
		}

		function success(position) {
			var latitude  = position.coords.latitude;
			var longitude = position.coords.longitude;
			$scope.lat = latitude;
			$scope.lng = longitude;
			$http({
				url: '/user/update',
				method: "POST",
				data: { "username":$scope.userInfo.data.username,"lat":latitude,"lng":longitude},
				headers: {
					'Content-Type': 'application/json', 
					'Accept': 'application/json' 
				}
			})
			.then(function(response) {
				if(response.status==200){
////					console.log(response.data);
					$cookieStore.put('username',response);
					$scope.userInfo = response;
				}else{
				}
				ngstomp.send("/topic/userin", {"message":"login","username":$scope.userInfo},{});
				return response;
			});
			getAllUsers();

		};

		function error() {
			getAllUsers();
			alert("Unable to retrieve your location. You can continue with simplified site.");
			ngstomp.send("/topic/userin", {"message":"login","username":$scope.userInfo},{});
		};


		navigator.geolocation.getCurrentPosition(success, error);
	}

	function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
		var R = 6371; // Radius of the earth in km
		var dLat = deg2rad(lat2-lat1);  // deg2rad below
		var dLon = deg2rad(lon2-lon1); 
		var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2)
			; 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in km
		return d;
	}

	function deg2rad(deg) {
		return deg * (Math.PI/180)
	}
}

angular.module('controller').controller('fileCtrl', fileCtrl);