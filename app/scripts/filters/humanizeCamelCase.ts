/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.filter('humanizeCamelCase', () => {

		var removeSpace = (m) => m.replace(/ /g, '');
			
		// Thanks to angularjs-camelCase-to-human-filter
		return (input: any): string => {
			var s = String(input);
			return (s.charAt(0).toUpperCase() + s.substr(1).replace(/[A-Z]/g, ' $&')).replace(/_/g, ' ').replace(/([A-Z][A-Z ]+[A-Z])/g, removeSpace);
		}

	});
