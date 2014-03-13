/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="./../references/Touch.d.ts" />
/// <reference path="./../references/NodeMaster.d.ts" />
/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../references/app.d.ts" />
/// <reference path="./../masterScope.d.ts" />
'use strict';

// Module configuration
angular.module('mobileMasterApp')
.config(function(masterMapProvider : Master.MapConfig, nodeMasterProvider : any) {
    masterMapProvider.setOptions({
        zoom: 13,
        center: new L.LatLng(59.911111,  	10.752778),
        zoomControl: false,
        attributionControl: false,
        maxZoom:18,
        keyboard:false
    })
    .declareTileLayer({
        name: "MapBoxBlue",
        iconPath:"layer_test.png",
        create: () => {
            return new L.TileLayer('http://{s}.tiles.mapbox.com/v3/apultier.g98dhngl/{z}/{x}/{y}.png', {
                detectRetina:true,
                maxNativeZoom:17
            });
        }
    })
    .declareTileLayer({
        name: "StatKart",
        iconPath:"layer_test2.png",
        create: () => {
            return <L.TileLayer><any> L.tileLayer.wms("http://opencache.statkart.no/gatekeeper/gk/gk.open?SERVICE=WMS",{
                name: 'topo2',
                layers: 'topo2',
                transparent: true,
				detectRetina:true,
                format: 'image/png',
                version: '1.1.1'
            });
        }
    })
    .declareTileLayer({
        name: "MapBox",
        iconPath:"layer_test3.png",
        create: () => {
            return new L.TileLayer('http://{s}.tiles.mapbox.com/v3/apultier.gefc9emp/{z}/{x}/{y}.png', {
                detectRetina:true,
                maxNativeZoom:17
            });
        }
    })
    .declareTileLayer({
        name: "MapBox Grey",
        iconPath:"layer_test4.png",
        create: () => {
            return new L.TileLayer('http://{s}.tiles.mapbox.com/v3/apultier.goh7k5a1/{z}/{x}/{y}.png', {
                detectRetina:true,
                maxNativeZoom:17
            });
        }
    })
    .declareTileLayer({
        name: "Watercolor",
        iconPath:"layer_test5.png",
        create: () => {
            return new L.TileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
                subdomains: ['a', 'b', 'c', 'd'],
                detectRetina:true,
                minZoom: 3,
                maxZoom: 16
            });
        }
    })
    .declareTileLayer({
        name: "Bing",
        iconPath:"layer_test6.png",
        create: () => {
            return new L.BingLayer("AnpoY7-quiG42t0EvUJb3RZkKTWCO0K0g4xA2jMTqr3KZ5cxZrEMULp1QFwctYG9",{
             detectRetina:true
            });
        }
    })
    .setDefaultTileLayer("MapBoxBlue");

