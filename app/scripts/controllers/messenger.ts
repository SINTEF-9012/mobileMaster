angular.module('mobileMasterApp')
	.controller('MessengerCtrl', (
		$scope: any,
		$rootScope,
		thingModel: ThingModelService,
		itsa: ThingIdentifierService,
		$window: ng.IWindowService,
		settingsService: SettingsService
	) => {

	$rootScope.bodyClass = 'main-messenger';

	$scope.$on('$destroy', () => {
		$rootScope.bodyClass = '';
	});
});
