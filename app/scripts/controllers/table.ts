/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />

/// <reference path="./../references/app.d.ts" />

'use strict';

angular.module('mobileMasterApp')
.controller('TableCtrl', (
	$scope: any,
	thingModel : ThingModelService,
	itsa: ThingIdentifierService,
	$state: ng.ui.IStateService,
	$stateParams: any
) => {

	$(window).scrollTop(0);

	$scope.from = $stateParams.from;
	$scope.thingfrom = $scope.from ? 'list-'+$scope.from : null;

	if ($stateParams.from === 'map') {
		$scope.returnLink = $state.href('map.slidder');
	} else {
		$scope.returnLink = $state.href('main');
	}

	$scope.typeName = $stateParams.thingtype;

	var thingTypeTest = itsa.testfor($stateParams.thingtype || ($state.is('background') ? 'imageoverlays': 'victims'));
		//new RegExp($stateParams.thingtype, 'i')

	var filter: (thing: ThingModel.Thing) => boolean =
		thingTypeTest ? (t) => t.Type && thingTypeTest.test(t.Type.Name) :
						(t) => itsa.other(t);

	$scope.filter = $stateParams.filter ? $stateParams.filter : 'all';
	$scope.previousPage = -1;
	$scope.nextPage = -1;

	var globalList = [];
	var pageSize = 50,
		startPageCount = $stateParams.page ? Math.max($stateParams.page * pageSize || 0,0) : 0,
		endPageCount = startPageCount + pageSize;

	angular.forEach(thingModel.warehouse.Things, (thing: ThingModel.Thing) => {
		if (filter(thing)) {
			var s : any = {};
			thingModel.ApplyThingToScope(s, thing);

			if (s.triage_status) {
				s.triage_status = s.triage_status.toLocaleLowerCase();
			}

			globalList.push(s);
		}
	});


	var sortVictims =  () => {
		globalList.sort((a, b) => {
			var ta = a.triage_status, tb = b.triage_status;

			if (ta === tb) return a.ID > b.ID ? 1 : -1;

			if (ta === 'black') return -1;
			if (tb === 'black') return 1;
			if (ta === 'red') return -1;
			if (tb === 'red') return 1;
			if (ta === 'yellow') return -1;
			if (tb === 'yellow') return 1;
			if (ta === 'greens') return -1;
			if (tb === 'greens') return 1;

			return ta > tb ? 1 : -1;
		});
	},
	dateSort = () => {
		globalList.sort((a, b) => a.datetime - b.datetime);
	},
	defaultSort = () => {
		globalList.sort((a, b) => a.ID < b.ID ? 1 : a.ID > b.ID ? -1 : 0);
	};


	var sortThings = $state.is('victims') ? sortVictims : ($state.is('messenger') ? dateSort : defaultSort);

	var filterRegex = /^(\w+):(.*)$/;
	var digestScope = throttle(() => {
		sortThings();

		$scope.things = [];
		var cpt = 0;

		var showAll = $scope.filter === 'all';
		var filterKey, filterValue;

		if (!showAll) {
			var m = $scope.filter.match(filterRegex);
			if (m) {
				filterKey = m[1];
				filterValue = m[2].toLowerCase();
			} else {
				filterKey = "triage_status";
				filterValue = $scope.filter.toLowerCase();
			}
		}

		var more = false;
		$scope.things = _.filter(globalList, (s: any) => {
				if (s.ID !== "master-summary" && (showAll || (""+s[filterKey]).toLowerCase() == filterValue) &&
				(cpt++ >= startPageCount)) {
					if (cpt <= endPageCount) {
						return true;
					} else {
						more = true;
					}
				}

				return false;
			}
		);

		$scope.previousPage = $stateParams.page - 1;
		$scope.nextPage = more ? parseInt($stateParams.page) + 1 || 1 : -1;

		if (!$scope.$$phase) {
			$scope.$digest();
		}
	}, 10);

	digestScope();

	var observer = {
		New: (thing: ThingModel.Thing) => {
			if (filter(thing)) {
				var s : any = {};
				thingModel.ApplyThingToScope(s, thing);

				if (s.triage_status) {
					s.triage_status = s.triage_status.toLocaleLowerCase();
				}

				globalList.push(s);
				digestScope();
			}
		}, 
		Updated: (thing: ThingModel.Thing) => {
			if (filter(thing)) {
				var t = _.find(globalList, (s: any) => s.ID === thing.ID);
				if (t) {
					thingModel.ApplyThingToScope(t, thing);

					if (t.triage_status) {
						t.triage_status = t.triage_status.toLocaleLowerCase();
					}
					digestScope();
				}
			}
		},
		Deleted: (thing: ThingModel.Thing) => {
			globalList = _.reject(globalList, (s: any) => s.ID === thing.ID);
			digestScope();
		},
		Define: (thingType: ThingModel.ThingType) => {}
	}
	thingModel.warehouse.RegisterObserver(observer);


	$scope.$on('$destroy', () => {
		thingModel.warehouse.UnregisterObserver(observer);
	});
});
