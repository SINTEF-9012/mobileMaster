
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

interface angularNotify {
	(notification: any): void;
}

// Generic libraries (if somebody want to write definitions…)
declare var OSMBuildings;
declare var rebound;

declare module L {
	export var Renderer: any;
	export var Layer: any;

	export module Control {
		export var RTSMiniMap: any;
	}

	/*export module Util {
		export var throttle: (fn: () => void, time: number, context?: any) => () => void;
	}*/

	export var MasterImageOverlay: any;
}

declare var throttle: (fn: () => void, wait: number, options?: any) => () => void;

declare var PruneClusterLeafletSpiderfier: any;

declare var RGBaster: any;
