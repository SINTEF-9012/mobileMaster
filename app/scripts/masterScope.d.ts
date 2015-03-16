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

		pastSituation: boolean;
		situationDate: Date;

		timelineInfos: {
			oldest: Date;
			newest: Date;
			count: number;
		}
	}

	interface Settings extends ng.IScope {
		thingModelUrl: string;
		clientName: string;
		accessKey: string;
		mediaServerUrl: string;
		rrdServerUrl: string;
		almendeTimelineUrl: string;
		almendeTimelineUsage: boolean;
		selectChannel: (channel: any) => void;
		reload: () => void;
		channels: any;
	}

	interface Background extends ng.IScope {
		layers: Layer[];
		layerClick: (layer: Layer) => void;

		mediaServerUrl: string;

		enableWeather: boolean;
		weatherLayers: any[];
		enableWeatherLayer: (name: string) => void;
		selectWeatherTime: (any) => void;
		weatherTime: any[];

		overlays: { [id: string]: boolean };
		zoomToOverlay: (thing: Thing) => void;
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
		typeName?: string;
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

