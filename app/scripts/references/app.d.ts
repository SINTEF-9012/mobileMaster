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

		enableScale();
		disableScale();

		enableSituationOverview();
		disableSituationOverview();

		showOverview();

		setVerticalTopMargin(margin: number);

		getLayerClass(name: string): L.ILayer;

		createMasterIconWithType(type: string, scope: ng.IScope, options?: L.IconOptions): L.Icon;

		moveTo(div: HTMLElement, keepCenter?: boolean);
		moveTo(div: JQuery, keepCenter?: boolean);
		hide();
		show();

		enableShadow(title?: string, icon?: HTMLElement, className?:string);
		disableShadow();

		unfilterThing(id:string);

		GamepadController: L.IHandler;

		hideOverlay(id: string);
		showOverlay(id: string);
	}

	export interface MapConfig {
		setContainer(container: HTMLElement): MapConfig;
		setOptions(options: L.MapOptions): MapConfig;
		declareTileLayer(layer: MasterScope.Layer): MapConfig;
		setDefaultTileLayer(name: string): MapConfig;
		declareLayerClass(name: string, layer: L.ILayer);
	}
}

interface PersistentMap {
	bindMasterMap(map: Master.Map);
	unbindMasterMap(map: Master.Map);
	saveCurrentLayer(layer: MasterScope.Layer);
	restorePersistentLayer(map: Master.Map);
	hideOverlay(id: string);
	showOverlay(id: string);
	getHiddenOverlays() : string[];
	clear();
}

declare module PersistentMap {
	export interface Storage {
		zoom?: number;
		lat?: number;
		lng?: number;
		layer?: string;
		hiddenOverlays?: string[];
	}
}

interface ThingModelService {
	warehouse: ThingModel.Warehouse;
	client: ThingModel.WebSockets.Client;
	RemoveThing(id: string, send?: boolean);
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
	register(typeName: string, location?: L.LatLng,
		fillingCallback?: (thing: ThingModel.ThingPropertyBuilder) => any, overrideId?: string, connections?:ThingModel.Thing[]);
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
	response(thing: ThingModel.Thing): boolean;
	risk(thing: ThingModel.Thing): boolean;
	beacon(thing: ThingModel.Thing): boolean;
	order(thing: ThingModel.Thing): boolean;
	multimedia(thing: ThingModel.Thing): boolean;
	message(thing: ThingModel.Thing): boolean;

	other(thing: ThingModel.Thing): boolean;

	typefrom(thing: ThingModel.Thing): string;
	testfor(type: string): RegExp;

	police(thing: ThingModel.Thing): boolean;
	medic(thing: ThingModel.Thing): boolean;
	fire(thing: ThingModel.Thing): boolean;

	stream(thing: ThingModel.Thing): boolean;
	imageOverlay(thing: ThingModel.Thing): boolean;
}

interface FilterService {
	getFilter(): (thing: ThingModel.Thing) => boolean;

	hasSomeFiltering(): boolean;
	isFilterEnabled(name: string): boolean;

	enableFilter(name: string, save?: boolean/* = true*/): void;
	disableFilter(name: string, save?: boolean/* = true*/): void;
}

interface KnowledgeService {
	canEdit(thing: ThingModel.Thing): boolean;
	canOrder(thing: ThingModel.Thing): boolean;
	canDelete(thing: ThingModel.Thing): boolean;

	getPropertiesOrder(thingType: ThingModel.ThingType): {
		key: string;
		required: boolean;
		type: string;
		score: number;
	}[];
}

interface ColorFromImageService {
	whiteOrBlack: (color: string) => string;
	applyColor: (img: any, callback: (color: string) => void, exclude?: boolean) => void;
}

interface AuthenticationService {
	getUserName: () => string;
	setUserName: (username: string) => void;
}
