/// <reference path="./../references/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/yetAnotherPanelsLibrary/lib/yapl.d.ts" />
'use strict';

// Module configuration
angular.module('mobileMasterApp')
.config(function(masterMapProvider : Master.MapConfig, nodeMasterProvider : any) {
    // Leaflet global variable setting (ugly)
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
        name: "MapBoxBlue",
        iconPath:"layer_test.png",
        create: function() {
            return new L.TileLayer('http://{s}.tiles.mapbox.com/v3/apultier.g98dhngl/{z}/{x}/{y}.png', {
                detectRetina:true,
                maxNativeZoom:17
            });
        }
    })
    .declareTileLayer({
        name: "StatKart",
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
        name: "MapBox",
        iconPath:"layer_test3.png",
        create: function() {
            return new L.TileLayer('http://{s}.tiles.mapbox.com/v3/apultier.gefc9emp/{z}/{x}/{y}.png', {
                detectRetina:true,
                maxNativeZoom:17
            });
        }
    })
    .declareTileLayer({
        name: "Watercolor",
        iconPath:"layer_test5.png",
        create: function() {
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
        create: function() {
            return new L.BingLayer("AnpoY7-quiG42t0EvUJb3RZkKTWCO0K0g4xA2jMTqr3KZ5cxZrEMULp1QFwctYG9",{
             detectRetina:true
            });
        }
    })
    .setDefaultTileLayer("MapBoxBlue");

nodeMasterProvider.setConnection("ws://"+window.location.hostname+":8181");
})
.controller('MapCtrl', function ($scope, masterMap : Master.Map, nodeMaster : any, $state : any) {

    // TODO ugly bootstrap-switch integration with angular-js
    $('.buildings-switch').bootstrapSwitch().on('switch-change', function(e, data) {
        $scope.buildings = data.value;
        $scope.$apply(); 
    });

    var jMap = $('#map'),
        jScroller= $('#scroller'),
        scroller = jScroller.get(0);

    jMap.append(masterMap.getContainer());

    // Create Facebook rebound spring
    var springSystem = new rebound.SpringSystem();

    var spring = springSystem.createSpring();
    var springConfig = rebound.SpringConfig.fromQcTensionAndFriction(40, 3);
    spring.setSpringConfig(springConfig);
    spring.setCurrentValue(0);

    var layout = new yetAnotherPanelsLibrary($('#main'), {
        autoHideOnClose: true,

        // Connect the iScroll bounce easing to the spring
        bounceEasing: {
            'style':'',
            fn: function(k) {
                if (k === 0) {
                    spring.setCurrentValue(0);
                    spring.setEndValue(1);
                }

                return spring.getCurrentValue();
            }
        },
        animationDuration: 1000,
        bounceTime: 1000,
        snapSpeed: 1000
    });


    var panelOpen = false;
   
    var topMenu = $('#top-menu');

    // Set a minimum height
    topMenu.height(Math.max(topMenu.children().innerHeight(), 100));
    layout.updateView();
  
    layout.setTopPanel(topMenu, true,
        function() {
            $state.go('map.layers');
            panelOpen = true;
        },
        function() {
            $state.go('^');
            panelOpen = false;
        });

    // Connect ui-router events
    $scope.$on('layers_enter', function() {
        layout.showTopPanel();
    });

    $scope.$on('layers_exit', function() {
        layout.showMainPanel();
    });


    // If the application is loaded with the panel openned
    if ($state.is('map.layers')) {
        layout.showTopPanel();
        panelOpen = true;
    }

    // Update the panel height after the layout initialization
    window.setTimeout(function() {
        masterMap.invalidateSize({});
        layout.updateView();
        topMenu.height(Math.max(topMenu.children().innerHeight(), 100));
        layout.updateView();
    }, 1);


    // Update the panel height when the layout change
    $(window).resize(function() {
        window.setTimeout(function() {
            topMenu.height(Math.max(topMenu.children().innerHeight(), 100));
            layout.updateView();
        },1);
    });


    // Manage the 3 fingers drag and drop
    var mapEnabled = true;

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

    // TODO Change position layer
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

    // Cluster for markers (best performances)
    var cluster = new L.MarkerClusterGroup({
        disableClusteringAtZoom: 18,
        spiderfyOnMaxZoom:false,
        showCoverageOnHover: false
    });

    var markers : {[key: string] : L.Marker} = {};

    var cpt = 0;

    var canChangePosition = true, updatePositionsAtEnd = false;

    // Manage markers

    function updatePatientsPositions() {
        // TODO reset every 60 iterations
        var update = ++cpt === 60;

        if (update) {
            cpt = 0;
            cluster.clearLayers();	
        }

        angular.forEach($scope.patients, function(patient : NodeMaster.IPatientModel, ID:string) {

            var location = new L.LatLng(patient.Location.lat,patient.Location.lng);
           
            if (markers[ID]) {
                markers[ID].setLatLng(location);

                if (update) {
                    cluster.addLayer(markers[ID]);
                }
            } else {
                markers[ID] = new L.Marker(location);

                cluster.addLayer(markers[ID]);
            }
        });
    }

    $scope.$watch('patients', function() {
        // TODO send an event when it's OK
        if (canChangePosition) {
            updatePatientsPositions();
        } else {
            updatePositionsAtEnd = true;
        }
    }, true);

    masterMap.on('movestart zoomstart', function() {
        canChangePosition = false;
    }).on('moveend zoomend', function() {
        // canChangePosition = true;
        window.setTimeout(function() {
            canChangePosition = true;

            if (updatePositionsAtEnd) {
                updatePatientsPositions();
            }
        }, 222);
    });

    var hackLayout = <any>layout;
    hackLayout.iscroll.on('scrollEnd', function() {
        canChangePosition = true;
    });
    hackLayout.iscroll.on('scrollStart', function() {
        canChangePosition = false;
        
        if (updatePositionsAtEnd) {
            updatePatientsPositions();
        }
    });

    masterMap.addLayer(cluster);

    // Register the layers into the scope
    $scope.layers = masterMap.getTilesLayers();

    $scope.layerClick = function(layer : MasterScope.Layer) {

        if (!layer.active) {
            angular.forEach($scope.layers, function(iLayer: MasterScope.Layer){
                masterMap.hideTileLayer(iLayer.name);
            });

            masterMap.showTileLayer(layer.name);
        }
    };

    // Manage special buildings layer (it can be used with every other layers)
    var buildings = null;
    $scope.$watch('buildings', function(value) {
        console.log("buildings", value);

        if (value) {
            if (buildings) {
                masterMap.addLayer(buildings);
            } else {
                buildings = new OSMBuildings(masterMap).setStyle({
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


});
