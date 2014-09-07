/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/angular-ui/angular-ui-router.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />

/// <reference path="./../references/app.d.ts" />
/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../references/PruneCluster.d.ts" />
/// <reference path="./../masterScope.d.ts" />

'use strict';

(<any>angular.module('mobileMasterApp'))
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
			filterService: FilterService,
			$state: ng.ui.IStateService,
			$stateParams: any,
			thingModel: ThingModelService) {

			// Generals settings
			L.Renderer.prototype.options.padding = 0.1;
			//PruneClusterLeafletSpiderfier.prototype._circleFootSeparation = 30;
			PruneClusterLeafletSpiderfier.prototype.spiderfyDistanceMultiplier = 1.26;

			var instance = <Master.Map> L.map(this.container, this.options);

			var jbody = $(document.body.parentElement);

			var eventState = {
				'zoom': false,
				'move': false,
				'margerdrag': false,
				'container': false
			};
			instance.on('zoomstart movestart markerdragstart', (e) => {

				if (eventState.zoom === false &&
					eventState.move === false &&
					eventState.container === false &&
					eventState.margerdrag === false) {
					jbody.addClass("disable-markers-animations");
				}

				var t = e.type.slice(0, -5);
				eventState[t] = true;
			}).on('zoomend moveend markerdragend', (e) => {
				var t = e.type.slice(0, -3);
				eventState[t] = false;

				if (eventState.zoom === false &&
					eventState.move === false &&
					eventState.container === false &&
					eventState.margerdrag === false) {
					window.setImmediate(() => jbody.removeClass("disable-markers-animations"));
				}
			});

			instance.GamepadController.enable();

			var cluster: PruneCluster.LeafletAdapter = new PruneClusterForLeaflet(100);

			instance.addLayer(cluster);

			//L.tileLayer('http://d2z9m7k9h4f0yp.cloudfront.net/tiles/cycling/color3/{z}/{x}/{y}.png').addTo(instance);

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

					if (this.selected) {
						e.attr('selected', this.selected);
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
					// based on L.Icon.Canvas from shramov/leaflet-plugins (BSD licence)
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

				var toState = itsa.victim(thing) ? 'victim' : (itsa.media(thing) ? 'media' : 'thing');

				content.click(() => {
					$state.go(toState, { ID: id, from: $stateParams.from ? $stateParams.from : 'map' });
				});

				var name : string;
				if (!(name = thing.String('name'))) {
					if (!(name = thing.String('title'))) {
						if (!(name = thing.String('description'))) {
							if (!(name = thing.String('message'))) {
								name = thing.Type ? thing.Type.Name : 'unknown object';
							}
						}
					}
				}

				content.text(name);
				var url: string = null, img = $('<img />');

				if (itsa.media(thing)) {
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
					marker.bindPopup(content.get(0), {
						closeButton: false,
						keepInView: false
					});
					popup = marker.getPopup();

					popup.setLatLng = L.Util.bind(function (latlng: L.LatLng) {
						this._latlng = latlng;
						if (this._map) {
							this._updatePosition();
							// NO this._adjustPan();
						}
						return this;
					}, popup);

					marker.on('dblclick', () => {
						$state.go(toState, {
							ID: (<any>marker)._masterMapThingId,
							from: $stateParams.from ? $stateParams.from : 'map'
						});
					});
				}

			};

			cluster.BuildLeafletClusterIcon = (cluster: PruneCluster.Cluster) => {

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
					leafletLayer.bringToBack();
				}

				return this;

			};

			function reloadMinimapMarkers() {
				minimap.clear();

				angular.forEach(thingsOnTheMap, (marker: PruneCluster.Marker) => {
					var minimapPoint = marker.data.minimapPoint, color = marker.data.minimapColor;
					if (minimapPoint) {
						minimapPoint.lat = marker.position.lat;
						minimapPoint.lng = marker.position.lng;
					} else {
						minimapPoint = new L.LatLng(marker.position.lat, marker.position.lng);
						marker.data.minimapPoint = minimapPoint;
					}

					minimap.addPoint(minimapPoint, color);
				});
			}

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
					reloadMinimapMarkers();
					minimap.render();
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
					instance.on('move', processView);
					instance.closePopup();
					processView();
				}
			}

			var overviewWorker = throttle(() => {
				if (situationOverviewEnabled) {
					cluster.FitBounds();
				}
			}, 1000);

			instance.disableSituationOverview = () => {
				situationOverviewEnabled = false;
				instance.off('move', processView);
			}

			instance.showOverview = () => {
				cluster.FitBounds();
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

				if (miniMapEnabled) {
					minimap.render();
				}

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


			var thingsOnTheMap: { [id: string]: PruneCluster.Marker } = {};
			var overlaysOnTheMap: { [id: string]: L.ImageOverlay } = {};
			var filteredOverlaysLookupTable: { [id: string]: boolean } = {};

			var serviceFilterMethod = filterService.getFilter();
			var filteredThings: { [id: string]: boolean } = {};



			var filteringMethod: (thing: ThingModel.Thing) => boolean = (thing: ThingModel.Thing) => {
				return serviceFilterMethod(thing) || filteredThings.hasOwnProperty(thing.ID);
			};

			$rootScope.$on('filterServiceUpdate', () => {
				angular.forEach(thingsOnTheMap, (marker: PruneCluster.Marker, id: string) => {
					var thing = thingModel.warehouse.GetThing(id);
					marker.filtered = filteringMethod(thing);
				});
				processView();
			});

			$rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
				var copyfilteredThings = _.clone(filteredThings);
				filteredThings = {};
				angular.forEach(copyfilteredThings, (value, id) => {
					var previousThing = thingsOnTheMap[id];
					if (previousThing) {
						var thing = thingModel.warehouse.GetThing(id);
						if (thing) {
							previousThing.filtered = filteringMethod(thing);
						}
					}
				});

				instance.removeSelectedThing();
				// TODO process view here ?
			});

			instance.filterThing = (id: string) => {
				var thing = thingsOnTheMap[id];
				if (thing) {
					thing.filtered = true;
				}

				filteredThings[id] = true;
				processView();
			};

			var selectedMapMarker = null, selectedMarkerId = null, noAnimTimeout = 0;
			instance.setSelectedThing = (id: string, lat: number, lng: number) => {
				if (selectedMapMarker && selectedMarkerId !== id) {
					instance.removeSelectedThing();
					instance.setSelectedThing(id, lat, lng);
					return;
				}	

				if (jbody.hasClass("disable-markers-animations")) {
					noAnimTimeout = window.setTimeout(() => {
						instance.setSelectedThing(id, lat, lng);
						noAnimTimeout = 0;
					}, 150);
					return;
				}

				if (noAnimTimeout) {
					window.clearTimeout(noAnimTimeout);
					noAnimTimeout = 0;
				}

				if (!selectedMapMarker) {
					selectedMapMarker = new L.Marker(new L.LatLng(lat, lng));
					var icon = new masterIcon();
					icon.scope = $rootScope;
					icon.thingID = id;
					icon.selected = true;
					selectedMapMarker.setIcon(icon);
					selectedMapMarker.setZIndexOffset(1000);
					instance.addLayer(selectedMapMarker);
				} else {
					selectedMapMarker.setLatLng(new L.LatLng(lat, lng));
				}

				selectedMarkerId = id;
			};

			instance.removeSelectedThing = () => {
				if (selectedMapMarker != null) {
					var m = selectedMapMarker;
					window.setTimeout(() => {
						m.setOpacity(0);
					}, 300);

					window.setTimeout(() => {
						instance.removeLayer(m);
					}, 600);
					selectedMapMarker = null;
				}
			};

			// rouge orange 0, vert pomme 1, jaune 2, bleu ciel 3, magenta 4, violet 5, gris beige 6, bleu marine 7
			var lockupTypeColor = {
				Victims: 0,
				Resources: 3,
				Incidents: 2,
				Responses: 1,
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

				var type = itsa.typefrom(thing),
					category = lockupTypeColor[type],
					color = colors[category];

				m.category = category;
				m.filtered = filteringMethod(thing);
				m.data.minimapColor = color;
				// TODO weight ?

				if (minimap && miniMapEnabled) {
					var minimapPoint = new L.LatLng(location.Latitude, location.Longitude);
					m.data.minimapPoint = minimapPoint;
					minimap.addPoint(minimapPoint, color);
				}

				cluster.RegisterMarker(m);
				thingsOnTheMap[thing.ID] = m;

				processView();
			};

			var updateMarker = (thing: ThingModel.Thing) => {
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
				marker.filtered = filteringMethod(thing);

				if (miniMapEnabled) {
					var minimapPoint = <L.LatLng>marker.data.minimapPoint;
					if (minimapPoint) {
						minimapPoint.lat = location.Latitude;
						minimapPoint.lng = location.Longitude;
					}
				}

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
							markersToRemove = [];

							if (miniMapEnabled) {
								reloadMinimapMarkers();
							}

							processView();
						}, 50);
					}
				}
			};

			var addImageOverlay = (thing: ThingModel.Thing) => {
				var topLeft = thing.LocationLatLng("topleft"),
					bottomRight = thing.LocationLatLng("bottomright"),
					url = thing.String("url");

				var overlay = new L.MasterImageOverlay(url,
					new L.LatLngBounds([
						new L.LatLng(topLeft.Latitude, topLeft.Longitude),
						new L.LatLng(bottomRight.Latitude, bottomRight.Longitude)
					]), {
						resizeServiceEndpoint: settingsService.getMediaServerUrl()+"/resize/deform/{width}/{height}/{url}"	
					});

				if (!filteredOverlaysLookupTable.hasOwnProperty(thing.ID)) {
					overlay.addTo(instance);
				}
				overlaysOnTheMap[thing.ID] = overlay;
			},
			removeImageOverlay = (thing: ThingModel.Thing) => {
				if (overlaysOnTheMap.hasOwnProperty(thing.ID)) {
					instance.removeLayer(overlaysOnTheMap[thing.ID]);
				}
			};

			instance.hideOverlay =  (id: string) => {
				filteredOverlaysLookupTable[id] = true;
				if (overlaysOnTheMap.hasOwnProperty(id)) {
					instance.removeLayer(overlaysOnTheMap[id]);
				}
			};

			instance.showOverlay = (id: string) => {
				delete filteredOverlaysLookupTable[id];
				if (overlaysOnTheMap.hasOwnProperty(id)) {
					instance.addLayer(overlaysOnTheMap[id]);
				}
			};

			var addMarkerOrOverlay = (thing: ThingModel.Thing) => {
				if (itsa.imageOverlay(thing)) {
					addImageOverlay(thing);
				} else {
					addMarker(thing);
				}
			};

			angular.forEach(thingModel.warehouse.Things, addMarkerOrOverlay);

			thingModel.warehouse.RegisterObserver({
				New: addMarkerOrOverlay,
				Updated: (thing: ThingModel.Thing) => {
					if (itsa.imageOverlay(thing)) {
						removeImageOverlay(thing);
						addImageOverlay(thing);
					} else {
						updateMarker(thing);
					}
				},
				Deleted: (thing: ThingModel.Thing) => {
					if (itsa.imageOverlay(thing)) {
						removeImageOverlay(thing);
					} else {
						removeMarker(thing);
					}
				},
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

			/*(<any>instance)._getMapPanePos = function () {
				return L.DomUtil.getPosition(this._mapPane) || new L.Point(0, 0);
			};*/

			var jContainer = $((<any>instance)._container),
				oldOffsetTop = 0,
				oldOffsetLeft = 0,
				oldWidth = 0,
				oldHeight = 0,
				containerHidden = false,
				immediateContainerHidding = 0;

			instance.moveTo = (div: any, keepCenter: boolean = false) => {
				instance.show();

				div = $(div);

				var width = div.outerWidth(),
					height = div.outerHeight(),
					offset = div.offset();

				if (width === 0 || height === 0) {
					return;
				}

				offset.top = Math.round(offset.top);
				offset.left = Math.round(offset.left);

				var diffTop = offset.top - oldOffsetTop,
					diffLeft = offset.left - oldOffsetLeft;

				oldOffsetTop = offset.top;
				oldOffsetLeft = offset.left;


				var invalidate = false;

				if (diffTop !== 0 || diffLeft !== 0) {
					jContainer.offset(offset);
					(<any>instance)._rawPanBy(new L.Point(diffLeft, diffTop));
					invalidate = true;
				}

				if (oldWidth !== width || oldHeight !== height) {
					jContainer.width(width).height(height);

					if (oldWidth === width) {
						(<any>instance)._rawPanBy(new L.Point(0, (oldHeight - height) * 0.5 - diffTop).round());
					} else if (oldHeight === height) {
						(<any>instance)._rawPanBy(new L.Point((oldWidth - width) * 0.5 - diffLeft, 0).round());
					} else if (keepCenter || shadowLayer !== null) {
						(<any>instance)._rawPanBy(new L.Point((oldWidth - width) * 0.5 - diffLeft, (oldHeight - height) * 0.5 - diffTop).round());
						keepCenter = false;
					}
					/*if (keepCenter) {
						diffLeft -= (oldWidth - width)*0.5;
						diffTop -= (oldHeight - height)*0.5;
					}*/
					oldWidth = width;
					oldHeight = height;
					invalidate = true;
				}

				if (invalidate) {
					instance.invalidateSize({ animate: false, pan: false });
					if (keepCenter) {
						instance.panBy(new L.Point(-diffLeft, -diffTop), {animate: false});
					}
				}
			};

			instance.show = () => {
				if (containerHidden) {
					jContainer.show();
					containerHidden = false;
				}
				if (immediateContainerHidding) {
					window.clearImmediate(immediateContainerHidding);
					immediateContainerHidding = 0;
				}
			};

			instance.hide = () => {
				immediateContainerHidding = window.setImmediate(() => {
					if (!containerHidden) {
						jContainer.hide();
						containerHidden = true;
					}
					immediateContainerHidding = 0;
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
