'use strict';

angular.module('mobileMasterApp')
	.provider('AddService', function() {
		var types: { [name: string]: ThingModel.ThingType } = {};

		this.defineType = (type: ThingModel.ThingType) => {
			types[type.Name] = type;
		};

		var createDefaultType = (typeName: string, location: boolean)=> {
			var type = ThingModel.BuildANewThingType.Named(typeName);

			if (location) {
				type.ContainingA.LocationLatLng("location");
			}

			var btype = type.Build();
			types[typeName] = btype;
			return btype;
		};

		var preciseRound = (value: number, precision: number) => +value.toFixed(precision);

		this.$get = (thingModel: ThingModelService, UUID: UUIDService) => {
			return {
				register: (typeName: string, location?: L.LatLng, fillingCallback?: (thing:ThingModel.ThingPropertyBuilder)=>any, overrideID?:string) => {
					var type = types[typeName],
						t: ThingModel.ThingPropertyBuilder,
						id = overrideID ? overrideID : UUID.generate();

					if (!type) {
						type = createDefaultType(typeName, !!location);
					}

					t = ThingModel.BuildANewThing.As(type).IdentifiedBy(id);

					if (location) {
						t.ContainingA.Location("location",
							new ThingModel.Location.LatLng(
								preciseRound(location.lat, 8), preciseRound(location.lng, 8)));
					}

					if (fillingCallback) {
						fillingCallback(t);
					}

					thingModel.warehouse.RegisterThing(t.Build(), false, true);
					thingModel.client.Send();
				}
			};
		};
	});
