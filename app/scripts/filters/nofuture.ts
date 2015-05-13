/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />

'use strict';

angular.module('mobileMasterApp')
.filter('noFuture',() => {
	return (input: any): any => {
		if (input instanceof Date) {
			var now = new Date();
			var diff = <any>now - input;
			if (diff < 0 && diff > -5000) {
				return now;
			}
		}
		return input;
	}
});
 
