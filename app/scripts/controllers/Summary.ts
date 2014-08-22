/// <reference path="./../../bower_components/DefinitelyTyped/marked/marked.d.ts" />
'use strict';

angular.module('mobileMasterApp').config((AddServiceProvider: AddServiceConfig) => {
	AddServiceProvider.defineType(
		// Laziness
		ThingModel.BuildANewThingType.Named('master:wiki')
			.WhichIs('A wiki document')
			.ContainingA.String('title')
			.AndA.String('content').Build());

	marked.setOptions({
		gfm: true,
		tables: true,
		breaks: true
	});

}).controller('SummaryCtrl', (
	$state,
	$scope,
	$stateParams,
	AddService: AddService,
	thingModel: ThingModelService
	) => {

	var defaultTitle = 'Untitled situation';

	var computeSummary = () => {
		var summary = thingModel.warehouse.GetThing('master-summary');
		if (summary) {
			$scope.title = summary.GetString('title');
			$scope.markdownSummary = summary.GetString('content');
			$scope.htmlSummary = $scope.markdownSummary ? marked($scope.markdownSummary)
				.replace(/<table>/g, '<table class="table table-striped">') : '';
		} else {

			if (!$state.is('summary.edit')) {
				$state.go('summary.edit');
			}

			$scope.title = defaultTitle;
			$scope.markdownSummary = '';
			$scope.htmlSummary = '';//$sce.trustAsHtml(defaultTitle);
		}

		if (!$scope.$$phase) {
			$scope.$apply();
		}
	};

	computeSummary();

	var checkObserver = (thing: ThingModel.Thing) => {
		if (thing.ID === 'master-summary') {
			computeSummary();
		}
	};
	var observer = {
		New: checkObserver, 
		Updated: checkObserver,
		Deleted: checkObserver,
		Define: (thingType: ThingModel.ThingType) => {}
	}
	thingModel.warehouse.RegisterObserver(observer);


	$scope.$on('$destroy', () => {
		thingModel.warehouse.UnregisterObserver(observer);
	});

	$scope.publish = () => {

		AddService.register('master:wiki', null, (thing : ThingModel.ThingPropertyBuilder) => {
			thing.String('title', $scope.title != undefined ? $scope.title : defaultTitle);
			thing.String('content', $scope.markdownSummary != undefined ? $scope.markdownSummary : "");
		}, 'master-summary');

		$state.go("summary");
	};
});
