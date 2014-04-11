/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

'use strict';

angular.module('mobileMasterApp')
.directive('masterIcon', function ($rootScope: MasterScope.Root) {

	var categories = {
		"incident": {
			char: "0",
			types: {
				"generic": "",
				"automobile": "c",
				"bomb": "d",
				"chemical": "e",
				"explosion": "f",
				"fire": "g",
				"rock slide": "h"
			}
		},
		"resource": {
			char: "1",
			types: {
				"health personnel": "C",
				"health vehicle": "E",
				"fire and rescue personnel": "F",
				"fire and rescue vehicle": "G",
				"police personnel": "H",
				"police vehicle": "I",
				"civil defence": "J",
				"norwegian people aid": "K",
				"red cross": "K"
			}
		}
	}

	var light = $('<div class="triage-light"></div>');
	function patientTriageIcon(color: string) : JQuery {
		return light.clone().css('background', color.toLowerCase());
	}

	function glyphicon(version: string): JQuery {
		return $('<span/>').addClass('glyphicon glyphicon-' + version);
	}

	function fonticon(category: string, type:string, typeChar: string): JQuery {
		var t = $('<div class="type"></div>').text(typeChar),
			c = $('<div></div>').text(categories[category].char)
				.addClass(category + " "+type.replace(/[:\s]/g, " ")); //TODO bourrin
		return c.append(t);
	}

	return {
//		template: '''<div class="">?<div class="type"></div></div>',
		restrict: 'E',
		link: function postLink(scope, element : JQuery, attrs) {

			var type = 'default',
				thing : MasterScope.Thing = null;
			if (attrs.type) {
				type = attrs.type;
			} else if (attrs.thingid) {
				thing = $rootScope.things[attrs.thingid];
				type = thing.typeName;
			}
			console.log(type);

			var wrapper = element.get(0).firstChild;


			if (/patient/i.test(type)) {
				// triage_status
				var color = (thing && thing.triage_status) ? thing.triage_status : '#FF4B00';
				console.log(color, element, patientTriageIcon(color));
				element.append(patientTriageIcon(color));
				element.addClass('patient');
			} else if (/picture/i.test(type)) {
				element.append(glyphicon('picture'));
				element.addClass('glyph picture');
			} else if (/tweet/i.test(type)) {
				element.append(glyphicon('comment'));
				element.addClass('glyph tweet');
			} else if (/video/i.test(type)) {
				element.append(glyphicon('film'));
				element.addClass('glyph video');
			} else if (/(incident|resource)/i.test(type)) {

				var cat = /incident/i.test(type) ? 'incident' : 'resource';
				var infos = categories[cat];

				var letter = '';
				var ltype = type.toLowerCase();
				for (var iconType in infos.types) {
					if (ltype.indexOf(iconType) >= 0) {
						letter = infos.types[iconType];
						break;
					} 	
				}

				element.append(fonticon(cat, ltype, letter));
				element.addClass('fonticon');

			} else if (/order/i.test(type)) {
				element.addClass('order');
			} else {
				element.addClass('default-icon');
				element.text(type[0]);
			}

/*			if (categorie) {
				wrapper.firstChild.data = categorie.char;

				var type = categorie.types[attrs.type.toLowerCase()];
				
				if (type) {
					wrapper.lastChild.appendChild(document.createTextNode(type));
				}
			} else {
//				wrapper.firstChild.data = "?";
//				element.find('.type').text('?');
			}*/

//			wrapper.setAttribute("class", attrs.category + " " + attrs.type.replace(/\s+/g, "-"));

//			if (!wrapper.lastChild.firstChild) {
//				wrapper.removeChild(wrapper.lastChild);
//			}
		}
	};
});
