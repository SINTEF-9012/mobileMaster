/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

'use strict';
angular.module('mobileMasterApp')
.config(function(KnowledgeProvider: any) {
	KnowledgeProvider.addKnowledge({
		typeName: /minecraft/,
		tablePropertiesOrder: { healt: 6, pitch: 1 }
	});
})
.controller('MainCtrl', (
	$rootScope,
	$scope,
	thingModel,
	$timeout: ng.ITimeoutService,
	$stateParams,
	masterMap:Master.Map,
	Knowledge) => {

	var jwindow = $(window);
	$rootScope.$on('$viewContentLoaded', ()=> {
		jwindow.trigger('resize');
	});

	$scope.thingType = $stateParams.thingtype;

	// Create an array of things because angular can only sort arrays
	$scope.$watch('types[thingType]', (newValue) => {
		var array = [];

		if (newValue && newValue.things) {
			angular.forEach(newValue.things, (value) => {
				array.push(value);
			});
		}

		$scope.arrayThings = array;
		jwindow.trigger('resize');

//		$scope.$digest();
	});
	
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
