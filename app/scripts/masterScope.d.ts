/// <reference path="./../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="./references/NodeMaster.d.ts" />

declare module MasterScope {
    interface Root extends ng.IScope {
        layers: Layer[];
        buildings: boolean;
        map: L.Map;

        closeLayerList() : void;
        layerClick(layer : Layer) : void;
        centerView() : void;
        things: {[typeName: string] : {[ID:string] : ThingModel.Thing}};
		resources: { [ID: string]: NodeMaster.ResourceStatusModel; };

		types: {[name: string] : {

			tableProperties: {
				key: string;
				score:number;
				property:ThingModel.PropertyType;
			}[];

			type: ThingModel.ThingType;
		}};
    }
    interface Layer {
        name: string;
        iconPath: string;
        active?: boolean;
        //leafletLayer?: L.ILayer;

        create() : L.TileLayer;
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