/// <reference path="./../references/angularjs/angular.d.ts" />
/// <reference path="./../references/app.d.ts" />

'use strict';

angular.module('mobileMasterApp')
  .service('persistentLocalization', function Persistentlocalization() {
  	this.bindToMasterMap = function(map : Master.Map) {

  		// We use localStorage as backend
  		if (!window.localStorage) {
  			return;
  		}

  		var center = null,
  			zoom = null;


  		// Load the saved position if it exist
  		var storage = window.localStorage.getItem("persistentLocalization");
  		if (storage !== null) {
  			var data : PersistentLocalization.Storage = JSON.parse(storage);

  			if (data.zoom) {
  				zoom = data.zoom;
  			}

  			if (data.lat && data.lng) {
  				center = new L.LatLng(data.lat, data.lng);
  			}

  			// Update the map view to the saved position
  			map.setView(center ? center : map.getCenter(), zoom ? zoom : map.getZoom());
  		}

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

  			window.localStorage.setItem("persistentLocalization",
  				JSON.stringify(data));
  		}

  		// Bind leaflet events, and save position
  		map.on('moveend', function() {
  			center = map.getCenter();
  			save();
  		}).on('zoomend', function() {
  			zoom = map.getZoom();
  			save();
  		});
  	};
  });
