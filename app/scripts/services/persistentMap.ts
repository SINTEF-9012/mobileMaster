/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />

/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../references/app.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.service('persistentMap', function() {

		var center = null,
			zoom = null,
			layer = null,
			binded = false,
			hiddenOverlays: string[] = null,
			masterMap: Master.Map = null;

		var localStorageKey = "persistentMap";

		// Save the position in the local storage
		var save = throttle(() => {
			    if (!binded) {
				    return;
			    }
			    var data: PersistentMap.Storage = {};

			    if (zoom) {
				    data.zoom = zoom;
			    }

			    if (center) {
				    data.lat = center.lat;
				    data.lng = center.lng;
			    }

			    if (layer) {
				    data.layer = layer;
				}

				if (hiddenOverlays) {
					data.hiddenOverlays = hiddenOverlays;
				}

			    window.localStorage.setItem(localStorageKey,
				    JSON.stringify(data));
		    }, 50),

			fetch = () => {
				// We use localStorage as backend
				if (!window.localStorage) {
					return;
				}

				// Load the saved position if it exist
				var storage = window.localStorage.getItem(localStorageKey);
				if (storage !== null) {
					var data: PersistentMap.Storage = JSON.parse(storage);

					if (data.zoom) {
						zoom = data.zoom;
					}

					if (data.lat && data.lng) {
						center = new L.LatLng(data.lat, data.lng);
					}

					if (data.layer) {
						layer = data.layer;
					}

					if (data.hiddenOverlays) {
						hiddenOverlays = data.hiddenOverlays;
					}

				}
			};


		var onmoveend = () => {
			    center = masterMap.getCenter();
			    save();
		    },
			onzoomend = () => {
				zoom = masterMap.getZoom();
				save();
			};

		this.bindMasterMap = (map: Master.Map) => {
			fetch();
			binded = true;
			// Update the map view to the saved position
			map.setView(center ? center : map.getCenter(), zoom ? zoom : map.getZoom());

			// Bind leaflet events, and save position
			map.on('moveend', onmoveend).on('zoomend', onzoomend);

			if (hiddenOverlays) {
				_.each(hiddenOverlays, (id) => {
					map.hideOverlay(id);
				});
			}

			masterMap = map;
		};


		this.unbindMasterMap = (map: Master.Map) => {
			map.off('moveend', onmoveend).off('zoomend', onzoomend);
			binded = false;
		};

		this.saveCurrentLayer = (_layer: MasterScope.Layer) => {
			layer = _layer.name;
			save();
		};


		this.restorePersistentLayer = (map: Master.Map, disableFetch = false) => {
			if (!disableFetch) {
				fetch();
			}

			if (layer) {
				angular.forEach(map.getTilesLayers(), (iLayer: MasterScope.Layer) => {
					if (layer !== iLayer.name) {
						map.hideTileLayer(iLayer.name);
					}
				});

				map.showTileLayer(layer);
			}
		};

		this.hideOverlay = (id: string) => {
			if (!hiddenOverlays) {
				hiddenOverlays = [id];
			} else if (!_.contains(hiddenOverlays, id)) {
				hiddenOverlays.push(id);
			}

			if (masterMap) {
				masterMap.hideOverlay(id);
			}

			save();
		};

		this.showOverlay = (id: string) => {
			hiddenOverlays = _.without(hiddenOverlays, id);

			if (masterMap) {
				masterMap.showOverlay(id);
			}

			save();
		};

		this.getHiddenOverlays = () => {
			fetch();
			return _.clone(hiddenOverlays);
		};

		$(window).on('storage', throttle(() => {
			if (!binded) {
				return;
			}

			var oldLayer = layer;
			fetch();
			if (oldLayer !== layer) {
				this.restorePersistentLayer(masterMap);
			}
		}, 100));

		this.clear = () => {
			window.localStorage.removeItem(localStorageKey);
		};
	});
