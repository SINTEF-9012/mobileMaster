/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

declare var IScroll;

'use strict';
angular.module('mobileMasterApp')
  .controller('MainCtrl', function ($scope, thingModel, $timeout : ng.ITimeoutService) {

  	
	var myScroll = new IScroll('#wrapper', { mouseWheel: true, scrollX: true, scrollY: true, zoom:true});

	$scope.$watch('patients', () => {
		window.setImmediate(() => {
			myScroll.refresh();
		}); 	
	});
  });
