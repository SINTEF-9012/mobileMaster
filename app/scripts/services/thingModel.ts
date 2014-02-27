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
			},
			Deleted: (thing : ThingModel.Thing) => {
				console.log(thing);
			},
			Define: (thingType: ThingModel.ThingType)=> {
				
			}
		});

		client = new ThingModel.WebSockets.Client(this.clientID, this.endPoint, this.wharehouse);

		window.setInterval(()=> {
			$rootScope.$digest();
		}, 500);
	};
});