nodeMasterProvider.setConnection("ws://"+window.location.hostname+":8181");
})
.controller('MapCtrl', function (
    $scope,
    masterMap : Master.Map,
    thingModel : any,
	$state: any,
    persistentLocalization : PersistentLocalization,
    $compile : ng.ICompileService) {

    persistentLocalization.bindToMasterMap(masterMap);
    persistentLocalization.restorePersistentLayer();

		var jMap = $('#map');

    jMap.append(masterMap.getContainer());

	// Update the panel height after the layout initialization
	window.setImmediate(() => {
		masterMap.invalidateSize({});
	});

	var jwindow = $(window);

    // Manage the 3 fingers drag and drop
    var mapEnabled = true;

	$('#map .map').on('touchstart pointerdown', function (e) {
        var oe = <TouchEvent><any> e.originalEvent;

        if (oe.touches && oe.touches.length>= 3) {

            if (mapEnabled) {
                mapEnabled = false;
                masterMap.dragging.disable();
                masterMap.touchZoom.disable();
                masterMap.doubleClickZoom.disable();
                masterMap.scrollWheelZoom.disable();
                masterMap.boxZoom.disable();
                masterMap.keyboard.disable();
                masterMap.tap&&masterMap.tap.disable();
            }
        }
	    jwindow.trigger('leafletstart');
    }).on('touchend pointerup', function(e) {

        var oe = <TouchEvent><any> e.originalEvent;

        if (!mapEnabled && (!oe.touches || oe.touches.length < 3)) {
            mapEnabled = true;
            masterMap.dragging.enable();
            masterMap.touchZoom.enable();
            masterMap.doubleClickZoom.enable();
            masterMap.scrollWheelZoom.enable();
            masterMap.boxZoom.enable();
            masterMap.keyboard.enable();
            masterMap.tap&&masterMap.tap.enable();
		}
		jwindow.trigger('leafletend');
	});

	var jbody = $(document.body);

		masterMap.on('popupopen', () => {
		jbody.addClass('popup-transition');
	}).on('popupclose', () => {
		jbody.removeClass('popup-transition');
	});

		var popup = L.popup({ closeButton: false, offset: L.point(0,-3) });
		popup._thingID = null;
		popup._initLayout();
		popup._container.addEventListener('click', (e) => {
			$state.go('main.thing', { id: popup._thingID });
		});

    // Cluster for markers (best performances)
    /*var cluster = new L.MarkerClusterGroup({
        disableClusteringAtZoom: 14,
        spiderfyOnMaxZoom:false,
        showCoverageOnHover: false
    });*/

    var markersThings : {[ID: string] : L.Marker} = {};

    var cpt = 0;

	var canChangePosition = true, updatePositionsAtEnd = false;

	var dragLineLatLng = [L.latLng(0, 0), L.latLng(0, 0)];
	var dragLine = L.polyline(dragLineLatLng, {'clickable': false });
	var onMap = false;

    // Manage markers
    function updatePatientsPositions() {
        // TODO reset every 60 iterations
        var update = ++cpt === 60000;

        if (update) {
			cpt = 0;
			//cluster.clearLayers();	
        }

	    angular.forEach($scope.things, (thing: MasterScope.Thing, ID: string) => {

				var loc = thing.location;
				if (!loc || isNaN(loc.x) || isNaN(loc.y)) {
					return;
				}
			    var location = new L.LatLng(loc.x, loc.y);

			    if (markersThings[ID]) {
					markersThings[ID].setLatLng(location);

					if (popup._thingID === ID) {
						popup.setLatLng(location);

						if (popup.getContent() !== thing.name) {
							popup.setContent(thing.name);
						}
						popup.update();
					}

					//.getPopup()/*.setLatLng(location)*/.setContent(thing.name).update();

				    if (update) {
						//cluster.addLayer(markersThings[ID]);
						masterMap.addLayer(markersThings[ID]);
					}
				} else {
				    var type = thing.typeName;
					var typeCss = type.replace(/[\s:]/g, '-');

					var iconClassName = 'thing-icon thing-icon-' + typeCss;
				    var size = 40;

					var triage = thing.triage_status;
					if (triage) {
						iconClassName += ' triage-' + triage;
						size = 28;
					}

					// TODO small temporal hack
					if (type === "ESS14:vehicle:wheeled") {
						type = "master:resource:fire-and-rescue-vehicle";
					}

					var parsing = type.match(/^master\:([^:]+)\:([^:]+)$/);
					if (parsing) {
						var resourceElement = angular.element('<master-icon category="' +
								parsing[1].replace(/-/g, ' ')
								+ '" type="' +
								parsing[2].replace(/-/g, ' ')
								+'"></master-icon>');
						var resourceElement2 = $compile(resourceElement)($scope);
					} else {
						iconClassName += " thing-icon-standard";
					}
					var icon = L.divIcon({
						className: iconClassName,
						iconSize: new L.Point(size, size),
						iconAnchor: new L.Point(size/2, size/2),
						html: resourceElement2 ?  '<master-icon>'+resourceElement2.html()+'</master-icon>' : ''
					});

					var marker = new L.Marker(location, { icon: icon, draggable: true });
					//marker.bindPopup(thing.name, {closeButton: false});

					markersThings[ID] = marker;

					marker.on('dragstart', (e) => {
						e.marker = marker;
						var pos = marker.getLatLng();
						marker._oldLatLng = new L.LatLng(pos.lat, pos.lng);
						masterMap.closePopup();
						masterMap.fire('markerdragstart', e);
					}).on('dragend', (e) => {
						e.marker = marker;
						window.setImmediate(()=> {
							masterMap.fire('markerdragend', e);
						});

						var newLatLng = marker.getLatLng(),
							oldLatLng = marker._oldLatLng;

						var newProj = masterMap.project(newLatLng),
							oldProj = masterMap.project(oldLatLng);

						// Pythagore
						var distance = Math.sqrt((oldProj.x - newProj.x) * (oldProj.x - newProj.x) +
						(oldProj.y - newProj.y) * (oldProj.y - newProj.y)); 


						if (distance > 28) {
							masterMap.panTo(newLatLng);
							$state.go('main.thing.order', { id: ID });
							marker.setLatLng(oldLatLng);
						} else {
							window.setImmediate(()=> {
								marker.setLatLng(oldLatLng);
							});
						}

					}).on('click dblclick', () => {
						//window.setTimeout(() => {
						var body = $(document.body);
							body.addClass('disable-markers-animations');
							popup.setLatLng(marker.getLatLng());
							popup.setContent($scope.things[ID].name);
							popup.openOn(masterMap);
							popup._thingID = ID;
							body.removeClass('disable-markers-animations');
						//}, 200);
					}).on('dblclick', () => {
							$state.go('main.thing', { id: ID });
						}).on('drag', (e) => {
							var loc = marker.getLatLng();
							dragLineLatLng[1].lat = loc.lat;
							dragLineLatLng[1].lng = loc.lng;
							dragLine.setLatLngs(dragLineLatLng);
							if (!onMap) {
								dragLine.addTo(masterMap).bringToBack();
								onMap = true;
							}
						});

					//cluster.addLayer(markersThings[ID]);
					masterMap.addLayer(markersThings[ID]);
			    }
		    });

		    angular.forEach(markersThings, (marker: L.Marker, ID: string) => {
			    if (!$scope.things[ID]) {
					masterMap.removeLayer(marker);
					if (popup._thingID === ID) {
						masterMap.closePopup();
					}
				    delete markersThings[ID];
			    }
		    });
    }

    $scope.$watch('things', function() {
		// TODO send an event when it's OK
		if (canChangePosition) {
            updatePatientsPositions();
        } else {
            updatePositionsAtEnd = true;
        }
    }, true);

    var resourceElement = angular.element('<master-icon category="resource" type="fire and rescue vehicle"></master-icon>');
    var resourceElement2 = $compile(resourceElement)($scope);

    console.log(resourceElement2.html());

		var resourceIcon = L.divIcon({
        className: "resource-icon",
        html: '<master-icon>'+resourceElement2.html()+'</master-icon>'
    });

	var endTimeoutId = 0, drag = false;
	masterMap.on('movestart zoomstart markerdragstart', e=> {
		canChangePosition = false;

		if (e.type === "markerdragstart") {
			drag = true;
		}

		if (endTimeoutId) {
			window.clearTimeout(endTimeoutId);
			endTimeoutId = 0;
		}
	}).on('moveend zoomend markerdragend', e=> {
		if (!endTimeoutId) {
			if (drag === false || e.type === "markerdragend") {
				drag = false;
				endTimeoutId = window.setTimeout(()=> {
					endTimeoutId = 0;
					canChangePosition = true;

					if (updatePositionsAtEnd) {
						updatePatientsPositions();
					}
				}, 300);
			}
		}
		// }, 222);
	});

    masterMap.on('zoomstart markerdragstart', ()=> {

	    $('body').addClass("disable-markers-animations");
    }).on('zoomend markerdragend', function (e) {
	    if (drag === false || e.type === "markerdragend") {
		    $('body').removeClass("disable-markers-animations");
	    }
    });

    //masterMap.addLayer(cluster);


	var mousemove = (e: L.LeafletMouseEvent)=> {
	};

	masterMap.on('markerdragstart', (e: L.Marker) => {
		if (!e.marker) {
			return;
		}
		var mLatLng = e.marker.getLatLng();
		dragLineLatLng[0] = new L.LatLng(mLatLng.lat, mLatLng.lng);

//		dragLine.redraw();
//		masterMap.on('mousemove', mousemove);

	}).on('markerdragend', (e: L.Marker)=> {
//		masterMap.off('mousemove', mousemove);
		if (onMap) {
			masterMap.removeLayer(dragLine);
			onMap = false;
		}
	});

	masterMap.on('contextmenu', (e: L.LeafletMouseEvent) => {
		if (!$state.is('main.thing.order')) {
			$state.go('main.add', e.latlng);
		}
	});

    $scope.centerView = ()=> {
	    var bounds  = new L.LatLngBounds(null,null);

	    angular.forEach($scope.resources, function(resource : NodeMaster.ResourceStatusModel, ID:string) {
		    bounds.extend(L.latLng(resource.Location.lat, resource.Location.lng));
	    });

	    angular.forEach($scope.patients, function(patient : NodeMaster.IPatientModel, ID:string) {
		    bounds.extend(L.latLng(patient.Location.lat, patient.Location.lng));
	    });

	    // alert(bounds.getCenter().toString())
	    masterMap.fitBounds(bounds);
    };
});
