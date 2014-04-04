'use strict';

angular.module('mobileMasterApp')
  .directive('thingProperty', () => {
    return {
      template: '<span>{{value}}</span>',
		restrict: 'E',
		scope: {
			thing: '=thing',
			property: '=property'
		},
		link: (scope, element : JQuery, attrs) => {
			var type = scope.property.property.type,
				key = scope.property.key;

			scope.key = key;

			scope.$watch('thing[key]', (value) => {
				if (!value) {
					scope.value = '';
					return;
				}

				element.addClass("thing-property-" + key);

				if (type === 'Double') {
					scope.value = parseFloat(value === null ? 0.0 : value).toLocaleString([]);
				} else {
					scope.value = value;
				}

				// TODO transfer this stuff somewhere else
				if (key === 'healt') {
					var nbHeart = Math.min(Math.round(value / 0.2), 5);
					if (nbHeart <= 0) {
						element.prepend('<span class="glyphicon glyphicon-heart-empty"></span>');
					} else {
						var heart = $('<span class="glyphicon glyphicon-heart"></span>');
						for (var i = 0; i < nbHeart; ++i) {
							element.prepend(heart.clone());
						}
					}
					scope.value = "";
				} else if (key === 'triage_status') {
					var light = $('<div class="triage-light"></div>');
					light.css('background', value.toLowerCase());
					element.prepend(light);
				}
			});
		}
    };
  });
