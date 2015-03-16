/// <reference path="../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />
/// <reference path="../../bower_components/DefinitelyTyped/moment/moment.d.ts" />

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

	var server = settingsService.getHttpThingModelUrl();

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

	var date = null;
	var throttledDate = throttle(() => {
		var r = (date - minDate) / diffDate * 1000;
		$scope.sliderValue = Math.round(r);
		$scope.isLive = false;
		$rootScope.pastSituation = true;
		$rootScope.situationDate = $scope.date;
	}, 60);

	$scope.$watch('date', (newValue, oldValue) => {
		if (newValue !== oldValue) {
			date = newValue;
			throttledDate();
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

	var timelineSlider = $('#timeline-slider');
		timelineSlider.empty();

	var loadDate = _.throttle((ldate) => {
		if (ldate === "now") {
			$rootScope.pastSituation = false;
			$rootScope.situationDate = null;
			thingModel.Live();
		} else {
			$rootScope.situationDate = ldate;
			$rootScope.pastSituation = true;
			thingModel.Load(ldate);
		}
	}, 200);

	$scope.$on('$destroy', () => {
		if ($scope.isLive) {
			thingModel.Live();
		} else {
			thingModel.Load(new Date($scope.date));

			var lastValue = 0, currentSelectedDate = $scope.date, speed = 0;
			//timelineSlider.click(() => $state.go('timeline'));
			(<any>timelineSlider).CircularSlider({
				innerCircleRatio: 0.5,
				formLabel: (newValue) => {
					var diff = Math.abs(newValue - lastValue);
					// Loop
					if (diff > 250) {
						diff = 360 - diff;
					}

					if (diff === 0) {
						speed *= 0.5;
					} else if (diff < 3) {
						speed = (1 + speed) / 2;
					} else {
						//speed = (diff + speed * 5) / 3;
						speed = Math.min(speed + 1, 200);
					}

					if (newValue - lastValue > 0) {
						currentSelectedDate += speed*1000;
					} else {
						currentSelectedDate -= speed*1000;
					}
					lastValue = newValue;
					var now = +new Date();
					if (currentSelectedDate >= now) {
						loadDate("now");
						currentSelectedDate = now;
						return "now";
					}

					var r = new Date(currentSelectedDate);
					loadDate(r);

					if (window.getSelection) window.getSelection().removeAllRanges();
					else if (document.selection) document.selection.empty();

					return moment(r).format("[<span>]HH:mm:ss[<br>]DD/MM/YY[</span>]");
				}
			});
		}
	});

});
