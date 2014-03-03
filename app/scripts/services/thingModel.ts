/// <reference path="../../bower_components/ThingModel/TypeScript/build/ThingModel.d.ts" />

angular.module("mobileMasterApp").provider("thingModel", function () {
	var client;

	this.clientID = "mobileMaster";
	this.endPoint = "ws://"+window.location.hostname+":8082/";

	this.setClientID = (clientID: string) => {
		this.clientID = clientID;
		return this;
	};

	this.setEndPoint = (endPoint: string)=> {
		this.endPoint = endPoint;
		return this;
	};

	var digestLock = false,
		digestNeeded = false;

	var setImmediateId = 0;
	var synchronizeScope = (scope) => {
		if (!setImmediateId) {
			setImmediateId = window.setImmediate(() => {
				setImmediateId = 0;
				if (digestLock) {
					digestNeeded = true;
				} else {
					scope.$digest();
				}
			});
		}
	};

	this.$get = ($rootScope: MasterScope.Root, Knowledge : KnowledgeModule) => {
		this.wharehouse = new ThingModel.Wharehouse();

		$rootScope.types = {};

		this.wharehouse.RegisterObserver({
			New: (thing: ThingModel.Thing) => {

				if (!thing.Type && !$rootScope.types['Thing']) {
					var type = ThingModel.BuildANewThingType
						.Named('Thing').WhichIs('The default type').Build();
					$rootScope.types['Thing'] = {
						type: type,
						tableProperties: Knowledge.getPropertiesOrder(type)
					};
				}
				var typeName = thing.Type ? thing.Type.Name : "Thing";

				if (!$rootScope.things) {
					$rootScope.things = {};
					$rootScope.things[typeName] = {};
				} else if (!$rootScope.things[typeName]){
					$rootScope.things[typeName] = {};
				}

				$rootScope.things[typeName][thing.ID] = thing;

				synchronizeScope($rootScope);
			},
			Updated: (thing : ThingModel.Thing) => {
				var typeName = thing.Type ? thing.Type.Name : "Thing";
				$rootScope.things[typeName][thing.ID] = thing;
				synchronizeScope($rootScope);
			},
			Deleted: (thing : ThingModel.Thing) => {
				console.log(thing);
				synchronizeScope($rootScope);
			},
			Define: (thingType: ThingModel.ThingType) => {
				if (!$rootScope.types) {
					$rootScope.types = {};
				}

				$rootScope.types[thingType.Name] = {
					type: thingType,
					tableProperties: Knowledge.getPropertiesOrder(thingType)
				};
				synchronizeScope($rootScope);
			}
		});

		$(window).on('touchstart mousedown leafletstart', ()=> {
			digestLock = true;
		}).on('touchend mouseup leafletend', () => {
			if (digestNeeded) {
				$rootScope.$digest();
			}
			digestLock = false;
			digestNeeded = false;
		});

		client = new ThingModel.WebSockets.Client(this.clientID, this.endPoint, this.wharehouse);
	};
});