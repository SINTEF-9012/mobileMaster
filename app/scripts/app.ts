/// <reference path="./references/angularjs/angular.d.ts" />
/// <reference path="./references/leaflet/leaflet.d.ts" />

'use strict';

angular.module('mobileMasterApp', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/compass', {
        templateUrl: 'views/compass.html',
        controller: 'CompassCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
