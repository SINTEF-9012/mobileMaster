'use strict';

angular.module('mobileMasterApp').controller('AddCtrl', (
	$scope,
	$rootScope : MasterScope.Root,
	$state,
	$stateParams,
    $compile : ng.ICompileService,
	masterMap: Master.Map,
	AddService: AddService
	) => {
	$rootScope.layoutautoscroll = false;
	var position: L.LatLng;

	if ($stateParams.lat && $stateParams.lng) {
		position = L.latLng($stateParams.lat, $stateParams.lng);

		// Pan to the position if it's not visible
		if (!masterMap.getBounds().pad(0.8).contains(position)) {
			masterMap.panTo(position);
		}
	} else {
		position = masterMap.getCenter();
	}

	var marker = new L.Marker(position, {
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
	});

	$scope.types = {
		"incident": {
			title: "Incidents",
			items: {
				"incident generic": "Generic",
				"incident automobile": "Car",
				"incident bomb": "Bomb",
				"incident chemical": "Chemical",
				"incident explosion": "Boom",
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
				"generic risk": "Just a risk",
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


	var updateIcon = (type: string)=> {
		var icon = masterMap.createMasterIconWithType(type, $scope);

		marker.setIcon(icon);
	};

	$scope.activate = (category:string, type: string)=> {
		$rootScope.add = {
			category: category,
			type: type
		};

		updateIcon(type);
	};

	if (!$rootScope.add) {
		$scope.activate('incident', 'incident generic');
	} else {
		updateIcon($rootScope.add.type);
	}

	marker.addTo(masterMap);

	$scope.save = (goToMainAfter: boolean) => {
		AddService.register(
			"master:" + $rootScope.add.type,
			marker.getLatLng());	
		
		if (goToMainAfter) {
			$state.go("main");
		}
	};

	var removeListener = $rootScope.$on('$stateChangeStart', (event : ng.IAngularEvent, toState:any)=> {
//		console.log(event, toState, fromState);
		if (toState.name === "main.add") {
			$scope.save(false);
		}
		masterMap.removeLayer(marker);
		removeListener();
	});

});
