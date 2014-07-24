/// <reference path="../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="../../bower_components/DefinitelyTyped/modernizr/modernizr.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.controller('CheckListCtrl', ($scope) => {

		$scope.websockets = Modernizr.websockets;
		$scope.canvas = Modernizr.canvas;
		$scope.localstorage = Modernizr.localstorage;
		$scope.video = Modernizr.video;
		$scope.audio = Modernizr.audio;
});
