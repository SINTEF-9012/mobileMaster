/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="../../bower_components/ThingModel/TypeScript/build/ThingModel.d.ts" />

/// <reference path="./../references/app.d.ts" />
/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../masterScope.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.config((AddServiceProvider: AddServiceConfig) => {

		var pictureType =
			ThingModel.BuildANewThingType.Named('master:picture')
				.WhichIs('Picture')
				.ContainingA.LocationLatLng()
				.AndA.NotRequired.String('url')
				.AndA.NotRequired.String('description')
				.AndA.NotRequired.DateTime('creation')
				.WhichIs('Creation date').Build();

		AddServiceProvider.defineType(pictureType);

		AddServiceProvider.defineType(
			ThingModel.BuildANewThingType.Named('master:video')
				.WhichIs('Video')
				.ContainingA.CopyOf(pictureType)
				.Build());

		AddServiceProvider.defineType(
			ThingModel.BuildANewThingType.Named('master:document')
				.WhichIs('Document')
				.ContainingA.CopyOf(pictureType)
				.Build());
	})
	.controller('CameraCtrl', (
		$scope,
		$rootScope: MasterScope.Root,
		$stateParams,
		settingsService: SettingsService,
		masterMap: Master.Map,
		AddService: AddService,
		$window: ng.IWindowService,
		$compile : ng.ICompileService,
		persistentMap: PersistentMap,
		notify: angularNotify,
		filetypeIdentificationService: FileTypeIdentificationService,
		$state: ng.ui.IStateService) => {

		if ($rootScope.pastSituation) {
			notify({message: "Live mode is required for adding new elements.", classes: "alert-warning"});
			$state.go("main");
			return;
		}

		var url = $stateParams.hash + '.' + $stateParams.extension,
			multimediaServer = settingsService.getMediaServerUrl();

		$scope.url = multimediaServer + '/' + url;

		$scope.mp4Url = multimediaServer + '/convert/mp4/480/' + url;
		$scope.webmUrl = multimediaServer + '/convert/webm/480/' + url;

//		$scope.identicon = settingsService.getMediaServerUrl() + '/identicon/' + $stateParams.hash;

		// Small list but it should be enough in 2014 (and we support web)
		$scope.isPicture = filetypeIdentificationService.isPicture($stateParams.extension);
		$scope.isVideo = filetypeIdentificationService.isVideo($stateParams.extension);
		var typeFile = $scope.isPicture ? 'master:picture' : ($scope.isVideo ? 'master:video' : 'master:document');

		if ($scope.isPicture) {
			$scope.thumbnailUrl = multimediaServer + '/resize/640/480/' + url;

			/*(<any>camThumb).imagesLoaded().fail(() => {
				$('#camera-submit').removeClass('btn-primary').addClass('btn-danger').text('Publish anyway');
				$('<div class="alert alert-danger">The picture seems to be broken.</div>').insertAfter(camThumb);
//				camThumb.remove();
			});*/
		} else {
			$scope.thumbnailUrl = multimediaServer + '/thumbnail/' + url;
		}
		var position = masterMap.getCenter();

		var icon = angular.element('<master-icon />');
		icon.attr('type', typeFile);
		var compiledIcon = $compile(icon)($scope);

		masterMap.locate({
			watch: true,
			setView: true,
			maxZoom: 16
		});
		var disablePositionWatching = () => masterMap.stopLocate();

		masterMap.once('drag', disablePositionWatching);

		$scope.publish = () => {

			AddService.register(typeFile, masterMap.getCenter(), (thing : ThingModel.ThingPropertyBuilder) => {
				thing.String('description', $scope.description != undefined ? $scope.description : "");
				thing.String('url', $scope.url);
				// TODO check if it's working
				thing.DateTime('creation', new Date());
			});

			$state.go($rootScope.previousState || 'map.slidder');
		};

	masterMap.closePopup();
	masterMap.enableInteractions();
	masterMap.enableScale();
	masterMap.disableMiniMap();

	var jwindow = $($window), jMap = $('#thing-map');

	var destroyed = false;

	var setLayout = throttle(() => {
		if (destroyed) {
			return;
		}
		var height = Math.max(Math.floor(jwindow.height() - jMap.offset().top), 300);
		jMap.height(height - 1 /* border */);
		masterMap.moveTo(jMap);
	}, 50);

	var mapInterval = window.setInterval(() => {
		masterMap.moveTo(jMap, true);
	}, 500);

	$scope.$on('$destroy', () => {
		destroyed = true;
		jwindow.off('resize', setLayout);
		window.clearInterval(mapInterval);
		masterMap.disableShadow();
		masterMap.off('drag', disablePositionWatching);
	});

	jwindow.resize(setLayout);

	persistentMap.unbindMasterMap(masterMap);
	masterMap.setVerticalTopMargin(0);
	masterMap.disableSituationOverview();
	setLayout();

	window.setImmediate(() => {
		persistentMap.restorePersistentLayer(masterMap);
		masterMap.panTo(position);
		masterMap.enableShadow(undefined, compiledIcon.get(0), 'flex');
	});
});
