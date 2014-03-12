'use strict';

angular.module('mobileMasterApp')
	.service('UUID', function UUID($rootScope: MasterScope.Root) {
		// AngularJS will instantiate a singleton by calling "new" on this function
		/**
		 * Fast UUID generator, RFC4122 version 4 compliant.
		 * @author Jeff Ward (jcward.com).
		 * @license MIT license
		 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
		 **/
		var lut = [];
		for (var i = 0; i < 256; i++) {
			lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
		}
		this.generate = ()=> {
			var d0 = Math.random() * 0xffffffff | 0;
			var d1 = Math.random() * 0xffffffff | 0;
			var d2 = Math.random() * 0xffffffff | 0;
			var d3 = Math.random() * 0xffffffff | 0;
			var id = lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
				lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
				lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
				lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];

			// Just for fun
			if ($rootScope.things.hasOwnProperty(id)) {
				alert("Take a picture : epic UUID collision : http://en.wikipedia.org/wiki/Universally_unique_identifier#Random_UUID_probability_of_duplicates");
				return this.generate();
			}

			return id;
		};
	});