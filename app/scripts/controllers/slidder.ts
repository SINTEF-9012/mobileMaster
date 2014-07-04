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
		$timeout: ng.ITimeoutService,
		$state: ng.ui.IStateService
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

		$('#view-slidder, #dashboard-btn').on('touchmove', () => false);

		var firstIteration = true;

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
						from: 'map'
					})
				};
			} else {
				++infos.count;
				infos.glowing = !firstIteration;

				if (infos.glowingTimeout) {
					$timeout.cancel(infos.glowingTimeout);
				}
			}

			infos.glowingTimeout = $timeout(() => {
				console.log("lapin")
				infos.glowing = false;
				infos.glowingTimeout = 0;
			}, 6000);

			synchronizeScope($scope);
		};

		angular.forEach(thingModel.warehouse.Things, registerNew);
		firstIteration = false;

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
