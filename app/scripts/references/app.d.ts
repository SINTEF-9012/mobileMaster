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
	createMasterIconWithId(ID:string, scope: ng.IScope, options?:L.IconOptions): L.Icon;
	createMasterIconWithType(type:string, scope: ng.IScope, options?:L.IconOptions): L.Icon;
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

interface ThingModelService {
	warehouse: ThingModel.Warehouse;
	client: ThingModel.WebSockets.Client;
	RemoveThing(id:string);
	EditThing(id: string, values: { [property: string]: {value:string;type:string} });
}

interface OrderService {
	setLocation(location: L.LatLng);
	setDetails(details: string);
	setTitle(title: string);
	setType(type: string);
	addThing(thingID: string);
	getId():string;
	emit();
	reset();
}

interface UUIDService {
	generate(): string;
}

interface AddServiceConfig {
	defineType(type: ThingModel.ThingType);
}

interface AddService {
	// It's just a first version :)
	register(typeName: string, location: L.LatLng);
}

interface SettingsService {
	setThingModelUrl(url: string);
	setClientName(name: string);
	setMediaServerUrl(url: string);

	getThingModelUrl(): string;
	getClientName(): string;
	getMediaServerUrl():string;
}