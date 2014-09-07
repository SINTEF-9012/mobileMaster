/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />

/// <reference path="./../references/app.d.ts" />
/// <reference path="./../masterScope.d.ts" />

'use strict';

angular.module('mobileMasterApp').controller('EditCtrl', (
	$state,
	$scope,
	$stateParams,
	$rootScope,
	masterMap: Master.Map,
	thingModel: ThingModelService
	) => {

	masterMap.show();


	$scope.$parent.returnLink = $state.href('^');
	/*$scope.$parent.showSaveButton = true;*/
	$scope.$parent.hideToolbarButtons = true;

	var id = $scope.$parent.id;

	if (!$scope.newValues) {
		$scope.newValues = {};
	}

	$scope.$parent.$watch('rawKnowledge', () => {
		if (!$scope.$parent) {
			return;
		}


		$scope.properties = $scope.$parent.rawKnowledge;

		var hasLocation = false;
		$scope.properties = _.filter($scope.properties, (k: any) => {
			if (k.key === 'location') {
				hasLocation = true;
				return false;
			}
			if (k.key === '_type') {
				return false;
			}
			return true;
		});
	});

	$scope.$parent.$watch('thing.location', () => {
		if (!$scope.$parent || !$scope.$parent.thing.location) {
			return;
		}

		masterMap.draggableSelectedThing(id, $scope.$parent.thing.location.Latitude, $scope.$parent.thing.location.Longitude);
	});

	$scope.save = () => {
		var thing = thingModel.warehouse.GetThing(id);


		var transaction : { [property: string]: { value: any; type: string } } = {};
		angular.forEach($scope.newValues, (value, key) => {
			if (typeof value !== "undefined") {
				var prop = thing.GetProperty(key),
					type = 'String';
				if (prop) {
					type = ThingModel.Type[prop.Type];
				} else if (thing.Type) {
					var propDef = thing.Type.GetPropertyDefinition(key);
					if (propDef) {
						type = ThingModel.Type[propDef.Type];
					}
				}

				transaction[key] = {
					value: value,
					type: type
				};
			}
		});


		var draggedPosition = masterMap.getDraggedMarkerPosition();

		if (draggedPosition) {
			transaction['location'] = {
				value: new ThingModel.Location.LatLng(
					Math.round(draggedPosition.lat * 10000000) / 10000000,
					Math.round(draggedPosition.lng * 10000000) / 10000000),
				type: 'localization'
			};
		}

		thingModel.EditThing(id, transaction);

		$state.go('^');
	};

	$scope.cancelProperty = (key) => {
		delete $scope.newValues[key];
	};


	$scope.remove = () => {
		thingModel.RemoveThing(id);
		$state.go("^");
	};

	masterMap.filterThing(id);
}); 
