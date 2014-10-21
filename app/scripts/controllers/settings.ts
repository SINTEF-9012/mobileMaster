/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />

/// <reference path="./../references/app.d.ts" />
/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../masterScope.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.controller('SettingsCtrl', (
		$scope: MasterScope.Settings,
		$http: ng.IHttpService,
		settingsService: SettingsService) => {

	$scope.thingModelUrl = settingsService.getThingModelUrl();
	$scope.clientName = settingsService.getClientName();
	$scope.mediaServerUrl = settingsService.getMediaServerUrl();

	$scope.$watch('thingModelUrl', (v) => {
		settingsService.setThingModelUrl(v);
	});

	$scope.$watch('clientName', (v) => {
		settingsService.setClientName(v);
	});

	$scope.$watch('mediaServerUrl', (v) => {
		settingsService.setMediaServerUrl(v);
	});

	$scope.reload = () => {
		// ui-router bypass
		(<any>window).location = "/";
	};

	function updateChannelsList() {
		var httpEndpoint = settingsService.getHttpThingModelUrl();
		var m = $scope.thingModelUrl.match(/^(wss?:\/\/[^\/]+)\/?/i);
		if (!m) {
			return;
		}
		var origin = m[1];
		$http.get(httpEndpoint + "/channels").success((data: any) => {

			_.each(data, (d: any, key) => {
				d.url = origin + key;
			});

			$scope.channels = data;
		});
	}

	updateChannelsList();
});
