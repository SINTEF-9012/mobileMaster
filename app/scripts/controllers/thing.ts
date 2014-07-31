/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="./../references/NodeMaster.d.ts" />
/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../references/app.d.ts" />
/// <reference path="./../masterScope.d.ts" />
'use strict';

angular.module('mobileMasterApp').controller('ThingCtrl', (
	$state: ng.ui.IStateService,
	$scope: any,
	$stateParams: any,
	cfpLoadingBar: any,
	Fullscreen: any,
	$rootScope: MasterScope.Root,
    persistentLocalization : PersistentLocalization,
	settingsService: SettingsService,
	itsa: ThingIdentifierService,
	masterMap: Master.Map,
	$window: ng.IWindowService,
	Knowledge : KnowledgeService,
	thingModel: ThingModelService
	) => {

	persistentLocalization.restorePersistentLayer(masterMap);
	persistentLocalization.unbindMasterMap(masterMap);

	var multimediaServer = settingsService.getMediaServerUrl();

	var id = $stateParams.ID;
	var stateBack = $state.is('victim') ? 'victims' : 'table',
		stateInfos = {thingtype: 'all'};

	$scope.from = $stateParams.from;
	$scope.id = id;

	if ($stateParams.from === 'map') {
		stateBack = 'map.slidder';
	}
	else if ($stateParams.from === 'multimedias') {
		stateBack = 'multimedias';
	}

	var jwindow = $($window), jMap = $('#thing-map'), jView = $('#thing-view');

	var deleteTimer = 0;
	$scope.startDeleteTimer = () => {
		$scope.deleteTimerRunning = true;
		$scope.delay = 5;
		$scope.hideToolbarButtons = true;

		deleteTimer = window.setInterval(() => {
			if (--$scope.delay === 0) {
				thingModel.RemoveThing(id);
				$state.go(stateBack, stateInfos);
				deleteTimer = 0;
			} else {
				$scope.$digest();
			};
		}, 1000);
	};

	$scope.cancelDeleteTimer = () => {
		window.clearInterval(deleteTimer);
		deleteTimer = 0;
		$scope.deleteTimerRunning = false;
		$scope.hideToolbarButtons = false;
	};

	$scope.returnLink = $state.href(stateBack, stateInfos);
	$scope.hideToolbarButtons = false;

	$scope.thing = {};
	$scope.unfound = true;

	var oldPosition: L.LatLng = null,
		oldZoom = 18,
		oldTime: number,
		thingSpeed = 0.0;

	var digestScope = throttle(() => {
		var thing = thingModel.warehouse.GetThing(id);

		if (thing) {

			$scope.unfound = false;

			thingModel.ApplyThingToScope($scope.thing, thing);

			var location = thing.LocationLatLng();

			if (!location || isNaN(location.Latitude) || isNaN(location.Longitude)) {
				$scope.hideMap = true;
			} else {
				$scope.hideMap = false;
				var pos = new L.LatLng(location.Latitude, location.Longitude),
					now = +new Date();

				if (oldPosition !== null) {
					// The speed is in km/h because it's easier for me
					thingSpeed = thingSpeed * 0.75 + (pos.distanceTo(oldPosition) / (now - oldTime)) * 1000 * 0.25 * 3.6;
				}

				var zoom: number = L.Browser.retina ? 17.0 : 18.0;

				if (thingSpeed > 95.0) {
					zoom = 16;
				} else if (thingSpeed > 80.0 && oldZoom === 16.0) {
					zoom = 16;
				} else if (thingSpeed > 18.0) {
					zoom = 17;
				} else if (thingSpeed > 15.0 && oldZoom === 17.0) {
					zoom = 17;
				} else if (thingSpeed < 1.0) {
					zoom = Math.max(masterMap.getZoom(), zoom);
				}

				//console.log(thingSpeed, zoom);

				if ((oldPosition === null && !/^(thing|victim)/.test($rootScope.previousState)) ||
					masterMap.getZoom() !== zoom || !masterMap.getBounds().pad(-0.2).contains(pos)) {
					masterMap.setView(pos, zoom);
					// TODO it's a bit ugly but it's july
					window.setTimeout(() => masterMap.setView(pos, zoom), 4);
				}

				oldPosition = pos;
				oldTime = now;
				oldZoom = zoom;
			}

			var type = itsa.typefrom(thing);
			if ($stateParams.from && $stateParams.from.indexOf('list-') === 0) {
				stateInfos = { from: $stateParams.from.slice(5), thingtype: type };
			} else {
				stateInfos = { thingtype: type };
			}

			$scope.returnLink = $state.href(stateBack, stateInfos);

			$scope.canOrder = Knowledge.canOrder(thing);
			$scope.canEdit = Knowledge.canEdit(thing);
			$scope.canDelete = Knowledge.canDelete(thing);

			var url = $scope.thing.url;
			var isMedia = url != null && itsa.media(thing);

			if (isMedia) {

				$scope.isVideo = /video/i.test(thing.Type.Name);
				$scope.isPicture = !$scope.isVideo;

				// TODO not so beautiful
				delete $scope.thing.url;

				if ($scope.isVideo) {
					$scope.fullUrl = multimediaServer + '/' + url;
					$scope.posterUrl = multimediaServer + '/thumbnail/' + url;
				}

				if ($scope.isPicture) {
					var width = jwindow.width();

					var size = '/';
					if (width <= 640) {
						size = '/resize/640/480/';
					} else if (width <= 1280) {
						size = '/resize/1280/720/';
					} else if (width <= 1920) {
						size = '/resize/1920/1080/';
					}

					$scope.fullUrl = multimediaServer + size + url;
					$scope.thumbnailUrl = multimediaServer + '/resize/640/480/' + url;

					$scope.showPicture = () => {
						$scope.fullscreenPicture = true;

						window.setImmediate(() => {
							cfpLoadingBar.start();

							(<any>$('#picture-view')).imagesLoaded(() => {
								cfpLoadingBar.complete();
							});

						});
					}

					Fullscreen.$on('FBFullscreen.change', (e, isEnabled) => {
						if (!isEnabled) {
							$scope.fullscreenPicture = false;
						}
					});

				}
			}

			//$scope.knowledge = thing.Type ? Knowledge.getPropertiesOrder(thing.Type) : [];

			// The location is already displayed on the map
			delete $scope.thing.location; // TODO TMP MUST USE knowledge

			if (!$scope.$$phase) {
				$scope.$digest();
				setLayout();
			}
		}
	}, 10);


	digestScope();

	var observer = {
		New: (thing: ThingModel.Thing) => {
			if (thing.ID === id) {
				digestScope();
			} 
		}, 
		Updated: (thing: ThingModel.Thing) => {
			if (thing.ID === id) {
				digestScope();
			} 
		},
		Deleted: (thing: ThingModel.Thing) => {
			if (thing.ID === id) {
				$scope.unfound = true;
				digestScope();
			} 
		},
		Define: () => {}
	};
	thingModel.warehouse.RegisterObserver(observer);


	masterMap.closePopup();
	masterMap.enableInteractions();
	masterMap.enableScale();
	masterMap.disableMiniMap();
	masterMap.unfilterThing(id);


	var setLayout = throttle(() => {
		var width = jwindow.width();


		var height = Math.max(Math.floor(jwindow.height() - jMap.offset().top), 300);
		jMap.height(height - 1 /* border */);
		if (width >= 768) {
			jView.height(height - 11 /* margin bottom */);
		}
		masterMap.invalidateSize({});
	}, 50);

	$scope.$on('$destroy', () => {
		jwindow.off('resize', setLayout);
		thingModel.warehouse.UnregisterObserver(observer);

		if (deleteTimer !== 0) {
			window.clearInterval(deleteTimer);
			thingModel.RemoveThing(id);
		}
	});

	jwindow.resize(setLayout);

	masterMap.setVerticalTopMargin(0);
	setLayout();
	masterMap.moveTo(jMap.get(0));
	masterMap.disableSituationOverview();
}); 
