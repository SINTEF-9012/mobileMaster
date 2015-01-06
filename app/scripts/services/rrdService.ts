/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />

/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../references/app.d.ts" />
/// <reference path="./../masterScope.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.service('rrdService', function (
		thingModel: ThingModelService,
		settingsService: SettingsService,
		$rootScope: MasterScope.Root,
		$http: ng.IHttpService) {

	var database: { [id: string]: {[property: string] : any[][] }} = {};

	var initialized = false;
	var init = () => {
		if (initialized) {
			return;
		}
		initialized = true;
		var eventHandler = (thing: ThingModel.Thing) => {
			if ($rootScope.pastSituation) {
				return;
			}
			var now = new Date();
			if (database.hasOwnProperty(thing.ID)) {
				var db = database[thing.ID]; 
				_.each(db, (values, key) => {
					var d = thing.Double(key);
					if (d) {
						values.push([now, d]);
					} else {
						var i = thing.Int(key);
						if (typeof i !== "undefined") {
							values.push([now, [Math.max(0, i - Math.round(Math.random()*3)), i, Math.min(9, i + Math.round(Math.random()*3))]]);
						}
					}
				});
			}
		};

		thingModel.warehouse.RegisterObserver({
			New: _.noop,
			Updated: eventHandler,
			Deleted: _.noop,
			Define: _.noop
		});
	};
		console.log("canard");
	//var initObserver = 

	this.load = (id: string, property: string, callback: (data: any[][]) => void, minMax: boolean = false) => {
		var collection;
		if (!database.hasOwnProperty(id)) {
			database[id] = {};
			collection = database[id][property] = [];
		} else if (!database[id].hasOwnProperty(property)) {
			collection = database[id][property] = [];
		} else {
			callback(database[id][property]);
			return;
		}

		if (!initialized) {
			init();
		}

		var rrdServerUrl = settingsService.getRrdServerUrl();
		$http.get(rrdServerUrl + "/" + encodeURIComponent(id) + "/"+encodeURIComponent(property)).success((json: any) => {
			_.each(json, (value: any) => {
				if (value.date && value.value) {
					if (minMax) {
						var i = value.value;
						collection.push([new Date(value.date), [Math.max(0, i - Math.round(Math.random() * 2)), i, Math.min(9, i + Math.round(Math.random() * 2))]]);
					} else {
						collection.push([new Date(value.date), value.value]);
					}
				}
			});
			callback(collection);
		});
	};
});
