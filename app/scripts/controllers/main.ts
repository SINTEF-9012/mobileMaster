/// <reference path="./../references/angularjs/angular.d.ts" />

declare var IScroll;

'use strict';
angular.module('mobileMasterApp')
  .controller('MainCtrl', function ($scope, nodeMaster, $timeout : ng.ITimeoutService) {

  	
	var myScroll = new IScroll('#wrapper', { mouseWheel: true, scrollX: true, scrollY: true, zoom:true});

	$scope.$watch('[patients, resources]', function() {
		window.setTimeout(function() {
			myScroll.refresh();
		},1); 	
	});
  });
