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

	var myScroll = new IScroll('#wrapper', { mouseWheel: true, scrollX: true, scrollY: true, zoom:true, preventDefault:false});

	var immediateRefreshId = 0;
	  var refresh = () => {
	  if (immediateRefreshId === 0) {
		  immediateRefreshId = window.setImmediate(() => {
			  myScroll.refresh();
			  immediateRefreshId = 0;
		  }, 10);
	  }
	};

	 $scope.$watch('types', refresh);
	  $scope.$watch('things', refresh);

	  $('#view-bottom').on('touchmove pointermove', () => {
		  if (myScroll.enabled) {
			  myScroll.options.preventDefault = true;
		  } else {
			  myScroll.options.preventDefault = false;
		  }
	  }).on('touchstart pointerdown', (e) => {
        var oe = <TouchEvent><any> e.originalEvent;

	    myScroll.options.preventDefault = false;
        if (oe.touches && oe.touches.length >= 3) {
	        myScroll.disable();
	        myScroll.options.preventDefault = false;
        }
    }).on('touchend pointerup', (e) => {

	    myScroll.options.preventDefault = false;
        var oe = <TouchEvent><any> e.originalEvent;
		if (!oe.touches || oe.touches.length < 3) {
	        myScroll.enable();
	        myScroll.options.preventDefault = false;
		}
    });

	 $(window).on('layout-scroll-end', refresh);
  });
