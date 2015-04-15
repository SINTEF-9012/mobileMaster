/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-hotkeys/angular-hotkeys.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />

/// <reference path="./../references/app.d.ts" />
/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../masterScope.d.ts" />

'use strict';

// Module configuration
angular.module('mobileMasterApp')
.controller('MapCtrl', (
	$scope,
	notify : angularNotify,
    masterMap : Master.Map,
    thingModel : ThingModelService,
	$rootScope : MasterScope.Root,
	$state: ng.ui.IStateService,
	$window: ng.IWindowService,
	hotkeys: ng.hotkeys.HotkeysProvider,
	persistentMap: PersistentMap) => {

	masterMap.closePopup();

	masterMap.enableInteractions();
    masterMap.enableScale();
	if (!L.Browser.touch) {
		masterMap.enableZoomControl();
	}
	masterMap.disableSituationOverview();

	persistentMap.restorePersistentLayer(masterMap);

	var jMap = $('#map'), jwindow = $(window);
	var destroyed = false;
	var setLayout = throttle(() => {
		if (destroyed) {
			return;
		}
		masterMap.moveTo(jMap);
	}, 50);

	setLayout();

	window.setImmediate(() => {
		persistentMap.bindMasterMap(masterMap);
		if ($state.is('map')) {
			masterMap.disableMiniMap();
		} else {
			masterMap.enableMiniMap();
		}
	});

	hotkeys.bindTo($scope)
		.add({
			combo: 'f',
			description: 'Change filters',
			callback: () => $state.go('filters')
		}).add({
			combo: 'o',
			description: 'Map drawing',
			callback: () => $state.go('map.paint')
		}).add({
			combo: 'b',
			description: 'Map background filters',
			callback: () => $state.go('background')
		}).add({
			combo: '0',
			description: 'Center the map on the situation',
			callback: () => masterMap.showOverview()
		});


	var contextmenu = (e: L.LeafletMouseEvent) => {
		if ($state.is('map.paint')) {
			return;
		}
		if ($rootScope.pastSituation) {
			notify({ message: "Live mode is required for adding new elements.", classes: "alert-warning" });
		} else {
			$state.go('add', e.latlng);
		}
	};

	masterMap.on('contextmenu', contextmenu);

	var slidder = null;
	var setMargin = () => {
		if (!slidder) {
			slidder = $('#view-slidder');
		}
		masterMap.setVerticalTopMargin(slidder.outerHeight());
	};

	jwindow.resize(setLayout);

	$scope.$on('$destroy', () => {
		destroyed = true;
		jwindow.off('resize', setLayout);
		masterMap.off('contextmenu', contextmenu);
		masterMap.disableZoomControl();
		angular.element($window).off('resize', setMargin);
	});

	setMargin();
	angular.element($window).resize(setMargin);
});
