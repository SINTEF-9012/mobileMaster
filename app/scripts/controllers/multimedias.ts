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
		settingsService: SettingsService,
		$state: ng.ui.IStateService,
		$stateParams: any
		) => {

		$scope.from = $stateParams.from;
		var stateBack = $stateParams.from === 'map' ? 'map.slidder' : 'main';
		$scope.returnLink = $state.href(stateBack);

		// Max number of medias in the list
		var maxMedias = $state.is('main') ? 16 : 256;

		var currentList = [];
		$scope.medias = [];

		var jwindow = $($window);

		/**
		 * Randomize array element order in-place.
		 * Using Fisher-Yates shuffle algorithm.
		 */
		function shuffleArray(array) {
			for (var i = array.length - 1; i > 0; i--) {
				var j = Math.floor(Math.random() * (i + 1));
				var temp = array[i];
				array[i] = array[j];
				array[j] = temp;
			}
			return array;
		}

		var digestScope = throttle(() => {
			if (currentList.length > 0) {
				shuffleArray(currentList);

				$scope.medias = $scope.medias.concat(currentList);

				currentList = [];

				if ($scope.medias.length > maxMedias) {
					$scope.medias = $scope.medias.slice($scope.medias.length - maxMedias);
				}
			}

			if (!$scope.$$phase) {
				$scope.$digest();
			}

			jwindow.trigger('resize');
		}, 42, { leading: false });


	var mediaServerUrl = settingsService.getMediaServerUrl();

	var createThumbnail = (thing: ThingModel.Thing) => {
		var url = thing.String("url");

		if (url) {
			var src  = mediaServerUrl + '/' + url;
			var full = mediaServerUrl + "/resize/256/256/" + url;
			var thumbnail = mediaServerUrl + "/thumbnail/" + url;

			var isVideo = /video/i.test(thing.Type.Name);

			if (isVideo) {
				full = null;
			}

			currentList.push({
				ID: thing.ID,
				url: thumbnail,
				full: full,
				video: isVideo,
				src: src
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

	digestScope();

	var deleteThumbnail = (id:string) => {
		$scope.medias = _.filter($scope.medias, (media: any) => {
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
