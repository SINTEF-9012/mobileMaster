'use strict';

angular.module('mobileMasterApp').controller('ThingCtrl', (
	$state,
	$scope,
	$stateParams,
	$rootScope,
	masterMap: Master.Map,
	thingModel: ThingModelService
	) => {

	var id = $stateParams.id;

	$scope.id = id;

	$scope.$watch('things[id]', () => {
		if (!$scope.things) {
			return;
		}

		var thing = $scope.things[id];
		if (!thing) {
			return;
		}

		$scope.thing = thing;

		return;//TODO what should we do here ?
		var location = new L.LatLng(thing.location.x, thing.location.y);
		var pixels = masterMap.project(location);
		pixels.y -= $(window).scrollTop() / 2;
		masterMap.panTo(masterMap.unproject(pixels));
	});

	$scope.remove = () => {
		thingModel.RemoveThing(id);
		$state.go("^");
	};
}); 