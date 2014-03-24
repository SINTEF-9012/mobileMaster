/// <reference path="./../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../bower_components/DefinitelyTyped/phonegap/phonegap.d.ts" />

/// <reference path="./references/generic.d.ts" />
/// <reference path="./references/app.d.ts" />
/// <reference path="./masterScope.d.ts" />

'use strict';

angular.module('mobileMasterApp', ['ui.router', 'ngAnimate'])
  .config(function ($stateProvider, $locationProvider, $urlRouterProvider) {

    if (!window.navigator.device) {
      $locationProvider.html5Mode(true);
    }

    $urlRouterProvider.otherwise("/");
		$stateProvider
			.state('main', {
				url: "/",
				views: {
					'top@': {
						templateUrl: 'views/map.html',
						controller: 'MapCtrl',
					},
					'bottom@': {
						controller: 'MainCtrl',
						templateUrl: 'views/main.html'
					},
					'slidder@': {
						controller: 'SlidderCtrl',
						templateUrl: 'views/slidder.html'
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
			.state('main.settings', {
				url: 'settings',
				views: {
					'bottom@': {
						controller: 'LayersCtrl',
						templateUrl: 'views/layers.html'
					}
				}
			})
			.state('main.thing', {
				url: 'thing/:id',
				views: {
					'popup@': {
						controller: 'ThingCtrl',
						templateUrl: 'views/thing.html'
					}
				} /*,
	    onEnter: () => {
			$('#layout-popup').show();
		},
		onExit: ()=> $('#layout-popup').hide()*/
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
			.state('main.thing.order', {
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
			})/*{
					controller: 'OrderCtrl',
					templateUrl: 'views/order.html'
				}
			}/*,
			onEnter: () => {
				window.setImmediate(()=>$('#layout-popup').addClass('popup-order'));
			},
			,onExit: ()=> {
				//window.setImmediate(()=>$('#layout-popup').removeClass('popup-order'));
				return false;
			}*/
      .state('map', {
        url: '/map',
        templateUrl: 'views/map.html',
        controller: 'MapCtrl'
      }).state('map.layers', {
        url: '/layers',
        templateUrl: 'views/layers.html',
        controller: 'LayersCtrl',
        onEnter: function(masterMap : Master.Map, $rootScope : MasterScope.Root) {
          $rootScope.$broadcast('layers_enter');
          // masterMap.disableInteractions();
        },
        
        onExit: function(masterMap : Master.Map, $rootScope : MasterScope.Root) {
          $rootScope.$broadcast('layers_exit');
          // masterMap.enableInteractions();
        }
      });

  });

if (navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i) && !window.navigator.standalone) {
  document.body.parentElement.className = "ipad ios7";

  window.addEventListener('orientationchange', function () {
    window.scrollTo(0, 0);
  });
}
