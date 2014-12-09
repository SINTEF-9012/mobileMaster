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
      template: '<span title="{{rawValue}}">{{result}}<span ng-bind-html="HTMLResult" ng-if="HTMLResult" class="markdown-property"></span></span>',
		restrict: 'E',
		scope: {
			value: '='
		},
		link: (scope, element: JQuery, attrs) => {

			var key = attrs.key;

			var testMarkdown = /(\n|[*>|=#].*[*>|=#]|http:\/\/)/;

			scope.$watch('value', (value) => {

				var i, text;

				var type = 'default';

				scope.rawValue = value;

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
					if (key.indexOf("alarm") !== -1) {
						
					}
					element.prepend(value ?
						(key.indexOf("alarm") !== -1 ? '<span class="glyphicon glyphicon-bell"></span>' :
						'<span class="glyphicon glyphicon-ok"></span> ') :
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
						for (i = 0; i < nbHeart; ++i) {
							element.prepend(heart.clone());
						}
					}
					scope.result = "";
				} else if (/*key === 'status' || */key === 'triage_status') {
					if (value === 'no status entered') {
						scope.result = '\u2205';
						element.addClass("thing-property-empty");
					} else if (value) {
						var light = $('<div class="triage-light"></div>');
						light.css('background', (value? value.toLowerCase(): 'grey'));
						element.prepend(light);
						light.attr("title", scope.result);
						scope.result = "";
					}
				} else if ((key === 'GPSSatellites' || key === 'GSMLevel') && type === 'Number') {
					if (value == 0) {
						element.prepend('<span class="glyphicon glyphicon-remove"></span> ');
					} else {
						text = '\u2588';
						for (i = 0; i < value && i < 4; ++i) {
							element.append($('<div class="network-bar"></div>').text(text));
							if (i < 3) {
								text += ' \u2588';
							}
						}
					}
					element.attr("title", scope.result);
					scope.result = "";
				} else if (key === 'battery' && type === 'Number') {
					scope.result = "";
					var battery = $('<span class="battery-indicator"></span>');
					if (value > 0 && value < 1) {
						value *= 100;
					}
					if (value < 30) {
						element.addClass("battery-indicator-low");
					}
					text = '';
					for (i = 0; i < value; i+=25) {
						text += '\u2588 ';
					}
					element.prepend(battery.text(text));
					scope.result = " "+value + "%";
				} else if (type === 'default') {

					if (key === 'url') {
						scope.result = '';
						var proxy = settingsService.getMediaServerUrl();
						var href = proxy + '/' + value;
						var a = $('<a target="_blank"></a>').attr('href', href).text(value);

						/*if (scope.thing.typeName === 'PictureType' || scope.thing.typeName === 'master:picture') {
							if (value) {
								var img = $('<img class="img-thumbnail"/>').attr('src', proxy + '/thumbnail/' + value);
								a.text('').append(img);
							}
						} else if (scope.thing.typeName === 'VideoType' || scope.thing.typeName === 'master:video') {
							a.addClass('btn btn-default btn-sm');
							a.text(' Play');
							a.prepend($('<span/>').addClass('glyphicon glyphicon-play'));
						} else {*/

						element.append(a);
					} else if (testMarkdown.test(value)) {

						scope.result = '';
						scope.HTMLResult = marked(value)
							.replace(/<table>/g, '<table class="table table-striped">');
					}
				}
			});
		}
    };
  });
