/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="./../../bower_components/a99d99f275e5c274a6ba/SuperSimpleCharts.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/marked/marked.d.ts" />
/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../references/app.d.ts" />
/// <reference path="./../masterScope.d.ts" />

angular.module('mobileMasterApp')
.config((masterMapProvider: Master.MapConfig) => {
    masterMapProvider.setOptions({
            zoom: 13,
            center: new L.LatLng(59.911111, 10.752778),
            zoomControl: false,
            attributionControl: false,
            maxZoom:20,
            keyboard: false
        })
        .declareTileLayer({
            name: "MapBox",
            iconPath: "layer_mapbox.png",
			create: () => {
                return new L.TileLayer('https://{s}.tiles.mapbox.com/v3/apultier.gefc9emp/{z}/{x}/{y}.png', {
                    detectRetina: true,
					reuseTiles: true,
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
                    maxNativeZoom: 18
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
                    maxNativeZoom: 17
                });
            }
        })
        .setDefaultTileLayer("MapBox");

	marked.setOptions({
		gfm: true,
		tables: true,
		breaks: true
	});

})
.controller('MainCtrl', function(
	masterMap: Master.Map,
	$scope,
	$rootScope,
	$window: ng.IWindowService,
	$sce: ng.ISCEService,
    persistentLocalization : PersistentLocalization,
    itsa : ThingIdentifierService,
    thingModel: ThingModelService) {

	$rootScope.bodyClass = 'main-dashboard';

	var jMap = $('#main-map'),
		jlink = $('#main-map-link'),
		jChat = $('#main-chat'),
		jMediablock = $('#main-mediablock'),
		jTimeline = $('#main-timeline'),
		jChatScrollarea = jChat.find('.chat-area').get(0);

	persistentLocalization.restorePersistentLayer(masterMap);
	persistentLocalization.unbindMasterMap(masterMap);

    masterMap.disableInteractions();
    masterMap.disableMiniMap();
    masterMap.disableScale();


	var jwindow = $($window);
	var setLayout = throttle(() => {

		var column = $('.responsive-infoblock-column'),
			blocs = column.children('.infoblock'),
			height = jwindow.height() - column.offset().top - 6;

		blocs.height(Math.min(blocs.first().innerWidth(), Math.floor(height / (blocs.length / 3))));

		var mediablockHeight = jMediablock.outerHeight();

		var mapHeight = Math.max(Math.floor(height - mediablockHeight - 12), 300);
		jMap.height(mapHeight);
		jChat.height(mapHeight - 8);
		jChatScrollarea.scrollTop = jChatScrollarea.scrollHeight;
		jTimeline.height(mediablockHeight - 12);

		window.setImmediate(() => {
			masterMap.invalidateSize({});
			jlink.height(mapHeight).width(jMap.width()).offset(jMap.offset());
		});
	}, 100);


	var statsVictims: { [color: string]: number }, nbVictims = 0;
	var victimsChart = new SuperSimpleCharts.BarChart(document.getElementById('victims-chart'));

	var checkObserver = (thing: ThingModel.Thing) => {
		if (itsa.victim(thing)) {
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
		if (now - lastCall < interval) {
			workerTimeout = window.setTimeout(computeStatsWorker, interval);
			return;
		}

		computeStatsWorker(first);
	};

	var computeStatsWorker = (first?: boolean) => {
		nbVictims = 0;
		statsVictims = {};
		angular.forEach(thingModel.warehouse.Things, (thing: ThingModel.Thing) => {
			if (itsa.victim(thing)) {
				nbVictims += 1;

				var triage_status: string;
				if (!(triage_status = thing.GetString('triage_status'))) {
					triage_status = '#FF4B00';
				} else {
					triage_status = triage_status.toLowerCase();
					if (triage_status === 'yellow') {
						triage_status = '#EBC813';
					}
				}

				statsVictims[triage_status] = (statsVictims[triage_status] + 1) || 1;
			}
		});

		victimsChart.SetData(statsVictims);
		$scope.nbVictims = nbVictims;
		if (!first) {
			$scope.$apply();
			setLayout();
		}
	};


	var computeSummary = (first?: boolean) => {
		var summary = thingModel.warehouse.GetThing('master-summary');
		if (summary) {
			$scope.title = summary.GetString('title');
			var content = summary.GetString('content');
			$scope.htmlSummary = content ? $sce.trustAsHtml(marked(content)) : '';
		} else {
			$scope.title = 'Untitled situation';
			$scope.htmlSummary = '';//$sce.trustAsHtml('Default situation summary');
		}

		if (!first) {
			$scope.$apply();
			setLayout();
		}
	};

	computeStats(true);
	computeSummary(true);
	thingModel.warehouse.RegisterObserver(observer);

	$scope.$on('$destroy', () => {
		$rootScope.bodyClass = '';
		jwindow.off('resize', setLayout);
		thingModel.warehouse.UnregisterObserver(observer);
	});

	jwindow.resize(setLayout);

	// Update the panel height after the layout initialization
    window.setImmediate(() => {
		setLayout();
		masterMap.setVerticalTopMargin(0);
		masterMap.moveTo(jMap.get(0));
		setLayout();
		masterMap.enableSituationOverview();
	});
});
