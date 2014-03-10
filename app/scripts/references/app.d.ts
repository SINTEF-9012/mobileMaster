declare module Master {
  export class Map extends L.Map {
    initializeMap(map : L.Map) : void;

    declareTileLayer(layer : MasterScope.Layer) : void;
    getTilesLayers() : MasterScope.Layer[];

    showTileLayer(name : string) : Map;
    hideTileLayer(name : string) : Map;

    enableInteractions() : Map;
	disableInteractions(): Map;

	getLayerClass(name: string): L.ILayer;

  }

  export interface MapConfig {
    setContainer(container : HTMLElement) : MapConfig;
    setOptions(options : L.MapOptions) : MapConfig;
    declareTileLayer(layer : MasterScope.Layer) : MapConfig;
    setDefaultTileLayer(name : string) : MapConfig;
	declareLayerClass(name: string, layer: L.ILayer);
  }
}

interface PersistentLocalization {
	bindToMasterMap(map : Master.Map);
  saveCurrentLayer(layer : MasterScope.Layer);
  restorePersistentLayer();
  clear();
}

declare module PersistentLocalization {
	export interface Storage {
		zoom?: number;
		lat?: number;
		lng?: number;
    layer?: string;
	}
}
