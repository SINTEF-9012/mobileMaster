/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="./../../bower_components/PruneCluster/PruneCluster.ts" />
/// <reference path="./../../bower_components/PruneCluster/LeafletAdapter.ts" />
/// <reference path="./../references/Touch.d.ts" />
/// <reference path="./../references/NodeMaster.d.ts" />
/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../references/app.d.ts" />
/// <reference path="./../masterScope.d.ts" />
'use strict';

// Module configuration
angular.module('mobileMasterApp')
.controller('MapCtrl', function (
    $scope,
    masterMap : Master.Map,
    thingModel : ThingModelService,
	$state: ng.ui.IStateService,
	$window: ng.IWindowService,
	hotkeys: ng.hotkeys.HotkeysProvider,
	persistentLocalization: PersistentLocalization) {

	masterMap.closePopup();

	masterMap.enableInteractions();
    masterMap.enableScale();
	masterMap.disableSituationOverview();

	persistentLocalization.restorePersistentLayer(masterMap);
	masterMap.moveTo(document.getElementById('map'));

	window.setImmediate(() => {
		persistentLocalization.bindMasterMap(masterMap);
		masterMap.enableMiniMap();
	});

	// The <any> is ugly. A pull-request on definitelyTyped is on the way
	(<any>hotkeys.bindTo($scope)
		.add({
			combo: 'f',
			description: 'Change filters',
			callback: () => $state.go('filters')
		})
		).add({
			combo: 'b',
			description: 'Map background filters',
			callback: () => $state.go('background')
		})
		.add({
			combo: '0',
			description: 'Center the map on the situation',
			callback: () => masterMap.showOverview()
		});
    /*var markersThings : {[ID: string] : PruneCluster.Marker} = {};

    // Manage markers
    function updatePatientsPositions() {
        masterMap.clearMiniMap();

	    angular.forEach($scope.things, (thing: MasterScope.Thing, ID: string) => {

				if (!thing.visible) {
					return;
				}

				var loc = thing.location;
				if (!loc || isNaN(loc.x) || isNaN(loc.y)) {
					return;
				}

				var location = new L.LatLng(loc.x, loc.y);

	        masterMap.drawMiniMapPoint(location, { r: 255, g: 0, b: 0 });

			if (markersThings[ID]) {
				markersThings[ID].position.lat = loc.x;
				markersThings[ID].position.lng = loc.y;
			} else {
				var m = new PruneCluster.Marker(loc.x, loc.y, {
					ID: ID
				});

			    //cluster.RegisterMarker(m);
				markersThings[ID] = m;



			    }
		    });

			angular.forEach(markersThings, (marker: L.Marker, ID: string) => {
				var scopeThing = $scope.things[ID];
			    if (!scopeThing || !scopeThing.visible) {
					masterMap.removeLayer(marker);
				    delete markersThings[ID];
			    }
			});
		masterMap.renderMiniMap();
	    //cluster.ProcessView();
    }*/


	/*var endTimeoutId = 0, drag = false;

	var canChangePosition = true, updatePositionsAtEnd = false;

	masterMap.on('movestart zoomstart markerdragstart', e=> {
		canChangePosition = false;

		if (e.type === "markerdragstart") {
			drag = true;
		}

		if (endTimeoutId) {
			window.clearTimeout(endTimeoutId);
			endTimeoutId = 0;
		}
	}).on('moveend zoomend markerdragend', e=> {
		if (!endTimeoutId) {
			if (drag === false || e.type === "markerdragend") {
				drag = false;
				endTimeoutId = window.setTimeout(()=> {
					endTimeoutId = 0;
					canChangePosition = true;

					if (updatePositionsAtEnd) {
						updatePatientsPositions();
					}
				}, 300);
			}
		}
	});*/


	(<any>window).lapin = masterMap;
	//var throttledUpdate = null;
	/*masterMap.on('markerdragstart', (e: L.Marker) => {
		if (!e.marker) {
			return;
		}
		var mLatLng = e.marker.getLatLng();
		dragLineLatLng[0] = new L.LatLng(mLatLng.lat, mLatLng.lng);

		//		dragLine.redraw();
		//		masterMap.on('mousemove', mousemove);

	}).on('markerdragend', (e: L.Marker) => {
			//		masterMap.off('mousemove', mousemove);
			if (onMap) {
				masterMap.removeLayer(dragLine);
				onMap = false;
			}
	}).on('drag', () => {
		if (masterMap._renderer) {
			if (!throttledUpdate) {
				throttledUpdate = L.Util.throttle(masterMap._renderer._update, 100, masterMap._renderer);
			}

			throttledUpdate();
		}
	});*/


	var contextmenu = (e: L.LeafletMouseEvent) => {
		$state.go('add', e.latlng);
	};

	masterMap.on('contextmenu', contextmenu);

	var slidder = null;
	var setMargin = () => {
		if (!slidder) {
			slidder = $('#view-slidder');
		}
		masterMap.setVerticalTopMargin(slidder.outerHeight());
	};

	$scope.$on('$destroy', () => {
		masterMap.off('contextmenu', contextmenu);
		angular.element($window).off('resize', setMargin);
	});

	setMargin();
	angular.element($window).resize(setMargin);
});
