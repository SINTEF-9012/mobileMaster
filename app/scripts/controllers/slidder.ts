/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="./../../bower_components/ThingModel/TypeScript/build/ThingModel.d.ts" />
/// <reference path="./../references/app.d.ts" />
'use strict';

angular.module('mobileMasterApp')
	.controller('SlidderCtrl', (
		$scope: any,
		thingModel: ThingModelService,
		itsa: ThingIdentifierService,
		//$rootScope: MasterScope.Root,
		$upload: any,
		cfpLoadingBar: any,
		settingsService: SettingsService,
		filterService: FilterService,
		$timeout: ng.ITimeoutService,
		$state: ng.ui.IStateService,
		$rootScope: MasterScope.Root
	) => {

		var digestScope = throttle(() => {
			if (!$scope.$$phase) {
				$scope.$digest();
			}
		}, 23);

		$scope.infos = {};

		var from = $state.current.name.indexOf('map') === 0 ? 'map' : null;

		$('#view-slidder, #dashboard-btn').on('touchmove', () => false);

		var firstIteration = true,
			startGlowing = (infos) => {
				infos.glowingTimeout = $timeout(() => {
					infos.glowing = false;
					infos.glowingTimeout = 0;
				}, 6000);
			},
			stopGlowing = (infos) => {
				if (infos.glowingTimeout) {
					$timeout.cancel(infos.glowingTimeout);
				}
			};

		var registerNew = (thing: ThingModel.Thing) => {
			var type = itsa.typefrom(thing),
				infos = $scope.infos[type];

			if (!infos) {
				$scope.infos[type] = infos = {
					count: 1,
					fullName: type,
					glowing: !firstIteration,
					href: $state.href(type === 'Victims' ? 'victims' : 'table', {
						thingtype: type,
						from: from
					}),
					filtered: filterService.isFilterEnabled(type)
				};
			} else {
				++infos.count;
				infos.glowing = !firstIteration;

				stopGlowing(infos);
			}


			startGlowing(infos);

			digestScope();
		};

		angular.forEach(thingModel.warehouse.Things, registerNew);
		firstIteration = false;

		var observer = {
			New: registerNew,
			Updated: (thing: ThingModel.Thing) => {
			},
			Deleted: (thing: ThingModel.Thing) => {
				var type = itsa.typefrom(thing),
					infos = $scope.infos[type];

				if (infos) {
					if (--infos.count === 0) {
						delete $scope.infos[type];
					} else {
						infos.glowing = true;

						stopGlowing(infos);
						startGlowing(infos);
					};
				}
				digestScope();
			},
			Define: (thingType: ThingModel.ThingType) => {
			}
		};

		thingModel.warehouse.RegisterObserver(observer);

		$scope.hasSomeFiltering = filterService.hasSomeFiltering();


		$rootScope.$on('filterServiceUpdate', () => {
			$scope.hasSomeFiltering = filterService.hasSomeFiltering();

			angular.forEach($scope.infos, (value, key) => {
				value.filtered = filterService.isFilterEnabled(key);
			});

			$scope.$digest();
		});

		$scope.$on('$destroy', () => {
			thingModel.warehouse.UnregisterObserver(observer);
		});

		$scope.onCapture = ($files) => {
			var c = $('#camera-file-upload');
			c.replaceWith(c.clone(true));

			cfpLoadingBar.start();
			$upload.upload({
				url: settingsService.getMediaServerUrl() + '/upload',
				file: $files
			}).progress((e) => {
				cfpLoadingBar.set(e.loaded / e.total);
			}).success((data) => {
				//console.log(data);
				$state.go('camera', data);
			}).error(() => {
				alert("Sorry, file upload error");
			}).then(() => {
				cfpLoadingBar.complete();
			});
		};
	});
