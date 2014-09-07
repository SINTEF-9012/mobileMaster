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
    masterMap : Master.Map,
    thingModel : ThingModelService,
	$state: ng.ui.IStateService,
	$window: ng.IWindowService,
	hotkeys: ng.hotkeys.HotkeysProvider,
	persistentMap: PersistentMap) => {

	masterMap.closePopup();

	masterMap.enableInteractions();
    masterMap.enableScale();
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
		masterMap.enableMiniMap();
	});

	hotkeys.bindTo($scope)
		.add({
			combo: 'f',
			description: 'Change filters',
			callback: () => $state.go('filters')
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

	jwindow.resize(setLayout);

	$scope.$on('$destroy', () => {
		destroyed = true;
		jwindow.off('resize', setLayout);
		masterMap.off('contextmenu', contextmenu);
		angular.element($window).off('resize', setMargin);
	});

	setMargin();
	angular.element($window).resize(setMargin);
});
