'use strict';

angular.module('mobileMasterApp')
  .directive('rangeSwitch', function () {
    return {
		template: '<div class="switch-range"><input type="range" id="{{name}}" ng-model="internalValue" min="0" max="1" step="1" /></div>',
		restrict: 'E',
		scope: {
			name:'=',
			model:'='
		},
	    link: (scope, element, attrs) => {
	    	
	    	scope.$watch('model', () => {
	    		scope.internalValue = scope.model ? '1' : '0';
	    	});

	    	scope.$watch('internalValue', () => {
	    		scope.model = scope.internalValue !== '0';
	    	});

	    }
    };
  });
