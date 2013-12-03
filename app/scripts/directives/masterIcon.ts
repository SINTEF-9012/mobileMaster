'use strict';

angular.module('mobileMasterApp')
  .directive('masterIcon', function () {
    return {
      template: '<div class="incident">0<div class="type">c</div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        // element.text('this is the masterIcon directive');
      }
    };
  });
