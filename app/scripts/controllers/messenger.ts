angular.module('mobileMasterApp')
.config((AddServiceProvider: AddServiceConfig) => {
	AddServiceProvider.defineType(ThingModel.BuildANewThingType.Named('messenger:message')
		.WhichIs('Chat message')
		.ContainingA.String("author")
		.AndA.String("content")
		.AndA.DateTime("datetime").Build());
}).controller('MessengerCtrl', (
	$scope: any,
	$rootScope,
	AddService: AddService,
	thingModel: ThingModelService,
	itsa: ThingIdentifierService,
	$window: ng.IWindowService,
	$state: ng.ui.IStateService
) => {

	//$controller('TableCtrl', { $scope: $scope });

	var currentList = [];

	var waitingDeletionList = [];

	$scope.messages = [];

	var maxMsg = 25;

	var limit = $state.is('main') ? 8 : maxMsg;

	angular.forEach(thingModel.warehouse.Things, (thing: ThingModel.Thing) => {
		if (itsa.message(thing)) {
			var s: any = {};
			thingModel.ApplyThingToScope(s, thing);

			currentList.push(s);
		}
	});


	var digestScope = throttle(() => {

		if (currentList.length > 0) {
			currentList.sort((a, b) => a.datetime - b.datetime);

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
				currentList.push(s);
				digestScope();
			}
		}, 
		Updated: (thing: ThingModel.Thing) => {
			if (itsa.message(thing)) {
				var t = _.find($scope.messages, (s: any) => s.ID === thing.ID);
				if (t) {
					thingModel.ApplyThingToScope(t, thing);

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
			thing.String('author', 'John Doe');
			thing.String('content', $scope.messageContent);
			thing.DateTime("datetime", now);
		});

		$scope.messageContent = '';
	};

	var jChatScrollarea = $('.chat-scroll-area').get(0);
	var jwindow = $($window);

	var scrollDown = () => {
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
