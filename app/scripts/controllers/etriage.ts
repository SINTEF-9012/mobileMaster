/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />

/// <reference path="./../references/app.d.ts" />
/// <reference path="./../references/generic.d.ts" />

'use strict';

angular.module('mobileMasterApp')
.controller('EtriageCtrl', (
	$scope,
	notify : angularNotify,
    masterMap : Master.Map,
    thingModel : ThingModelService,
	$rootScope : MasterScope.Root,
	$state: ng.ui.IStateService,
	$window: ng.IWindowService,
	authenticationService: AuthenticationService,
    itsa : ThingIdentifierService,
	persistentMap: PersistentMap) => {

	$scope.username = authenticationService.getUserName();
	$scope.changeUserName = () => {
		var newname = window.prompt("Please enter your name", $scope.username);
		if (newname) {
			$scope.username = newname;
			authenticationService.setUserName(newname);
		}
	};

	var jMap = $('#main-map'),
		jlink = $('#main-map-link'),
		jSummary = $('#main-summary'),
		jPatientsList = $('#main-patients-list'),
		jMapBody = jMap.children();

	persistentMap.restorePersistentLayer(masterMap);
	persistentMap.unbindMasterMap(masterMap);

	masterMap.closePopup();
    masterMap.enableScale();
    masterMap.disableInteractions();
    masterMap.disableMiniMap();

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

		onAnimationComplete: function () {
			this.options.animation = false;
			this.options.animateRotate = false;
			this.options.animateScale = false;
		}
	};

	var patientsChart = new Chart((<HTMLCanvasElement>document.getElementById('patients-chart')).getContext('2d')).Doughnut([], chartJSOptions);
	var patientsLocationChart = new Chart((<HTMLCanvasElement>document.getElementById('patients-location-chart')).getContext('2d')).Doughnut([], chartJSOptions);
	patientsChart.resize();
	patientsLocationChart.resize();

	var setLayout = throttle(() => {

		if (destroyed) {
			return;
		}

		var windowWidth = jwindow.width(),
			height = $window.innerHeight - 8,
			mapHeight = 360;

		// If it's not a mobile or a tablet in portrait
		if (windowWidth >= 768) {
			mapHeight = height - 104;
			jPatientsList.height(mapHeight - jSummary.height() - 76);
		}

		jMap.height(mapHeight);

		window.setImmediate(() => {
			if (destroyed) {
				return;
			}
			jlink.height(mapHeight).width(jMap.width()).offset(jMap.offset());
			masterMap.moveTo(jMapBody);
			_.each(patientsChart.segments, (segment:any) => segment.save());
			patientsChart.resize(() => {
				patientsChart.reflow();
				patientsChart.render();
			});
			_.each(patientsLocationChart.segments, (segment:any) => segment.save());
			patientsLocationChart.resize(() => {
				patientsLocationChart.reflow();
				patientsLocationChart.render();
			});
			masterMap.showOverview();
		});
	}, 200);

	setLayout();

	window.setImmediate(() => {
		persistentMap.bindMasterMap(masterMap);
		masterMap.enableMiniMap();
	});

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
		'unknown': '#FFF',
		'yellow': '#EBC813',
		'red': '#E51E23',
		'black': '#888'
	};

	var locationColorsLockup = {
		'onscene': ['#673ab7', 'On scene'],
		'transport': ['#0277bd', 'Transport'],
		'delivered': ['#689f38', 'Delivered']
	};
	
	var computeStatsWorker = (first?: boolean) => {
		workerTimeout = 0;
		lastCall = +new Date();


		var nbPatients = 0;
		var statsPatients = {};
		var statsPatientsLocation = {};
		var finalStatsPatients = [];
		var finalStatsPatientsLocation = [];
		
		var tableStats = {
			red: {
				onscene: 0,
				transport: 0,
				delivered: 0,
				total: 0
			},
			yellow: {
				onscene: 0,
				transport: 0,
				delivered: 0,
				total: 0
			},
			green: {
				onscene: 0,
				transport: 0,
				delivered: 0,
				total: 0
			},
			black: {
				onscene: 0,
				transport: 0,
				delivered: 0,
				total: 0
			},
			white: {
				onscene: 0,
				transport: 0,
				delivered: 0,
				total: 0
			}
		};

		patientsChart.segments = [];
		patientsLocationChart.segments = [];

		/*statsResources[0].value = 0;
		statsResources[1].value = 0;
		statsResources[2].value = 0;

		statsBeacons[0].value = 0;
		statsBeacons[1].value = 0;
		statsBeacons[2].value = 0;*/;

		angular.forEach(thingModel.warehouse.Things, (thing: ThingModel.Thing) => {
			if (itsa.patient(thing)) {
				nbPatients += 1;

				var triage_status: string;
				if (!(triage_status = thing.GetString('triage_status'))) {
					triage_status = 'unknown';
				} else {
					triage_status = triage_status.toLowerCase();
					if (triage_status === "no status entered") {
						triage_status = "unknown";
					}
				}

				var tableTriageStatusKey:string = tableStats.hasOwnProperty(triage_status) ? triage_status : 'white',
					tableTriageLocationkey:string = null;

				var locationName = thing.GetString('locationName');
				if (locationName === 'on scene') {
					tableTriageLocationkey = 'onscene';
				} else if (locationName === 'transport') {
					tableTriageLocationkey = 'transport';
				} else if (locationName === 'hospital' || locationName === 'after transport' || locationName === 'after ER') {
					tableTriageLocationkey = 'delivered';
				}

				var s;

				if (tableTriageLocationkey) {
					var tmpStats = tableStats[tableTriageStatusKey];
					++tmpStats.total;
					++tmpStats[tableTriageLocationkey];

					if (statsPatientsLocation.hasOwnProperty(tableTriageLocationkey)) {
						++statsPatientsLocation[tableTriageLocationkey].value;
					} else {
						var lk = locationColorsLockup[tableTriageLocationkey];
						s = statsPatientsLocation[tableTriageLocationkey] = {
							value: 1,
							color: lk[0],
							label: lk[1]
						};
						finalStatsPatientsLocation.push(s);
					}
				}

				if (statsPatients.hasOwnProperty(triage_status)) {
					++statsPatients[triage_status].value;
				} else {
					s = statsPatients[triage_status] = {
						value: 1,
						color: triageColorsLockup[triage_status] || triage_status,
						label: triage_status,
					};
					finalStatsPatients.push(s);
				}
			}
		});

		finalStatsPatients.sort((a, b) => a.label > b.label ? 1 : -1);

		var i, l;
		for (i = 0, l = finalStatsPatients.length; i < l; ++i) {
			patientsChart.addData(finalStatsPatients[i], undefined, true);
		}
		for (i = 0, l = finalStatsPatientsLocation.length; i < l; ++i) {
			patientsLocationChart.addData(finalStatsPatientsLocation[i], undefined, true);
		}

		patientsChart.reflow();
		patientsChart.update();

		patientsLocationChart.update();
		patientsLocationChart.update();

		$scope.nbPatients = nbPatients;
		$scope.tableStats = tableStats;

		if (!first) {
			$scope.$apply();
			setLayout();
		}
	};

	var checkObserver = (thing: ThingModel.Thing) => {
		if (itsa.patient(thing)) {
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


	$rootScope.$on('thingmodel.open', () => {
		computeSummary();
	});

	computeStats(true);
	computeSummary();
	thingModel.warehouse.RegisterObserver(observer);

	jwindow.resize(setLayout);

	$scope.$on('$destroy', () => {
		destroyed = true;
		jwindow.off('resize', setLayout);
		thingModel.warehouse.UnregisterObserver(observer);
		patientsChart.destroy();
		patientsLocationChart.destroy();
	});
	
	// Update the panel height after the layout initialization
    window.setImmediate(() => {
		if (destroyed) {
			return;
		}
		setLayout();
		masterMap.setVerticalTopMargin(0);
		masterMap.moveTo(jMapBody);
		setLayout();
		masterMap.disableMiniMap();
		masterMap.enableSituationOverview();
    });
});
