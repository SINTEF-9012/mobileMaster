/// <reference path="./../references/angularjs/angular.d.ts" />
'use strict';

angular.module('mobileMasterApp').controller('LayersCtrl', function ($scope : Master.MasterScope, $state) {

	var selectFunction = function() {
		alert(this);
	}

	var removeOtherLayers = function(currentLayer) {
		$scope.layers.forEach(function(layer) {
			// TODO doesn't work
			if (currentLayer != layer && layer.leafletLayer) {
				console.log("remove");
				
				$scope.map.removeLayer(layer.leafletLayer);
			}
		});	
	}

	$scope.layers = [];

	$scope.layers.push({
		name: "test",
		iconPath:"/test",
		select: function() {
			if (!this.leafletLayer) {
			    this.leafletLayer = new L.TileLayer('http://{s}.tiles.mapbox.com/v3/apultier.g98dhngl/{z}/{x}/{y}.png', {
			    });
			}
		    removeOtherLayers(this);
		    $scope.map.addLayer(this.leafletLayer);
		    $state.go('^');
		}
	});

	$scope.layers.push({
		name: "test",
		iconPath:"/test",
		select: function() {
			if (!this.leafletLayer) {
			    this.leafletLayer = L.tileLayer.wms("http://openwms.statkart.no/skwms1/wms.topo2",{
					layers: 'topo2_WMS',
					transparent: true,
					format: 'image/png',
					version: '1.1.1'
				})
			}
		    removeOtherLayers(this);
		    $scope.map.addLayer(this.leafletLayer);

		    $state.go('^');
		}
	});

	// $scope.layers[0].select();


});