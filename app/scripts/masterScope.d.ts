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
        patients: {[ID: string] : ThingModel.Thing};
		resources: { [ID: string]: NodeMaster.ResourceStatusModel; };
		types: {[name: string] : ThingModel.ThingType;};
    }
    interface Layer {
        name: string;
        iconPath: string;
        active?: boolean;
        //leafletLayer?: L.ILayer;

        create() : L.TileLayer;
    }
}
