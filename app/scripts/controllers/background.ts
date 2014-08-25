/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/moment/moment.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-hotkeys/angular-hotkeys.d.ts" />

/// <reference path="./../references/app.d.ts" />
/// <reference path="./../masterScope.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.controller('BackgroundCtrl', (
	$rootScope: MasterScope.Root,
	settingsService: SettingsService,
	$scope : MasterScope.Background,
	hotkeys: ng.hotkeys.HotkeysProvider,
	persistentMap: PersistentMap,
	masterMap: Master.Map) => {

	$scope.mediaServerUrl = settingsService.getMediaServerUrl();

	// Register the layers into the scope
	$scope.layers = masterMap.getTilesLayers();


	$scope.layerClick = (layer: MasterScope.Layer) => {

		if (!layer.active) {
			angular.forEach($scope.layers, (iLayer: MasterScope.Layer) => {
				masterMap.hideTileLayer(iLayer.name);
			});

			masterMap.showTileLayer(layer.name);
			persistentMap.saveCurrentLayer(layer);
		}
	};

	var date;

	var weatherLayer = null;
	$scope.enableWeatherLayer = (name: string) => {
		if (weatherLayer !== null) {
			masterMap.removeLayer(weatherLayer);
		}

		weatherLayer = L.tileLayer.wms("http://public-wms.met.no/verportal/verportal.map", {
			layers: name,
			format: 'image/png',
			transparent: true,
			retina: true,
			TIME: date
		});

		weatherLayer.addTo(masterMap);
		weatherLayer.bringToFront();
	};

	$scope.enableWeather = false;

	$scope.weatherLayers = [
		{ name: 'precipitation_3h_global', title: 'Clouds precipitation' },
		{ name: 'clouds_precipitation_regional', title: 'Clouds precipitation (Norway)' },
		{ name: 'radar_precipitation_intensity', title: 'Radar precipitation intensity (Norway)' },
		{ name: 'temperature_2m_global', title: 'Temperature' },
		{ name: 'temperature_2m_regional', title: 'Temperature (Norway)' },
		{ name: 'wind_10m_global', title: 'Wind' },
		{ name: 'wind_10m_regional', title: 'Wind (Norway)' },
		{ name: 'sea_temperature_regional', title: 'Sea temparture' },
		{ name: 'sea_current_regional', title: 'Sea current' },
		{ name: 'sea_wave_height_direction_regional', title: 'Sea wave' },
	];

	$scope.selectWeatherTime = (time) => {
		var now = moment();

		now.add('hours', time.add);

		date = now.format('YYYY-MM-DDThh:[00]Z');

		_.each($scope.weatherTime, (t: any) => {
			t.selected = false;
		});

		time.selected = true;
	};

	$scope.weatherTime = [
		{ name: 'Now', add: 0, selected: false },
		{ name: '+1h', add: 1, selected: false },
		{ name: '+3h', add: 3, selected: false },
		{ name: '+6h', add: 6, selected: false },
		{ name: '+12h', add: 12, selected: false },
		{ name: '+24h', add: 24, selected: false }
	];

	$scope.selectWeatherTime($scope.weatherTime[0]);

	hotkeys.bindTo($scope)
		.add({
			combo: '/',
			description: 'Weather (alpha)',
			callback: () => $scope.enableWeather = true
		});

	$scope.overlays = {};

	_.each(persistentMap.getHiddenOverlays(), (v) => {
		$scope.overlays[v] = false;
	});

	$scope.$watchCollection('overlays', (overlays) => {
		_.each(overlays, (v, key) => {
			if (v) {
				persistentMap.showOverlay(key);
			} else {
				persistentMap.hideOverlay(key);
			}
		});
	});
});
