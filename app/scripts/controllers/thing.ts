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

		$scope.$watch('things', () => {
			angular.forEach($scope.things, (tata)=> {
				var thing: ThingModel.Thing = tata[id];
				if (!thing) return;

				var loc = thing.GetProperty<ThingModel.Property.Location>("location", ThingModel.Type.Location);
				if (!loc) return;
				var loc2 = loc.Value;
				var location = new L.LatLng(loc2.X, loc2.Y);

				var pixels = masterMap.project(location);
				pixels.y -= $(window).scrollTop() / 2;
				masterMap.panTo(masterMap.unproject(pixels));
			});
		});
});
