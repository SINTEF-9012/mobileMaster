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
	$scope.accessKey = settingsService.getAccessKey();
	$scope.mediaServerUrl = settingsService.getMediaServerUrl();
	$scope.rrdServerUrl = settingsService.getRrdServerUrl();
	$scope.almendeTimelineUrl = settingsService.getAlmendeTimelineUrl();
	$scope.almendeTimelineUsage = settingsService.getAlmendeTimelineUsage();

	$scope.$watch('thingModelUrl', (v) => {
		settingsService.setThingModelUrl(v);
	});

	$scope.$watch('clientName', (v) => {
		settingsService.setClientName(v);
	});

	$scope.$watch('accessKey',(v) => {
		settingsService.setAccessKey(v);
	});

	$scope.$watch('mediaServerUrl', (v) => {
		settingsService.setMediaServerUrl(v);
	});

	$scope.$watch('rrdServerUrl', (v) => {
		settingsService.setRrdServerUrl(v);
	});

	$scope.$watch('almendeTimelineUrl',(v) => {
		settingsService.setAlmendeTimelineUrl(v);
	});

	$scope.$watch('almendeTimelineUsage',(v) => {
		settingsService.setAlmendeTimelineUsage(v);
	});

	$scope.selectChannel = (channel) => {
		if (channel.secure && !$scope.accessKey) {
			var key = window.prompt("The channel \"" + channel.name + "\" requires an access key.");
			settingsService.setAccessKey(key);
		}
		settingsService.setThingModelUrl(channel.url);
		// ui-router bypass
		(<any>window).location = "/";
	};

	$scope.reload = () => {
		// ui-router bypass
		(<any>window).location = "/";
	};

	var origin;
	var parseChannelList = (data: any) => {
		_.each(data, (d: any, key) => {
			d.url = origin + key;
		});

		$scope.channels = data;
	};

	var updateChannelsList = () => {
		var httpEndpoint = settingsService.getHttpThingModelUrl();
		var m = $scope.thingModelUrl.match(/^(wss?:\/\/[^\/]+)\/?/i);
		if (!m) {
			return;
		}
		origin = m[1];

		$http.get(httpEndpoint + "/channels").success(parseChannelList).error(() => {

			var addr = window.hasOwnProperty('defaultThingModelUrl') ?
				window['defaultThingModelUrl'].replace(/^ws/i, "http") :
				"http://" + window.location.hostname + ":8083";
			$http.get(addr + "/channels").success(parseChannelList);
		});
	}

	updateChannelsList();
});
