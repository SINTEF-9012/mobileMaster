/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="./../references/Touch.d.ts" />
/// <reference path="./../references/NodeMaster.d.ts" />
/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../references/app.d.ts" />
/// <reference path="./../masterScope.d.ts" />
'use strict';

angular.module('mobileMasterApp')
.config(function(masterMapProvider: Master.MapConfig) {
	masterMapProvider.declareLayerClass("sight",L.Class.extend({
		initialize: function (latlng, title) {
			// save position of the layer or any options from the constructor
			this._latlng = latlng;
			this._titleText = title;
		},

		addTo: function (map : L.Map) {
			this._map = map;

			// create a DOM element and put it into one of the map panes
			this._el = L.DomUtil.create('div', 'shadow-layer');
			this._title = L.DomUtil.create('h1', '');
			this._title.appendChild(document.createTextNode(this._titleText));
			// map.getPanes().overlayPane.appendChild(this._el);
			this._el.appendChild(this._title);
			map.getContainer().appendChild(this._el);

			// add a viewreset event listener for updating layer's position, do the latter
			// map.on('viewreset move', this._reset, this);
			//this._reset();
		},

		remove: function () {
			// remove layer's DOM elements and listeners
			this._map.getContainer().removeChild(this._el);
			this._map.off('viewreset move', this._reset, this);
		},

		_reset: function () {
			// update layer's position
			//var pos = this._map.latLngToLayerPoint(this._latlng);
			//L.DomUtil.setPosition(this._el, pos);
			L.DomUtil.setPosition(this._el, this._map.latLngToLayerPoint(this._map.getCenter()));
		}
    }));
}).controller('OrderCtrl', function (
	$scope,
	$rootScope : MasterScope.Root,
	$stateParams,
	masterMap: Master.Map) {

		var layer = masterMap.getLayerClass("sight");
		var ll = new layer([0, 0], "Order");
		ll.addTo(masterMap);

		var id = $stateParams.id;

		$scope.id = id;

		masterMap.closePopup();

		var dragLinePoints = [new L.LatLng(0, 0), masterMap.getCenter()];
		var dragLine = L.polyline(dragLinePoints, { clickable: false });
		var onScreen = false;
		masterMap.on('viewreset move', () => {
			dragLinePoints[1] = masterMap.getCenter();
			if (onScreen) {
				dragLine.setLatLngs(dragLinePoints);
			}
		});

		$(document).one('main.thing.order.exit', ()=> {
			masterMap.removeLayer(ll).removeLayer(dragLine);
			onScreen = false;
		});

		$scope.$watch('things[id]', () => {
			if ($scope.things) {
				var thing = $scope.things[id];
				ll._title.firstChild.data = "Order to " + thing.name;
				var loc = thing.location;
				if (loc) {
					dragLinePoints[0].lat = loc.x;
					dragLinePoints[0].lng = loc.y;

					if (onScreen) {
						dragLine.redraw();
					} else {
						//masterMap.panTo(dragLinePoints[0]);
						dragLinePoints[1] = dragLinePoints[0];
						dragLine.addTo(masterMap);
						onScreen = true;
					}
				}
			}
		});

});
