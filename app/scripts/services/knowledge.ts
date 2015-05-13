/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />

/// <reference path="./../references/app.d.ts" />

'use strict';

(<any>angular.module('mobileMasterApp')).provider('Knowledge', function () {

	var knowledge : Knowledge []= [
		{
			typeName: null, // default
			tablePropertiesOrder: { name : 10, description: 3, location: -5, _type: -5}
		},
		{
			typeName: "patients",
			tablePropertiesOrder: {
				triage_status: 30,
				alarmAct: 15,
				temperature: 14,
				activity: 13,
				description: 12, 
				alarmTemp: 11,
				transporting: 10,
				braceletOn: 9,
				transferredToDestination: 8,
				reportDate: 7,
				age: 6,
				sex: 5,
				locationName: 5,
				locationId: 4,
				GPSSatellites: 3,
				GSMLevel: 2,
				battery: 1,
				_activityMax: -1,
				_activityMin: -1
			}	
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
			typeName: "beacons",
			tablePropertiesOrder: {
				message: 8,
				rescued: 7,
				safe: 6,
				notified: 5,
				name: -6,
				time: 3,
				lastScan: 2,
				advertised: 1,
				imei: -1
			}
		},
		{
			typeName: "orders",
			tablePropertiesOrder: {
				task: 10,
				accepted: 5,
				done: 4
			}
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
				instabilityLevel: -1,
				hospitalName: -2
			}
		}
	];

	this.addKnowledge = (k: Knowledge) => {
		knowledge.push(k);
	};

	this.$get = (itsa: ThingIdentifierService, authenticationService: AuthenticationService) => {

		_.each(knowledge, (k: Knowledge) => {
			if (k.typeName) {
				k.typeTest = itsa.testfor(k.typeName);
			} else if (!k.typeTest) {
				k.typeTest = /^/;
			}
		});

		var getPropertiesOrder = (thing: ThingModel.Thing) => {
			var scores = {};
			var list = [];
			var propertiesDone = {};


			if (thing.Type) {
				_.each(knowledge,(k: Knowledge) => {
					if (k.typeTest.test(thing.Type.Name)) {
						_.each(k.tablePropertiesOrder,(score, key) => {
							if (scores.hasOwnProperty(key)) {
								scores[key] += score;
							} else {
								scores[key] = score;
							}
						});
					}
				});


				_.each(thing.Type.Properties,(prop: ThingModel.PropertyType) => {

					if (prop.Key !== "undefined") {
						var score = scores[prop.Key] || 0;

						var scopeProp: any = {
							key: prop.Key,
							required: prop.Required,
							type: ThingModel.Type[prop.Type],
							score: score + (prop.Required ? 1 : 0)
						};

						// TODO identify undefined source and fixe it
						// lets be honest, it will never be fixed :-)
						if (prop.Name !== "undefined" && prop.Name !== undefined) {
							scopeProp.name = prop.Name;
						} else {
							scopeProp.name = prop.Key.charAt(0).toUpperCase() + prop.Key.slice(1);
						}

						if (prop.Description !== "undefined" && prop.Description !== undefined) {
							scopeProp.description = prop.Description;
						}

						propertiesDone[prop.Key] = true;
						list.push(scopeProp);
					}
				});

			}

			_.each(thing.Properties,(prop: ThingModel.Property) => {
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
		};

		// TODO security later
		if (authenticationService.getUserName() === 'root') {
			console.log("raaa")
			return {
				canOrder: () => true,
				canEdit: () => true,
				canDelete: () => true,
				getPropertiesOrder: getPropertiesOrder
			};
		}

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
					itsa.other(thing) ||
					itsa.risk(thing);
			},
			canDelete: (thing: ThingModel.Thing) => {
				return itsa.multimedia(thing) ||
					itsa.order(thing) ||
					itsa.incident(thing) ||
					itsa.response(thing) ||
					itsa.other(thing) ||
					itsa.risk(thing);
			},
			getPropertiesOrder: getPropertiesOrder
		};
	};
});
