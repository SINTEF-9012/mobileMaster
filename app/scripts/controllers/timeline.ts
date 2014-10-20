/// <reference path="../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />

/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../references/app.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.controller('TimelineCtrl', (
		$scope,
		$http: ng.IHttpService,
		thingModel: ThingModelService,
		$rootScope : MasterScope.Root,
		$state: ng.ui.IStateService,
		settingsService: SettingsService) => {

	$scope.isLive = thingModel.IsLive();

	var server = settingsService.getThingModelUrl().replace(/^ws/i, "http");

	var timelineUrl = server + "/timeline?precision=60000";

	var maxDate = +new Date(),
		minDate = maxDate - 10000,
		diffDate = 10000; 

	$http.get(timelineUrl).success((data: any) => {

		var max = (<any>_.max(data, (d: any) => d.s)).s;
		minDate = (<any>_.first(data)).d;
		maxDate = (<any>_.last(data)).d;
		diffDate = maxDate - minDate;

		var gradient = "linear-gradient(to right";

		_.each(data, (d: any) => {
			var changesDiff = Math.round(d.s / max * 100);
			var timePosition = Math.round((d.d - minDate) / diffDate * 10000) / 100;
			d.timePosition = timePosition;
			d.s = changesDiff;
			gradient += ",hsl(210,"+(30+changesDiff/5)+"%,"+Math.min(d.s + 10, 80)+"%) "+timePosition+"%";
		});

		gradient += ")";
		$scope.gradient = gradient;
		$scope.data = data;
		$scope.sliderValue = $scope.isLive ? 1000 : Math.max(Math.round(($scope.lorie - minDate)/diffDate * 1000), 0);
	});

	$scope.lorie = +thingModel.CurrentTime();

	$scope.sliderValue = $scope.isLive ? 1000 : Math.max(Math.round(($scope.lorie - minDate)/diffDate * 1000), 0);

	$scope.$watch('date', (newValue, oldValue) => {
		if (newValue !== oldValue) {
			var r = (newValue - minDate) / diffDate * 1000;
			$scope.sliderValue = Math.round(r);
			$scope.isLive = false;
			$rootScope.pastSituation = true;
			$rootScope.situationDate = $scope.date;
		}
	});

	$scope.$watch('sliderValue', (newValue, oldValue) => {
		if (newValue !== oldValue) {
			var r = newValue / 1000;
			if (isNaN(r)) {
				r = maxDate;
			}
			var d = Math.round(r * diffDate + minDate);
			$scope.date = d;
		}
	});

	$scope.selectRecord = (record) => {
		$scope.date = record.d;

		$scope.isLive = false;
		if (!L.Browser.touch) {
			$state.go('main');
		}
	};

	$scope.live = () => {
		$scope.isLive = true;
		$state.go('main');

		$rootScope.pastSituation = false;
		$rootScope.situationDate = null;
	};

	$scope.$on('$destroy', () => {
		if ($scope.isLive) {
			thingModel.Live();
		} else {
			thingModel.Load(new Date($scope.date));
		}
	});
});
