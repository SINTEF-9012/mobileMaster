/// <reference path="./references/generic.d.ts" />

'use strict';
/*
 * L.ImageOverlay is used to overlay images over the map (to specific geographical bounds).
 */

L.MasterImageOverlay = L.Layer.extend({

	options: {
		opacity: 1,
		alt: '',
		// how much to extend the clip area around the map view (relative to its size)
		// e.g. 0.1 would be 10% of map view in each direction
		// defaults to clip with a two times bigger map view
		padding: 1
	},

	initialize: function (url, bounds, options) { // (String, LatLngBounds, Object)
		this._url = url;
		this._bounds = L.latLngBounds(bounds);

		(<any>L).setOptions(this, options);
	},

	onAdd: function () {
		if (!this._image) {
			this._initImage();

			if (this.options.opacity < 1) {
				this._updateOpacity();
			}
		}

		this.getPane().appendChild(this._image);

		this._reset();

		this._updateVisibilility();
	},

	onRemove: function () {
		(<any>L.DomUtil).remove(this._image);
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;

		if (this._image) {
			this._updateOpacity();
		}
		return this;
	},

	bringToFront: function () {
		if (this._map) {
			(<any>L.DomUtil).toFront(this._image);
		}
		return this;
	},

	bringToBack: function () {
		if (this._map) {
			(<any>L.DomUtil).toBack(this._image);
		}
		return this;
	},

	setUrl: function (url) {
		this._url = url;
		this.reset();

		return this;
	},

	getAttribution: function () {
		return this.options.attribution;
	},

	getEvents: function () {
		var events : any = {
			viewreset: this._reset,
			moveend: this._updateVisibilility
		};

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}

		return events;
	},

	_initImage: function () {
		var img = this._image = <HTMLImageElement>L.DomUtil.create('img',
			'leaflet-image-layer ' + (this._zoomAnimated ? 'leaflet-zoom-animated' : ''));

		img.onselectstart = L.Util.falseFn;
		img.onmousemove = L.Util.falseFn;

		img.onload = (<any>L).bind(this.fire, this, 'load');
		img.alt = this.options.alt;
	},

	_animateZoom: function (e) {
		var topLeft = this._map._latLngToNewLayerPoint(this._bounds.getNorthWest(), e.zoom, e.center),
			size = this._map._latLngToNewLayerPoint(this._bounds.getSouthEast(), e.zoom, e.center).subtract(topLeft),
			offset = topLeft.add(size._multiplyBy((1 - 1 / e.scale) / 2));

		(<any>L.DomUtil).setTransform(this._image, offset, e.scale);
	},

	_reset: function () {
		var image = this._image,
			bounds = new L.Bounds(
				this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
				this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
			size = bounds.getSize();

		L.DomUtil.setPosition(image, bounds.min);

		this._size = size.x * size.y;

		if (this._size > 8) {
			var imageX = size.x,
				imageY = size.y;

			if (L.Browser.retina) {
				imageX *= 2;
				imageY *= 2;
			}

			image.src = 'http://medias.master-bridge.eu/resize/' + imageX + '/' + imageY + '/' + this._url;
		} else {
			image.src = L.Util.emptyImageUrl;
		}

		image.style.width = size.x + 'px';
		image.style.height = size.y + 'px';
	},

	_updateVisibilility: function () {
		var p = this.options.padding,
			mapBounds = this._map.getBounds().pad(p);

		this._image.style.display = this._size > 8 && mapBounds.intersects(this._bounds) ? '' : 'none';
	},

	_updateOpacity: function () {
		L.DomUtil.setOpacity(this._image, this.options.opacity);
	}
});
