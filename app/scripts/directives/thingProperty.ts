/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/marked/marked.d.ts" />

/// <reference path="./../references/app.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.directive('thingProperty', (
		settingsService: SettingsService,
	    $compile: ng.ICompileService
) => {
    return {
      template: '<span>{{result}}</span>',
		restrict: 'E',
		scope: {
			value: '='
		},
		link: (scope, element: JQuery, attrs) => {

			var key = attrs.key;

			scope.$watch('value', (value) => {

				var type = 'default';

				if (_.isNumber(value)) {
					type = 'Number';
				} else if (_.isDate(value)) {
					type = 'DateTime';
				} else if (_.isBoolean(value)) {
					type = 'Boolean';
				}

				element.removeClass().addClass("thing-property-" + key + " thing-property-" + type.replace(/\s+/g, '-').toLowerCase());

				if (type === 'DateTime') {
					scope.result = value ? value.toLocaleString(window.navigator.userLanguage || window.navigator.language) : '';

					var roger = $('<p class="date" am-time-ago="value"></p>');
					$compile(roger)(scope);
					element.append(roger);
				}
				else if (type === 'Number') {
					scope.result = value.toLocaleString([]);
				} else if (type === 'Boolean') {
					scope.result = '';

					element.prepend(value ?
						'<span class="glyphicon glyphicon-ok"></span> ' :
						'<span class="glyphicon glyphicon-remove"></span> ');
				} else {
					if (value) {
						scope.result = value;
					} else {
						scope.result = '\u2205';
						element.addClass("thing-property-empty");
					}
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
					scope.result = "";
				} else if (/*key === 'status' || */key === 'triage_status') {
					var light = $('<div class="triage-light"></div>');
					light.css('background', value.toLowerCase());
					element.prepend(light);
				} else if (type === 'String' && key === 'url') {
					scope.result = '';
					var proxy = settingsService.getMediaServerUrl();
					var href =  proxy +'/'+ value;
					var a = $('<a target="_blank"/>').attr('href', href).text('Open');

					if (scope.thing.typeName === 'PictureType' || scope.thing.typeName === 'master:picture') {
						if (value) {
							var img = $('<img class="img-thumbnail"/>').attr('src', proxy + '/thumbnail/' + value);
							a.text('').append(img);
						}
					} 
					else if (scope.thing.typeName === 'VideoType' || scope.thing.typeName === 'master:video') {
						a.addClass('btn btn-default btn-sm');
						a.text(' Play');
						a.prepend($('<span/>').addClass('glyphicon glyphicon-play'));
					} else {
						a.addClass('btn btn-default');
					}

					element.append(a);
				}
			});
		}
    };
  });
