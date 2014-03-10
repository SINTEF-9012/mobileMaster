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

		this.$get = function() {
			var instance = <Master.Map> L.map(this.container, this.options);


			instance.declareTileLayer = function(layer) {
				layersTable[layer.name] = layer;
				layersList.push(layer);
				return instance;
			};

			instance.getTilesLayers = function() {
				return layersList;
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
	});