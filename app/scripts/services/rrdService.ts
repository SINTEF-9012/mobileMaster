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

	var database: { [id: string]: { [property: string]: any[][] } } = {};
	var minMaxDatabase: { [id: string]: { [property: string]: {min: string;max: string } } } = {};

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

					if (d === null) {
						d = thing.Int(key);
						if (d === null) {
							return;
						}
					}

					if (minMaxDatabase.hasOwnProperty(thing.ID) && minMaxDatabase[thing.ID].hasOwnProperty(key)) {
						var infos = minMaxDatabase[thing.ID][key];
						var min = thing.Double(infos.min);
						if (min === null) {
							min = thing.Int(infos.min);
							if (min === null) {
								min = d;
							}
						}
						var max = thing.Double(infos.max);
						if (max === null) {
							max = thing.Int(infos.max);
							if (max === null) {
								max = d;
							}
						}

						values.push([now, [min, d, max]]);
					} else {
						values.push([now, d]);
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

	this.load = (id: string, property: string, callback: (data: any[][]) => void, minMax?: {min: string; max:string}) => {
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
		var encodedId = encodeURIComponent(id);

		// If it's a min/max loading, we need to load 3 datasets and to merge them
		// this could be done in O(n), but I am tired and I will go with a O(n log n)
		if (minMax) {

			if (!minMaxDatabase.hasOwnProperty(id)) {
				minMaxDatabase[id] = {};
				minMaxDatabase[id][property] = minMax;
			} else if (!minMaxDatabase[id].hasOwnProperty(property)) {
				minMaxDatabase[id][property] = minMax;
			}

			var minLoaded = false, maxLoaded = false, avgLoaded = false;

			var minMaxCallback = () => {
				if (!minLoaded || !maxLoaded || !avgLoaded) {
					return;
				}

				collection.sort((a, b) => a[0] - b[0]);

				var newCollection = [], current = collection[0];
				_.each(collection, (itemb) => {
					if (current[0] < itemb[0]) {
						newCollection.push(current);
						current = itemb;
					} else if (itemb[1][0] !== undefined) {
						current[1][0] = itemb[1][0];
					}
					else if (itemb[1][1] !== undefined) {
						current[1][1] = itemb[1][1];
					}
					else if (itemb[1][2] !== undefined) {
						current[1][2] = itemb[1][2];
					}
				});

				newCollection.push(current);


				var previous, nextMin, nextMax, nextAvg;
				for (var i = 0, l = newCollection.length; i < l; ++i) {
					var item = newCollection[i];

					if (item[1][1] === undefined) {
						if (previous) {
							if (!nextAvg || nextAvg[0] < item[0]) {
								nextAvg = null;
								for (var j = i + 1; j < l; ++j) {
									if (newCollection[j][1][1] !== undefined) {
										nextAvg = newCollection[j];
										break;
									}
								}
								if (!nextAvg) {
									if (item[1][0] !== undefined) {
										if (item[1][2] !== undefined) {
											item[1][1] = (item[1][0] + item[1][1]) / 2;
										} else {
											item[1][1] = item[1][0];
										}
									} else {
										item[1][1] = item[1][2];
									}
								}
							}
							if (nextAvg) {
								item[1][1] = previous[1][1] + (item[0] - previous[0]) *
								((nextAvg[1][1] - previous[1][1]) / (nextAvg[0] - previous[0]));
							}
						} else {
							if (item[1][0] !== undefined) {
								if (item[1][2] !== undefined) {
									item[1][1] = (item[1][0] + item[1][1]) / 2;
								} else {
									item[1][1] = item[1][0];
								}
							} else {
								item[1][1] = item[1][2];
							}
						}
					}

					if (item[1][0] === undefined) {
						if (previous) {
							if (!nextMin || nextMin[0] < item[0]) {
								nextMin = null;
								for (j = i + 1; j < l; ++j) {
									if (newCollection[j][1][0] !== undefined) {
										nextMin = newCollection[j];
										break;
									}
								}
								if (!nextMin) {
									item[1][0] = item[1][1];
								}
							}
							if (nextMin) {
								item[1][0] = previous[1][0] + (item[0] - previous[0]) *
								((nextAvg[1][0] - previous[1][0]) / (nextAvg[0] - previous[0]));
							}
						} else {
							item[1][0] = item[1][1];
						}
					}

					if (item[1][2] === undefined) {
						if (previous) {
							if (!nextMax || nextMax[0] < item[0]) {
								nextMax = null;
								for (j = i + 1; j < l; ++j) {
									if (newCollection[j][2][0] !== undefined) {
										nextMax = newCollection[j];
										break;
									}
								}
								if (!nextMax) {
									item[1][2] = item[1][1];
								}
							}
							if (nextMax) {
								item[1][2] = previous[1][2] + (item[0] - previous[0]) *
								((nextAvg[1][2] - previous[1][2]) / (nextAvg[0] - previous[0]));
							}
						} else {
							item[1][2] = item[1][1];
						}
					}

					previous = item;
				}

				callback(newCollection);
			};

			$http.get(rrdServerUrl + "/" + encodedId + "/" + encodeURIComponent(minMax.min)).success((json: any[]) => {
				minLoaded = true;
				_.each(json, (value: any) => {
					if (typeof value.date !== "undefined" &&
						typeof value.value !== "undefined") {
						collection.push([new Date(value.date), [value.value, undefined, undefined]]);
					}
				});
				minMaxCallback();
			}).error(() => {
				minLoaded = true;
				minMaxCallback();
			});

			$http.get(rrdServerUrl + "/" + encodedId + "/" + encodeURIComponent(minMax.max)).success((json: any[]) => {
				maxLoaded = true;
				_.each(json, (value: any) => {
					if (typeof value.date !== "undefined" &&
						typeof value.value !== "undefined") {
						collection.push([new Date(value.date), [undefined, undefined, value.value]]);
					}
				});
				minMaxCallback();
			}).error(() => {
				maxLoaded = true;
				minMaxCallback();
			});

			$http.get(rrdServerUrl + "/" + encodedId + "/" + encodeURIComponent(property)).success((json: any[]) => {
				avgLoaded = true;
				_.each(json, (value: any) => {
					if (typeof value.date !== "undefined" &&
						typeof value.value !== "undefined") {
						collection.push([new Date(value.date), [undefined, value.value, undefined]]);
					}
				});
				minMaxCallback();
			}).error(() => {
				avgLoaded = true;
				minMaxCallback();
			});
		} else {
			$http.get(rrdServerUrl + "/" + encodedId + "/" + encodeURIComponent(property)).success((json: any) => {
				_.each(json, (value: any) => {
					if (typeof value.date !== "undefined" &&
						typeof value.value !== "undefined") {
						collection.push([new Date(value.date), value.value]);
					}
				});
				// Check the order from the server (should be useless)
				collection.sort((a, b) => a[0] - b[0]);
				callback(collection);
			});
		}
	};
});
