/// <reference path="../references/angularjs/angular.d.ts" />
'use strict';

angular.module('mobileMasterApp')
  .filter('humanizeDistance', function () {
  	// The distance is in meters
    return function (distance : number) : string {
    	console.log(distance);
    	
    	if(distance >= 10000) {
    		return Math.round(distance/1000) + "km";
    	} 

    	if (distance >= 2000) {

    	}
      return 'humanizeDistance filter: ' + distance;
    };
  });
