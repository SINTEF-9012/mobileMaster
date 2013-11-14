/// <reference path="./references/angularjs/angular.d.ts" />
/// <reference path="./references/leaflet/leaflet.d.ts" />

'use strict';

angular.module('mobileMasterApp', ['ui.router'])
  .config(function ($stateProvider, $locationProvider, $urlRouterProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise("/");
    $stateProvider
      .state('main', {
        url: "/",
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .state('compass', {
        url: '/compass',
        templateUrl: 'views/compass.html',
        controller: 'CompassCtrl'
      })
      .state('map', {
        url: '/map',
        templateUrl: 'views/map.html',
        controller: 'MapCtrl'
      });
  });
