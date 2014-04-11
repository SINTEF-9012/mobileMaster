/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/leaflet/leaflet.d.ts" />
/// <reference path="./../references/Touch.d.ts" />
/// <reference path="./../references/NodeMaster.d.ts" />
/// <reference path="./../references/generic.d.ts" />
/// <reference path="./../references/app.d.ts" />
/// <reference path="./../masterScope.d.ts" />
'use strict';

angular.module('mobileMasterApp')
.config((masterMapProvider: Master.MapConfig) => {
	
}).controller('OrderCtrl', function (
	$scope,
	$rootScope : MasterScope.Root,
	$stateParams,
	orderService: OrderService,
	masterMap: Master.Map) {

		// TODO find the root issue (maybe a bootstrap problem)
		var jwindow = $(window);
		$rootScope.$on('$viewContentLoaded', () => {
			window.setImmediate(() => {
				jwindow.trigger('resize');
			});
		});
		var layer = masterMap.getLayerClass("shadow");
		var ll = new layer("Order");
		ll.addTo(masterMap);

		var id = $stateParams.id;

		$scope.id = id;

		orderService.addThing(id);

		masterMap.closePopup();

		var dragLinePoints = [new L.LatLng(0, 0), masterMap.getCenter()];
		var dragLine = L.polyline(dragLinePoints, { clickable: false });
		var onScreen = false;
		masterMap.on('viewreset move', () => {
			var center = masterMap.getCenter();
			dragLinePoints[1] = center;
			if (onScreen) {
				dragLine.setLatLngs(dragLinePoints);
			}
			orderService.setLocation(center);
		});

		$(document).one('main.thing.order.exit', ()=> {
			masterMap.removeLayer(ll).removeLayer(dragLine);
			onScreen = false;
		});

		var title = "Order";
		$scope.$watch('title', () => {
			orderService.setTitle($scope.title ? $scope.title : title);
		});

		$scope.$watch('details', (newValue) => {
			orderService.setDetails(newValue ? newValue : "");
		});

		$scope.$watch('things[id]', () => {
			if ($scope.things) {
				var thing = $scope.things[id];
				title = "Order to " + thing.name;
				orderService.setTitle(title);
				ll._title.firstChild.data = title;
				$scope.placeholder = title;
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
