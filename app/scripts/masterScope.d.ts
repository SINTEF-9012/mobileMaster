/// <reference path="./../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="./../bower_components/ThingModel/TypeScript/build/ThingModel.d.ts" />

declare module MasterScope {
    interface Root extends ng.IScope {
        layers: Layer[];
        buildings: boolean;
        map: L.Map;

		add: {
			category: string;
			type: string;
		};

		order: {
			category: string;
			type: string;
		}

		layoutautoscroll: boolean;
		previousState: string;

		thingmodel: {
			loading: boolean;
			connected: boolean;
			nbTransactions: number;
			lastSenderName: string;
			nbSend: number;
		}

		currentState: string;
		bodyClass: string;
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

        create() : L.TileLayer;
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
		triage_status?:string;
	}
}

interface Knowledge {
	typeName: string;
	tablePropertiesOrder: { [key: string]: number };
	typeTest?: RegExp;
}

interface KnowledgeModule {
	getPropertiesOrder(thingType: ThingModel.ThingType) : {key:string;score:number;property:ThingModel.PropertyType}[];
}

