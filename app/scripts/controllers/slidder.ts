/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
'use strict';

angular.module('mobileMasterApp')
	.controller('SlidderCtrl', (
		$scope: any,
		thingModel: ThingModelService,
		itsa: ThingIdentifierService,
		//$rootScope: MasterScope.Root,
		$upload: any,
		settingsService: SettingsService,
		$state: ng.ui.IStateService
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

		var registerNew = (thing: ThingModel.Thing) => {
			var type = itsa.typefrom(thing);

			if (!$scope.infos[type]) {
				$scope.infos[type] = {
					count: 1,
					fullName: type,
					href: $state.href(type === 'Victims' ? 'victims' : 'table', {
						thingtype: type,
						from: 'map'
					})
				};
			} else {
				++$scope.infos[type].count;
			}

			synchronizeScope($scope);
		};

		angular.forEach(thingModel.warehouse.Things, registerNew);

		var observer = {
			New: registerNew,
			Updated: (thing: ThingModel.Thing) => {
			},
			Deleted: (thing: ThingModel.Thing) => {
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
