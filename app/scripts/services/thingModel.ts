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

	this.$get = ($rootScope: MasterScope.Root) => {
		this.wharehouse = new ThingModel.Wharehouse();

		this.wharehouse.RegisterObserver({
			New: (thing : ThingModel.Thing) => {
				console.log(thing);
				if (!$rootScope.patients) {
					$rootScope.patients = {};
				} else {
					$rootScope.patients[thing.ID] = thing;
				}
				thing.Name = thing.GetProperty<ThingModel.Property.String>("name", ThingModel.Type.String).Value;
				var loc = thing.GetProperty<ThingModel.Property.Location>("location", ThingModel.Type.Location).Value;
				thing.Location = {
					lat: loc.X,
					lng: loc.Y
				};
				synchronizeScope($rootScope);
			},
			Updated: (thing : ThingModel.Thing) => {
				if (!$rootScope.patients) {
					$rootScope.patients = {};
				} else {
					$rootScope.patients[thing.ID] = thing;
				}
				thing.Name = thing.GetProperty<ThingModel.Property.String>("name", ThingModel.Type.String).Value;
				var loc = thing.GetProperty<ThingModel.Property.Location>("location", ThingModel.Type.Location).Value;
				thing.Location = {
					lat: loc.X,
					lng: loc.Y
				};
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

				$rootScope.types[thingType.Name] = thingType;
				synchronizeScope($rootScope);
			}
		});

		$(window).on('touchstart mousedown', ()=> {
			digestLock = true;
		}).on('touchend mouseup', () => {
			if (digestNeeded) {
				$rootScope.$digest();
			}
			digestLock = false;
			digestNeeded = false;
		});

		client = new ThingModel.WebSockets.Client(this.clientID, this.endPoint, this.wharehouse);
	};
});