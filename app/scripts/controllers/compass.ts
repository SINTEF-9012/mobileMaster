/// <reference path="./../references/angularjs/angular.d.ts" />

'use strict';

angular.module('mobileMasterApp')
  .controller('CompassCtrl', function ($scope, $window) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    
    $scope.distance = {lat:43.474894, lng: 5.97361};
    $scope.canard = {lat:0.0, lng: 0.0};
    $scope.direction = 56.0;

    // if ($window.navigator salut)
    // $winldow.navigator
  });
