/// <reference path="../../bower_components/ThingModel/TypeScript/build/ThingModel.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="./../masterScope.d.ts" />

declare module Master {
	export class Map extends L.Map {
		initializeMap(map: L.Map): void;

		declareTileLayer(layer: MasterScope.Layer): void;
		getTilesLayers(): MasterScope.Layer[];

		showTileLayer(name: string): Map;
		hideTileLayer(name: string): Map;

		enableInteractions(): Map;
		disableInteractions(): Map;

		enableMiniMap(): Map;
		disableMiniMap(): Map;

		clearMiniMap(): Map;
		renderMiniMap(): Map;
		drawMiniMapPoint(pos: L.LatLng, color: { r: number; g: number; b: number }): Map;

		enableScale();
		disableScale();

		enableSituationOverview();
		disableSituationOverview();

		setVerticalTopMargin(margin: number);

		getLayerClass(name: string): L.ILayer;

		createMasterIconWithType(type: string, scope: ng.IScope, options?: L.IconOptions): L.Icon;

		moveTo(div: HTMLElement);

		enableShadow(title?: string, icon?: HTMLElement, className?:string);
		disableShadow();
	}

	export interface MapConfig {
		setContainer(container: HTMLElement): MapConfig;
		setOptions(options: L.MapOptions): MapConfig;
		declareTileLayer(layer: MasterScope.Layer): MapConfig;
		setDefaultTileLayer(name: string): MapConfig;
		declareLayerClass(name: string, layer: L.ILayer);
	}
}

interface PersistentLocalization {
	bindMasterMap(map: Master.Map);
	unbindMasterMap(map: Master.Map);
	saveCurrentLayer(layer: MasterScope.Layer);
	restorePersistentLayer(map: Master.Map);
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
	RemoveThing(id: string);
	ApplyThingToScope($scope: any, thing: ThingModel.Thing);
	EditThing(id: string, values: { [property: string]: { value: string;type: string } });
}

interface OrderService {
	setLocation(location: L.LatLng);
	setDetails(details: string);
	setTitle(title: string);
	setType(type: string);
	addThing(thingID: string);
	getId(): string;
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
	register(typeName: string, location?: L.LatLng, fillingCallback?: (thing: ThingModel.ThingPropertyBuilder) => any, overrideId?: string);
}

interface SettingsService {
	setThingModelUrl(url: string);
	setClientName(name: string);
	setMediaServerUrl(url: string);

	getThingModelUrl(): string;
	getClientName(): string;
	getMediaServerUrl(): string;
}

interface ThingIdentifierService {
	victim(thing: ThingModel.Thing): boolean;
	media(thing: ThingModel.Thing): boolean;
	tweet(thing: ThingModel.Thing): boolean;
	resource(thing: ThingModel.Thing): boolean;
	incident(thing: ThingModel.Thing): boolean;
	risk(thing: ThingModel.Thing): boolean;
	beacon(thing: ThingModel.Thing): boolean;
	order(thing: ThingModel.Thing): boolean;
	multimedia(thing: ThingModel.Thing): boolean;

	other(thing: ThingModel.Thing): boolean;

	typefrom(thing: ThingModel.Thing): string;
	testfor(type: string): RegExp;
}

declare module L {
	export var Renderer: any;
	export var Layer: any;

	export module Control {
		export var RTSMiniMap: any;
	}

	export module Util {
		export var throttle: (fn: () => void, time: number, context?: any) => () => void;
	}
}

declare var PruneClusterLeafletSpiderfier: any;