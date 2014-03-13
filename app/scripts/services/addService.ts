'use strict';

angular.module('mobileMasterApp')
	.provider('AddService', function() {
		var types: { [name: string]: ThingModel.ThingType } = {};

		this.defineType = (type: ThingModel.ThingType) => {
			types[type.Name] = type;
		};

		var createDefaultType = (typeName: string)=> {
			var type = ThingModel.BuildANewThingType.Named(typeName)
				.ContainingA.Location("location").Build();
			types[typeName] = type;
			return type;
		};

		this.$get = (thingModel: ThingModelService, UUID: UUIDService) => {
			return {
				register: (typeName: string, location: L.LatLng) => {
					var type = types[typeName],
						t: ThingModel.ThingPropertyBuilder,
						id = UUID.generate();

					if (!type) {
						type = createDefaultType(typeName);
					}

					t = ThingModel.BuildANewThing.As(type).IdentifiedBy(id)
						.ContainingA.Location("location",
							new ThingModel.Location.LatLng(location.lat, location.lng));

					thingModel.wharehouse.RegisterThing(t.Build(), false, true);
					thingModel.client.Send();
				}
			};
		};
	});
