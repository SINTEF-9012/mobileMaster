/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />

'use strict';
angular.module('mobileMasterApp')
.config(function(KnowledgeProvider: any) {
	KnowledgeProvider.addKnowledge({
		typeName: /minecraft/,
		tablePropertiesOrder: { healt: 6, pitch: 1 }
	});
})
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


	var thingTypeTest = itsa.testfor($stateParams.thingtype || 'victims');
		//new RegExp($stateParams.thingtype, 'i')
		//: /(victim|patient)/i;

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
	//$scope.things = globalList;


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
	defaultSort = () => {
		globalList.sort((a, b) => a.ID < b.ID ? 1 : a.ID > b.ID ? -1 : 0);
	};


	var sortThings = $state.is('victims') ? sortVictims : defaultSort;

	var digestScope = L.Util.throttle(() => {
		sortThings();

		$scope.things = [];
		var cpt = 0;

		var more = false;
		$scope.things = _.filter(globalList, (s: any) => {
				if (($scope.filter === 'all' || $scope.filter === s.triage_status) &&
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
			var t = _.find(globalList, (s: any) => s.ID === thing.ID);
			if (t) {
				thingModel.ApplyThingToScope(t, thing);

				if (t.triage_status) {
					t.triage_status = t.triage_status.toLocaleLowerCase();
				}
				digestScope();
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

	// Sort by the id ascending by default
	$scope.sortExpression = '+ID';
	$scope.sortPropertyKey = 'ID';
	$scope.sortDirection = '+';

	$scope.sortThings = (key: string) => {
		var direction = key == $scope.sortPropertyKey ?
		($scope.sortDirection === '+' ? '-' : '+') : '+';
		$scope.sortExpression = direction + key;
		$scope.sortDirection = direction;
		$scope.sortPropertyKey = key;
	};

	/*$scope.filter = (filter: string) => {
		filter = filter.toLocaleLowerCase();

		$scope.filter = filter;
		$stateParams.filter = filter;
		digestScope();
	};*/
});
