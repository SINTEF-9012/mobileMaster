/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

/// <reference path="./../references/app.d.ts" />

'use strict';

angular.module('mobileMasterApp')
  .directive('identicon', (settingsService: SettingsService) => {
    return {
        template: '<img alt="" ng-src="{{url}}" title="{{id}}" class="identicon"/>',
		restrict: 'E',
		scope: {
			id: '='
		},
		link: (scope, element : JQuery, attrs) => {
			var server = settingsService.getMediaServerUrl() + '/identicon/';

			var style = attrs.style ? '/?style=' + encodeURIComponent(attrs.style) : '/?style=averagewindow';

			scope.$watch('id', () => {
				if (scope.id) {
					scope.url = server + encodeURIComponent(scope.id) + style;
				} else {
					scope.url = '/images/identicon-unfound.png';
				}
			});
	    }
    };
  });
