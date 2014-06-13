'use strict';

angular.module('mobileMasterApp')
	.config((AddServiceProvider: AddServiceConfig) => {

		var pictureType =
			ThingModel.BuildANewThingType.Named('master:picture')
				.WhichIs('Picture')
				.ContainingA.LocationLatLng()
				.AndA.NotRequired.String('url')
				.AndA.NotRequired.String('description').Build();
//				.AndA.NotRequired.DateTime('creation')
//				.WhichIs('Creation date')


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
		$state) => {

			var p = $stateParams.hash + '.' + $stateParams.extension,
				s = settingsService.getMediaServerUrl();
		$scope.url = s + '/' + p;
//		$scope.identicon = settingsService.getMediaServerUrl() + '/identicon/' + $stateParams.hash;


		// Small list but it should be enough in 2014 (and we support web)
		$scope.isPicture = /(bmp|png|jpeg|jpg|gif|tiff|webp)/i.test($stateParams.extension);
		$scope.isVideo = /(3gb|3g2|h261|h263|h264|jpgv|mp4|mpv4|mpg4|mpeg|mpg|mpe|mv1|mv2|ogv|qt|mov|webm|flv|mkv|mk3d|wm|wmv|avi|movie)/i.test($stateParams.extension);
		var type = $scope.isPicture ? 'master:picture' : ($scope.isVideo ? 'master:video' : 'master:document');

		if ($scope.isPicture) {
			$scope.thumbnailUrl = s + '/thumbnail/' + p;
			var camThumb = $('#camera-thumbnail');

			camThumb.on('error', () => {
				$('#camera-submit').removeClass('btn-primary').addClass('btn-danger').val('Publish anyway');
				$('<div class="alert alert-danger">The picture seems to be broken.</div>').insertAfter(camThumb);
//				camThumb.remove();
			});
		}
		var position = masterMap.getCenter();

		var marker = new L.Marker(position, {
			draggable: true,
			icon: masterMap.createMasterIconWithType(type,$scope)
		});

		marker.addTo(masterMap);


		var watchPositionID = navigator.geolocation.watchPosition((pos: Position) => {
			var mlatlng = marker.getLatLng();
			mlatlng.lat = pos.coords.latitude;
			mlatlng.lng = pos.coords.longitude;
			marker.update();
			var pixels = masterMap.project(mlatlng);
			pixels.y -= $(window).scrollTop() / 2;
			masterMap.panTo(masterMap.unproject(pixels));
		});

		var removeListener = $rootScope.$on('$stateChangeStart', (event: ng.IAngularEvent, toState: any) => {
			masterMap.removeLayer(marker);
			navigator.geolocation.clearWatch(watchPositionID);
			removeListener();
		});

		marker.on('dragstart', (e) => {
			masterMap.fire('markerdragstart', e);

			// If the user drags the marker, we don't have to update his position after
			navigator.geolocation.clearWatch(watchPositionID);
		}).on('dragend', (e) => {
			window.setImmediate(() => {
				masterMap.fire('markerdragend', e);
			});
		});

		$scope.publish = () => {



			AddService.register(type, marker.getLatLng(), (thing : ThingModel.ThingPropertyBuilder) => {
				thing.String('description', $scope.description != undefined ? $scope.description : "");
				thing.String('url', $scope.url);
//				thing.DateTime('creation', new Date());
			});
			$state.go("main");
		};
});
