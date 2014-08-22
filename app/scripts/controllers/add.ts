/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-hotkeys/angular-hotkeys.d.ts" />
/// <reference path="../../bower_components/ThingModel/TypeScript/build/ThingModel.d.ts" />

/// <reference path="./../references/app.d.ts" />
/// <reference path="./../masterScope.d.ts" />

'use strict';

angular.module('mobileMasterApp').controller('AddCtrl', (
	$scope,
	$rootScope : MasterScope.Root,
	$state: ng.ui.IStateService,
	$stateParams,
    $compile : ng.ICompileService,
	masterMap: Master.Map,
	AddService: AddService,
	hotkeys: ng.hotkeys.HotkeysProvider,
	$window: ng.IWindowService,
    persistentLocalization : PersistentLocalization
	) => {


	var position: L.LatLng;

	// The location can be specified as state parameters
	if ($stateParams.lat && $stateParams.lng) {
		position = L.latLng($stateParams.lat, $stateParams.lng);
	} else {
		position = masterMap.getCenter();
	}


	$scope.types = {
		"incident": {
			title: "Incidents",
			items: {
				"incident generic": "Generic",
				"incident automobile": "Car",
				"incident bomb": "Bomb",
				"incident chemical": "Chemical",
				"incident explosion": "Explosion",
				"incident fire": "Fire",
				"incident rock slide": "Rock slide"
			}
		},
		"resource": {
			title: "Resources",
			items: {
				"resource fire and rescue vehicle": "Firetruck",
				"resource health personnel": "Health personnel",
				"resource health vehicle": "Health vehicle",
				"resource police personnel": "Policeman",
				"resource police vehicle": "Police vehicle",
				"resource fire and rescue personnel": "Fireman",
				"resource civil defence": "Civil defence",
				"resource red cross": "Red cross",
				"resource people aid": "People's aid",
				"resource hexacopter uav": "Helicopter UAV"
			}
		},
		"risk": {
			title: "Risks",
			items: {
				"risk automobile": "Automobile Risk",
				"risk bomb": "Bomb risk",
				"risk chemical": "Chemical risk",
				"risk explosion": "Explosion risk",
				"risk fire": "Fire risk",
				"risk generic": "Generic risk",
				"risk rock slide": "Rock slide risk"
			}
		},
		"response_aligment": {
			title: "Aligments",
			items: {
				"response alignment generic": "Generic alignment",
				"response alignment police car": "Police car alignment",
				"response alignment firetruck": "Firetruck alignment",
				"response alignment ambulances": "Ambulances alignment"
			}
		},
		"response_assembly_area": {
			title: "Assembly areas",
			items: {
				"response assembly area generic": "Assembly area",
				"response assembly area dead": "Assembly area dead",
				"response assembly area evacuated": "Assembly area evacuated",
				"response assembly area injured": "Assembly area injured"
			}
		},
		"response_points": {
			title: "Points",
			items: {
				"response point meeting": "Meeting point",
				"response point meeting fire": "Meeting point fire personnel",
				"response point meeting health": "Meeting point health personnel",
				"response point meeting police": "Meeting point police personnel",
				"response point control ": "Control point",
				"response point exit": "Exit point",
				"response point entry": "Entry point"
			}
		},
		"generic_response": {
			title: "Responses",
			items: {
				"response generic": "Generic response",
				"response command post": "Command post",
				"response helicopter landing": "Helicopter landing",
				"response roadblock": "RoadBlock",
				"response depot": "Depot"
			}
		}
	};

	var iconContainer = L.DomUtil.create('div', ''),
		jIconContainer = $(iconContainer);

	var updateIcon = (type) => {
		var icon = angular.element('<master-icon />');
		icon.attr('type', type);
		jIconContainer.empty().append($compile(icon)($scope));
	};

	$scope.activate = (category:string, type: string)=> {
		$rootScope.add = {
			category: category,
			type: type
		};

		if (window.localStorage) {
			window.localStorage.setItem('addCategory', category);
			window.localStorage.setItem('addType', type);
		}

		updateIcon(type);
	};

	if (!$rootScope.add) {
		if (window.localStorage) {
			$scope.activate(window.localStorage.getItem('addCategory') || 'generic_response',
				window.localStorage.getItem('addType') || 'generic response');
		} else {
			$scope.activate('generic_response', 'generic response');
		}
	} else {
		updateIcon($rootScope.add.type);
	}

	//marker.addTo(masterMap);

	$scope.save = (goToMainAfter: boolean) => {

		var type = "master:" + $rootScope.add.category; 
		AddService.register(type, masterMap.getCenter(), (thing: ThingModel.ThingPropertyBuilder) => {
			if ($scope.description) {
				thing.String('description', $scope.description);
			}
			thing.String('name', $scope.types[$rootScope.add.category].items[$rootScope.add.type]);
			thing.String('_type', $rootScope.add.type);
		});

		//alert($scope.description)
		
		if (goToMainAfter) {
			$state.go(($rootScope.previousState && $rootScope.previousState.indexOf('add') !== 0) ?
				$rootScope.previousState : 'map.slidder');
		}
	};

	var removeListener = $rootScope.$on('$stateChangeStart', (event : ng.IAngularEvent, toState:any)=> {
//		console.log(event, toState, fromState);
		if (toState.name === "main.add") {
			$scope.save(false);
		}
		//masterMap.removeLayer(marker);
		removeListener();
	});

	masterMap.closePopup();
	masterMap.enableInteractions();
	masterMap.enableScale();
	masterMap.disableMiniMap();

	var jwindow = $($window), jMap = $('#thing-map'), jView = $('#thing-view');

	var setLayout = throttle(() => {
		var width = jwindow.width();
		var height = Math.max(Math.floor(jwindow.height() - jMap.offset().top), 300);
		masterMap.invalidateSize({});
		jMap.height(height - 1 /* border */);

		if (width >= 768 && !$scope.hideMap) {
			jView.height(height - 11 /* margin bottom */);
		} else {
			jView.height('auto');
		}

		masterMap.invalidateSize({});
	}, 50);

	$scope.$on('$destroy', () => {
		jwindow.off('resize', setLayout);
		masterMap.disableShadow();
		//thingModel.warehouse.UnregisterObserver(observer);
	});

	jwindow.resize(setLayout);

	//persistentLocalization.unbindMasterMap(masterMap);
	masterMap.setVerticalTopMargin(0);
	setLayout();
	masterMap.moveTo(jMap.get(0));
	masterMap.disableSituationOverview();
	persistentLocalization.bindMasterMap(masterMap);

	window.setImmediate(() => {
		persistentLocalization.restorePersistentLayer(masterMap);
		masterMap.panTo(position);
		masterMap.enableShadow(undefined, iconContainer, 'flex');
	});

	hotkeys.bindTo($scope)
		.add({
			combo: 'return',
			description: 'Save',
			callback: () => $scope.save()
	});
});
