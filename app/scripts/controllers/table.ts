/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

'use strict';
angular.module('mobileMasterApp')
.config(function(KnowledgeProvider: any) {
	KnowledgeProvider.addKnowledge({
		typeName: /minecraft/,
		tablePropertiesOrder: { healt: 6, pitch: 1 }
	});
})
.controller('TableCtrl', (
	$rootScope,
	$scope,
	thingModel,
	$timeout: ng.ITimeoutService,
	$stateParams,
	masterMap: Master.Map,
	settingsService: SettingsService,
	Knowledge) => {

	var jwindow = $(window);

	$scope.mediaServer = settingsService.getMediaServerUrl();

	$scope.thingType = $stateParams.thingtype;

	// Create an array of things because angular can only sort arrays
	var array = [];
	$scope.$watch('types[thingType].things', () => {
		array.length = 0;
		if ($scope.types && $scope.types[$scope.thingType]) {
			angular.forEach($scope.types[$scope.thingType].things, (value) => {
				array.push(value);
			});
		}

		$scope.arrayThings = array;
		jwindow.trigger('resize');

//		$scope.$digest();
	}, true);
	
	// Sort by the id ascending by default
	$scope.sortExpression = '+ID';
	$scope.sortPropertyKey = 'ID';
	$scope.sortDirection = '+';

	$scope.sortThings = (key: string) => {
		var direction = key == $scope.sortPropertyKey ?
			($scope.sortDirection === '+' ? '-' : '+') : '+';
		$scope.sortExpression = direction + key;
        $scope.sortDirection = direction;
        $scope.sortPropertyKey = key;
	}

	$scope.selectThing = (thing: MasterScope.Thing) => {
		if (!thing.location) {
			return;
        }
		var location = new L.LatLng(thing.location.x, thing.location.y);
		var pixels = masterMap.project(location);
		pixels.y -= $(window).scrollTop() / 2;
		masterMap.panTo(masterMap.unproject(pixels));
	};
});
