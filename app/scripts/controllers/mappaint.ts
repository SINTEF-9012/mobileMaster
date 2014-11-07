/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-hotkeys/angular-hotkeys.d.ts" />

/// <reference path="./../references/app.d.ts" />
/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../masterScope.d.ts" />

'use strict';

// Module configuration
angular.module('mobileMasterApp')
	.config((AddServiceProvider: AddServiceConfig) => {

		var overlayType =
			ThingModel.BuildANewThingType.Named('master:imageoverlay:drawing')
				.WhichIs('A map drawing')
				.ContainingA.LocationLatLng("topleft")
				.AndA.LocationLatLng("bottomright")
				.AndA.String('url')
				.AndA.NotRequired.String('description')
				.AndA.NotRequired.DateTime('timestamp')
				.WhichIs('Creation date').Build();

		AddServiceProvider.defineType(overlayType);
	})
	.controller('MapPaintCtrl', (
	masterMap: Master.Map,
	notify: angularNotify,
	AddService: AddService,
	settingsService: SettingsService,
	$upload: any,
	cfpLoadingBar: any,
	$state: ng.ui.IStateService,
	hotkeys: ng.hotkeys.HotkeysProvider,
	$scope: ng.IScope
		) => {

	var jMap = $('#map');
	masterMap.moveTo(jMap);

	var switchControl = new MapPaint.SwitchControl();


	window.setImmediate(() => {
		masterMap.disableMiniMap();
		masterMap.addControl(switchControl);

		switchControl._container.onclick = () => {
			mapPaint.disable();
			$state.go('map.slidder');
		};
	});

	var mapPaint = (<any>masterMap).MapPaint;	

	var preciseRound = (value: number, precision: number) => +value.toFixed(precision);

	mapPaint.enable();
	mapPaint.saveMethod = (image: string, bounds: L.LatLngBounds) => {
		var mapOverlay = L.imageOverlay(image, bounds);
		mapOverlay.addTo(masterMap);	

		var saveDate = new Date();
		var blobBin = atob(image.split(',')[1]);
		var array = [];
		for (var i = 0; i < blobBin.length; i++) {
			array.push(blobBin.charCodeAt(i));
		}
		var file = new Blob([new Uint8Array(array)], { type: 'image/png' });
			
		$upload.upload({
			url: settingsService.getMediaServerUrl() + '/upload',
			fileName: 'master-imageoverlay-drawing.png',
			file: file
		}).progress((e) => {
			cfpLoadingBar.set(e.loaded / e.total);
		}).success((data) => {
			var url = settingsService.getMediaServerUrl() + '/'
				+ data.hash + '.' + data.extension;

			AddService.register("master:imageoverlay:drawing", null, (thing: ThingModel.ThingPropertyBuilder) => {
				var northWest = bounds.getNorthWest(),
					southEast = bounds.getSouthEast();

				thing.String('url', url);
				thing.DateTime('timestamp', saveDate);
				thing.Location("topleft",
					new ThingModel.Location.LatLng(
						preciseRound(northWest.lat, 8), preciseRound(northWest.lng, 8)));
				thing.Location("bottomright",
					new ThingModel.Location.LatLng(
						preciseRound(southEast.lat, 8), preciseRound(southEast.lng, 8)));
			});
			masterMap.removeLayer(mapOverlay);
			notify({ message: "Drawing saved", classes: "alert-info" });
		}).error(() => {
			notify({ message: "Sorry, an error occured while uploading the drawing", classes: "alert-danger" });
		}).then(() => {
			cfpLoadingBar.complete();
		});

		$state.go('map.slidder');
	};

	hotkeys.bindTo($scope)
		.add({
			combo: 'alt+s',
			description: 'Save drawing and go to the map view',
			callback: () => {
				var pencil = mapPaint.pencil;
				pencil.SavePicture(masterMap, (image, bounds) => {
					mapPaint.saveMethod(image, bounds);
				});
			}
		});

	$scope.$on('$destroy', () => {
		mapPaint.disable();
		window.setImmediate(() => {
			masterMap.moveTo(jMap);
			masterMap.removeControl(switchControl);
			masterMap.enableMiniMap();
		});
	});
});
