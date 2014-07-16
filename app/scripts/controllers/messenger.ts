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
	$scope.things = [];

	var maxMsg = 25;

	var limit = $state.is('main') ? 12 : maxMsg;

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

			$scope.things = $scope.things.concat(currentList);

			currentList = [];

			if ($scope.things.length > limit) {
				$scope.things = $scope.things.slice($scope.things.length - limit);
			}
		}

		if (!$scope.$$phase) {
			$scope.$digest();
		}

		window.setInterval(scrollDown, 10);
	}, 40);

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
				var t = _.find($scope.things, (s: any) => s.ID === thing.ID);
				if (t) {
					thingModel.ApplyThingToScope(t, thing);

					digestScope();
				}
			}
		},
		Deleted: (thing: ThingModel.Thing) => {
			if (itsa.message(thing)) {
				$scope.things = _.reject($scope.things, (s: any) => s.ID === thing.ID);
				digestScope();
			}
		},
		Define: (thingType: ThingModel.ThingType) => {}
	}
	thingModel.warehouse.RegisterObserver(observer);

	if (!$state.is('main')) {
		$rootScope.bodyClass = 'main-messenger';
	}

	$scope.send = () => {

		var now = new Date();

		// Is this experimental ?
		var minAge = 1000 * 60 * 20;

		if ($scope.things && $scope.things.length > maxMsg) {
			for (var i = 0, l = $scope.things.length - maxMsg; i < l; ++i) {
				var t = $scope.things[i];
				if (l < maxMsg && +now - t.datetime < minAge) {
					break;
				}
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
	var scrollDown = () => {
		jChatScrollarea.scrollTop = jChatScrollarea.scrollHeight;
	} 

	var jwindow = $($window);
	jwindow.on('resize', scrollDown);

	$scope.$on('$destroy', () => {
		thingModel.warehouse.UnregisterObserver(observer);
		jwindow.off('resize', scrollDown);

		if (!$state.is('main')) {
			$rootScope.bodyClass = '';
		}
	});

	digestScope();
});
