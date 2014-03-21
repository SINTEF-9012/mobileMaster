	'use strict';

angular.module('mobileMasterApp')
	.controller('OrdertoolbarCtrl', (
		$scope: any,
		$window: ng.IWindowService,
		orderService: OrderService) => {

	$scope.cancelOrder = ()=> {
		orderService.reset();
		$window.history.back();
	};

	$scope.confirmOrder = () => {

		//orderService.setLocation(masterMap.getCenter());
		//orderService.setDetails("vive les canards");
		orderService.emit();
		$window.history.back();
	};

	var jwindow = $(window);
	$scope.showDetails = ()=> {
		jwindow.trigger('layout-scroll-bottom-content');
		window.setTimeout(()=> {
			$('#layout-bottom input').focus();
		}, 500);
	};
});
