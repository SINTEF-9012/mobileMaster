'use strict';

angular.module('mobileMasterApp').controller('EditCtrl', (
	$state,
	$scope,
	$stateParams,
	$rootScope,
	masterMap: Master.Map,
	thingModel: ThingModelService
	) => {

	var id = $stateParams.id;

	$scope.id = id;

	var once = false;
	$scope.$watch('things[id]', () => {
		//console.log("canard");
		if (!$scope.things) {
			return;
		}

		var thing = $scope.things[id];
		if (!thing) {
			return;
		}

		$scope.thing = thing;

		var location = new L.LatLng(thing.location.x, thing.location.y);
		var pixels = masterMap.project(location);
		pixels.y -= $(window).scrollTop() / 2;
		masterMap.panTo(masterMap.unproject(pixels));

		if (!once) {
			once = true;
//			window.setImmediate(()=> {
				var jwindow = $(window);
//				jwindow.trigger('layout-scroll-bottom-content');
				jwindow.trigger('layout-scroll-bottom');
//			});
		}
	});


	$scope.remove = () => {
		thingModel.RemoveThing(id);
		$state.go("^");
	};
}); 