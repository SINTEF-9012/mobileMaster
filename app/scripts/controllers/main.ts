/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="./../../bower_components/a99d99f275e5c274a6ba/SuperSimpleCharts.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/marked/marked.d.ts" />

/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../references/app.d.ts" />
/// <reference path="./../masterScope.d.ts" />

'use strict';

angular.module('mobileMasterApp')
.config((masterMapProvider: Master.MapConfig) => {
    masterMapProvider.setOptions({
            zoom: 13,
            center: new L.LatLng(59.911111, 10.752778),
            zoomControl: false,
            attributionControl: false,
            maxZoom:20,
			keyboard: false,
			trackResize: false
        })
        .declareTileLayer({
            name: "MapBox",
            iconPath: "layer_mapbox.png",
			create: () => {
                return new L.TileLayer('https://{s}.tiles.mapbox.com/v3/apultier.gefc9emp/{z}/{x}/{y}.png', {
                    detectRetina: true,
					reuseTiles: true,
					maxZoom:20,
                    maxNativeZoom: 17
                });
            }
        })
        .declareTileLayer({
            name: "MapBoxBlue",
            iconPath: "layer_mapbox_blue.png",
            create: () => {
                return new L.TileLayer('https://{s}.tiles.mapbox.com/v3/apultier.g98dhngl/{z}/{x}/{y}.png', {
                    detectRetina: true,
					reuseTiles: true,
					maxZoom:20,
                    maxNativeZoom: 17
                });
            }
        })
        .declareTileLayer({
            name: "MapBox Grey",
            iconPath: "layer_mapbox_grey.png",
            create: () => {
                return new L.TileLayer('https://{s}.tiles.mapbox.com/v3/apultier.goh7k5a1/{z}/{x}/{y}.png', {
                    detectRetina: true,
					reuseTiles: true,
					maxZoom:20,
                    maxNativeZoom: 17
                });
            }
        })
        .declareTileLayer({
            name: "StatKart",
            iconPath: "layer_no_topo2.png",
            create: () => {
                return new L.TileLayer('http://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?' +
                    'layers=topo2&zoom={z}&x={x}&y={y}', {
                        subdomains: ['', '2', '3'],
                        detectRetina: true,
						reuseTiles: true,
						maxZoom:20,
                        maxNativeZoom: 18
                    });
            }
        })
        .declareTileLayer({
            name: "StatKart Graatone",
            iconPath: "layer_no_topo2_graatone.png",
            create: () => {
                return new L.TileLayer('http://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?' +
                    'layers=topo2graatone&zoom={z}&x={x}&y={y}', {
                        subdomains: ['', '2', '3'],
                        detectRetina: true,
						reuseTiles: true,
						maxZoom:20,
                        maxNativeZoom: 18
                    });
            }
        })
        .declareTileLayer({
            name: "StatKart sjo hovedkart",
            iconPath: "layer_no_hovedkart2.png",
            create: () => {
                return new L.TileLayer('http://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?' +
                    'layers=sjo_hovedkart2&zoom={z}&x={x}&y={y}', {
                        subdomains: ['', '2', '3'],
                        detectRetina: true,
						reuseTiles: true,
						maxZoom:20,
                        maxNativeZoom: 18
                    });
            }
        })
        .declareTileLayer({
            name: "StatKart gruunkart",
            iconPath: "layer_no_gruunkart.png",
            create: () => {
                return new L.TileLayer('http://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?' +
                    'layers=norges_grunnkart&zoom={z}&x={x}&y={y}', {
                        subdomains: ['', '2', '3'],
                        detectRetina: true,
						reuseTiles: true,
						maxZoom:20,
                        maxNativeZoom: 18
                    });
            }
        })
        .declareTileLayer({
            name: "Watercolor",
            iconPath: "layer_stamen.png",
            create: () => {
                return new L.TileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
                    subdomains: ['a', 'b', 'c', 'd'],
                    detectRetina: true,
					reuseTiles: true,
                    minZoom: 3,
					maxZoom:20,
                    maxNativeZoom: 16
                });
            }
        })
        .declareTileLayer({
            name: "Bing",
            iconPath: "layer_bing.png",
            create: () => {
                return new L.BingLayer("AnpoY7-quiG42t0EvUJb3RZkKTWCO0K0g4xA2jMTqr3KZ5cxZrEMULp1QFwctYG9", {
					detectRetina: true,
					reuseTiles: true,
					minZoom: 1,
                    maxNativeZoom: 18,
		            maxZoom:20
                });
            }
        })
        .declareTileLayer({
            name: "Satellite Mapbox",
            iconPath: "layer_mapbox_sat.png",
            create: () => {
				return new L.TileLayer('https://{s}.tiles.mapbox.com/v3/apultier.iehnl469/{z}/{x}/{y}.png', {
                    detectRetina: true,
					reuseTiles: true,
					maxZoom:20,
                    maxNativeZoom: 17
                });
            }
        })
		.setDefaultTileLayer("MapBox")
		.setContainer(document.getElementById("map-root"));

	marked.setOptions({
		gfm: true,
		tables: true,
		breaks: true
	});

})
.controller('MainCtrl', function(
	masterMap: Master.Map,
	$scope,
	$rootScope : MasterScope.Root,
	$window: ng.IWindowService,
	persistentMap: PersistentMap,
	authenticationService: AuthenticationService,
    itsa : ThingIdentifierService,
    thingModel: ThingModelService) {

	$scope.username = authenticationService.getUserName();
	$scope.changeUserName = () => {
		var newname = window.prompt("What is your name ? (A real authentication is coming)", $scope.username);
		if (newname) {
			$scope.username = newname;
			authenticationService.setUserName(newname);
		}
	};

	var jMap = $('#main-map'),
		jMapBody = jMap.children(),
		jlink = $('#main-map-link'),
		jChat = $('#main-chat'),
		jMediablock = $('#main-mediablock'),
		jChatScrollarea = $('.chat-scroll-area').get(0),
		jTimeline = $('#main-timeline');

	persistentMap.restorePersistentLayer(masterMap);
	persistentMap.unbindMasterMap(masterMap);

    masterMap.disableInteractions();
    masterMap.disableMiniMap();
    masterMap.disableScale();

	var jwindow = $($window);

	var destroyed = false;

	// Chart.js Options
	var chartJSOptions = {

		// Sets the chart to be responsive
		responsive: false,

		//Boolean - Whether we should show a stroke on each segment
		segmentShowStroke: false,

		//String - The colour of each segment stroke
		segmentStrokeColor: 'black',

		//Number - The width of each segment stroke
		segmentStrokeWidth: 2,

		//Number - The percentage of the chart that we cut out of the middle
		percentageInnerCutout: 60, // This is 0 for Pie charts

		// Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
		maintainAspectRatio: false,

		//Number - Amount of animation steps
		animationSteps: 100,

		//String - Animation easing effect
		animationEasing: 'easeOutBounce',

		//Boolean - Whether we animate the rotation of the Doughnut
		animateRotate: true,

		//Boolean - Whether we animate scaling the Doughnut from the centre
		animateScale: false,
	};

	// And for a doughnut chart
	var patientsChart = new Chart((<HTMLCanvasElement>document.getElementById('patients-chart')).getContext('2d')).Doughnut([], chartJSOptions);
	var resourcesChart = new Chart((<HTMLCanvasElement>document.getElementById('resources-chart')).getContext('2d')).Doughnut([], chartJSOptions);
	var beaconsChart = new Chart((<HTMLCanvasElement>document.getElementById('beacons-chart')).getContext('2d')).Doughnut([], chartJSOptions);
	patientsChart.resize();
	resourcesChart.resize();
	beaconsChart.resize();

	var setLayout = throttle(() => {

		if (destroyed) {
			return;
		}

		var column = $('.responsive-infoblock-column'),
			blocs = column.children('.infoblock'),
			columnOffset = column.offset(),
			height = $window.innerHeight - (columnOffset ? columnOffset.top : 0) - 6,
			windowWidth = jwindow.width(),
			mediablockHeight = jMediablock.outerHeight();


		var mapHeight, blockHeight;

		// If it's a mobile or a tablet in portrait
		if (windowWidth <= 768) {
			mapHeight = 360;
			blockHeight = 180;
		} else {

			var lg = blocs.length / (windowWidth >= 1200 ? 3 : 2);

			blockHeight = Math.floor(height / Math.ceil(lg)) - 12;
			var width = blocs.first().innerWidth();
			if (blockHeight / width > 1.42) {
				blockHeight = Math.min(150, blockHeight);
			} 
			mapHeight = Math.max(Math.floor(height - mediablockHeight - 12), 270);
		}

		blocs.height(blockHeight);
		jMap.height(mapHeight);
		jChat.height(mapHeight - 8);
		jTimeline.height(mediablockHeight - 12);

		window.setImmediate(() => {
			if (destroyed) {
				return;
			}
			jlink.height(mapHeight).width(jMap.width()).offset(jMap.offset());

			jChatScrollarea.scrollTop = jChatScrollarea.scrollHeight;

			masterMap.moveTo(jMapBody);
			patientsChart.resize(() => {
				patientsChart.reflow();
				patientsChart.update();
			});
			resourcesChart.resize(() => {
				resourcesChart.reflow();
				resourcesChart.update();
			});
			beaconsChart.resize(() => {
				beaconsChart.reflow();
				beaconsChart.update();
			});
			//masterMap.invalidateSize({});
			masterMap.showOverview();

		});
	}, 200);


	//var statsPatients: { [color: string]: number }, nbPatients = 0;
	//var patientsChart = new SuperSimpleCharts.BarChart(document.getElementById('patients-chart'));


	var checkObserver = (thing: ThingModel.Thing) => {
		if (itsa.patient(thing) || itsa.beacon(thing) || itsa.resource(thing)) {
			computeStats();
		}

		else if (thing.ID === 'master-summary') {
			computeSummary();
		}
	};

	var observer = {
		New: checkObserver, 
		Updated: checkObserver,
		Deleted: checkObserver,
		Define: () => {}
	};

	var lastCall = 0,
		workerTimeout = 0,
		interval = 300;

	var computeStats = (first?: boolean) => {
		if (workerTimeout !== 0) {
			return;
		}

		var now = +new Date();
		if ((now - lastCall) < interval) {
			workerTimeout = window.setTimeout(computeStatsWorker, interval);
			return;
		}

		computeStatsWorker(first);
	};

	var triageColorsLockup = {
		'unknown': '#666',
		'no status entered': '#666',
		'yellow': '#EBC813',
		'red': '#E51E23' 
	};


	var statsResources: { value: number; color: string; highlight: string; label: string }[] = [
		{
			value: 1,
			color: '#F7464A',
			highlight: '#FF2539',
			label: 'Fire'
		},
		{
			value: 1,
			color: '#318C12',
			highlight: '#309D01',
			label: 'Medic'
		},
		{
			value: 1,
			color: '#55BCBE',
			highlight: '#44BCCF',
			label: 'Police'
		}
	];
	var statsBeacons: { value: number; color: string; highlight: string; label: string }[] = [
		{
			value: 1,
			color: '#D2204C',
			highlight: '#E56081',
			label: 'Unsafe'
		},
		{
			value: 1,
			color: '#01579B',
			highlight: '#327DB8',
			label: 'Safe'
		},
		{
			value: 1,
			color: '#0A8F08',
			highlight: '#50C04E',
			label: 'Rescued'
		}
	];

	var computeStatsWorker = (first?: boolean) => {
		workerTimeout = 0;
		lastCall = +new Date();
		//nbPatients = 0;
		var statsPatients = {};
		var finalStatsPatients = [];

		patientsChart.segments = [];
		resourcesChart.segments = [];
		beaconsChart.segments = [];

		statsResources[0].value = 0;
		statsResources[1].value = 0;
		statsResources[2].value = 0;

		statsBeacons[0].value = 0;
		statsBeacons[1].value = 0;
		statsBeacons[2].value = 0;

		angular.forEach(thingModel.warehouse.Things, (thing: ThingModel.Thing) => {
			if (itsa.patient(thing)) {
				//nbPatients += 1;

				var triage_status: string;
				if (!(triage_status = thing.GetString('triage_status'))) {
					triage_status = 'unknown';
				} else {
					triage_status = triage_status.toLowerCase();
				}

				if (statsPatients[triage_status]) {
					++statsPatients[triage_status].value;
				} else {
					var s = statsPatients[triage_status] = {
						value: 1,
						color: triageColorsLockup[triage_status] || triage_status,
						label: triage_status
					};
					finalStatsPatients.push(s);
				}
			} else if (itsa.resource(thing)){ 
				if (itsa.fire(thing)) {
					++statsResources[0].value;
				} else if (itsa.medic(thing)) {
					++statsResources[1].value;
				} else if (itsa.police(thing)) {
					++statsResources[2].value;
				}
			} else if (itsa.beacon(thing)) {
				if (thing.Boolean("rescued")) {
					++statsBeacons[2].value;
				} else if (thing.Boolean("safe")) {
					++statsBeacons[1].value;
				} else {
					++statsBeacons[0].value;
				}
			}
		});

		//patientsChart.SetData(statsPatients);
		//$scope.nbPatients = nbPatients;
		//myDoughnutChart.segments = $scope.statsPatients;
		for (var i = 0, l = finalStatsPatients.length; i < l; ++i) {
			patientsChart.addData(finalStatsPatients[i], undefined, true);
		}
		for (i = 0, l = statsResources.length; i < l; ++i) {
			resourcesChart.addData(statsResources[i], undefined, true);
		}
		for (i = 0, l = statsBeacons.length; i < l; ++i) {
			beaconsChart.addData(statsBeacons[i], undefined, true);
		}
		resourcesChart.stop();
		resourcesChart.reflow();
		resourcesChart.update();

		patientsChart.stop();
		patientsChart.reflow();
		patientsChart.update();

		beaconsChart.stop();
		beaconsChart.reflow();
		beaconsChart.update();

		if (!first) {
			$scope.$apply();
			setLayout();
			patientsChart.options.animateRotate = false;
			resourcesChart.options.animateRotate = false;
			beaconsChart.options.animateRotate = false;
		}
	};



	var computeSummary = () => {
		var summary = thingModel.warehouse.GetThing('master-summary');
		if (summary) {
			$scope.title = summary.GetString('title');
			//var content = summary.GetString('content');
			//$scope.htmlSummary = content ? marked(content)) : '';
		} else {
			$scope.title = 'Untitled situation';
			//$scope.htmlSummary = '';
		}

		if (!$scope.$$phase) {
			$scope.$digest();
			setLayout();
		}
	};

	$rootScope.$on('thingmodel.open', () => {
		computeSummary();
	});

	computeStats(true);
	computeSummary();
	thingModel.warehouse.RegisterObserver(observer);

	

	$scope.$on('$destroy', () => {
		destroyed = true;
		jwindow.off('resize', setLayout);
		thingModel.warehouse.UnregisterObserver(observer);
		patientsChart.destroy();
		resourcesChart.destroy();
		beaconsChart.destroy();
	});

	jwindow.resize(setLayout);

	// Update the panel height after the layout initialization
    window.setImmediate(() => {
		if (destroyed) {
			return;
		}
		setLayout();
		masterMap.setVerticalTopMargin(0);
		masterMap.moveTo(jMap.get(0));
		setLayout();
		masterMap.enableSituationOverview();
    });
});
