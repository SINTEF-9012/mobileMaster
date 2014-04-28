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
	$rootScope,
	masterMap: Master.Map,
	$sce: ng.ISCEService,
	AddService: AddService
	) => {

	$rootScope.$watch('things["master-summary"]', (summary) => {
		console.log(summary);
		if (summary && summary.content) {
			var content = summary.content;
			$scope.markdownSummary = content;
			$scope.htmlSummary = $sce.trustAsHtml(marked(content)
				.replace(/<table>/g, '<table class="table table-striped">'));
			$scope.title = summary.title;
		} else {
			$scope.title = 'Loading';
			$scope.markdownSummary = '';
			$scope.htmlSummary = '';//$sce.trustAsHtml('empty');
		}

	});

	$scope.publish = () => {

		AddService.register('master:wiki', null, (thing : ThingModel.ThingPropertyBuilder) => {
			thing.String('title', $scope.title != undefined ? $scope.title : "Default title");
			thing.String('content', $scope.markdownSummary != undefined ? $scope.markdownSummary : "");
		}, 'master-summary');
		$state.go("main");
	};
});