declare module Master {
    interface MasterScope extends ng.IScope {
        layers: Layer[];
        map: L.Map;
    }
    interface Layer {
        name: string;
        iconPath: string;
        leafletLayer?: L.ILayer;

        select() : void;
    }
}
