  
/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="./../../bower_components/ThingModel/TypeScript/build/ThingModel.d.ts" />
/// <reference path="./../references/app.d.ts" />
'use strict';

angular.module('mobileMasterApp')
	.directive('cameraTrigger', (
	$upload: any,
	cfpLoadingBar: any,
	$state: ng.ui.IStateService,
	settingsService: SettingsService
) => {
	return {
		template: '<div class="camera-trigger">' +
			'<span class="glyphicon glyphicon-camera"></span>' +
			'<input type="file" accept="image/*,video/*,audio/*"' +
			' capture ng-file-select="onCapture($files)" />' +
		'</div>',
		restrict: 'E',
		scope: true,
		link: (scope: any, element: JQuery, attrs: any) => {
			scope.onCapture = ($files) => {

				// Replace the input field seems to fix a lot of issues
				var c = element.find('input:first');
				c.replaceWith(c.clone(true));

				cfpLoadingBar.start();
				$upload.upload({
					url: settingsService.getMediaServerUrl() + '/upload',
					file: $files
				}).progress((e) => {
					cfpLoadingBar.set(e.loaded / e.total);
				}).success((data) => {
					$state.go('camera', data);
				}).error(() => {
					// TODO this is not really good :-)
					alert("Sorry, an error occured while uploading the file");
				}).then(() => {
					cfpLoadingBar.complete();
				});
			}
		}
	}
});
