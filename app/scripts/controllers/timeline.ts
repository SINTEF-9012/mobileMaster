/// <reference path="../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.controller('TimelineCtrl', ($scope, $http: ng.IHttpService) => {
	$http.get("https://master-bridge.eu/thingmodel/timeline?precision=60000").success((data) => {
		$scope.data = data;
	});
});
