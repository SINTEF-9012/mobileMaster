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

    $window.navigator.geolocation.watchPosition(function(pos){
      $scope.distance = {lat:pos.coords.latitude, lng: pos.coords.longitude};
      $scope.$apply();
    }, function() {}, {enableHighAccuracy:true});
    
    $scope.canard = {lat:59.945043, lng: 10.713};
    $scope.direction = 56.0;

    // if ($window.navigator salut)
    // $winldow.navigator
  });
