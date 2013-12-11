/// <reference path="./../references/angularjs/angular.d.ts" />

'use strict';

angular.module('mobileMasterApp')
.directive('masterIcon', function () {

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

	return {
		template: '<div class="">?<div class="type"></div></div>',
		restrict: 'E',
		link: function postLink(scope, element, attrs) {

			var wrapper = element.get(0).firstChild;

			var categorie = categories[attrs.category.toLowerCase()];

			if (categorie) {
				wrapper.firstChild.data = categorie.char;

				var type = categorie.types[attrs.type.toLowerCase()];
				
				if (type) {
					wrapper.lastChild.appendChild(document.createTextNode(type));
				}
			} else {
				wrapper.firstChild.data = "?";
			}

			wrapper.setAttribute("class", attrs.category + " " + attrs.type.replace(/\s+/g, "-"));

			if (!wrapper.lastChild.firstChild) {
				wrapper.removeChild(wrapper.lastChild);
			}
		}
	};
});
