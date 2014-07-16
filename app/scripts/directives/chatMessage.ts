angular.module('mobileMasterApp')
  .directive('chatMessage', () => {
    return {
        template: '<div class="chat-message" ng-class="messageClass">' +
        '<identicon id="thing.author" />' +
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

			scope.$watch('thing.author', () => {
				if (scope.thing.author === 'John Doe') {
					scope.messageClass = 'my-chat-message';
				} else {
					scope.messageClass = '';
				}
			});
	    }
    };
  });
