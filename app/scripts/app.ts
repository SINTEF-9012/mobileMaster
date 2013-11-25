/// <reference path="./references/angularjs/angular.d.ts" />
/// <reference path="./references/leaflet/leaflet.d.ts" />
/// <reference path="./references/phonegap/phonegap.d.ts" />
/// <reference path="./references/NodeMaster.d.ts" />

/// <reference path="./masterScope.d.ts" />

'use strict';

angular.module('mobileMasterApp', ['ui.router'])
  .config(function ($stateProvider, $locationProvider, $urlRouterProvider) {

    if (!window.navigator.device) {
      $locationProvider.html5Mode(true);
    }

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
      }).state('map.layers', {
        url: '/layers',
        templateUrl: 'views/layers.html',
        controller: 'LayersCtrl',
        onEnter: function(masterMap : Master.Map) {
          masterMap.disableInteractions();
        },
        
        onExit: function(masterMap : Master.Map) {
          masterMap.enableInteractions();
        }
      });

  });
