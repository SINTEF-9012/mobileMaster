'use strict';

angular.module('mobileMasterApp')
	.controller('SettingsCtrl', (
		$scope: MasterScope.Settings,
		layout : any,
		settingsService: SettingsService) => {

	layout.disable();
	
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
});