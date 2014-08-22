/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />
/// <reference path="../../bower_components/ThingModel/TypeScript/build/ThingModel.d.ts" />

/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../references/app.d.ts" />
/// <reference path="./../masterScope.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.service('filterService', function (
		itsa: ThingIdentifierService,
		$rootScope: MasterScope.Root
		) {

	var filters: {
		[name: string]: {
			enabled: boolean;
			filter: (thing: ThingModel.Thing) => boolean;
		}
	} = {
		"Victims": {
			enabled: false,
			filter: (thing) => itsa.victim(thing)
		},
		"Multimedias": {
			enabled: false,
			filter: (thing) => itsa.multimedia(thing)
		},
		"Resources": {
			enabled: false,
			filter: (thing) => itsa.resource(thing)
		},
		"Responses": {
			enabled: false,
			filter: (thing) => itsa.response(thing)
		},
		"Incidents": {
			enabled: false,
			filter: (thing) => itsa.incident(thing)
		},
		"Risks": {
			enabled: false,
			filter: (thing) => itsa.risk(thing)
		},
		"Beacons": {
			enabled: false,
			filter: (thing) => itsa.beacon(thing)
		},
		"Orders": {
			enabled: false,
			filter: (thing) => itsa.order(thing)
		},
		"Others": {
			enabled: false,
			filter: (thing) => itsa.other(thing)
		}
	};

	var filtersEnabled = [];

	this.getFilter = () =>
		((thing: ThingModel.Thing) => {
			for (var i = 0, l = filtersEnabled.length; i < l; ++i) {
				if (filtersEnabled[i](thing)) {
					return true;
				}
			}

			return false;
		});

	this.hasSomeFiltering = () => filtersEnabled.length > 0;

	this.isFilterEnabled = (name: string) => {
		var filter = filters[name];
		return (filter && filter.enabled);
	}

	var enableFilter = this.enableFilter = (name: string, save: boolean = true) => {
		var filter = filters[name];
		if (filter && !filter.enabled) {
			filtersEnabled.push(filter.filter);
			filter.enabled = true;
			if (save) {
				saveFilters();
			}
		}
	};

	var disableFilter = this.disableFilter = (name: string, save: boolean = true) => {
		var filter = filters[name];
		if (filter && filter.enabled) {
			filtersEnabled = _.without(filtersEnabled, filter.filter);
			filter.enabled = false;
			if (save) {
				saveFilters();
			}
		}
	};

	var saveFilters = () => {
		var val = {}; 
		_.each(filters, (filter, name) => {
			val[name] = filter.enabled;
		});

		window.localStorage.setItem("filterServiceState", JSON.stringify(val));
		$rootScope.$emit('filterServiceUpdate');
	}

	var restoreFilters = () => {
		var jval = window.localStorage.getItem("filterServiceState");
		if (!jval) {
			return;
		}

		var val = JSON.parse(jval);

		_.each(val, (state, name) => {
			if (state) {
				enableFilter(name, false);
			} else {
				disableFilter(name, false);
			}
		});
	}

	restoreFilters();

	$(window).on('storage', throttle(() => {
		restoreFilters();
		$rootScope.$emit('filterServiceUpdate');
	}, 100));

})
