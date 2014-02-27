/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
'use strict';

angular.module('mobileMasterApp')
  .directive('thing', () => {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: (scope, element, attrs)=> {
	      element.text('this is the thing directive');
      }
    };
  });
