/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="./../../bower_components/ThingModel/TypeScript/build/ThingModel.d.ts" />
/// <reference path="./../references/app.d.ts" />
'use strict';

angular.module('mobileMasterApp')
	.controller('MultimediasCtrl', (
		$scope: any,
		thingModel: ThingModelService,
		itsa: ThingIdentifierService,
		$window: ng.IWindowService,
		settingsService: SettingsService
		) => {

		// Max number of medias in the list
		var maxMedias = 16;

		$scope.medias = [];

		var jwindow = $($window);

		var digestScope = throttle(() => {
			if ($scope.medias.length > maxMedias) {
				$scope.medias = $scope.medias.slice(0, maxMedias);

			}

			if (!$scope.$$phase) {
				jwindow.trigger('resize');
				$scope.$digest();
			}
		}, 42);


	var mediaServerUrl = settingsService.getMediaServerUrl();

	var createThumbnail = (thing: ThingModel.Thing) => {
		var url = thing.String("url");

		if (url) {
			url = mediaServerUrl + "/thumbnail/" + url;
			$scope.medias.push({
				ID: thing.ID,
				url: url
			});
		}
	};

	var cpt = 0;

	_.every(thingModel.warehouse.Things, (thing: ThingModel.Thing) => {
		if (itsa.multimedia(thing)) {
			createThumbnail(thing);
			++cpt;
		}

		return cpt < maxMedias;
	});

	var deleteThumbnail = (id:string) => {
		$scope.medias = _.filter($scope.medias, (media) => {
			return media.ID !== id;
		});
	};

	var observer = {
		New: (thing: ThingModel.Thing) => {
			if (itsa.multimedia(thing)) {
				createThumbnail(thing);
				digestScope();
			}
		},
		Updated: (thing: ThingModel.Thing) => {
			if (itsa.multimedia(thing)) {
				deleteThumbnail(thing.ID);
				createThumbnail(thing);
				digestScope();
			}
		},
		Deleted: (thing: ThingModel.Thing) => {
			if (itsa.multimedia(thing)) {
				deleteThumbnail(thing.ID);
				digestScope();
			}
		},
		Define: (thingType: ThingModel.ThingType) => {
		}
	};

	thingModel.warehouse.RegisterObserver(observer);
	$scope.$on('$destroy', () => {
		thingModel.warehouse.UnregisterObserver(observer);
	});
});
