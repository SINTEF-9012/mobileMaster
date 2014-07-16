/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="./../references/Touch.d.ts" />
/// <reference path="./../references/NodeMaster.d.ts" />
/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../references/app.d.ts" />
/// <reference path="./../masterScope.d.ts" />
'use strict';

angular.module('mobileMasterApp')
	.config((AddServiceProvider: AddServiceConfig) => {
	AddServiceProvider.defineType(ThingModel.BuildANewThingType.Named('master:order')
		.WhichIs('Order')
		.ContainingA.LocationLatLng()
		.AndA.String("task")
		.AndA.NotRequired.String("description")
		.AndA.Boolean("accepted")
		.AndA.Boolean("done").Build());
}).controller('OrderCtrl', function (
	$scope,
	$rootScope : MasterScope.Root,
	$stateParams,
	$window: ng.IWindowService,
	AddService: AddService,
    persistentLocalization : PersistentLocalization,
	thingModel: ThingModelService,
	$state: ng.ui.IStateService,
	itsa: ThingIdentifierService,
	Knowledge,
	masterMap: Master.Map) {

	$scope.types = {};

	var rawTypes = {
		resources: {
			"fightfire": {
				title: "Fight fire",
				items: {
					"fightfire putoutfire": "Put out fire",
					"fightfire smokedive": "Smoke Dive"
				}
			},
			"search": {
				title: "Search",
				items: {
					"search building": "Search building",
					"search other location": "Search other location"
				}
			},
			"secure": {
				title: "Secure",
				items: {
					"secure hazardous material": "Secure hazardous material"
				}
			},
			"0": {
				title: "Assign",
				items: {
					"after quench": "After quench",
					"assist police": "Assist police",
					"assist medical personnel": "Assist medical personel",
					"diving task": "Divink task",
					"rescue task": "Rescue task",
					"other task": "Task given by radio"
				}
			}

		},
		medic: {
			"0": {
				title: "Assign",
				items: {
					"triage victims": "Trigae victims",
					"trauma treatment": "Trauma treatment",
					"treat victim": "Treat victim",
					"other task": "Task given by radio"
				}
			},

			"transport": {
				title: "Transport victim",
				items: {
					"transport hospital": "Transport victim to hospital",
					"transport emergency clinic": "Transport victim to emergency clinic",
					"transport assembly area": "Transport victim to assembly area",
					"transport other location": "Transport victim to other location"
				}
			},

			"takerole1": {
				title: "Take role",
				items: {
					"takerole incident scene": "Take leader role at incident scene",
					"takerole assembly area": "Take leader role at assembly area",
					"takerole other location": "Take leader role at other location"
				}
			}
		},

		police: {
			"0": {
				title: "Assign",
				items: {
					"evacuate": "Evacuate area",
					"setup evacuation point": "Setup evacuation point",
					"other task": "Task given by radio"
				}
			},

			"goto": {
				title: "Go to",
				items: {
					"goto observe report": "Observe and report",
					"goto guard object": "Guard object"
				}
			},

			"setup": {
				title: "Set up",
				items: {
					"setup road block": "Set up road block",
					"setup cordon": "Set up cordon"
				}
			},
			"takerole2": {
				title: "Take role as",
				items: {
					"takerole field commander": "Take role as field commander",
					"takerole radio leader": "Take role as radio leader",
					"takerole logger": "Take role as logger",
					"takerole incident commander": "Take role as incident commander",
					"takerole second commander": "Take role as second commander",
					"takerole team leader": "Take role as team leader"
				}
			},
			"investigate": {
				title: "Investigate",
				items: {
					"investigate incident cause": "Investigate cause of incident",
					"investigate risk": "Investigate risk"
				}
			}
		}
	};

	$scope.activate = (category: string, type: string) => {
		$rootScope.order = {
			category: category,
			type: type
		};

		if (window.localStorage) {
			window.localStorage.setItem('orderCategory', category);
			window.localStorage.setItem('orderType', type);
		}
	};

	if (!$rootScope.order) {
		if (window.localStorage) {
			$scope.activate(window.localStorage.getItem('orderCategory') || '0',
				window.localStorage.getItem('orderType') || 'other task');
		} else {
			$scope.activate('0', 'other task');
		}
	}

	var id = $stateParams.ID;
	$scope.id = id;

	var stateBack = $stateParams.from === 'map' ? 'map.slidder' : 'table',
		stateInfos = {thingtype: 'all'};
	$scope.returnLink = $state.href(stateBack, stateInfos);

	$scope.thing = {};
	$scope.unfound = true;
	var thingModelThing: ThingModel.Thing = null;

	var lineStart: L.LatLng = null,
		dragLine: L.Path = null,
		renderUpdate = throttle(() => (<any>masterMap)._renderer._update(), 100, (<any>masterMap)._renderer);

	var lineDraw = throttle(() => {
		if (!lineStart) {
			if (dragLine) {
				masterMap.removeLayer(dragLine);
				dragLine = null;
			}
		} else {
			if (!dragLine) {
				dragLine = L.polyline([masterMap.getCenter(), lineStart], {
					clickable: false
				}).addTo(masterMap);
			} else {
				(<any>dragLine).setLatLngs([masterMap.getCenter(), lineStart]);
				renderUpdate();
			}
		}
	}, 10);

	masterMap.on('viewreset move', lineDraw);

	var digestScope = throttle(() => {
		var thing = thingModel.warehouse.GetThing(id);

		if (thing) {
			if (!Knowledge.canOrder(thing)) {
				alert("You are not supposed to give order to this thing");
				$state.go('main');
			}
		
			$scope.unfound = false;
			thingModelThing = thing;

			thingModel.ApplyThingToScope($scope.thing, thing);

			var location = thing.LocationLatLng();
			if (location && !isNaN(location.Latitude) && !isNaN(location.Longitude)) {
				lineStart = new L.LatLng(location.Latitude, location.Longitude);
				lineDraw();
			}

			if (itsa.police(thing)) {
				$scope.types = rawTypes.police;
			} else if (itsa.medic(thing)) {
				$scope.types = rawTypes.medic;
			} else {
				$scope.types = rawTypes.resources;
			}

			if (!$scope.types[$rootScope.order.category] ||
				!$scope.types[$rootScope.order.category].items[$rootScope.order.type]) {
				$scope.activate('0', 'other task');
			}

			var type = itsa.typefrom(thingModelThing);
			if ($stateParams.from && $stateParams.from.indexOf('list-') === 0) {
				stateInfos = { from: $stateParams.from.slice(5), thingtype: type };
			} else {
				stateInfos = { thingtype: type };
			}

			$scope.returnLink = $state.href(stateBack, stateInfos);

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
			if (thing.ID === id) {
				$scope.unfound = true;
				digestScope();
			} 
		},
		Define: () => {}
	}
	thingModel.warehouse.RegisterObserver(observer);

	masterMap.closePopup();
	masterMap.enableInteractions();
	masterMap.enableScale();
	masterMap.disableMiniMap();
	masterMap.unfilterThing(id);

	var jwindow = $($window), jMap = $('#thing-map');
	var setLayout = throttle(() => {
		var height = Math.max(Math.floor(jwindow.height() - jMap.offset().top), 300);
		jMap.height(height - 1 /* border */);
		masterMap.invalidateSize({});
	}, 50);



	$scope.$on('$destroy', () => {
		jwindow.off('resize', setLayout);
		masterMap.removeLayer(dragLine);
		if (lineDraw) {
			masterMap.off('viewreset move', lineDraw);
		}
		masterMap.disableShadow();
		thingModel.warehouse.UnregisterObserver(observer);
	});

	jwindow.resize(setLayout);

	//persistentLocalization.unbindMasterMap(masterMap);
	masterMap.setVerticalTopMargin(0);
	setLayout();
	masterMap.moveTo(jMap.get(0));
	masterMap.disableSituationOverview();

	window.setImmediate(() => {
		persistentLocalization.bindMasterMap(masterMap);
		persistentLocalization.restorePersistentLayer(masterMap);
		masterMap.enableShadow();
	});

	$scope.publish = () => {
		AddService.register("master:order", masterMap.getCenter(), (thing: ThingModel.ThingPropertyBuilder) => {
			thing.String("task", $rootScope.order.type);
			thing.Boolean("accepted", false);
			thing.Boolean("done", false);
			thing.String("description", $scope.types[$scope.order.category].items[$scope.order.type] + " ; "+
				($scope.thing.name || $scope.thing.ID));
		}, undefined, [thingModelThing]);

		$state.go(stateBack, stateInfos);
	};

});
