/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.directive('videolan', () => {
		return {
			template:'<div></div>',
			restrict: 'E',
			scope: {
				src: '=',
				mimetype: '='
			},
			link: (scope, element: JQuery, attrs: any) => {
				scope.$watch('src', () => {
	
					if (!scope.src) {
						return;
					}
					var embed = $('<embed>')
						.attr({
							type: "application/x-vlc-plugin",
							pluginspage: "http://www.videolan.org",
							width: "320",
							height: "240",
							windowless: "false",
							allowfullscreen: "true",
							src: scope.src
						});

					embed.get(0).setAttribute("autoplay", "true");

					element.empty().append(embed);
				});
			}
		};
	})
