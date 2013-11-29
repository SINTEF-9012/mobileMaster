/// <reference path="./../references/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/yetAnotherPanelsLibrary/lib/yapl.d.ts" />
'use strict';

declare module L{
	export var MarkerClusterGroup;
}

interface Window {
	L_PREFER_CANVAS : boolean;
	canard:any;
}

declare var OSMBuildings;

angular.module('mobileMasterApp')
  .config(function(masterMapProvider : Master.MapConfig,
  	nodeMasterProvider : any) {
  	window.L_PREFER_CANVAS = true;
   	masterMapProvider.setOptions({
   		zoom: 13,
   		center: new L.LatLng(59.911111,  	10.752778),
   		zoomControl: false,
   		attributionControl: false,
   		maxZoom:18
   		})
   	.declareTileLayer({
		name: "test",
		iconPath:"/test",
		create: function() {
		    return new L.TileLayer('http://{s}.tiles.mapbox.com/v3/apultier.g98dhngl/{z}/{x}/{y}.png', {
		    	detectRetina:true,
		    	maxNativeZoom:17
			});
		}
  	})
  	.declareTileLayer({
  		name: "test2",
		iconPath:"/test",
		create: function() {
			return L.tileLayer.wms("http://opencache.statkart.no/gatekeeper/gk/gk.open?SERVICE=WMS",{
					name: 'topo2',
					layers: 'topo2',
					transparent: true,
					format: 'image/png',
					version: '1.1.1'
				});
		}
	})
	.setDefaultTileLayer("test");


    nodeMasterProvider.setConnection("ws://"+window.location.hostname+":8181");
  })
  .controller('MapCtrl', function ($scope, masterMap : Master.Map, nodeMaster : any) {

    var jMap = $('#map');

    jMap.append(masterMap.getContainer());

    var layout = new yetAnotherPanelsLibrary($('#main'), {
        autoHideOnClose: true,

        // mainPanelMask:true,
        preventDefault:false 
	});


var panelOpen = false;
layout.setTopPanel($('#top-menu'), true, function() {
console.log("cool open");
// map.dragging.disable();
// map.touchZoom.disable();
// map.doubleClickZoom.disable();
// map.scrollWheelZoom.disable();
// map.boxZoom.disable();
// map.keyboard.disable();
// map.tap&&map.tap.disable();
panelOpen = true;
        },
function() {
        console.log("cool close");
panelOpen = false;

// map.dragging.enable();
// map.touchZoom.enable();
// map.doubleClickZoom.enable();
// map.scrollWheelZoom.enable();
// map.boxZoom.enable();
// map.keyboard.enable();
// map.tap&&map.tap.enable();
}
        )
        // .updateView();

        window.canard = layout;

    // masterMap.invalidateSize({});
       // layout.showTopPanel();
       layout.updateView();
       window.setTimeout(function() {
	   	masterMap.invalidateSize({});
       	// layout.showTopPanel();
       }, 1);

    var nbTouchs = 0, lastTouchMove = 0, touchEnabled = true;
	$('#map .map').on('touchstart pointerdown', function(e) {
        ++nbTouchs;
        console.log(nbTouchs);
        if (nbTouchs == 3) {
                e.preventDefault();
                if (touchEnabled) {

touchEnabled = false;
masterMap.dragging.disable();
masterMap.touchZoom.disable();
masterMap.doubleClickZoom.disable();
masterMap.scrollWheelZoom.disable();
masterMap.boxZoom.disable();
masterMap.keyboard.disable();
masterMap.tap&&masterMap.tap.disable();
                }
                // layout.mainPanelMask.show();
                // $('#wrapper').trigger('touchstart');
                // $('#wrapper').trigger('touchstart');
                // $('#wrapper').trigger('touchstart');
        }
}).on('touchend pointerup', function(e) {
        if (nbTouchs) {
                --nbTouchs;
        }
        console.log(nbTouchs);
        if (nbTouchs == 2) {
                e.preventDefault();
                if (!touchEnabled) {
                        touchEnabled = true
masterMap.dragging.enable();
masterMap.touchZoom.enable();
masterMap.doubleClickZoom.enable();
masterMap.scrollWheelZoom.enable();
masterMap.boxZoom.enable();
masterMap.keyboard.enable();
masterMap.tap&&masterMap.tap.enable();
                }
                // layout.mainPanelMask.hide();
        }
}).on('touchmove pointermove', function() {
        lastTouchMove = +new Date();
});

window.setInterval(function(){
        if ((+new Date()) - lastTouchMove > 500) {
                nbTouchs = 0;
if (!touchEnabled) {

        masterMap.dragging.enable();
masterMap.touchZoom.enable();
masterMap.doubleClickZoom.enable();
masterMap.scrollWheelZoom.enable();
masterMap.boxZoom.enable();
masterMap.keyboard.enable();
masterMap.tap&&masterMap.tap.enable();
}
        }
}, 500);



   	// $scope.map = map;
    // var openStreetMapLayer = new L.TileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        // attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    // });
    // openStreetMapLayer.addTo(map);
    // var openStreetMapLayer = new L.TileLayer('http://{s}.tiles.mapbox.com/v3/apultier.g98dhngl/{z}/{x}/{y}.png', {
    // });
    // openStreetMapLayer.addTo(map);

  	// L.tileLayer.wms("http://openwms.statkart.no/skwms1/wms.topo2",{
  	// 	layers: 'topo2_WMS',
  	// 	transparent: true,
  	// 	format: 'image/png',
  	// 	version: '1.1.1'
  	// }).addTo(map);


  	var MyCustomLayer = L.Class.extend({

	    initialize: function (latlng) {
	        // save position of the layer or any options from the constructor
	        this._latlng = latlng;
	    },

	    onAdd: function (map : L.Map) {
	        this._map = map;

	        // create a DOM element and put it into one of the map panes
	        this._el = L.DomUtil.create('div', 'shadow-layer');
	        this._title = L.DomUtil.create('h1', '');
	        this._title.appendChild(document.createTextNode("Set your location"));
	        // map.getPanes().overlayPane.appendChild(this._el);
	        this._el.appendChild(this._title);
	        map.getContainer().appendChild(this._el);

	        // add a viewreset event listener for updating layer's position, do the latter
	        // map.on('viewreset move', this._reset, this);
	        //this._reset();
	    },

	    onRemove: function (map) {
	        // remove layer's DOM elements and listeners
	        // map.getPanes().overlayPane.removeChild(this._el);
	        map.off('viewreset move', this._reset, this);
	    },

	    _reset: function () {
	        // update layer's position
	        //var pos = this._map.latLngToLayerPoint(this._latlng);
	        //L.DomUtil.setPosition(this._el, pos);
	        L.DomUtil.setPosition(this._el, this._map.latLngToLayerPoint(this._map.getCenter()));
	    }
	});
	// masterMap.addLayer(new MyCustomLayer([0,0]));

	var cluster = new L.MarkerClusterGroup({
		disableClusteringAtZoom: 18,
		spiderfyOnMaxZoom:false,
		showCoverageOnHover: false});
	var markers : {[key: string] : L.Marker} = {};

	var cpt = 0;
	$scope.$watch('patients', function(patients: {[ID: string] : NodeMaster.IPatientModel}) {
		// cluster.clearLayers();

		var update = ++cpt === 60;

		if (update) {
			cpt = 0;
			cluster.clearLayers();	
		}
		angular.forEach(patients, function(patient : NodeMaster.IPatientModel, ID:string) {
			var location = new L.LatLng(patient.Location.lat,patient.Location.lng);
			if (markers[ID]) {
				// cluster.removeLayer(markers[ID]);
				markers[ID].setLatLng(location);
				if (update) {
					cluster.addLayer(markers[ID]);
				}
			} else {
				markers[ID] = new L.Marker(location);

				// markers[ID].addTo(masterMap);
				cluster.addLayer(markers[ID]);
			}

		});

	}, true);

	// masterMap.addLayer(cluster);

	// new OSMBuildings(masterMap)
	// 	.setStyle({
	// 		wallColor:"rgb(106,131,136)",
	// 		roofColor:"rgb(176,189,195)"
	// 		})
	// 	.loadData();
  });
