﻿'use strict';

angular.module('mobileMasterApp').controller('AddCtrl', (
	$scope,
	$rootScope : MasterScope.Root,
	$state,
	$stateParams,
    $compile : ng.ICompileService,
	masterMap: Master.Map,
	AddService: AddService
	) => {

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
				"generic": "Generic",
				"automobile": "Car",
				"bomb": "Bomb",
				"chemical": "Chemical",
				"explosion": "Boom",
				"fire": "Fire",
				"rock slide": "Rock slide"
			}
		},
		"resource": {
			title: "Resources",
			items: {
				"fire and rescue vehicle": "Fire and rescue vehicle",
				"police personnel": "Policeman",
				"police vehicle": "Police vehicle",
				"civil defence": "Civil defence",
				"red cross": "Red cross"
			}
		}
	};


	var updateIcon = (category: string, type: string)=> {
		var icon = masterMap.createMasterIconWithType(category + " " + type, $scope);

		marker.setIcon(icon);
	};

	$scope.activate = (category: string, type: string)=> {
		$rootScope.add = {
			category: category,
			type: type
		};

		updateIcon(category, type);
	};

	if (!$rootScope.add) {
		$scope.activate('incident', 'generic');
	} else {
		updateIcon($rootScope.add.category, $rootScope.add.type);
	}

	marker.addTo(masterMap);

	$scope.save = (goToMainAfter: boolean) => {
		AddService.register(
			"master:" + $rootScope.add.category + ":" + $rootScope.add.type,
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
