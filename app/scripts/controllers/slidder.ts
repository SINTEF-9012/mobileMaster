/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />

/// <reference path="./../references/app.d.ts" />
/// <reference path="./../references/generic.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.controller('SlidderCtrl', (
		$scope: any,
		thingModel: ThingModelService,
		itsa: ThingIdentifierService,
		//$rootScope: MasterScope.Root,
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

			// Ignore the summary
			if (thing.ID === "master-summary") {
				return;
			}

			var type = itsa.typefrom(thing),
				infos = $scope.infos[type];

			if (!infos) {
				var href: string = null;

				switch (type) {
					case 'Patients':
						href = 'patients';
						break;
					case 'Messages':
						href = 'messenger';
						break;
					case 'Multimedias':
						href = 'multimedias';
						break;
					// Ignore image overlays and evacuationPlans
					case 'ImageOverlays':
					case 'EvacuationPlans':
					case 'GeometricZones':
						return;
					default:
						href = 'table';
				}

				$scope.infos[type] = infos = {
					count: 1,
					fullName: type,
					glowing: !firstIteration,
					href: $state.href(href, {
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

	});
