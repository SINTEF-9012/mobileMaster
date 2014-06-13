/// <reference path="../../bower_components/ThingModel/TypeScript/build/ThingModel.d.ts" />

angular.module("mobileMasterApp").provider("thingModel", function () {
	this.$get = ($rootScope: MasterScope.Root,
		Knowledge: KnowledgeModule,
		settingsService: SettingsService) => {
		this.warehouse = new ThingModel.Warehouse();

		var clientID = settingsService.getClientName() + " - " + navigator.userAgent;
		var endPoint = settingsService.getThingModelUrl();

		this.client = new ThingModel.WebSockets.Client(clientID, endPoint, this.warehouse);

		this.RemoveThing = (id: string)=> {
			var thing = this.warehouse.GetThing(id);
			this.warehouse.RemoveThing(thing);
			this.client.Send();
		};

		this.EditThing = (id: string, values: { [property: string]: { value: string; type: string } }) => {
			var thing = this.warehouse.GetThing(id);
			if (!thing) {
				return;
			}

			_.each(values, (value: {value:string;type:string}, property: string)=> {
				var prop;	
				switch (value.type.toLowerCase()) {
					case 'localization':
						throw "Not implemented";
					case 'number':
					case 'double':
						prop = new ThingModel.Property.Double(property, parseFloat(value.value));
						break;
					case 'int':
						prop = new ThingModel.Property.Int(property, parseInt(value.value));
						break;
					case 'datetime':
						prop = new ThingModel.Property.DateTime(property, new Date(value.value));
						break;
					case 'boolean':
						prop = new ThingModel.Property.Boolean(property, !/^(false|0|no)$/i.test(value.value));
						break;
					default :
					case 'string':
						prop = new ThingModel.Property.String(property, value.value);
						break;
				}
				thing.SetProperty(prop);
			});

			this.warehouse.NotifyThingUpdate(thing);
			this.client.Send();
		};

		return this;
	};
});