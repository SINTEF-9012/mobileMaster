/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />

/// <reference path="./../references/app.d.ts" />
/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../masterScope.d.ts" />

'use strict';

angular.module('mobileMasterApp')
.config((AddServiceProvider: AddServiceConfig) => {
	AddServiceProvider.defineType(ThingModel.BuildANewThingType.Named('messenger:message')
		.WhichIs('Chat message')
		.ContainingA.String("author")
		.AndA.String("content")
		.AndA.DateTime("datetime")
		.AndA.NotRequired.Int("number").Build());
}).controller('MessengerCtrl', (
	$scope: any,
	$rootScope : MasterScope.Root,
	AddService: AddService,
	thingModel: ThingModelService,
	authenticationService: AuthenticationService,
	itsa: ThingIdentifierService,
	$window: ng.IWindowService,
	$state: ng.ui.IStateService,
	$stateParams: any
) => {

	$scope.from = $stateParams.from;
	var stateBack = $stateParams.from === 'map' ? 'map.slidder' : 'main';
	$scope.returnLink = $state.href(stateBack);

	var currentList = [];

	var waitingDeletionList = [];

	$scope.messages = [];

	var maxMsg = 25;

	var limit = $state.is('main') ? 8 : maxMsg;

	var maxOrderNumber = 0;

	angular.forEach(thingModel.warehouse.Things, (thing: ThingModel.Thing) => {
		if (itsa.message(thing)) {
			var s: any = {};
			thingModel.ApplyThingToScope(s, thing);

			maxOrderNumber = Math.max(maxOrderNumber, thing.Int("number"));

			currentList.push(s);
		}
	});


	var digestScope = throttle(() => {

		if (currentList.length > 0) {
			currentList.sort((a, b) => {
				if (a.number && b.number) {
					return a.number - b.number;
				} else {
					return a.datetime - b.datetime;
				}
			});

			$scope.messages = $scope.messages.concat(currentList);

			currentList = [];


			if ($scope.messages.length > limit) {
				var thelimit = $scope.messages.length - limit;

				waitingDeletionList = waitingDeletionList.concat($scope.messages.slice(0, thelimit));

				$scope.messages = $scope.messages.slice(thelimit);
			}
		}

		if (!$scope.$$phase) {
			$scope.$digest();
		}

		scrollDown();
	}, 40, {leading: false});

	var observer = {
		New: (thing: ThingModel.Thing) => {
			if (itsa.message(thing)) {
				var s : any = {};
				thingModel.ApplyThingToScope(s, thing);
				maxOrderNumber = Math.max(maxOrderNumber, thing.Int("number"));
				currentList.push(s);
				digestScope();
			}
		}, 
		Updated: (thing: ThingModel.Thing) => {
			if (itsa.message(thing)) {
				var t = _.find($scope.messages, (s: any) => s.ID === thing.ID);
				if (t) {
					thingModel.ApplyThingToScope(t, thing);
					maxOrderNumber = Math.max(maxOrderNumber, thing.Int("number"));

					digestScope();
				}
			}
		},
		Deleted: (thing: ThingModel.Thing) => {
			if (itsa.message(thing)) {
				$scope.messages = _.reject($scope.messages, (s: any) => s.ID === thing.ID);
				digestScope();
			}
		},
		Define: (thingType: ThingModel.ThingType) => {}
	}
	thingModel.warehouse.RegisterObserver(observer);

	$scope.send = () => {

		var now = new Date();

		// Is this experimental ?
		var minAge = 1000 * 60 * 20;

		for (var i = 0, l = waitingDeletionList.length; i < l; ++i) {
			var t = waitingDeletionList[i];
			if (+now - t.datetime > minAge) {
				thingModel.RemoveThing(t.ID, false);
			}
		}

		AddService.register("messenger:message", null, (thing: ThingModel.ThingPropertyBuilder) => {
			thing.String('author', authenticationService.getUserName());
			thing.String('content', $scope.messageContent);
			thing.DateTime("datetime", now);
			thing.Int("number", ++maxOrderNumber);
		});

		$scope.messageContent = '';
	};

	var jChatScrollarea = $('.chat-scroll-area').get(0);
	var jwindow = $($window);

	var scrollDown = () => {
		jChatScrollarea.scrollTop = jChatScrollarea.scrollHeight;
		window.setTimeout(() => {
			jChatScrollarea.scrollTop = jChatScrollarea.scrollHeight;
		}, 10);
	};

	jwindow.on('resize', scrollDown);

	$scope.$on('$destroy', () => {
		thingModel.warehouse.UnregisterObserver(observer);
		jwindow.off('resize', scrollDown);
	});

	digestScope();
});
