/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />

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
    persistentMap : PersistentMap,
	settingsService: SettingsService,
	itsa: ThingIdentifierService,
	masterMap: Master.Map,
	$window: ng.IWindowService,
	Knowledge : KnowledgeService,
	thingModel: ThingModelService,
	colorFromImage: ColorFromImageService,
	notify: angularNotify
	) => {

	masterMap.disableSituationOverview();
	persistentMap.restorePersistentLayer(masterMap);
	persistentMap.unbindMasterMap(masterMap);


	var multimediaServer = settingsService.getMediaServerUrl();

	var id = $stateParams.ID;
	var stateBack = $state.is('patient') ? 'patients' : 'table',
		stateInfos = { thingtype: 'all' },
		isMedia = false;

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
				notify({message: id +" deleted", classes: "alert-danger"});
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

	var returnLink = $scope.returnLink = $state.href(stateBack, stateInfos);
	$scope.hideToolbarButtons = false;

	$scope.thing = {};
	$scope.unfound = true;
	$scope.hideMap = false;

	var oldPosition: L.LatLng = null,
		oldZoom = 18,
		oldTime: number,
		oldBounds: L.LatLngBounds = null,
		thingSpeed = 0.0,
		registeredViewLostDate = 0;

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

				masterMap.setSelectedThing(id, location.Latitude, location.Longitude);

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

				/*var centerPoint = masterMap.project(pos, zoom),
					size = masterMap.getSize().divideBy(2),
					viewBounds = new L.Bounds(centerPoint.subtract(size), centerPoint.add(size)),
					viewLatLngBounds = new L.LatLngBounds(
						masterMap.unproject(viewBounds.min, zoom),
						masterMap.unproject(viewBounds.max, zoom));

				masterMap.setMaxBounds(viewLatLngBounds);*/

				var mapBounds = masterMap.getBounds();

				var changeView = false, initSetView = false;
				if (oldPosition === null && (!mapBounds.pad(-0.2).contains(pos) || Math.abs(masterMap.getZoom() - zoom) > 2)){
					changeView = true;
					initSetView = true;
				} else if (mapBounds.contains(pos)) {
					if (masterMap.getZoom() > zoom || !mapBounds.pad(-0.2).contains(pos)) {
						changeView = true;
					}
				} else {
					if (registeredViewLostDate) {
						if (!mapBounds.equals(oldBounds)) {
							registeredViewLostDate = now;
							oldBounds = mapBounds;
						}
						else if (now - registeredViewLostDate > 4200) {
							changeView = true;
							registeredViewLostDate = 0;
						}
					} else {
						registeredViewLostDate = +new Date();
						oldBounds = mapBounds;
					}
				}

				if (changeView) {
					//if (trueinitSetView/* || !$('html').hasClass('disable-markers-animations')*/) {

						var options = oldPosition === null ? { animate: false } : undefined;

					masterMap.setView(pos, zoom, options);

					var asynchronousRah = () => {
						if (oldPosition === pos && oldZoom === zoom && !masterMap.getCenter().equals(pos)) {
							masterMap.setView(pos, zoom, {animate: false});
						}
					};

					masterMap.on('moveend', asynchronousRah);

					window.setTimeout(() => {
						masterMap.off('moveend', asynchronousRah);
					}, 500);

					//}
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

			returnLink = $scope.returnLink = $state.href(stateBack, stateInfos);

			$scope.canOrder = Knowledge.canOrder(thing);
			$scope.canEdit = Knowledge.canEdit(thing);
			$scope.canDelete = Knowledge.canDelete(thing);

			var url = $scope.thing.url;
			isMedia = url != null && itsa.media(thing);

			if (isMedia) {

				$scope.isVideo = /video/i.test(thing.Type.Name);
				$scope.isPicture = !$scope.isVideo;

				var smallThumbnailUrl = multimediaServer + '/thumbnail/' + url;

				if ($scope.isVideo) {
					$scope.mp4Url = multimediaServer + '/convert/mp4/480/' + url;
					$scope.webmUrl = multimediaServer + '/convert/webm/480/' + url;
					$scope.posterUrl = smallThumbnailUrl;
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

				window.setImmediate(() => {
					colorFromImage.applyColor(smallThumbnailUrl, setTilesColors);
				});
			}

			$scope.knowledge = thing.Type ? Knowledge.getPropertiesOrder(thing) : [];

			/*var missingProperties: { [key: string]: boolean } = {
				ID: true,
				type: true,
				location: true,
				_type: true
			};


			_.each($scope.knowledge, (property: any) => missingProperties[<string>(property.key)] = true);

			_.each($scope.thing, (value, key) => {
				if (!missingProperties[key]) {
					if (key !== 'name' || $scope.thing.description !== $scope.thing.name ||
					(key !== 'undefined' && !$scope.thing.undefined)) {
						$scope.knowledge.push({
							key: key,
							required: false,
							score: 0,
							name: key.charAt(0).toUpperCase() + key.slice(1)
						});
					}
				}
			});*/

			// The name information is already in the page title
			$scope.rawKnowledge = $scope.knowledge;
			$scope.knowledge = _.filter($scope.knowledge, (k: any) => k.score >= 0 /*&& k.key !== 'name'*/);

			if (!$scope.$$phase) {
				$scope.$digest();
				setLayout();
			} else {
				window.setImmediate(() => setLayout());
			}
		}
	}, 10);

	var destroyed = false;

	var tileColor = null;//, oldTileColor = null;

	var setLayout = throttle(() => {
		if (destroyed) {
			return;
		}

		var width = jwindow.width();

		//if (tileColor !== oldTileColor) {
		//	oldTileColor = tileColor;
		setTilesColors(tileColor);
		////}

		var height = Math.max(Math.floor(jwindow.height() - jMap.offset().top), 300);
		jMap.height(height - 1 /* border */);
		if (width >= 768 && !$scope.hideMap) {
			jView.height(height - 11 /* margin bottom */);
		} else {
			jView.height('auto');
		}

		if ($scope.hideMap) {
			masterMap.hide();
		} else {
			masterMap.moveTo(jMap);
		}

		//if (oldPosition) {
		//	masterMap.setView(oldPosition, oldZoom, {animate: false});
		//}
	}, 50);

	setLayout();
	// ??? masterMap.moveTo(jMap);

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
	masterMap.filterThing(id);





	var disableStateChangeSuccessCallback =
	$rootScope.$on('$stateChangeSuccess', () => {
		$scope.returnLink = returnLink;
		$scope.hideToolbarButtons = false;
		masterMap.filterThing(id);

		if ($scope.thing.location) {
			masterMap.setSelectedThing(id, $scope.thing.location.Latitude, $scope.thing.location.Longitude);
		}

		if (!$scope.$$phase) {
			$scope.$digest();
		}

		window.setImmediate(() => setTilesColors(tileColor));
	});

	$scope.$on('$destroy', () => {
		destroyed = true;
		jwindow.off('resize', setLayout);
		thingModel.warehouse.UnregisterObserver(observer);
		disableStateChangeSuccessCallback();

		if (deleteTimer !== 0) {
			window.clearInterval(deleteTimer);
			thingModel.RemoveThing(id);
		}
	});

	jwindow.resize(setLayout);

	masterMap.setVerticalTopMargin(0);
	setLayout();

	function setTilesColors(color) {
		if (!color) return;
		tileColor = color;
		$('.patientInfobox, .thingInfobox').css({
			'backgroundColor': color,
			'color': colorFromImage.whiteOrBlack(color)
		});
	}

	// ReSharper disable once ExpressionIsAlwaysConst
	if (!isMedia) {
		var imgIdenticon = $('img.identicon');

		if (colorFromImage.hasCache(imgIdenticon.get(0))) {
			colorFromImage.applyColor(imgIdenticon.get(0), setTilesColors, true);
		} else {
			(<any>imgIdenticon).imagesLoaded(() => {
				// Double verification because it's asynchronous
				if (!isMedia) {
					colorFromImage.applyColor(imgIdenticon.get(0), setTilesColors, true);
				}
			});
		}
	}

}); 
