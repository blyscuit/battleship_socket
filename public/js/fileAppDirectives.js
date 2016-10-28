function dropzone($rootScope,ngstomp,$cookieStore) {

	if(!$rootScope.fileHistory)
		$rootScope.fileHistory=[];
	return function(scope, element, attrs) {

		var config = {
				url: '/uploadDZ',
				maxFilesize: 10,//MB
				paramName: "uploadfile",
				maxThumbnailFilesize: 10,
				parallelUploads: 1,
				autoProcessQueue: true,
				uploadMultiple: true,
//				maxFiles : 3,
				addRemoveLinks:true
		};

		var eventHandlers = {
				'addedfile': function(file) {
//					scope.file = file;
//					if (this.files[1]!=null) {
//						this.removeFile(this.files[0]);
//					}
//					scope.$apply(function() {
//						scope.fileAdded = true;
//					});
				},

				'success': function (file, response) {
////					console.log(file);
//					console.log(response);
					for (var i = 0;i<response.length;i++){
//						Output(
//						"<p><strong>" + jsData.name +
//						"</strong> link: <strong>" + jsData.link +
//						"</strong></p>"
//						);
						var fI = response[i];
////						console.log(fI);
////						console.log(scope.userTo);
						scope.userInfo = $cookieStore.get('username');
						if(scope.userTo){
							$rootScope.fileHistory.push(fI);
							sendURL(fI,scope.userInfo.data,scope.userTo);
						}else{
							sendURL(fI,scope.userInfo.data);
						}

//						var objectToSend = { message : 'Hello Web-Socket'},
//						stompHeaders = {headers1 : 'xx', headers2 : 'yy'};
//						ngstomp
//						.send('/topic/item', objectToSend, stompHeaders);
					}
				}
		};

		function sendURL(fI,user){
			fI.user=user;
////			console.log(fI);
			ngstomp.send("/topic/file", fI,{});//JSON.stringify({"name":fI.name,"message":fI.message,"link":fI.link}));
		}

		function sendURL(fI,user,userTo){
			fI.user=user;
//			fI.userTo = userTo;
			for(var i=0;i<userTo.length;i++){
				ngstomp.send("/app/file/"+userTo[i].username, fI,{});
////				console.log(userTo[i].username);
			}
			scope.users = userTo;
		}

		dropzone = new Dropzone(element[0], config);

		angular.forEach(eventHandlers, function(handler, event) {
			dropzone.on(event, handler);
		});

		scope.processDropzone = function() {
			dropzone.processQueue();
		};

		scope.resetDropzone = function() {
			dropzone.removeAllFiles();
		}
	}
}
angular.module('controller').directive('dropzone', dropzone);