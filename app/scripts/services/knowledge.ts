/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />

/// <reference path="./../references/app.d.ts" />

'use strict';

(<any>angular.module('mobileMasterApp')).provider('Knowledge', function () {

	var knowledge = [
		{
			typeName: null, // default
			tablePropertiesOrder: { name : 10, description: 3, location: -5, _type: -5}
		},
		{
			typeName: "tweets",
			tablePropertiesOrder: {
				description: 5,
				tags: 3,
				available: 2
			}	
		},
		{
			typeName: "resources",
			tablePropertiesOrder: { speed: 5 }
		},
		{
			typeName: "medias",
			tablePropertiesOrder: {url: -1}
		},
		{
			typeTest: /./i,
			tablePropertiesOrder: {
				observationText: 5,
				responsePrecaution: 4,
				ppeBody: 3,
				ppeRespirators: 2,
				healthComment: 1,
				flammabilityComment: 1,
				threatLevel: -1,
				healthLevel: -1,
				flammabilityLevel: -1,
				instabilityLevel: -1
			}
		}
	];

	this.addKnowledge = (k: Knowledge) => {
		knowledge.push(k);
	};

	this.$get = (itsa: ThingIdentifierService) => {

		_.each(knowledge, (k: Knowledge) => {
			if (k.typeName) {
				k.typeTest = itsa.testfor(k.typeName);
			} else if (!k.typeTest) {
				k.typeTest = /^/;
			}
		});

		return {
			canOrder: (thing: ThingModel.Thing) => {
				if (!itsa.resource(thing)) {
					return false;
				}

				var status = thing.String("status");
				return !status || status === "Unassigned";
			},
			canEdit: (thing: ThingModel.Thing) => {
				return itsa.incident(thing) ||
					itsa.multimedia(thing) ||
					itsa.order(thing) ||
					itsa.response(thing) ||
					itsa.risk(thing);
			},
			canDelete: (thing: ThingModel.Thing) => {
				return itsa.multimedia(thing) ||
					itsa.order(thing) ||
					itsa.incident(thing) ||
					itsa.response(thing) ||
					itsa.risk(thing);
			},
			getPropertiesOrder: (thing: ThingModel.Thing) => {
				var scores = {};
				var list = [];
				var propertiesDone = {};


				if (thing.Type) {
					_.each(knowledge, (k: Knowledge) => {
						if (k.typeTest.test(thing.Type.Name)) {
							_.each(k.tablePropertiesOrder, (score, key) => {
								if (scores.hasOwnProperty(key)) {
									scores[key] += score;
								} else {
									scores[key] = score;
								}
							});
						}
					});


					_.each(thing.Type.Properties, (prop: ThingModel.PropertyType) => {

						if (prop.Key !== "undefined") {
							var score = scores[prop.Key] || 0;

							var scopeProp: any = {
								key: prop.Key,
								required: prop.Required,
								type: ThingModel.Type[prop.Type],
								score: score + (prop.Required ? 1 : 0)
							};

							// TODO identify undefined source and fixe it
							if (prop.Name !== "undefined") {
								scopeProp.name = prop.Name;
							} else {
								scopeProp.name = prop.Key.charAt(0).toUpperCase() + prop.Key.slice(1);
							}

							if (prop.Description !== "undefined") {
								scopeProp.description = prop.Description;
							}

							propertiesDone[prop.Key] = true;
							list.push(scopeProp);
						}
					});

				}

				_.each(thing.Properties, (prop: ThingModel.Property) => {
					var key = prop.Key;
					if (propertiesDone[key]) {
						return;
					}

					var score = scores[prop.Key] || 0;

					var scopeProp = {
						key: key,
						required: false,
						score: score,
						name: key.charAt(0).toUpperCase() + key.slice(1)
					};

					list.push(scopeProp);
				});



				list.sort((a, b) => {
					var scorea = a.score,
						scoreb = b.score;
					return scorea === scoreb ? a.key.localeCompare(b.key) : scoreb - scorea;
				});


				return list;
			}
		}
	};
});
