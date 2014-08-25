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
		$scope.properties = $scope.$parent.rawKnowledge;


		var hasLocation = false;
		$scope.properties = _.filter($scope.properties, (k: any) => {
			if (k.key === 'location') {
				hasLocation = true;
				return false;
			}
			return true;
		});
	});

	$scope.save = () => {
		var thing = thingModel.warehouse.GetThing(id);


		var transaction : { [property: string]: { value: string; type: string } } = {};
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
}); 
