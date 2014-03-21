/// <reference path="../../bower_components/ThingModel/TypeScript/build/ThingModel.d.ts" />

angular.module("mobileMasterApp").provider("thingModel", function () {

	this.clientID = "mobileMaster - " + navigator.userAgent;
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
				tableProperties: Knowledge.getPropertiesOrder(type)
			};
		}
		var typeName = thing.Type ? thing.Type.Name : "Thing";

		var scopeThing: MasterScope.Thing = {
			ID: thing.ID,
			name: null,
			typeName: typeName
		};

		_.each(thing.Properties, (property: ThingModel.Property) => {
			scopeThing[property.Key] = (<any>property).Value;
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

		$rootScope.types[typeName].things[thing.ID] = scopeThing;
	};

	this.$get = ($rootScope: MasterScope.Root, Knowledge : KnowledgeModule) => {
		this.wharehouse = new ThingModel.Wharehouse();

		$rootScope.types = {};

		this.wharehouse.RegisterObserver({
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
				//console.log(thing);
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

				if (thingType.Description !== "undefined") {
					scopeType.Description = thingType.Description;
				}

				$rootScope.types[thingType.Name] = {
					type: scopeType,
					things: {},
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

		this.client = new ThingModel.WebSockets.Client(this.clientID, this.endPoint, this.wharehouse);

		return this;
	};
});