var app = angular.module('controller');

app.controller('ConfirmModalController', ['$scope', '$element', 'title', 'close', function($scope, $element, title, close) {

	$scope.title = title;

	//  This close function doesn't need to use jQuery or bootstrap, because
	//  the button has the 'data-dismiss' attribute.
	$scope.close = function(result) {
	 	  close(result); // close, but give 500ms for bootstrap to animate
	  };

}]);