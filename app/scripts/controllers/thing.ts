'use strict';

angular.module('mobileMasterApp').controller('ThingCtrl', (
	$state,
	$scope,
	$stateParams,
	$rootScope,
    persistentLocalization : PersistentLocalization,
	masterMap: Master.Map,
	$window: ng.IWindowService,
	thingModel: ThingModelService
	) => {

	$scope.remove = () => {
		thingModel.RemoveThing(id);
		$state.go("^");
	};

	var id = $stateParams.ID;
	$scope.id = id;


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
				alert("I don't know what to do");
			} else {
				var pos = new L.LatLng(location.Latitude, location.Longitude),
					now = +new Date();

				if (oldPosition != null) {
					// The speed is in km/h because it's easier for me
					thingSpeed = thingSpeed * 0.75 + (pos.distanceTo(oldPosition) / (now - oldTime)) * 1000 * 0.25 * 3.6;
				}

				var zoom: number = 18.0;

				if (thingSpeed > 95.0) {
					zoom = 16;
				} else if (thingSpeed > 80.0 && oldZoom === 16.0) {
					zoom = 16;
				}
				else if (thingSpeed > 18.0) {
					zoom = 17;
				} else if (thingSpeed > 15.0 && oldZoom === 17.0) {
					zoom = 17;
				}

				console.log(thingSpeed, zoom);

				if (masterMap.getZoom() !== zoom || !masterMap.getBounds().pad(-0.2).contains(pos)) {
					masterMap.setView(pos, zoom);
				}

				oldPosition = pos;
				oldTime = now;
				oldZoom = zoom;
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

	persistentLocalization.restorePersistentLayer();
	persistentLocalization.unbindMasterMap(masterMap);

	masterMap.disableInteractions();
	masterMap.enableScale();
	masterMap.disableMiniMap();

	masterMap.setVerticalTopMargin(0);
    jMap.append(masterMap.getContainer());

	var setLayout = L.Util.throttle(() => {
		var height = Math.max(Math.floor(jwindow.height() - jMap.offset().top), 300);
		jMap.height(height);
	}, 50);

	$scope.$on('$destroy', () => {
		jwindow.off('resize', setLayout);
		thingModel.warehouse.UnregisterObserver(observer);
	});

	jwindow.resize(setLayout);

	window.setImmediate(() => {
		setLayout();
		masterMap.invalidateSize({});
	    masterMap.disableSituationOverview();
	});
}); 