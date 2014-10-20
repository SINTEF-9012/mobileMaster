/// <reference path="./../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../bower_components/DefinitelyTyped/modernizr/modernizr.d.ts" />
/// <reference path="./../bower_components/DefinitelyTyped/phonegap/phonegap.d.ts" />
/// <reference path="./../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />
/// <reference path="./../bower_components/DefinitelyTyped/ravenjs/ravenjs.d.ts" />
/// <reference path="./../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="./../bower_components/DefinitelyTyped/angular-hotkeys/angular-hotkeys.d.ts" />

/// <reference path="./references/generic.d.ts" />
/// <reference path="./references/app.d.ts" />
/// <reference path="./masterScope.d.ts" />

'use strict';

angular.module('mobileMasterApp', [
	'ui.router',
	'angularFileUpload',
	'angular-loading-bar',
	'cfp.loadingBar',
	'angularMoment',
	'masonry',
	'FBAngular',
	'cfp.hotkeys',
	'ngSanitize'])
  .config(($stateProvider, $locationProvider, $urlRouterProvider, cfpLoadingBarProvider, $provide) => {

	$provide.decorator("$exceptionHandler", ['$delegate', ($delegate) => {
		  return (exception, cause) => {
			  $delegate(exception, cause);
			  if (typeof Raven !== 'undefined') {
				  Raven.captureException(exception, { cause: cause });
			  }
			  //alert(exception.message);
		  };
	}]);
	
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
		.state('patients', {
			url: '/patients?filter&page&from',
			controller: 'TableCtrl',
			templateUrl: 'views/patients.html'
		})
		.state('patient', {
			url: '/patient/:ID?from',
			controller: 'ThingCtrl',
			templateUrl: 'views/patient.html'
		})
        .state('main', {
            url: '/',
            controller: 'MainCtrl',
            templateUrl: 'views/main.html'
		})
		.state('table', {
			url: '/table/:thingtype?filter&order&page&from',
			controller: 'TableCtrl',
			templateUrl: 'views/table.html'
		})
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
			templateUrl: 'views/addinformations.html',
			controller: (masterMap: Master.Map) => {
				masterMap.show();
			}
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
		.state('media', {
			url: '/media/:ID?from',
			controller: 'ThingCtrl',
			templateUrl: 'views/media.html'
		})
		.state('media.edit', {	
			url: '/edit',
			controller: 'EditCtrl',
			templateUrl: 'views/thingedit.html'
        })
		.state('messenger', {
			url: '/messenger?from',
			controller: 'MessengerCtrl',
			templateUrl: 'views/messenger.html'
		})
		.state('timeline', {
			url: '/timeline?from',
			controller: 'TimelineCtrl',
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
	  masterMap: Master.Map,
	  hotkeys: ng.hotkeys.HotkeysProvider) => {
	  $rootScope.$on('$stateChangeStart', (event, toState: ng.ui.IState, toParams, fromState: ng.ui.IState, fromParams) => {
			$rootScope.previousState = fromState.name;
		  $rootScope.currentState = toState.name;
		  if (!fromState.name || fromState.name.indexOf(toState.name + ".") !== 0) {
			  masterMap.hide();
		  }
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
		description: 'Patients',
		callback: () => $state.go('patients')
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

	$(document).on('blur', 'input, textarea', () => {
		window.scrollTo(0, 0);
	});
}

if (window.applicationCache) {
	window.applicationCache.addEventListener('updateready', () => {
		if (confirm('An new version of Master is available. Restart now?')) {
			window.location.reload();
		}
	});
}

if (navigator.userAgent.match(/iPad;.*CPU.*OS [78]_\d/i) && !window.navigator.standalone) {
	document.body.parentElement.className = "ipad ios7";

  window.addEventListener('orientationchange', () => {
    window.scrollTo(0, 0);
  });
}
