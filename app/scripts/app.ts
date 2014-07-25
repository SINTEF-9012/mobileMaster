/// <reference path="./../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../bower_components/DefinitelyTyped/modernizr/modernizr.d.ts" />
/// <reference path="./../bower_components/DefinitelyTyped/phonegap/phonegap.d.ts" />
/// <reference path="./../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="./../bower_components/DefinitelyTyped/angular-hotkeys/angular-hotkeys.d.ts" />

/// <reference path="./references/generic.d.ts" />
/// <reference path="./references/app.d.ts" />
/// <reference path="./masterScope.d.ts" />

'use strict';

angular.module('mobileMasterApp', [
	'ui.router', 'angularFileUpload', 'angular-loading-bar', 'cfp.loadingBar', 'angularMoment', 'masonry', 'FBAngular', 'cfp.hotkeys'])
  .config(function ($stateProvider, $locationProvider, $urlRouterProvider, cfpLoadingBarProvider) {

    if (!window.navigator.device) {
      $locationProvider.html5Mode(true);
	}

	cfpLoadingBarProvider.includeSpinner = false;

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
		.state('table', {
			url: '/table/:thingtype?order&page&from',
			controller: 'TableCtrl',
			templateUrl: 'views/table.html'
		})
		/*.state('main.compass', {
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
		})*/
		.state('background', {
			url: '/background',
			controller: 'BackgroundCtrl',
			templateUrl: 'views/background.html'
		})
		.state('filters', {
			url: '/filters',
			controller: 'FiltersCtrl',
			templateUrl: 'views/filters.html'
		})
		.state('thing', {
			url: '/thing/:ID?from',
			controller: 'ThingCtrl',
			templateUrl: 'views/thing.html'
		})
		.state('thing.edit', {	
			url: '/edit',
			controller: 'EditCtrl',
			templateUrl: 'views/thingedit.html'
        })
		.state('add', {
			url: '/add?lat&lng',
			controller: 'AddCtrl',
			templateUrl: 'views/add.html'
		})
		.state('add.informations', {
			url: '/informations',
			templateUrl: 'views/addinformations.html'
		})
        .state('order', {
			url: '/order/:ID?from',
			controller: 'OrderCtrl',
			templateUrl: 'views/order.html'
		})
		.state('camera', {
			url: '/camera/:hash/:extension',
			controller: 'CameraCtrl',
			templateUrl: 'views/camera.html'
		})
		.state('multimedias', {
			url: '/Multimedias?from',
			controller: 'MultimediasCtrl',
			templateUrl: 'views/multimedias.html'
		})
		.state('messenger', {
			url: '/messenger?from',
			controller: 'MessengerCtrl',
			templateUrl: 'views/messenger.html'
		})
		.state('timeline', {
			url: '/timeline?from',
			templateUrl: 'views/timeline.html'
		})
		.state('settings', {
			url: '/settings',
			controller: 'SettingsCtrl',
			templateUrl: 'views/settings.html'
		})
		.state('checklist', {
			url: '/checklist',
			controller: 'CheckListCtrl',
			templateUrl: 'views/checklist.html'
		});

  }).run((
	  $rootScope: MasterScope.Root,
	  $state: ng.ui.IStateService,
	  hotkeys: ng.hotkeys.HotkeysProvider) => {
	  $rootScope.$on('$stateChangeStart', (event, toState: ng.ui.IState, toParams, fromState: ng.ui.IState, fromParams) => {
		$rootScope.previousState = fromState.name;
		$rootScope.currentState = toState.name;
	});
	$rootScope.$on('$stateChangeSuccess', (event, toState: ng.ui.IState, toParams, fromState: ng.ui.IState, fromParams) => {
		$rootScope.bodyClass = toState.name.replace('.', '-controller ')+"-controller";
	});

	// Setup keyboard shortcuts between states :-)
	hotkeys.add({
		combo: 'd',
		description: 'Dashboard',
		callback: () => $state.go('main')
	});
	hotkeys.add({
		combo: 'm',
		description: 'Map',
		callback: () => $state.go('map.slidder')
	});
	hotkeys.add({
		combo: 'c',
		description: 'Messenger',
		callback: () => $state.go('messenger')
	});
	hotkeys.add({
		combo: 'p',
		description: 'Multimedias',
		callback: () => $state.go('multimedias')
	});
	hotkeys.add({
		combo: 'v',
		description: 'victims',
		callback: () => $state.go('victims')
	});
	hotkeys.add({
		combo: 's',
		description: 'Settings',
		callback: () => $state.go('settings')
	});
	hotkeys.add({
		combo: 'a',
		description: 'Add',
		callback: () => $state.go('add')
	});
	hotkeys.add({
		combo: 'w',
		description: 'Summary',
		callback: () => $state.go('summary')
	});

	// Check if the browser is compatible
	// We need to wait a bit for the initialization of ui.state
	// 3 seconds should be enough
	window.setTimeout(() => {
		if (!Modernizr.websockets || !Modernizr.canvas || !Modernizr.localstorage || !Modernizr.video || !Modernizr.audio) {
			$state.go('checklist');
		}
	}, 3000);
  });


if (window.navigator.standalone) {
	document.body.className += " standalone";

	//$('head').append('<meta name="apple-mobile-web-app-status-bar-style" content="translucent">');
}
  
var throttle = <(fn: () => void, wait: number, options?: any) => () => void>_.throttle;

if (!!("ontouchstart" in window) || window.navigator.msMaxTouchPoints > 0) {
	document.body.className += " touch";

	$(document)/*.on('focus', 'input, textarea', () => {
		//$('.navbar.navbar-fixed-top').css('position', 'absolute');
	})*/.on('blur', 'input, textarea', () => {
		//$('.navbar.navbar-fixed-top').css('position', 'fixed');
		window.scrollTo(0, 0);
	});
}

if (window.applicationCache) {
	window.applicationCache.addEventListener('updateready', function () {
		if (confirm('An new version of Master is available. Restart now?')) {
			window.location.reload();
		}
	});
}

if (navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i) && !window.navigator.standalone) {
	document.body.parentElement.className = "ipad ios7";

  window.addEventListener('orientationchange', function () {
    window.scrollTo(0, 0);
  });
}
