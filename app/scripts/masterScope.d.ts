declare module MasterScope {
    interface Root extends ng.IScope {
        layers: Layer[];
        map: L.Map;

        closeLayerList() : void;
        layerClick(layer : Layer) : void;
    }
    interface Layer {
        name: string;
        iconPath: string;
        active?: boolean;
        //leafletLayer?: L.ILayer;

        create() : L.TileLayer;
    }
}
