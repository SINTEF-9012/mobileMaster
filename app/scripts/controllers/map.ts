/// <reference path="./../references/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/yetAnotherPanelsLibrary/lib/yapl.d.ts" />
'use strict';

angular.module('mobileMasterApp')
  .config(function(masterMapProvider : Master.MapConfig,
  	nodeMasterProvider : any) {

  	window.L_PREFER_CANVAS = true;

   	masterMapProvider.setOptions({
   		zoom: 13,
   		center: new L.LatLng(59.911111,  	10.752778),
   		zoomControl: false,
   		attributionControl: false,
   		maxZoom:18,
   		keyboard:false
   		})
   	.declareTileLayer({
		name: "test",
		iconPath:"layer_test.png",
		create: function() {
		    return new L.TileLayer('http://{s}.tiles.mapbox.com/v3/apultier.g98dhngl/{z}/{x}/{y}.png', {
		    	detectRetina:true,
		    	maxNativeZoom:17
			});
		}
  	})
  	.declareTileLayer({
  		name: "test2",
		iconPath:"layer_test2.png",
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
    .declareTileLayer({
    name: "test3",
    iconPath:"layer_test3.png",
    create: function() {
        return new L.TileLayer('http://{s}.tiles.mapbox.com/v3/apultier.gefc9emp/{z}/{x}/{y}.png', {
          detectRetina:true,
          maxNativeZoom:17
      });
    }
    })
    // .declareTileLayer({
    // name: "test4",
    // iconPath:"layer_test.png",
    // create: function() {
    //    return L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    //     attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    //   }); 
    // }
    // })
    .declareTileLayer({
    name: "test5",
    iconPath:"layer_test5.png",
    create: function() {
                return new L.TileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
          attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
          subdomains: ['a', 'b', 'c', 'd'],
          detectRetina:true,
          minZoom: 3,
          maxZoom: 16
        });
    }})

        .declareTileLayer({
    name: "test6",
    iconPath:"layer_test6.png",
    create: function() {

      return new L.BingLayer("AnpoY7-quiG42t0EvUJb3RZkKTWCO0K0g4xA2jMTqr3KZ5cxZrEMULp1QFwctYG9",{
        detectRetina:true
        });
      //  return L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      //   attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      // }); 
    }
    })
	.setDefaultTileLayer("test");


    nodeMasterProvider.setConnection("ws://"+window.location.hostname+":8181");
  })
  .controller('MapCtrl', function ($scope, masterMap : Master.Map, nodeMaster : any, $state : any) {

    var jMap = $('#map'), jScroller= $('#scroller'), scroller = jScroller.get(0);

    jMap.append(masterMap.getContainer());

   	var springSystem = new rebound.SpringSystem();

	var spring = springSystem.createSpring();
    var springConfig = rebound.SpringConfig.fromQcTensionAndFriction(40, 3);
    spring.setSpringConfig(springConfig);
    spring.setCurrentValue(0);

    var layout = new yetAnotherPanelsLibrary($('#main'), {
        autoHideOnClose: true,

        // mainPanelMask:true,
        // preventDefault:false,
        // bounceEasing: 'bounce',
        bounceEasing: {
        	'style':'',
        	fn: function(k) {
        		if (k === 0) {
        			spring.setCurrentValue(0);
        			spring.setEndValue(1);
        		}
        		// console.log(k);
        		
        		// return k*0.1;
        		return spring.getCurrentValue();
        	}
        },
        animationDuration: 1000,
        bounceTime: 1000,
        snapSpeed: 1000,
         // preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|BUTTON)$/, className: /^(canard_panel)$/ }
	});


var panelOpen = false;
var topMenu = $('#top-menu');
topMenu.height(Math.max(topMenu.children().innerHeight(), 100));
layout.setTopPanel(topMenu, true, function() {
console.log("cool open");

$state.go('map.layers');

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
$state.go('^');
panelOpen = false;

// map.dragging.enable();
// map.touchZoom.enable();
// map.doubleClickZoom.enable();
// map.scrollWheelZoom.enable();
// map.boxZoom.enable();
// map.keyboard.enable();
// map.tap&&map.tap.enable();
});

        // .updateView();
$scope.$on('layers_enter', function() {
  layout.showTopPanel();
});

$scope.$on('layers_exit', function() {
  layout.showMainPanel();
});

        window.canard = layout;

    // masterMap.invalidateSize({});
       // layout.showTopPanel();
       layout.updateView();

       if ($state.is('map.layers')) {
          layout.showTopPanel();
       }
       window.setTimeout(function() {
	   	masterMap.invalidateSize({});
topMenu.height(Math.max(topMenu.children().innerHeight(), 100));
        layout.updateView();
        // if (panelOpen)
       	// layout.showTopPanel();
       }, 1);


       $(window).resize(function() {
        window.setTimeout(function() {

topMenu.height(Math.max(topMenu.children().innerHeight(), 100));
        layout.updateView();
        // layout.showMainPanel();
          },1);
       });//.trigger('resize');

       var mapEnabled = true;

      // $('#map .map').on('pointerdown', function(e) {
      //   console.log(e.originalEvent);
      // }).on('pointerup', function(e) {
      //   console.log(e.originalEvent);
      // });

      $('#map .map').on('touchstart pointerdown', function(e) {
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
      });

//     var nbTouchs = 0, lastTouchMove = 0, touchEnabled = true, first = true;
// 	$('#map .map').on('touchstart pointerdown', function(e) {
//         ++nbTouchs;
//         console.log(nbTouchs);
//         if (nbTouchs == 3) {
//                 e.preventDefault();
//                 if (touchEnabled) {

// touchEnabled = false;
// masterMap.dragging.disable();
// masterMap.touchZoom.disable();
// masterMap.doubleClickZoom.disable();
// masterMap.scrollWheelZoom.disable();
// masterMap.boxZoom.disable();
// masterMap.keyboard.disable();
// masterMap.tap&&masterMap.tap.disable();
//                 }
//                 // layout.mainPanelMask.show();
//                 // $('#wrapper').trigger('touchstart');
//                 // $('#wrapper').trigger('touchstart');
//                 // $('#wrapper').trigger('touchstart');
//         }
// }).on('touchend pointerup', function(e) {
//         if (nbTouchs) {
//                 --nbTouchs;
//         }
//         console.log(nbTouchs);
//         if (nbTouchs == 2) {
//                 e.preventDefault();
//                 if (!touchEnabled) {
//                         touchEnabled = true
// masterMap.dragging.enable();
// masterMap.touchZoom.enable();
// masterMap.doubleClickZoom.enable();
// masterMap.scrollWheelZoom.enable();
// masterMap.boxZoom.enable();
// masterMap.keyboard.enable();
// masterMap.tap&&masterMap.tap.enable();
//                 }
//                 // layout.mainPanelMask.hide();
//         }
// }).on('touchmove pointermove', function() {
//         lastTouchMove = +new Date();
// });

// window.setInterval(function(){
//         if ((+new Date()) - lastTouchMove > 300) {
//           if (first) {
//             first = false;
//             return;
//           }
//                 nbTouchs = 0;
// if (!touchEnabled) {

//         masterMap.dragging.enable();
// masterMap.touchZoom.enable();
// masterMap.doubleClickZoom.enable();
// masterMap.scrollWheelZoom.enable();
// masterMap.boxZoom.enable();
// masterMap.keyboard.enable();
// masterMap.tap&&masterMap.tap.enable();
// }
//         }
// }, 300);



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

  $scope.layers = masterMap.getTilesLayers();

  $scope.layerClick = function(layer : MasterScope.Layer) {

    if (!layer.active) {
      angular.forEach($scope.layers, function(iLayer: MasterScope.Layer){

        masterMap.hideTileLayer(iLayer.name);
      });

      masterMap.showTileLayer(layer.name);
    }
  };
	// masterMap.addLayer(cluster);

  var buildings = null;
  $scope.$watch('buildings', function(value) {
    console.log("buildings", value);
    
    if (value) {
      if (buildings) {
        masterMap.addLayer(buildings);
      } else {
        buildings = new OSMBuildings(masterMap)
         .setStyle({
           wallColor:"rgb(106,131,136)",
           roofColor:"rgb(176,189,195)"
           })
         .loadData();
      }
    } else {
      if (buildings) {
        masterMap.removeLayer(buildings);
      }
    }
  });

  $('.buildings-switch').bootstrapSwitch().on('switch-change', function(e, data) {
    $scope.buildings = data.value;
    $scope.$apply(); 
    });


  });
