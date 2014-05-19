/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="./../../bower_components/PruneCluster/PruneCluster.ts" />
/// <reference path="./../../bower_components/PruneCluster/LeafletAdapter.ts" />
/// <reference path="./../references/Touch.d.ts" />
/// <reference path="./../references/NodeMaster.d.ts" />
/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../references/app.d.ts" />
/// <reference path="./../masterScope.d.ts" />
'use strict';

// Module configuration
angular.module('mobileMasterApp')
.config((masterMapProvider : Master.MapConfig) => {
    masterMapProvider.setOptions({
        zoom: 13,
        center: new L.LatLng(59.911111,  	10.752778),
        zoomControl: false,
        attributionControl: false,
//        maxZoom:20,
        keyboard:false
    })
    .declareTileLayer({
        name: "MapBox",
        iconPath:"layer_mapbox.png",
        create: () => {
            return new L.TileLayer('https://{s}.tiles.mapbox.com/v3/apultier.gefc9emp/{z}/{x}/{y}.png', {
                detectRetina:true,
                maxNativeZoom:17
            });
        }
    })
    .declareTileLayer({
        name: "MapBoxBlue",
        iconPath:"layer_mapbox_blue.png",
        create: () => {
            return new L.TileLayer('https://{s}.tiles.mapbox.com/v3/apultier.g98dhngl/{z}/{x}/{y}.png', {
                detectRetina:true,
                maxNativeZoom:17
            });
        }
	})
    .declareTileLayer({
        name: "MapBox Grey",
        iconPath:"layer_mapbox_grey.png",
        create: () => {
            return new L.TileLayer('https://{s}.tiles.mapbox.com/v3/apultier.goh7k5a1/{z}/{x}/{y}.png', {
                detectRetina:true,
                maxNativeZoom:17
            });
        }
    })
    .declareTileLayer({
        name: "StatKart",
        iconPath:"layer_no_topo2.png",
        create: () => {
			return new L.TileLayer('http://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?' +
				'layers=topo2&zoom={z}&x={x}&y={y}', {
                subdomains: ['', '2', '3'],
                detectRetina:true,
                maxNativeZoom:18
            });
        }
    })
    .declareTileLayer({
        name: "StatKart Graatone",
        iconPath:"layer_no_topo2_graatone.png",
        create: () => {
			return new L.TileLayer('http://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?' +
				'layers=topo2graatone&zoom={z}&x={x}&y={y}', {
                subdomains: ['', '2', '3'],
                detectRetina:true,
                maxNativeZoom:18
            });
        }
    })
    .declareTileLayer({
        name: "StatKart sjo hovedkart",
        iconPath:"layer_no_hovedkart2.png",
        create: () => {
			return new L.TileLayer('http://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?' +
				'layers=sjo_hovedkart2&zoom={z}&x={x}&y={y}', {
                subdomains: ['', '2', '3'],
                detectRetina:true,
                maxNativeZoom:18
            });
        }
    })
    .declareTileLayer({
        name: "StatKart gruunkart",
        iconPath:"layer_no_gruunkart.png",
        create: () => {
			return new L.TileLayer('http://opencache{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?' +
				'layers=norges_grunnkart&zoom={z}&x={x}&y={y}', {
                subdomains: ['', '2', '3'],
                detectRetina:true,
                maxNativeZoom:18
            });
        }
    })
    .declareTileLayer({
        name: "Watercolor",
        iconPath:"layer_stamen.png",
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
        iconPath:"layer_bing.png",
        create: () => {
            return new L.BingLayer("AnpoY7-quiG42t0EvUJb3RZkKTWCO0K0g4xA2jMTqr3KZ5cxZrEMULp1QFwctYG9",{
             detectRetina:true
            });
        }
    })
    .setDefaultTileLayer("MapBox");

})
.controller('MapCtrl', function (
    $scope,
    masterMap : Master.Map,
    thingModel : any,
	$state: any,
    persistentLocalization : PersistentLocalization) {

    persistentLocalization.bindToMasterMap(masterMap);
    persistentLocalization.restorePersistentLayer();

		var jMap = $('#map');

    jMap.append(masterMap.getContainer());

	// Update the panel height after the layout initialization
	window.setImmediate(() => {
		masterMap.invalidateSize({});
	});

	var osm2 = new /*L.BingLayer("AnpoY7-quiG42t0EvUJb3RZkKTWCO0K0g4xA2jMTqr3KZ5cxZrEMULp1QFwctYG9", {
		detectRetina: true
	});*/ L.TileLayer('https://{s}.tiles.mapbox.com/v3/apultier.i0afp8bh/{z}/{x}/{y}.png', {
                detectRetina:true,
                maxNativeZoom:17
            });
	var miniMap = new L.Control.RTSMiniMap(osm2, { toggleDisplay: false }).addTo(masterMap);

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

	var cluster: PruneCluster.LeafletAdapter = new PruneClusterForLeaflet();
	cluster.Cluster.Size = 100;

	(<any>cluster).BuildLeafletMarker = (rawMarker: PruneCluster.Marker, location: L.LatLng) => {
		var id = rawMarker.data.ID;
		var marker = new L.Marker(location, { icon: masterMap.createMasterIconWithId(id, $scope), draggable: true });
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
				$state.go('main.thing.order', { id: id });
				marker.setLatLng(oldLatLng);
			} else {
				window.setImmediate(()=> {
					marker.setLatLng(oldLatLng);
				});
			}

		}).on('click', () => {
			$state.go('main.thing', { id: id });
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

		return marker;
	}

    var markersThings : {[ID: string] : PruneCluster.Marker} = {};

    var cpt = 0;

	var canChangePosition = true, updatePositionsAtEnd = false;

	var dragLineLatLng = [L.latLng(0, 0), L.latLng(0, 0)];
	var dragLine = L.polyline(dragLineLatLng, {'clickable': false });
	var onMap = false;

    // Manage markers
    function updatePatientsPositions() {
		miniMap.clear();

	    angular.forEach($scope.things, (thing: MasterScope.Thing, ID: string) => {

				if (!thing.visible) {
					return;
				}

				var loc = thing.location;
				if (!loc || isNaN(loc.x) || isNaN(loc.y)) {
					return;
				}

				var location = new L.LatLng(loc.x, loc.y);

				miniMap.addPoint(location, { r: 255 });

			if (markersThings[ID]) {
				markersThings[ID].position.lat = loc.x;
				markersThings[ID].position.lng = loc.y;
			} else {
				var m = new PruneCluster.Marker(loc.x, loc.y, {
					ID: ID
				});

			    cluster.RegisterMarker(m);
				markersThings[ID] = m;



			    }
		    });

			angular.forEach(markersThings, (marker: L.Marker, ID: string) => {
				var scopeThing = $scope.things[ID];
			    if (!scopeThing || !scopeThing.visible) {
					masterMap.removeLayer(marker);
				    delete markersThings[ID];
			    }
			});
		miniMap.render();
	    cluster.ProcessView();
    }

	masterMap.addLayer(cluster);

    $scope.$watch('things', function() {
		// TODO send an event when it's OK
		if (canChangePosition) {
            updatePatientsPositions();
        } else {
            updatePositionsAtEnd = true;
        }
    }, true);

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
	});

    masterMap.on('zoomstart markerdragstart', ()=> {
	    $('body').addClass("disable-markers-animations");
    }).on('zoomend markerdragend', (e) => {
	    if (drag === false || e.type === "markerdragend") {
		    $('body').removeClass("disable-markers-animations");
	    }
    });

    //masterMap.addLayer(cluster);


	var mousemove = (e: L.LeafletMouseEvent)=> {
	};

	window.lapin = masterMap;
	var throttledUpdate = null;
	masterMap.on('markerdragstart', (e: L.Marker) => {
		if (!e.marker) {
			return;
		}
		var mLatLng = e.marker.getLatLng();
		dragLineLatLng[0] = new L.LatLng(mLatLng.lat, mLatLng.lng);

		//		dragLine.redraw();
		//		masterMap.on('mousemove', mousemove);

	}).on('markerdragend', (e: L.Marker) => {
			//		masterMap.off('mousemove', mousemove);
			if (onMap) {
				masterMap.removeLayer(dragLine);
				onMap = false;
			}
	}).on('drag', () => {
		if (masterMap._renderer) {
			if (!throttledUpdate) {
				throttledUpdate = L.Util.throttle(masterMap._renderer._update, 100, masterMap._renderer);
			}

			throttledUpdate();
		}
	});


	masterMap.on('contextmenu', (e: L.LeafletMouseEvent) => {
		// TODO UGLY
		if (!$state.is('main.thing.order') && !$state.is('main.thing.edit')) {
			$state.go('main.add', e.latlng);
		}
	});

});
