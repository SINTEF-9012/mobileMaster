/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../references/app.d.ts" />

'use strict';

angular.module('mobileMasterApp')
  .service('persistentLocalization', function Persistentlocalization() {

    var center = null,
      zoom = null,
      layer = null,
      masterMap : Master.Map = null;

    var localStorageKey = "persistentLocalization";

    // Save the position in the local storage
    function save() {
      var data : PersistentLocalization.Storage = {};

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

      window.localStorage.setItem(localStorageKey,
        JSON.stringify(data));
    }

	var onmoveend = () => {	
		center = masterMap.getCenter();
		save();
	},
	onzoomend = () => {
		zoom = masterMap.getZoom();
		save();
	};

  	this.bindMasterMap = (map : Master.Map) => {

		  // We use localStorage as backend
		  if (!window.localStorage) {
			  return;
		  }

		  // Load the saved position if it exist
		  var storage = window.localStorage.getItem(localStorageKey);
		  if (storage !== null) {
			  var data : PersistentLocalization.Storage = JSON.parse(storage);

			  if (data.zoom) {
				  zoom = data.zoom;
			  }

			  if (data.lat && data.lng) {
				  center = new L.LatLng(data.lat, data.lng);
			  }

			  if (data.layer) {
				  layer = data.layer;
			  }

			  // Update the map view to the saved position
			  map.setView(center ? center : map.getCenter(), zoom ? zoom : map.getZoom());
		  }


		  // Bind leaflet events, and save position
		  map.on('moveend', onmoveend).on('zoomend', onzoomend);

		  masterMap = map;
	  };


	this.unbindMasterMap = (map: Master.Map) => {
		map.off('moveend', onmoveend).off('zoomend', onzoomend);
	};

    this.saveCurrentLayer = (_layer : MasterScope.Layer) => {
	    layer = _layer.name;
	    save();
    };

    this.restorePersistentLayer = () => {
	    if (layer) {
		    angular.forEach(masterMap.getTilesLayers(), (iLayer: MasterScope.Layer) => {
			    masterMap.hideTileLayer(iLayer.name);
		    });

		    masterMap.showTileLayer(layer);
	    }
    };

    this.clear = () => {
	    window.localStorage.removeItem(localStorageKey);
    };
  });
