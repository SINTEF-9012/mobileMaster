'use strict';

angular.module('mobileMasterApp')
	.controller('SlidderCtrl', (
		$scope: any,
		thingModel: ThingModelService,
		$rootScope:MasterScope.Root
		) => {

	var setImmediateId = 0;
	var digestLock = false,
		digestNeeded = false;
	var synchronizeScope = (scope) => {
		if (!setImmediateId) {
			setImmediateId = window.setImmediate(() => {
				setImmediateId = 0;
				if (digestLock) {
					digestNeeded = true;
				} else {
					scope.$digest();
				}
			});
		}
	};

	$scope.infos = {};

	var registerNew = (type: string)=> {
		if (!$scope.infos[type]) {
			var parsing = type.replace(/-/g, ' ').match(/^master\:([^:]+)\:([^:]+)$/);
			if (parsing) {
				$scope.infos[type] = { count: 1, category: parsing[1], type: parsing[2], fullName: type };
			} else {
				$scope.infos[type] = { count: 1, category: "unknown", type: "unknown", fullName: type };
			}
		} else {
			++$scope.infos[type].count;
		}
		synchronizeScope($scope);
	};

	angular.forEach($rootScope.things, (thing: MasterScope.Thing, ID: string) => {
		registerNew(thing.typeName);
	});


	thingModel.wharehouse.RegisterObserver({
		New: (thing: ThingModel.Thing) => {
			if (thing.Type) {
				registerNew(thing.Type.Name);
			}
		},
		Updated: (thing : ThingModel.Thing) => {
		},
		Deleted: (thing : ThingModel.Thing) => {
			if (!thing.Type) {
				return;
			}
			var type = thing.Type.Name;
			if ($scope.infos[type]) {
				if (--$scope.infos[type].count === 0) {
					delete $scope.infos[type];
				};
			}
			synchronizeScope($scope);
		},
		Define: (thingType: ThingModel.ThingType) => {
		}
	});
});
