/// <reference path="./../references/app.d.ts" />
/// <reference path="./../masterScope.d.ts" />

'use strict';

angular.module('mobileMasterApp').controller('FiltersCtrl', (
	$rootScope: MasterScope.Root,
	filterService: FilterService,
	$scope) => {

	$scope.filters = [
		{ name: "Victims", enabled: !filterService.isFilterEnabled("Victims") },
		{ name: "Multimedias", enabled: !filterService.isFilterEnabled("Multimedias") },
		{ name: "Resources", enabled: !filterService.isFilterEnabled("Resources") },
		{ name: "Responses", enabled: !filterService.isFilterEnabled("Responses") },
		{ name: "Incidents", enabled: !filterService.isFilterEnabled("Incidents") },
		{ name: "Risks", enabled: !filterService.isFilterEnabled("Risks") },
		{ name: "Beacons", enabled: !filterService.isFilterEnabled("Beacons") },
		{ name: "Orders", enabled: !filterService.isFilterEnabled("Orders") },
		{ name: "Others", enabled: !filterService.isFilterEnabled("Others") }
	];

	$scope.$watch('filters', () => {
		angular.forEach($scope.filters, (category) => {
			if (category.enabled) {
				filterService.disableFilter(category.name);
			} else {
				filterService.enableFilter(category.name);
			}
		});
	}, true);

	var switchState = false;
	$scope.switchAll = () => {
		var cptTrue = 0, cptFalse = 0;
		angular.forEach($scope.filters, (category) => {
			if (category.enabled) {
				++cptTrue;
			} else {
				++cptFalse;
			}
		});

		var state = switchState;
		switchState = !switchState;
		if (cptTrue > cptFalse) {
			state = false;
		} else if (cptTrue < cptFalse) {
			state = true;
		}

		angular.forEach($scope.filters, (category) => {
			category.enabled = state;
		});
	};
});
