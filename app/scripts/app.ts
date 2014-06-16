/// <reference path="./../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../bower_components/DefinitelyTyped/phonegap/phonegap.d.ts" />

/// <reference path="./references/generic.d.ts" />
/// <reference path="./references/app.d.ts" />
/// <reference path="./masterScope.d.ts" />

'use strict';

angular.module('mobileMasterApp', ['ui.router', 'ngAnimate', 'angularFileUpload'])
  .config(function ($stateProvider, $locationProvider, $urlRouterProvider) {

    if (!window.navigator.device) {
      $locationProvider.html5Mode(true);
    }

    $urlRouterProvider.otherwise("/");
	$stateProvider
		.state('map', {
			url: '/map/fullscreen',
            controller: 'MapCtrl',
            templateUrl: 'views/map.html'
        })
        .state('map.slidder', {
            url: '^/map',
            views: {
                'slidder': {
					controller: 'SlidderCtrl',
					templateUrl: 'views/slidder.html'
                }
            }
		})
		.state('summary', {
			url: '/summary',
			controller: 'SummaryCtrl',
			templateUrl: 'views/summary.html'
		})
		.state('summary.edit', {
			url: '/editsummary',
			templateUrl: 'views/editsummary.html'
		})
        .state('main', {
            url: '/',
            controller: 'MainCtrl',
            templateUrl: 'views/main.html'
		})
		.state('main.editsummary', {
			url: 'editsummary',
			views: {
				'bottom@': {
				}					
			}
		})
		.state('main.table', {
			url: 'table/:thingtype',
			views: {
				'bottom@': {
					controller: 'TableCtrl',
					templateUrl: 'views/table.html'
				}
			}
		})
		.state('main.compass', {
			url: 'compass',
			views: {
//			top: {
//				templateUrl: 'views/map.html',
//				controller: 'MapCtrl',
//			},
				'bottom@': {
					controller: 'CompassCtrl',
					templateUrl: 'views/compass.html'
				},
//			slidder: {
//				templateUrl: 'views/slidder.html'
//			}
			}
		})
		.state('background', {
			url: '/background',
			controller: 'BackgroundCtrl',
			templateUrl: 'views/background.html'
		})
		.state('main.filters', {
			url: 'filters',
			views: {
				'bottom@': {
					controller: 'FiltersCtrl',
					templateUrl: 'views/filters.html'
				}
			}
		})
		.state('thing', {
			url: '/thing/:id',
			controller: 'ThingCtrl',
			templateUrl: 'views/thing.html'
		})
		.state('main.thing.edit', {	
			url: 'thing/:id/edit',
			views: {
				'popup@': false,
				'bottom@': {
					controller: 'EditCtrl',
					templateUrl: 'views/thingedit.html'
				},
				'slidder@': {
					controller: 'EdittoolbarCtrl',
					templateUrl: 'views/edittoolbar.html'
				}
			}
        })
        .state('map.thing.order', {
			url: 'thing/:id/order',
			views: {
				'popup@': false,
				'bottom@': {
					controller: 'OrderCtrl',
					templateUrl: 'views/order.html'
				},
				'slidder@': {
					controller: 'OrdertoolbarCtrl',
					templateUrl: 'views/ordertoolbar.html'
				}
			},
			onExit: () => {
				// TODO find a better way
				$(document).trigger('main.thing.order.exit');
			}
		})
		.state('main.add', {
			url: 'add?lat&lng',
			views: {
				'popup@': {
					controller: 'AddCtrl',
					templateUrl: 'views/add.html'
				}
			}
		})
		.state('main.camera', {
			url: 'camera/:hash/:extension',
			views: {
				'popup@': {
					controller: 'CameraCtrl',
					templateUrl: 'views/camera.html'
				}
			}
		})
		.state('settings', {
			url: '/settings',
			controller: 'SettingsCtrl',
			templateUrl: 'views/settings.html'
		});

});

if (window.navigator.standalone) {
	document.body.className += " standalone";

	//$('head').append('<meta name="apple-mobile-web-app-status-bar-style" content="translucent">');
}

if (navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i) && !window.navigator.standalone) {
	document.body.parentElement.className = "ipad ios7";

  window.addEventListener('orientationchange', function () {
    window.scrollTo(0, 0);
  });
}
