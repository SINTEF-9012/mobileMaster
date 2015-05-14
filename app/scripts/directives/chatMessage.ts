/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

/// <reference path="./../references/app.d.ts" />

'use strict';

angular.module('mobileMasterApp')
  .directive('chatMessage', (authenticationService: AuthenticationService) => {
    return {
        template: '<div class="chat-message" ng-class="messageClass">' +
        '<identicon id="identiconId" />' +
		'<p class="message">{{thing.content || " "}}</p>' +
		'<p class="chat-infos">' +
	        '<span class="author">{{thing.author}}</span>' +
	        '<span class="date" am-time-ago="thing.datetime"></span>' +
        '</p>' +
        '</div>',
		restrict: 'E',
		scope: {
			thing: '='
		},
		link: (scope, element: JQuery, attrs) => {
			var authName = authenticationService.getUserName(),
				edxlAuthName = authName.replace(/\s+/g, "");
			scope.$watch('thing.author', () => {
				// TODO this is obviously wrong
				if (scope.thing.author === authName || scope.thing.author === edxlAuthName) {
					scope.messageClass = 'my-chat-message';
					scope.identiconId = edxlAuthName;
				} else {
					scope.messageClass = '';
					scope.identiconId = scope.thing.author;
				}
			});
	    }
    };
  });
