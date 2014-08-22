/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.filter('humanizeCamelCase', () => {
	
		// Thanks to angularjs-camelCase-to-human-filter
		return (input: any): string =>
			input.charAt(0).toUpperCase() + input.substr(1).replace(/[A-Z]/g, ' $&');
	});
