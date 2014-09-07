/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

/// <reference path="./../references/app.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.directive('masterIcon', function (
		$rootScope: MasterScope.Root,
		thingModel: ThingModelService) {

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
				"people aid": "K",
				"red cross": "K",
				"uav": "T"
			}
		},
		"risk": {
			char: "2",
			types: {
				"generic": "",
				"automobile": "M",
				"bomb": "N",
				"chemical": "O",
				"explosion": "P",
				"fire": "Q",
				"rock": "R"
			}
		},
		"response": {
			char: "1",
			types: {
				"response generic": "",
				"alignment generic": "j",
				"alignment police car": "m",
				"alignment firetruck": "l",
				"alignment ambulances": "k",
				"assembly area generic": "n",
				"assembly area dead": "o",
				"assembly area evacuated": "q",
				"assembly area injured": "p",
				"point control": "s",
				"point exit": "t",
				"point entry": "u",
				"command post": "w",
				"point meeting": "x",
				"helicopter landing": "v",
				"point meeting fire": "z",
				"point meeting health": "y",
				"point meeting police": "A",
				"roadblock": "B",
				"depot": "D"
			}
		},
		"helpbeacon": {
			char: "1",
			types: {
				"": "S"
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

	function setIcon(element: JQuery, type: string, thing: ThingModel.Thing, attrs) {
		if (/patient/i.test(type)) {
			// triage_status
			var color = (thing && thing.HasProperty('triage_status')) ? thing.String('triage_status') : '#FF4B00';
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
		} else if (/resources/i.test(type)) {
			element.addClass('resources');
		} else if (/(incident|resource|risk|response|beacon)/i.test(type)) {

			var cat: string;

			switch (true) {
				case /incident/i.test(type):
					cat = 'incident';
					break;	
				case /risk/i.test(type):
					cat = 'risk';
					break;	
				case /response/i.test(type):
					cat = 'response';
					break;	
				case /beacon/i.test(type):
					cat = 'helpbeacon';
					break;	
				default:
				//case /resource/i.test(type):
					cat = 'resource';
					break;	
			}

			var infos = categories[cat];

			// TODO fix it in the adapter?
			if (thing) {

				if (type === 'ResourceType') {
					// TODO HOTFIX
					type += " " + thing.String("type").replace(/medic/i, 'health')
						.replace(/fire personnel/i, 'fire and rescue personnel');
				}
			}

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
		} else if (/victims/i.test(type)) {
			element.addClass('victims');
		} else if (/messages/i.test(type)) {
			element.addClass('messages');
		} else if (/multimedias/i.test(type)) {
			element.addClass('multimedias');
		} else if (/advise/i.test(type)) {
			element.addClass('advise');
			var health = $('<div>').addClass("advise-health"),
				fire = $('<div>').addClass("advise-fire"),
				instability = $('<div>').addClass("advise-instability"),
				specific = $('<div>').addClass("advise-specific");

			if (thing) {
				var prop = thing.Int("healthLevel");
				if (prop !== null) {
					$('<span>').text(prop).appendTo(health);
				}

				prop = thing.Int("flammabilityLevel");
				if (prop !== null) {
					$('<span>').text(prop).appendTo(fire);
				}

				prop = thing.Int("instabilityLevel");
				if (prop !== null) {
					$('<span>').text(prop).appendTo(instability);
				}

				var sprop = thing.String("hazard");
				if (sprop !== null) {
					$('<span>').text(sprop.substr(0, 2)).appendTo(specific);
				}
			}

			element.append(health).append(fire).append(instability).append(specific);

		} else if (/others/i.test(type)) {
			element.addClass('others');
			element.text('\u25C6');
		} else {
			element.addClass('default-icon');
			element.text(type[0]);
		}


		if (attrs.selected) {
			element.addClass('selected');
		}

	}

		return {
		template: '<div></div>',
		restrict: 'E',
		scope: {
			watch: '='
		},
		link: function postLink(scope, element : JQuery, attrs) {

			var type = 'default',
				thing: ThingModel.Thing = null,
				_type = null;
			if (attrs.type) {
				type = attrs.type;
			} else if (attrs.thingid) {
				thing = thingModel.warehouse.GetThing(attrs.thingid);

				if (thing) {
					if (thing.Type) {
						type = thing.Type.Name;
					}

					_type = thing.String("_type");
					if (_type) {
						type = type + " " + _type;
					}
				}
			} else {
				scope.$watch('watch', () => {
					element.empty().removeClass();	

					thing = thingModel.warehouse.GetThing(scope.watch);

					if (thing) {
						if (thing.Type) {
							type = thing.Type.Name;
						}

						_type = thing.String("_type");
						if (_type) {
							type = type + " " + _type;
						}
					}
					setIcon(element, type, thing, attrs);
				});
				return;
			}

			setIcon(element, type, thing, attrs);
		}
	};
});
