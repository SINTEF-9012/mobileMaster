'use strict';

angular.module('mobileMasterApp')
	.controller('ThingCtrl', (
		$scope,
		$stateParams,
		$rootScope,
		masterMap : Master.Map
		) => {

		var id = $stateParams.id;

			$scope.id = id;

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
		});
});
