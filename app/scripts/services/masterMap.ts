'use strict';

declare module Master {
  export class Map extends L.Map {
    initializeMap(map : L.Map) : void;

    declareTileLayer(layer : MasterScope.Layer) : void;
    getTilesLayers() : MasterScope.Layer[];

    showTileLayer(name : string) : MapConfig;
    hideTileLayer(name : string) : MapConfig;
  }

  export interface MapConfig {
    setContainer(container : HTMLElement) : MapConfig;
    setOptions(options : L.MapOptions) : MapConfig;
    declareTileLayer(layer : MasterScope.Layer) : MapConfig;
    setDefaultTileLayer(name : string) : MapConfig;
  }
}
console.log("canard");

angular.module('mobileMasterApp')
  .provider('masterMap', function () {

    var layersTable = {},
        leafletsLayersTable = {},
        layersList = [];

    this.declareTileLayer = function(layer : MasterScope.Layer) {
      layersTable[layer.name] = layer;
      layersList.push(layer);
      return this;
    }


    this.container = document.createElement("div");
    this.container.className = "map";
    this.setContainer = function(container : HTMLElement) {
      this.container = container;
      return this;
    }

    this.options = {};

    this.setOptions = function(options : L.MapOptions) {
      this.options = options;
      return this;
    }

    var defaultLayerName : string = null;
    this.setDefaultTileLayer = function(name : string) {
      defaultLayerName = name;
      return this;
    }

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

      instance.showTileLayer = function(name : string) {

        var layer = layersTable[name];
        if (!layer) {
          throw "Unknown layer";
        }

        var leafletLayer = leafletsLayersTable[layer.name];

        if (!leafletLayer){
          leafletLayer  = layer.create();
          leafletsLayersTable[layer.name] = leafletLayer;
        }

        if (!layer.active) {
          layer.active = true;
          instance.addLayer(leafletLayer);
        }

        return this;

      };

      instance.hideTileLayer = function(name : string) {
        if (layersTable.hasOwnProperty(name)) {
          var layer : MasterScope.Layer = layersTable[name];

          if (layer.active) {
            layer.active = false;
            instance.removeLayer(leafletsLayersTable[name]);
          }
        }

        return this;
      };

      if (defaultLayerName) {
        instance.showTileLayer(defaultLayerName);
      }

      return instance;
    }

  });
