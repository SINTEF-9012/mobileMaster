	'use strict';

angular.module('mobileMasterApp')
	.controller('OrdertoolbarCtrl', (
		$scope: any,
		$window: ng.IWindowService,
		$state,
		orderService: OrderService) => {

	$scope.cancelOrder = ()=> {
		orderService.reset();
		$window.history.back();
	};

	$scope.confirmOrder = () => {

		var id = orderService.getId();
		orderService.emit();
		$state.go('main.thing', { id: id });
	};

	var jwindow = $(window);
	$scope.showDetails = ()=> {
		jwindow.trigger('layout-scroll-bottom-content');
		window.setTimeout(()=> {
			$('#layout-bottom input').focus();
		}, 500);
	};
});
