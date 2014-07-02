/// <reference path="./../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="./../bower_components/ThingModel/TypeScript/build/ThingModel.d.ts" />
/// <reference path="./references/NodeMaster.d.ts" />

declare module MasterScope {
    interface Root extends ng.IScope {
        layers: Layer[];
        buildings: boolean;
        map: L.Map;

		add: {
			category: string;
			type: string;
		};

		layoutautoscroll: boolean;
		previousState: string;
	}

	interface Settings extends ng.IScope {
		thingModelUrl: string;
		clientName: string;
		mediaServerUrl: string;
		reload: () => void;	
	}

    interface Layer {
        name: string;
        iconPath: string;
        active?: boolean;
        //leafletLayer?: L.ILayer;

        create() : L.TileLayer;
	}

	/*interface ThingType {
		//things: { [ID: string]: Thing };
		/*tableProperties: {
			key: string;
			score:number;
			property:ThingModel.PropertyType;
		}[];

		visible:boolean;
		type: ThingModel.ThingType;
		count: number;
	}*/

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
		triage_status?:string;
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