	'use strict';

angular.module('mobileMasterApp')
	.controller('OrdertoolbarCtrl', (
		$scope: any,
		$window: ng.IWindowService,
		masterMap: Master.Map,
		orderService: OrderService) => {

	$scope.cancelOrder = ()=> {
		$window.history.back();
	};

	$scope.confirmOrder = () => {

		orderService.setLocation(masterMap.getCenter());
		orderService.setDetails("vive les canards");
		orderService.emit();
		$window.history.back();
	};
});
