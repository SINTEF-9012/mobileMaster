/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
'use strict';

angular.module('mobileMasterApp').controller('ThingCtrl', (
	$state: ng.ui.IStateService,
	$scope: any,
	$stateParams: any,
	$rootScope: MasterScope.Root,
    persistentLocalization : PersistentLocalization,
	itsa: ThingIdentifierService,
	masterMap: Master.Map,
	$window: ng.IWindowService,
	thingModel: ThingModelService
	) => {

	persistentLocalization.restorePersistentLayer(masterMap);
	persistentLocalization.unbindMasterMap(masterMap);

	$scope.remove = () => {
		thingModel.RemoveThing(id);
		$state.go("^");
	};

	var id = $stateParams.ID;
	var stateBack = $state.is('victim') ? 'victims' : 'table';

	$scope.id = id;

	if ($stateParams.from === 'map') {
		stateBack = 'map.slidder';
	}

	$scope.returnLink = $state.href(stateBack, { thingtype: 'all' });

	$scope.thing = {};
	$scope.unfound = true;

	var oldPosition: L.LatLng = null,
		oldZoom = 18,
		oldTime: number,
		thingSpeed = 0.0;

	var digestScope = L.Util.throttle(() => {
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

				if (oldPosition != null) {
					// The speed is in km/h because it's easier for me
					thingSpeed = thingSpeed * 0.75 + (pos.distanceTo(oldPosition) / (now - oldTime)) * 1000 * 0.25 * 3.6;
				}

				var zoom: number = L.Browser.retina ? 17.0 : 18.0;

				if (thingSpeed > 95.0) {
					zoom = 16;
				} else if (thingSpeed > 80.0 && oldZoom === 16.0) {
					zoom = 16;
				}
				else if (thingSpeed > 18.0) {
					zoom = 17;
				} else if (thingSpeed > 15.0 && oldZoom === 17.0) {
					zoom = 17;
				} else if (thingSpeed < 1.0) {
					zoom = Math.max(masterMap.getZoom(), zoom);
				}

				//console.log(thingSpeed, zoom);

				if (masterMap.getZoom() !== zoom || !masterMap.getBounds().pad(-0.2).contains(pos)) {
					masterMap.setView(pos, zoom);
				}

				oldPosition = pos;
				oldTime = now;
				oldZoom = zoom;
			}

			var type = itsa.typefrom(thing);
			if ($stateParams.from && $stateParams.from.indexOf('list-') === 0) {
				$scope.returnLink = $state.href(stateBack, { from: $stateParams.from.slice(5), thingtype: type });
			} else {
				$scope.returnLink = $state.href(stateBack, { thingtype: type });
			}

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
			$scope.unfound = true;
			digestScope();
		},
		Define: (thingType: ThingModel.ThingType) => {}
	}
	thingModel.warehouse.RegisterObserver(observer);

	var jwindow = $($window), jMap = $('#thing-map');


	masterMap.closePopup();
	masterMap.enableInteractions();
	masterMap.enableScale();
	masterMap.disableMiniMap();


	var setLayout = L.Util.throttle(() => {
		var height = Math.max(Math.floor(jwindow.height() - jMap.offset().top), 300);
		jMap.height(height - 1 /* border */);
	}, 50);

	$scope.$on('$destroy', () => {
		jwindow.off('resize', setLayout);
		thingModel.warehouse.UnregisterObserver(observer);
	});

	jwindow.resize(setLayout);

	masterMap.setVerticalTopMargin(0);
	setLayout();
	masterMap.moveTo(jMap.get(0));
	masterMap.disableSituationOverview();
}); 