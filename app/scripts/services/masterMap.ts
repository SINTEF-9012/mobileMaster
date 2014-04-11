/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
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


		this.$get = function($compile : ng.ICompileService) {
			var instance = <Master.Map> L.map(this.container, this.options);
			var masterIcon = L.Icon.extend({
				options: {
					iconSize: [40, 40],
					iconAnchor: [20, 20],
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

					var masterIconElement = $compile(angular.element('<master-icon />').attr('thingid', this.thingID));
					masterIconElement(this.scope).appendTo(div);

					this._setIconStyles(div, 'icon');

					return div;
				},

				createShadow: () => null
		});

			instance.declareTileLayer = function(layer) {
				layersTable[layer.name] = layer;
				layersList.push(layer);
				return instance;
			};

			instance.getTilesLayers = function() {
				return layersList;
			};

			instance.createMasterIcon = (ID:string, scope: ng.IScope, options?: L.IconOptions) => {
				var i = new masterIcon(options);
				i.scope = scope;
				i.thingID = ID;
				return i;
			};

			instance.showTileLayer = function(name: string) {

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

			instance.hideTileLayer = (name: string)=> {
				if (layersTable.hasOwnProperty(name)) {
					var layer: MasterScope.Layer = layersTable[name];

					if (layer.active) {
						layer.active = false;
						instance.removeLayer(leafletsLayersTable[name]);
					}
				}

				return this;
			};

			instance.enableInteractions = ()=> {
				instance.dragging.enable();
				instance.touchZoom.enable();
				instance.doubleClickZoom.enable();
				instance.scrollWheelZoom.enable();
				instance.boxZoom.enable();
				instance.keyboard.enable();

				instance.tap && instance.tap.enable();
				return this;
			};

			instance.disableInteractions = ()=> {
				instance.dragging.disable();
				instance.touchZoom.disable();
				instance.doubleClickZoom.disable();
				instance.scrollWheelZoom.disable();
				instance.boxZoom.disable();
				instance.keyboard.disable();
				instance.tap && instance.tap.disable();
				return this;
			};

			instance.getLayerClass = (name:string) => this.layerClasses[name];

			if (defaultLayerName) {
				instance.showTileLayer(defaultLayerName);
			}

			return instance;
		};

	this.declareLayerClass("shadow", L.Layer.extend({
		initialize: function (title, icon) {
			// save position of the layer or any options from the constructor
			this._titleText = title;
			this._icon = icon;
		},

		onAdd: function (map : L.Map) {
			this._map = map;

			// create a DOM element and put it into one of the map panse
			this._el = L.DomUtil.create('div', 'shadow-layer');
			this._title = L.DomUtil.create('h1', '');
			this._title.appendChild(document.createTextNode(this._titleText));
			// map.getPanes().overlayPane.appendChild(this._el);
			this._el.appendChild(this._title);
			if (this._icon) {
				this._el.appendChild(this._icon);
			}
			map.getContainer().appendChild(this._el);

			// add a viewreset event listener for updating layer's position, do the latter
			// map.on('viewreset move', this._reset, this);
			//this._reset();
		},

		onRemove: function () {
			// remove layer's DOM elements and listeners
			this._map.getContainer().removeChild(this._el);
			this._map.off('viewreset move', this._reset, this);
		},

		_reset: function () {
			// update layer's position
			//L.DomUtil.setPosition(this._el, pos);
			L.DomUtil.setPosition(this._el, this._map.latLngToLayerPoint(this._map.getCenter()));
		}
	}));
});