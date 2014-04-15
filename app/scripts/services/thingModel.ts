/// <reference path="../../bower_components/ThingModel/TypeScript/build/ThingModel.d.ts" />

angular.module("mobileMasterApp").provider("thingModel", function () {

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

	var applyThingToScope = ($rootScope: MasterScope.Root, Knowledge: KnowledgeModule, thing: ThingModel.Thing) => {
		var prop;
		var name = thing.ID;

		if (thing.HasProperty("name")) {
			prop = thing.GetProperty<ThingModel.Property.String>("name");
			if (prop) {
				name = prop.Value;
			}
		}
		else if (thing.HasProperty("title")) {
			prop = thing.GetProperty<ThingModel.Property.String>("title");
			if (prop) {
				name = prop.Value;
			}
		}

		if (!thing.Type && !$rootScope.types['Thing']) {
			var type = ThingModel.BuildANewThingType
				.Named('Thing').WhichIs('The default type').Build();

			if (!$rootScope.types) {
				$rootScope.types = {};
			}

			$rootScope.types['Thing'] = {
				type: type,
				things: {},
				visible: true,
				count: 0,
				tableProperties: Knowledge.getPropertiesOrder(type)
			};
		}
		var typeName = thing.Type ? thing.Type.Name : "Thing";

		var scopeType = $rootScope.types[typeName];

		var scopeThing: MasterScope.Thing = {
			ID: thing.ID,
			name: null,
			visible:scopeType.visible,
			typeName: typeName
		};

		_.each(thing.Properties, (property: ThingModel.Property) => {
//			console.log((<any>property).Value);
			if (property.Type != ThingModel.Type.DateTime) {
				scopeThing[property.Key] = (<any>property).Value;
			} else {
				console.log((<any>property).Value);
			}
		});
		scopeThing.name = name;

		if (thing.HasProperty("location")) {
			prop = thing.GetProperty<ThingModel.Property.Location>("location", ThingModel.Type.Location);
			if (prop) {
				scopeThing.location = {
					x: prop.Value.X,
					y: prop.Value.Y,
					z: prop.Value.Z
				};
			}
		}

		if (!$rootScope.things) {
			$rootScope.things = {};
		}

		$rootScope.things[thing.ID] = scopeThing;

		scopeType.things[thing.ID] = scopeThing;
	};

	this.$get = ($rootScope: MasterScope.Root,
		Knowledge: KnowledgeModule,
		settingsService: SettingsService) => {
		this.warehouse = new ThingModel.Warehouse();

		$rootScope.types = {};

		this.warehouse.RegisterObserver({
			New: (thing: ThingModel.Thing) => {

				applyThingToScope($rootScope, Knowledge, thing);

				synchronizeScope($rootScope);
			},
			Updated: (thing : ThingModel.Thing) => {
				//var typeName = thing.Type ? thing.Type.Name : "Thing";
				applyThingToScope($rootScope, Knowledge, thing);
				//$rootScope.things[typeName][thing.ID] = thing;
				synchronizeScope($rootScope);
			},
			Deleted: (thing : ThingModel.Thing) => {
				if ($rootScope.things) {
					delete $rootScope.things[thing.ID];
				}

				if ($rootScope.types) {
					var typeName = thing.Type ? thing.Type.Name : "Thing";
					delete $rootScope.types[typeName].things[thing.ID];
				}

				synchronizeScope($rootScope);
			},
			Define: (thingType: ThingModel.ThingType) => {
				if (!$rootScope.types) {
					$rootScope.types = {};
				}

				var scopeType : any = {
					name: thingType.Name
				};

				// TODO identify undefined source and fixe it
				if (thingType.Description !== "undefined") {
					scopeType.Description = thingType.Description;
				}

				var things : { [name: string]: MasterScope.Thing }
					= $rootScope.types[thingType.Name] ? $rootScope.types[thingType.Name].things : {};

				$rootScope.types[thingType.Name] = {
					type: scopeType,
					visible: true,
					things: things,
					count: 0,
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