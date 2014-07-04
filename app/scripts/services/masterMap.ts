/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="./../../bower_components/PruneCluster/PruneCluster.ts" />
/// <reference path="./../references/NodeMaster.d.ts" />
/// <reference path="./../references/app.d.ts" />
/// <reference path="./../masterScope.d.ts" />
'use strict';

angular.module('mobileMasterApp')
	.provider('masterMap', function() {

		var layersTable = {},
			leafletsLayersTable = {},
			layersList = [];

		this.declareTileLayer = (layer: MasterScope.Layer) => {
			layersTable[layer.name] = layer;
			layersList.push(layer);
			return this;
		};
		this.container = document.createElement("div");
		this.container.className = "map";
		this.setContainer = (container: HTMLElement) => {
			this.container = container;
			return this;
		};
		this.options = {};

		this.setOptions = (options: L.MapOptions) => {
			this.options = options;
			return this;
		};
		var defaultLayerName: string = null;
		this.setDefaultTileLayer = (name: string) => {
			defaultLayerName = name;
			return this;
		};

		this.layerClasses = {};
		this.declareLayerClass = (name: string, layer: L.ILayer) => {
			this.layerClasses[name] = layer;
		};


		this.$get = function (
			$compile: ng.ICompileService,
			$rootScope: MasterScope.Root,
			settingsService: SettingsService,
			itsa: ThingIdentifierService,
			$state: ng.ui.IStateService,
			$stateParams: any,
			thingModel: ThingModelService) {

			// Generals settings
			L.Renderer.prototype.options.padding = 0.1;
			//PruneClusterLeafletSpiderfier.prototype._circleFootSeparation = 30;
			PruneClusterLeafletSpiderfier.prototype.spiderfyDistanceMultiplier = 1.26;

			var instance = <Master.Map> L.map(this.container, this.options);

			var jbody = $(document.body);
			instance.on('zoomstart movestart markerdragstart', () => {
				jbody.addClass("disable-markers-animations");
			}).on('zoomend moveend markerdragend', (e) => {
				window.setImmediate(() => jbody.removeClass("disable-markers-animations"));
			});

			var cluster: PruneCluster.LeafletAdapter = new PruneClusterForLeaflet(100);

			instance.addLayer(cluster);

			var masterIcon = L.Icon.extend({
				options: {
					iconSize: [40, 40],
					iconAnchor: [20, 20],
					popupAnchor: [0, -17],
					className: 'leaflet-master-icon',
					html: false
				},

				createIcon: function(oldIcon: Element) {

					var div;

					if (oldIcon && oldIcon.tagName === 'DIV') {
						div = oldIcon;
						oldIcon.removeChild(oldIcon.firstChild);
					} else {
						div = document.createElement('div');
					}

					var e = angular.element('<master-icon />');
					if (this.thingID) {
						e.attr('thingid', this.thingID);
					} else {
						e.attr('type', this.type);
					}

					var masterIconElement = $compile(e);
					masterIconElement(this.scope).appendTo(div);

					this._setIconStyles(div, 'icon');

					return div;
				},

				createShadow: () => null
			});

			var colors = ['#ff4b00', '#bac900', '#EC1813', '#55BCBE', '#D2204C', '#7109aa', '#ada59a', '#3e647e'],
				// rouge orange, vert pomme, jaune, bleu ciel, magenta, violet, gris beige, bleu marine
				pi2 = Math.PI * 2;

			var clusterIcon = L.Icon.extend({
				options: {
					iconSize: new L.Point(42, 42),
					//iconSize: new L.Point(48, 48),
					className: 'prunecluster leaflet-markercluster-icon'
				},

				createIcon: function () {
					// based on L.Icon.Canvas from shramov/leaflet-plugins (BSD licence)
					var e = document.createElement('canvas');
					this._setIconStyles(e, 'icon');
					var s = this.options.iconSize;
					var w = s.x, h = s.y;
					if (L.Browser.retina) {
						w += w;
						h += h;
					}
					e.width = w;
					e.height = h;
					this.draw(e.getContext('2d'), w, h);
					return e;
				},

				createShadow: function () {
					return null;
				},

				draw: function (canvas, width, height) {


					var xa = 2, xb = 50, ya = 18, yb = 21;

					var r = ya + (this.population - xa) * ((yb - ya) / (xb - xa));

					var radiusMarker = Math.min(r, 21),
						radiusCenter = 11,
						center = width / 2;

					if (L.Browser.retina) {
						canvas.scale(2, 2);
						center /= 2;
						canvas.lineWidth = 0.5;
					}

					canvas.strokeStyle = 'rgba(0,0,0,0.25)';

					var start = 0, stroke = true;
					for (var i = 0, l = colors.length; i < l; ++i) {

						//var size = Math.min(this.stats[i] / this.population,
						//	this.stats[i] / 100);

						var size = this.stats[i] / this.population;

						if (size > 0) {

							stroke = size != 1;

							canvas.beginPath();
							canvas.moveTo(center, center);
							canvas.fillStyle = colors[i];
							var from = start + 0.14,
								to = start + size * pi2;

							if (to < from || size == 1) {
								from = start;
							}
							canvas.arc(center, center, radiusMarker, from, to);

							start = start + size * pi2;
							canvas.lineTo(center, center);
							canvas.fill();
							if (stroke) {
								canvas.stroke();
							}
							canvas.closePath();
						}

					}

					if (!stroke) {
						canvas.beginPath();
						canvas.arc(center, center, radiusMarker, 0, Math.PI * 2);
						canvas.stroke();
						canvas.closePath();
					}

					canvas.beginPath();
					canvas.fillStyle = 'white';
					canvas.moveTo(center, center);
					canvas.arc(center, center, radiusCenter, 0, Math.PI * 2);
					canvas.fill();
					canvas.closePath();


					canvas.fillStyle = '#454545';
					canvas.textAlign = 'center';
					canvas.textBaseline = 'middle';
					canvas.font = 'bold '+(this.population < 100 ? '12' : '11')+'px sans-serif';

					canvas.fillText(this.population, center, center, radiusCenter*2);
				},

				/*_draw: function (canvas, width, height) {

					var lol = 0;

					var start = 0;
					for (var i = 0, l = colors.length; i < l; ++i) {

						var size = this.stats[i] / this.population;


						if (size > 0) {

							canvas.beginPath();

							var angle = Math.PI / 4 * i;
							var posx = Math.cos(angle) * 17, posy = Math.sin(angle) * 17;


							var xa = 0, xb = 1, ya = 4, yb = 7;

							// var r = ya + (size - xa) * ((yb - ya) / (xb - xa));
							var r = ya + size * (yb - ya);


							//canvas.moveTo(posx, posy);
							canvas.arc(24 + posx, 24 + posy, r, 0, pi2);
							canvas.fillStyle = colors[i];
							canvas.fill();
							canvas.closePath();
						}

					}

					canvas.beginPath();
					canvas.fillStyle = 'white';
					canvas.arc(24, 24, 15, 0, Math.PI * 2);
					canvas.fill();
					canvas.closePath();

					canvas.fillStyle = '#555';
					canvas.textAlign = 'center';
					canvas.textBaseline = 'middle';
					canvas.font = 'bold 12px sans-serif';

					canvas.fillText(this.population, 24, 24, 48);
				}*/

			});

			(<any>cluster).PrepareLeafletMarker = (marker: L.Marker, data: any) => {
				var id = data.ID;

				var icon = new masterIcon();
				icon.scope = $rootScope;
				icon.thingID = id;

				marker.setIcon(icon);

				var content = $('<div />');



				var thing = thingModel.warehouse.GetThing(id);

				if (!thing) {
					return;
				}

				var toState = itsa.victim(thing) ? 'victim' : 'thing';

				content.click(() => {
					$state.go(toState, { ID: id, from: $stateParams.from ? $stateParams.from : 'map' });
				});

				var name : string;
				if (!(name = thing.String('name'))) {
					if (!(name = thing.String('title'))) {
						if (!(name = thing.String('description'))) {
							name = thing.Type ? thing.Type.Name : 'unknown object';
						}
					}
				}

				content.text(name);
				var url: string = null, img = $('<img />');

				if (thing.Type && /(media|picture)/i.test(thing.Type.Name)) {
					url = thing.String('url');
					if (url) {
						url = settingsService.getMediaServerUrl() +
							"/thumbnail/" + url;
						content.addClass('with-media');
					}
				}

				if (!url) {
					content.addClass('with-identicon');
					url = settingsService.getMediaServerUrl() + "/identicon/" + encodeURIComponent(id) + "?style=averagewindow";
				}

				content.prepend(img.attr('src', url));

				var popup = (<any>marker).getPopup();
				(<any>marker)._masterMapThingId = id;

				if (popup) {
					popup.setContent(content.get(0));
					popup.update();
				} else {
					marker.bindPopup(content.get(0));
					marker.on('dblclick', () => {
						$state.go(toState, {
							ID: (<any>marker)._masterMapThingId,
							from: $stateParams.from ? $stateParams.from : 'map'
						});
					});
				}

			};

			cluster.BuildLeafletClusterIcon = (cluster: PruneCluster.Cluster) => {

				/*var results = [];

				angular.forEach(cluster.stats, (value, key) => {
					results.push({count: value, name: key});
				});

				results.sort((a, b) => b.count - a.count);

				var more = results.length > 3;

				if (more) {
					results = results.slice(0, 3);
				}

				var div = angular.element('<div/>');
				for (var i = 0, l = results.length; i < l; ++i) {
					var e = angular.element('<master-icon />');
						e.attr('type', results[i].name);
						var masterIconElement = $compile(e);
						masterIconElement($rootScope).appendTo(div);
				}

				return new L.DivIcon({
					html: div.html(),
					className: 'cluster-multi',
					iconSize: L.point(40, 40)
				});*/

				var e = new clusterIcon();

				e.stats = cluster.stats;
				e.population = cluster.population;
				return e;

			};

			instance.declareTileLayer = function(layer) {
				layersTable[layer.name] = layer;
				layersList.push(layer);
				return instance;
			};

			instance.getTilesLayers = function() {
				return layersList;
			};

			instance.createMasterIconWithType = (type: string, scope: ng.IScope, options?: L.IconOptions) => {
				var i = new masterIcon(options);
				i.scope = scope;
				i.type = type;
				return i;
			};

			instance.showTileLayer = function (name: string) {

				var layer = layersTable[name];
				if (!layer) {
					throw "Unknown layer";
				}

				var leafletLayer = leafletsLayersTable[layer.name];

				if (!leafletLayer) {
					leafletLayer = layer.create();
					leafletsLayersTable[layer.name] = leafletLayer;
				}

				if (!layer.active) {
					layer.active = true;
					instance.addLayer(leafletLayer, true);
				}

				return this;

			};

			var minimap = null, miniMapEnabled = false;
			instance.enableMiniMap = function () {
				if (!minimap) {
					var osm2 = new L.TileLayer('https://{s}.tiles.mapbox.com/v3/apultier.i0afp8bh/{z}/{x}/{y}.png', {
						detectRetina: true,
						maxNativeZoom: 17
					});

					minimap = new L.Control.RTSMiniMap(osm2, { toggleDisplay: false });
				}

				if (!miniMapEnabled) {
					minimap.addTo(instance);
					miniMapEnabled = true;
				}

				return this;
			};

			instance.disableMiniMap = function() {
				if (minimap && miniMapEnabled) {
					instance.removeControl(minimap);
					miniMapEnabled = false;
				}
				return this;
			};

			instance.clearMiniMap = function() {
				if (minimap) {
					minimap.clear();
				}
				return this;
			};

			instance.renderMiniMap = function() {
				if (minimap) {
					minimap.render();
				}
				return this;
			};

			instance.drawMiniMapPoint = function(pos, color) {
				if (minimap) {
					minimap.addPoint(pos, color);
				}
				return this;
			};

			instance.hideTileLayer = (name: string) => {
				if (layersTable.hasOwnProperty(name)) {
					var layer: MasterScope.Layer = layersTable[name];

					if (layer.active) {
						layer.active = false;
						instance.removeLayer(leafletsLayersTable[name]);
					}
				}

				return this;
			};

			instance.enableInteractions = () => {
				instance.dragging.enable();
				instance.touchZoom.enable();
				instance.doubleClickZoom.enable();
				instance.scrollWheelZoom.enable();
				instance.boxZoom.enable();
				instance.keyboard.enable();

				instance.tap && instance.tap.enable();
				return this;
			};

			instance.disableInteractions = () => {
				instance.dragging.disable();
				instance.touchZoom.disable();
				instance.doubleClickZoom.disable();
				instance.scrollWheelZoom.disable();
				instance.boxZoom.disable();
				instance.keyboard.disable();
				instance.tap && instance.tap.disable();
				return this;
			};

			var scale: L.IControl = null, scaleEnabled = false;
			instance.enableScale = () => {
				if (!scale) {
					scale = L.control.scale({ imperial: false, maxWidth: 150 });
				}

				if (!scaleEnabled) {
					instance.addControl(scale);
					scaleEnabled = true;
				}
			}

			instance.disableScale = () => {
				if (scale && scaleEnabled) {
					instance.removeControl(scale);
					scaleEnabled = false;
				}
			}

			var situationOverviewEnabled = false;
			instance.enableSituationOverview = () => {
				if (!situationOverviewEnabled) {
					situationOverviewEnabled = true;
					processView();
				}
			}

			var overviewWorker = L.Util.throttle(() => {
				if (situationOverviewEnabled) {
					cluster.FitBounds();
				}
			}, 1000, instance);

			instance.disableSituationOverview = () => {
				situationOverviewEnabled = false;
			}

			instance.getLayerClass = (name: string) => this.layerClasses[name];

			if (defaultLayerName) {
				instance.showTileLayer(defaultLayerName);
			}

			var lastCall = 0,
				workerTimeout = 0,
				firstCall = true,
			processViewWorker = () => {
				cluster.ProcessView();
				if (firstCall) {
					window.setTimeout(overviewWorker, 300);
					firstCall = false;
				} else {
					overviewWorker();
				}

				workerTimeout = 0;
				// a new date because it can be time consumming
				lastCall = +new Date();
			},
			interval = 300;

			var processView = () => {
				if (workerTimeout !== 0) {
					return;
				}

				var now = +new Date();
				if (now - lastCall < interval) {
					workerTimeout = window.setTimeout(processViewWorker, interval);
					return;
				}

				processViewWorker();
			};


			var thingsOnTheMap : {[id:string] : PruneCluster.Marker}= {};

			// rouge orange 0, vert pomme 1, jaune 2, bleu ciel 3, magenta 4, violet 5, gris beige 6, bleu marine 7
			var lockupTypeColor = {
				Victims: 0,
				Resources: 3,
				Incidents: 2,
				Orders: 1,
				Multimedias: 7,
				Beacons: 5,
				Risks: 4,
				Others: 6
			};

			var addMarker = (thing: ThingModel.Thing) => {
				if (thingsOnTheMap.hasOwnProperty(thing.ID)) {
					removeMarker(thing);
					}

					var location = thing.LocationLatLng();

					if (!location || isNaN(location.Latitude) || isNaN(location.Longitude)) {
						return;
					}

					var m = new PruneCluster.Marker(location.Latitude, location.Longitude, {
						ID: thing.ID
					});

					m.category = lockupTypeColor[itsa.typefrom(thing)];
					
					// TODO weight ?

					cluster.RegisterMarker(m);
					thingsOnTheMap[thing.ID] = m;

					processView();
			};

			var removeMarkersTimeout = 0, markersToRemove = [];
			var removeMarker = (thing: ThingModel.Thing) => {
				var id = thing.ID;
				var marker = thingsOnTheMap[id];

				if (marker) {
					markersToRemove.push(marker);
					delete thingsOnTheMap[id];

					// The removing is delayed so we can group removing actions
					if (removeMarkersTimeout === 0) {
						removeMarkersTimeout = window.setTimeout(() => {
							removeMarkersTimeout = 0;

							cluster.RemoveMarkers(markersToRemove);
							cluster.ProcessView();
							markersToRemove = [];

						}, 50);
					}
				}
			};

			angular.forEach(thingModel.warehouse.Things, addMarker);

			thingModel.warehouse.RegisterObserver({
				New: addMarker,
				Updated: (thing: ThingModel.Thing) => {
					var marker = thingsOnTheMap[thing.ID];

					if (!marker) {
						addMarker(thing);
						return;
					}

					var location = thing.LocationLatLng();

					if (!location || isNaN(location.Latitude) || isNaN(location.Longitude)) {
						removeMarker(thing);
						return;
					}

					marker.Move(location.Latitude, location.Longitude);
					processView();
				},
				Deleted: removeMarker,
				Define: () => {}
			});

		

			(<any>instance).oldFitBounds = instance.fitBounds;
			var paddingBottomRight = new L.Point(20, 20),
				paddingTopLeft = new L.Point(20, 20);
			instance.fitBounds = (bounds: L.LatLngBounds, options?: L.FitBoundsOptions) => {
				if (!options) {
					options = {
						paddingBottomRight: paddingBottomRight,
						paddingTopLeft: paddingTopLeft
					};
				} else {
					if (!options.paddingTopLeft) {
						options.paddingTopLeft = paddingTopLeft;
					}
					if (!options.paddingBottomRight) {
						options.paddingBottomRight = paddingBottomRight;
					}
				}
				(<any>instance).oldFitBounds(bounds, options);
				return this;
			};

			instance.setVerticalTopMargin = (margin: number) => {
				paddingTopLeft.y = margin + 20;
			};

			(<any>instance)._getMapPanePos = function () {
				return L.DomUtil.getPosition(this._mapPane) || new L.Point(0,0);
			};

			instance.moveTo = (div: HTMLElement) => {
				jbody.addClass('disable-markers-animations');
				div.appendChild(instance.getContainer());

				(<any>L.Util.falseFn)(div.offsetWidth); // redraw ?

				instance.invalidateSize({});

				window.setImmediate(() => {
					jbody.removeClass('disable-markers-animations');
				});
			};

			var shadowLayer = null;
			instance.enableShadow = (title?: string, icon?: HTMLElement, className?: string) => {
				if (shadowLayer) {
					instance.disableShadow();
				}

				var c = <any>instance.getLayerClass('shadow');
				shadowLayer = new c(title, icon, className);

				instance.addLayer(shadowLayer);
			};

			instance.disableShadow = () => {
				if (shadowLayer) {
					instance.removeLayer(shadowLayer);
					shadowLayer = null;
				}
			}

			return instance;
		};

		this.declareLayerClass("shadow", L.Layer.extend({
			initialize: function(title, icon, className) {
				// save position of the layer or any options from the constructor
				this._titleText = title;
				this._icon = icon;
				this._class = 'shadow-layer';
				if (className) {
					this._class += ' ' + className;
				}
			},

			onAdd: function(map: L.Map) {
				this._map = map;

				// create a DOM element and put it into one of the map panse
				this._el = L.DomUtil.create('div', this._class);

				if (this._titleText) {
					this._title = L.DomUtil.create('h1', '');
					this._title.appendChild(document.createTextNode(this._titleText));
					this._el.appendChild(this._title);
				}

				if (this._icon) {
					this._el.appendChild(this._icon);
				}
				map.getContainer().appendChild(this._el);

				// add a viewreset event listener for updating layer's position, do the latter
				// map.on('viewreset move', this._reset, this);
				//this._reset();
			},

			onRemove: function() {
				// remove layer's DOM elements and listeners
				this._map.getContainer().removeChild(this._el);
				this._map.off('viewreset move', this._reset, this);
			},

			_reset: function() {
				// update layer's position
				//L.DomUtil.setPosition(this._el, pos);
				L.DomUtil.setPosition(this._el, this._map.latLngToLayerPoint(this._map.getCenter()));
			}
		}));
		});
