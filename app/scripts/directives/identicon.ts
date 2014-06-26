angular.module('mobileMasterApp')
  .directive('identicon', (settingsService: SettingsService) => {
    return {
        template: '<img alt="" src="{{url}}" title="{{id}}" class="identicon"/>',
		restrict: 'E',
		scope: {
			id: '='
		},
		link: (scope, element : JQuery, attrs) => {
			var server = settingsService.getMediaServerUrl() + '/identicon/';

			var style = attrs.style ? '/?style=' + encodeURIComponent(attrs.style) : '/?style=averagewindow';

			scope.$watch('id', () => {
				scope.url = server + encodeURIComponent(scope.id) + style;
			});
	    }
    };
  });
