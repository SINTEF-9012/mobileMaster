'use strict';

angular.module('mobileMasterApp')
  .controller('OrdertoolbarCtrl', ($scope, $window) => {
	$scope.cancelOrder = ()=> {
		$window.history.back();
	};

	$scope.confirmOrder = () => {
		alert("Ok je vais envoyer tout ça lol");
	};
  });
