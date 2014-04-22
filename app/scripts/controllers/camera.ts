'use strict';

angular.module('mobileMasterApp')
	.config((AddServiceProvider: AddServiceConfig) => {
		AddServiceProvider.defineType(
			ThingModel.BuildANewThingType.Named('master:picture')
				.WhichIs('Picture')
				.ContainingA.Location('location')
				.AndA.NotRequired.String('url')
				.AndA.NotRequired.String('description')
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
		$scope.url = s + '/thumbnail/' + p;
//		$scope.identicon = settingsService.getMediaServerUrl() + '/identicon/' + $stateParams.hash;

		var camThumb = $('#camera-thumbnail');

		camThumb.on('error', () => {
			$('#camera-submit').removeClass('btn-primary').addClass('btn-danger').text('Publish anyway');
			$('<div class="alert alert-danger">The picture seems to be broken.</div>').insertAfter(camThumb);
			camThumb.remove();
		});


		var position = masterMap.getCenter();

		var marker = new L.Marker(position, {
			draggable: true,
			icon: masterMap.createMasterIconWithType('picture',$scope)
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
			AddService.register('master:picture', marker.getLatLng(), (thing : ThingModel.ThingPropertyBuilder) => {
				thing.String('description', $scope.description);
				thing.String('url', s + '/' + p);
			});
			$state.go("main");
		};
});
