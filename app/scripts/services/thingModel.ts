/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />
/// <reference path="../../bower_components/ThingModel/TypeScript/build/ThingModel.d.ts" />

/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../references/app.d.ts" />

'use strict';

(<any>angular.module("mobileMasterApp")).provider("thingModel", function () {
	this.$get = (
		$rootScope: MasterScope.Root,
		Knowledge: KnowledgeService,
		$state: ng.ui.IStateService,
		$http: ng.IHttpService,
		itsa: ThingIdentifierService,
		settingsService: SettingsService) => {
		this.warehouse = new ThingModel.Warehouse();

		/*window.onbeforeunload = () => {
			try {
				var serializer = new ThingModel.Proto.ToProtobuf();
				var transaction = serializer.Convert(this.warehouse.Things, [], this.warehouse.ThingsTypes, "offline save");
				window.localStorage.setItem("ThingModelWarehouseOfflineSave", transaction.toBase64());
			} catch (e) {}
		}*/

		var clientID = settingsService.getClientName() + " - " + navigator.userAgent;
		var endPoint = settingsService.getThingModelUrl();
		var infosUrl = settingsService.getHttpThingModelUrl()+"/infos";

		if (settingsService.hasAccesskey()) {
			var key = "?key="+encodeURIComponent(settingsService.getAccessKey());
			endPoint += key;
			infosUrl += key;
		}

		$rootScope.thingmodel = {
			loading: true,
			connected: false,
			nbTransactions: 0,
			lastSenderName: null,
			nbSend: 0
		};


		$rootScope.timelineInfos = {
			count: 0,
			oldest: null,
			newest: null
		};


		$http.get(infosUrl).success((data: any) => {
			$rootScope.timelineInfos.count += data.count;
			$rootScope.timelineInfos.oldest = new Date(data.oldest);
			$rootScope.timelineInfos.newest = new Date(data.newest);
		});

		var applyScope = throttle(() => {
			if (!$rootScope.$$phase) {
				$rootScope.$digest();
			}
		}, 50);

		try {
			this.client = new ThingModel.WebSockets.ClientEnterpriseEdition(clientID, endPoint, this.warehouse);
		} catch (e) {
			alert("ThingModel error: " + e.message);
			$state.go('settings');
			return this;
		} 

		this.client.RegisterObserver({
			OnFirstOpen: () => {
				$rootScope.thingmodel.loading = false;
				$rootScope.$emit('thingmodel.firstopen');
			},
			OnOpen: () => {
				$rootScope.thingmodel.connected = true;
				$rootScope.thingmodel.loading = false;
				$rootScope.$emit('thingmodel.open');
				applyScope();
			},
			OnClose: () => {
				$rootScope.thingmodel.connected = false;
				applyScope();
				$rootScope.$emit('thingmodel.close');
			},
			OnTransaction: (senderName: string) => {
				++$rootScope.thingmodel.nbTransactions;
				if (this.IsLive() && ($rootScope.thingmodel.nbTransactions > 1 || $rootScope.timelineInfos.newest === null)) {
					$rootScope.timelineInfos.newest = new Date();
					++$rootScope.timelineInfos.count;
				}
				$rootScope.thingmodel.lastSenderName = senderName;
				applyScope();
				$rootScope.$emit('thingmodel.transaction');
			},
			OnSend: () => {
				++$rootScope.thingmodel.nbSend;
				++$rootScope.timelineInfos.count;
				$rootScope.timelineInfos.newest = new Date();
				applyScope();
				$rootScope.$emit('thingmodel.send');
			}
		});

		this.RemoveThing = (id: string, send: boolean = true)=> {
			var thing = this.warehouse.GetThing(id);
			this.warehouse.RemoveThing(thing);
			if (send) {
				this.client.Send();
			}
		};

		this.ApplyThingToScope = ($scope: any, thing: ThingModel.Thing) => {

			if (!$scope || !thing) {
				return;
			}

			var name = this.GetThingName(thing);

			$scope.ID = thing.ID;
			$scope.type = thing.Type ? thing.Type.Name : undefined;

			_.each(thing.Properties, (property: ThingModel.Property) => {
				$scope[property.Key] = (<any>property).Value;
			});

			$scope._masterName = name;
		};

		this.GetThingName = (thing: ThingModel.Thing) => {
			if (itsa.beacon(thing)) {
				return thing.String("message");
			}

			if (thing.String("_type") === "response text") {
				return thing.String("description");
			}

			var name: string;
			if (!(name = thing.String('name'))) {
				if (!(name = thing.String('title'))) {
					if (!(name = thing.String('description'))) {
						if (!(name = thing.String('message'))) {
							name = undefined;
						}
					}
				}
			}
			return name;
		};

		this.EditThing = (id: string, values: { [property: string]: { value: string; type: string } }) => {
			var thing = this.warehouse.GetThing(id);
			if (!thing) {
				return;
			}

			_.each(values, (value: {value:any;type:string}, property: string)=> {
				var prop;	
				switch (value.type.toLowerCase()) {
					case 'localization':
						if (value.value.type === 'latlng') {
							prop = new ThingModel.Property.Location.LatLng(property, value.value);
							break;
						}
						if (value.value.type === 'point') {
							prop = new ThingModel.Property.Location.Point(property, value.value);
							break;
						}
						if (value.value.type === 'equatorial') {
							prop = new ThingModel.Property.Location.Equatorial(property, value.value);
							break;
						}
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
						prop = new ThingModel.Property.String(property, value.value == null ? "" : value.value);
						break;
				}
				thing.SetProperty(prop);
			});

			this.warehouse.NotifyThingUpdate(thing);
			this.client.Send();
		};

		this.Live = () => {
			(<ThingModel.WebSockets.ClientEnterpriseEdition> this.client).Live();
			$rootScope.timelineInfos.count = 0;
			$rootScope.thingmodel.nbTransactions = 0;

			$http.get(infosUrl).success((data: any) => {
				$rootScope.timelineInfos.count += data.count;
				$rootScope.timelineInfos.oldest = new Date(data.oldest);
				$rootScope.timelineInfos.newest = new Date(data.newest);
			});
		};

		var currentTime = null;
		this.Load = (time: Date) => {
			currentTime = time;
			(<ThingModel.WebSockets.ClientEnterpriseEdition> this.client).Load(time);
		};

		this.Play = () => {
			(<ThingModel.WebSockets.ClientEnterpriseEdition> this.client).Play();
		};

		this.Pause = () => {
			(<ThingModel.WebSockets.ClientEnterpriseEdition> this.client).Pause();
		};

		this.IsLive = () =>
			(<ThingModel.WebSockets.ClientEnterpriseEdition> this.client).IsLive;

		this.CurrentTime = () => {
			if (this.IsLive()) {
				return new Date();
			}
			return currentTime;
		};

		return this;
	};
});
