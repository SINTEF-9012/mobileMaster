/// <reference path="../references/angularjs/angular.d.ts" />

'use strict';

angular.module('mobileMasterApp')
  .filter('distance', function () {

  	var HaversineDistance = function(latA: number, lngA: number, latB: number, lngB: number) : number {
  		var R =  6378137,
  			toRadians = Math.PI / 180,
  			dLat = Math.sin(((latB - latA) * toRadians)/2),
  			dLng = Math.sin(((lngB - lngA) * toRadians)/2),
  			a = dLat * dLat
  				+ Math.cos(latA * toRadians) * Math.cos(latB * toRadians)
  				* dLng * dLng,
  			c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  			return R * c;
  	};

    return function (input : any) : number {
    	if (input && input.from && input.from.lat != undefined && input.from.lng != undefined
    		&& input.to && input.to.lat != undefined && input.to.lng != undefined) {
    		return HaversineDistance(input.from.lat, input.from.lng, input.to.lat, input.to.lng);
    	}
    	return undefined;
    };
  });
