/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

'use strict';

angular.module('mobileMasterApp')
  .filter('humanizeDistance', () => {
  	// The distance is in meters
    return (orgDistance : number) : string => {
      var distance = Math.round(orgDistance);

      if(distance >= 1000000) {
        return Math.round(distance/1000000)*1000 + " km";
      } 

    	if(distance >= 5000) {
    		return Math.round(distance/1000) + " km";
    	}

      if(distance >= 3000) {
        var d = Math.floor(distance/1000),
            m = distance % 1000;
        if (m >= 250) d+=0.5; 
        if (m >= 750) d+=0.5;
        return d + " km";
      }

    	if (distance >= 1500) {
        return Math.round(distance/100) * 100 + " m";
    	}

      if (distance > 1000) {
        var d = Math.floor(distance/100)*100,
            m = distance % 100;
        if (m >= 25) d+= 50;
        if (m >= 75) d+= 50;
        return d + " m";
      }

      if (distance < 3) {
        return Math.round(orgDistance*100) + " cm";
      }

      return distance + " m";
    };
  });
