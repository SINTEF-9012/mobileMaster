/// <reference path="./../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="./references/NodeMaster.d.ts" />

declare module MasterScope {
    interface Root extends ng.IScope {
        layers: Layer[];
        buildings: boolean;
        map: L.Map;

        //closeLayerList() : void;
        //layerClick(layer : Layer) : void;
		centerView(): void;

        things: {[ID:string] : Thing};

		types: {[name: string] : ThingType};

		add: {
			category: string;
			type: string;
		};
	}

    interface Layer {
        name: string;
        iconPath: string;
        active?: boolean;
        //leafletLayer?: L.ILayer;

        create() : L.TileLayer;
	}

	interface ThingType {
		things: { [ID: string]: Thing };
		tableProperties: {
			key: string;
			score:number;
			property:ThingModel.PropertyType;
		}[];

		visible:boolean;
		type: ThingModel.ThingType;
	}

	interface Thing {
		ID: string;
		name: string;
		typeName: string;
		visible: boolean;
		location?: {
			x: number;
			y: number;
			z: number;
		};
	}
}

interface Knowledge {
	typeName: RegExp;
	tablePropertiesOrder: {[key: string] : number};
//	icon(thing: ThingModel.Thing): L.Icon;
}

interface KnowledgeModule {
	getPropertiesOrder(thingType: ThingModel.ThingType) : {key:string;score:number;property:ThingModel.PropertyType}[];
}