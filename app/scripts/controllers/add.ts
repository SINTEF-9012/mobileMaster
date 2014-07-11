/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
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
	$window: ng.IWindowService,
    persistentLocalization : PersistentLocalization
	) => {


	var position: L.LatLng;

	if ($stateParams.lat && $stateParams.lng) {
		position = L.latLng($stateParams.lat, $stateParams.lng);
		// Pan to the position if it's not visible
		//if (!masterMap.getBounds().pad(0.8).contains(position)) {
		//	masterMap.panTo(position);
		//}
	} else {
		position = masterMap.getCenter();
	}


	/*var marker = new L.Marker(position, {
		draggable: true
	});

	marker.on('dragstart', (e)=> {
		masterMap.fire('markerdragstart', e);
	}).on('dragend', (e)=> {
		window.setImmediate(()=> {
			masterMap.fire('markerdragend', e);
		});

		var pos = marker.getLatLng();

		// TODO update the URL params in a beautiful and wonderful way
		//$state.go('main.add', pos);
	});*/

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
				"resource people aid": "People's aid"
			}
		},
		"risk": {
			title: "Risks",
			items: {
				"automobile risk": "Automobile Risk",
				"bomb risk": "Bomb risk",
				"chemical risk": "Chemical risk",
				"explosion risk": "Explosion risk",
				"fire risk": "Fire risk",
				"generic risk": "Generic risk",
				"rock slide risk": "Rock slide risk"
			}
		},
		"response_aligment": {
			title: "Aligments",
			items: {
				"response generic alignment": "Generic alignment",
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
				"response assembly area injured": "Assembly area injured",
			}
		},
		"response_points": {
			title: "Points",
			items: {
				"response meeting point fire": "Meeting point fire personnel",
				"response meeting point health": "Meeting point health personnel",
				"response meeting point police": "Meeting point police personnel",
				"response control point ": "Control point",
				"response exit point ": "Exit point",
				"response entry point": "Entry point",
				"response meeting point": "Meeting point"
			}
		},
		"generic_response": {
			title: "Responses",
			items: {
				"generic response": "Generic response",
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

		var type = "master:" + $rootScope.add.type; 
		AddService.register(type, masterMap.getCenter(), (thing: ThingModel.ThingPropertyBuilder) => {
			if ($scope.description) {
				thing.String('description', $scope.description);
			}
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

	var jwindow = $($window), jMap = $('#thing-map');

	var setLayout = throttle(() => {
		var height = Math.max(Math.floor(jwindow.height() - jMap.offset().top), 300);
		masterMap.invalidateSize({});
		jMap.height(height - 1 /* border */);
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
});
