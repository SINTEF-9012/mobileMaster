/// <reference path="../../bower_components/ThingModel/TypeScript/build/ThingModel.d.ts" />
'use strict';

angular.module('mobileMasterApp').provider('orderService', function () {

	var orderType = ThingModel.BuildANewThingType.Named("master:order")
		.WhichIs("An instruction ordeeeer mouhahhahaa")
		.ContainingA.Location("location")
		.AndA.NotRequired.String("details", "Details").Build();

	var i = 0;
	var createThingOrder = (id:string)=> {
		return ThingModel.BuildANewThing.As(orderType)
			.IdentifiedBy(id);
	};

	this.$get = (thingModel: ThingModelService, UUID: UUIDService) => {

		var thing: ThingModel.ThingPropertyBuilder;
		var relatedThings: string[];

		var reset = ()=> {
			relatedThings = [];
			thing = createThingOrder(UUID.generate());
		};

		reset();

		return {
			setLocation: (location: L.LatLng)=> {
				thing.Location("location",
					new ThingModel.Location.LatLng(location.lat, location.lng));
			},
			setDetails: (details: string)=> {
				thing.String("details", details);
			},
			setType: (type: string)=> {
				// TODO, do something :P
			},
			addThing: (thingID: string) => {
				relatedThings.push(thingID);
			},
			emit: ()=> {
				var bthing = thing.Build();

				_.each(relatedThings, (id: string)=> {
					var t = thingModel.wharehouse.GetThing(id);
					if (t) {
						bthing.Connect(t);
					}
				});

				thingModel.wharehouse.RegisterThing(bthing, false, true);

				thingModel.client.Send();

				reset();
			},
			reset: reset
		};
	};
});
