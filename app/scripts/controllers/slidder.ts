'use strict';

angular.module('mobileMasterApp')
	.controller('SlidderCtrl', (
		$scope: any,
		thingModel: ThingModelService,
		//$rootScope: MasterScope.Root,
        $upload: any,
		settingsService: SettingsService,
		$state
		) => {

	var setImmediateId = 0;
	var digestLock = false,
		digestNeeded = false;

	var jwindow = $(window);

	var synchronizeScope = (scope) => {
		if (!setImmediateId) {
			setImmediateId = window.setImmediate(() => {
				setImmediateId = 0;
				if (digestLock) {
					digestNeeded = true;
				} else {
					scope.$digest();
					jwindow.trigger('resize');
				}
			});
		}
	};

    $scope.infos = {};

    $('#view-slidder, #dashboard-btn').on('touchmove', () => false);

		var registerNew = (type: string) => {
		if (/(patient|victim)/i.test(type)) {
			type = 'PatientType';
		} else if (/(incident)/i.test(type)) {
			type = 'IncidentType';
		} else if (/(resource)/i.test(type)) {
			type = 'ResourceType';
		}

		// if (thing.Type && thing.Type.Name !== 'master:wiki') { // TODO
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

	angular.forEach(thingModel.warehouse.Things, (thing: ThingModel.Thing) => {
		registerNew(thing.Type ? thing.Type.Name : 'default');
	});

	var observer =  {
		New: (thing: ThingModel.Thing) => {
			registerNew(thing.Type ? thing.Type.Name : 'default');
		},
		Updated: (thing: ThingModel.Thing) => {
		},
		Deleted: (thing : ThingModel.Thing) => {
			if (!thing.Type) {
				return;
			}
			var type = thing.Type ? thing.Type.Name : 'default';
			if ($scope.infos[type]) {
				if (--$scope.infos[type].count === 0) {
					delete $scope.infos[type];
				};
			}
			synchronizeScope($scope);
		},
		Define: (thingType: ThingModel.ThingType) => {
		}
	};

	thingModel.warehouse.RegisterObserver(observer);

	$scope.$on('$destroy', () => {
		thingModel.warehouse.UnregisterObserver(observer);
	});

	$scope.onCapture = ($files) => {
		var c = $('#camera-file-upload');
		c.replaceWith(c.clone(true));

		var up = $upload.upload({
			url: settingsService.getMediaServerUrl() + '/upload',
			file: $files
		}).progress((e) => {
			console.log(100.0 * (e.loaded / e.total));
		}).success((data) => {
			console.log(data);
			$state.go('main.camera', data);
		});
	};
});
