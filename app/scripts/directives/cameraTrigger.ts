/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />

/// <reference path="./../references/app.d.ts" />
/// <reference path="./../references/generic.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.directive('cameraTrigger', (
	notify: angularNotify,
	$upload: any,
	cfpLoadingBar: any,
	$state: ng.ui.IStateService,
	settingsService: SettingsService
) => {
	return {
		template: '<div class="camera-trigger">' +
			'<span class="glyphicon glyphicon-camera"></span>' +
			'<input type="file" accept="image/*,video/*,audio/*"' +
			' capture ng-file-select ng-model="myFile" capture resetOnClick="true" />' +
		'</div>',
		restrict: 'E',
		scope: true,
		link: (scope: any, element: JQuery, attrs: any) => {
			scope.$watch('myFile',() => {
				if (!scope.myFile || !scope.myFile.length) {
					return;
				}

				cfpLoadingBar.start();
				$upload.upload({
					url: settingsService.getMediaServerUrl() + '/upload',
					file: scope.myFile[0]
				}).progress((e) => {
					cfpLoadingBar.set(e.loaded / e.total);
				}).success((data) => {
					$state.go('camera', data);
				}).error(() => {
					notify({ message: "Sorry, an error occured while uploading the file", classes: "alert-danger" });
				}).then(() => {
					cfpLoadingBar.complete();
				});
			});
		}
	}
});
