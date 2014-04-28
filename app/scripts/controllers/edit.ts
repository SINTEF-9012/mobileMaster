'use strict';

angular.module('mobileMasterApp').controller('EditCtrl', (
	$state,
	$scope,
	$stateParams,
	$rootScope,
	masterMap: Master.Map,
	thingModel: ThingModelService
	) => {



//	var layer = masterMap.getLayerClass("sight");
//	var ll = new layer("Order");

//	ll.addTo(masterMap);

	var id = $stateParams.id;

		$scope.id = id;

	if (!$scope.properties) {
		$scope.properties = {};
	}

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

		angular.forEach($rootScope.types[thing.typeName].tableProperties, (value) => {
			var key = value.key;
			var prop = $scope.properties[key];
			if (!prop) {
				prop = $scope.properties[key] = {};
			}

			prop.key = key;
			prop.name = value.property.name;
			prop.type = value.property.type;
			prop.realtimeValue = thing[key];
		});

		$scope.thing = thing;

		if (thing.location) {
			var location = new L.LatLng(thing.location.x, thing.location.y);
			var pixels = masterMap.project(location);
			pixels.y -= $(window).scrollTop() / 2;
			masterMap.panTo(masterMap.unproject(pixels));
		}

		if (!once) {
			once = true;
//			window.setImmediate(()=> {
				var jwindow = $(window);
//				jwindow.trigger('layout-scroll-bottom-content');
				jwindow.trigger('layout-scroll-bottom');
//			});
		}
	});

	$scope.save = () => {
		var transaction : { [property: string]: { value: string; type: string } } = {};
		angular.forEach($scope.properties, (property, key) => {
			if (typeof property.newValue !== "undefined") {
				transaction[key] = {
					value: property.newValue,
					type: property.type
				};
			}
		});
		thingModel.EditThing(id, transaction);
	};

	$rootScope.$on('main.thing.edit.save', $scope.save);

	$scope.remove = () => {
		thingModel.RemoveThing(id);
		$state.go("^");
	};
}); 