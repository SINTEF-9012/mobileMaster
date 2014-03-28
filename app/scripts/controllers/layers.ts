/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
'use strict';

angular.module('mobileMasterApp')
	.controller('LayersCtrl', (
		$rootScope:MasterScope.Root,
		$scope,
	    persistentLocalization : PersistentLocalization,
		masterMap: Master.Map) => {

    // Register the layers into the scope
    $scope.layers = masterMap.getTilesLayers();

    $scope.layerClick = (layer : MasterScope.Layer) => {

        if (!layer.active) {
            angular.forEach($scope.layers, (iLayer: MasterScope.Layer) => {
                masterMap.hideTileLayer(iLayer.name);
            });

            masterMap.showTileLayer(layer.name);
            persistentLocalization.saveCurrentLayer(layer);
        }
	};

	$scope.centerView = () => {

		var bounds = new L.LatLngBounds(null, null);

		angular.forEach($scope.things, (thing: MasterScope.Thing)=> {
			var loc = thing.location;
			if (!loc || isNaN(loc.x) || isNaN(loc.y)) {
				return;
			}

			bounds.extend(new L.LatLng(loc.x, loc.y));
		});

		masterMap.fitBounds(bounds.pad(1.1));
	};
    


});