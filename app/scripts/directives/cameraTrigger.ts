/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui-router/angular-ui-router.d.ts" />

/// <reference path="./../references/app.d.ts" />
/// <reference path="./../references/generic.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.directive('cameraTrigger', (
	notify: angularNotify,
	Upload: any,
	cfpLoadingBar: any,
	$state: ng.ui.IStateService,
	settingsService: SettingsService
) => {
	return {
		template: '<div class="camera-trigger">' +
			'<span class="glyphicon glyphicon-camera"></span>' +
			'<input type="file" ngf-pattern="\'image/*,video/*,audio/*\'" ngf-accept="\'image/*,video/*,audio/*\'"' +
			' ngf-select ng-model="myFile" ngf-capture="camera" resetOnClick="true" />' +
		'</div>',
		restrict: 'E',
		scope: true,
		link: (scope: any, element: JQuery, attrs: any) => {
			scope.$watch('myFile',() => {
				if (!scope.myFile) {
					return;
				}

				cfpLoadingBar.start();
				Upload.upload({
					url: settingsService.getMediaServerUrl() + '/upload',
					file: scope.myFile
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
