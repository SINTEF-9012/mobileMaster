/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

declare var IScroll;

'use strict';
angular.module('mobileMasterApp')
.config(function(KnowledgeProvider: any) {
		KnowledgeProvider.addKnowledge({
			typeName: /minecraft/,
			tablePropertiesOrder: { healt: 6, pitch: 1 }
		});
	})
  .controller('MainCtrl', function ($scope, thingModel, $timeout : ng.ITimeoutService, Knowledge) {

  	
	var myScroll = new IScroll('#wrapper', { mouseWheel: true, scrollX: true, scrollY: true, zoom:true});

	$scope.$watch('types', () => {
		window.setImmediate(() => {
			myScroll.refresh();
		}); 	
	});
  });
