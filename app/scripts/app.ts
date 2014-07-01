/// <reference path="./../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../bower_components/DefinitelyTyped/phonegap/phonegap.d.ts" />

/// <reference path="./references/generic.d.ts" />
/// <reference path="./references/app.d.ts" />
/// <reference path="./masterScope.d.ts" />

'use strict';

angular.module('mobileMasterApp', ['ui.router', 'angularFileUpload', 'angular-loading-bar'])
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
		.state('victims', {
			url: '/victims?filter&page&from',
			controller: 'TableCtrl',
			templateUrl: 'views/victims.html'
		})
		.state('victim', {
			url: '/victim/:ID?from',
			controller: 'ThingCtrl',
			templateUrl: 'views/victim.html'
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
		.state('table', {
			url: '/table/:thingtype?order&page&from',
			controller: 'TableCtrl',
			templateUrl: 'views/table.html'
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
			url: '/thing/:ID?from',
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

  })/*.run(($rootScope) => {
	console.log("canard");
	  $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {

		console.log(event, toState, $('#lapin'));
		  if (toState.name === 'victims'/* && current.name === 'victims') {
			//if (document.body.className.indexOf('animation') === -1) {
			$('body').addClass('canard').removeClass('no-asnimation');
			//}
		} else {
			$('body').removeClass('canard').addClass('no-asnimation');
		}
	});
})*/;

if (window.navigator.standalone) {
	document.body.className += " standalone";

	//$('head').append('<meta name="apple-mobile-web-app-status-bar-style" content="translucent">');
}


if (!!("ontouchstart" in window) || window.navigator.msMaxTouchPoints > 0) {
	document.body.className += " touch";
}

if (navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i) && !window.navigator.standalone) {
	document.body.parentElement.className = "ipad ios7";

  window.addEventListener('orientationchange', function () {
    window.scrollTo(0, 0);
  });
}
