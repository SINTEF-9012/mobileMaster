
// iOS specific 
interface Navigator {
  standalone? : boolean;
}

// Leaflet plugins
declare module L{
	export var MarkerClusterGroup;
	export var BingLayer;
}

// Leaflet global constant (ugly)
interface Window {
	L_PREFER_CANVAS : boolean;
}

// JQuery plugins
interface JQuery{
  bootstrapSwitch : any;
}

// Generic libraries (if somebody want to write definitions…)
declare var OSMBuildings;
declare var rebound;

