/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
'use strict';

angular.module('mobileMasterApp')
	.controller('LayersCtrl', function ($scope: MasterScope.Root, $state,
	    persistentLocalization : PersistentLocalization,
		masterMap: Master.Map) {

    // Register the layers into the scope
    $scope.layers = masterMap.getTilesLayers();

    $scope.layerClick = function(layer : MasterScope.Layer) {

        if (!layer.active) {
            angular.forEach($scope.layers, function(iLayer: MasterScope.Layer){
                masterMap.hideTileLayer(iLayer.name);
            });

            masterMap.showTileLayer(layer.name);
            persistentLocalization.saveCurrentLayer(layer);
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
    // TODO ugly bootstrap-switch integration with angular-js
//    $('.buildings-switch').bootstrapSwitch().on('switch-change', function(e, data) {
//        $scope.buildings = data.value;
//        $scope.$apply(); 
//    });
	// var selectFunction = function() {
	// 	alert(this);
	// }

	// var removeOtherLayers = function(currentLayer) {
	// 	$scope.layers.forEach(function(layer) {
	// 		// TODO doesn't work
	// 		if (currentLayer != layer && layer.leafletLayer) {
	// 			console.log("remove");
				
	// 			$scope.map.removeLayer(layer.leafletLayer);
	// 		}
	// 	});	
	// }

	// $scope.layers = masterMap.getTilesLayers();

	// $scope.layers.push({
	// 	name: "test",
	// 	iconPath:"/test",
	// 	select: function() {
	// 		if (!this.leafletLayer) {
	// 		    this.leafletLayer = new L.TileLayer('http://{s}.tiles.mapbox.com/v3/apultier.g98dhngl/{z}/{x}/{y}.png', {
	// 		    });
	// 		}
	// 	    removeOtherLayers(this);
	// 	    $scope.map.addLayer(this.leafletLayer);
	// 	    $state.go('^');
	// 	}
	// });

	// $scope.layers.push({
	// 	name: "test",
	// 	iconPath:"/test",
	// 	select: function() {
	// 		if (!this.leafletLayer) {
	// 		    this.leafletLayer = L.tileLayer.wms("http://openwms.statkart.no/skwms1/wms.topo2",{
	// 				layers: 'topo2_WMS',
	// 				transparent: true,
	// 				format: 'image/png',
	// 				version: '1.1.1'
	// 			})
	// 		}
	// 	    removeOtherLayers(this);
	// 	    $scope.map.addLayer(this.leafletLayer);

	// 	    $state.go('^');
	// 	}
	// });

	// // $scope.layers[0].select();

	// $(masterMap.getContainer()).one("click", function() {
	// 	$scope.closeLayerList();
	// });



	// $scope.closeLayerList = function(){
	// 	$state.go("^");
	// }

	// $scope.layers = masterMap.getTilesLayers();


});