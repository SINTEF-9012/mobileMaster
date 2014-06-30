'use strict';

angular.module('mobileMasterApp')
	.service('itsa', function() {

	// Raw categories
	var victim = /(victim|patient)/i,
		media = /(media|picture)/i,
		tweet = /(tweet)/i,
		resource = /(resource)/i,
		incident = /(incident)/i,
		beacon = /(beacon)/i,
		order = /(order)/i,

	// Some more high level categories
		multimedia = /(picture|video|tweet)/i;

	this.victim = (thing: ThingModel.Thing) =>		thing.Type && victim.test(thing.Type.Name);
	this.media = (thing: ThingModel.Thing) =>		thing.Type && media.test(thing.Type.Name);
	this.tweet = (thing: ThingModel.Thing) =>		thing.Type && tweet.test(thing.Type.Name);
	this.resource = (thing: ThingModel.Thing) =>	thing.Type && resource.test(thing.Type.Name);
	this.incident = (thing: ThingModel.Thing) =>	thing.Type && incident.test(thing.Type.Name);
	this.beacon = (thing: ThingModel.Thing) =>		thing.Type && beacon.test(thing.Type.Name);
	this.order = (thing: ThingModel.Thing) =>		thing.Type && order.test(thing.Type.Name);
	this.multimedia = (thing: ThingModel.Thing) =>	thing.Type && multimedia.test(thing.Type.Name);

	this.typefrom = (thing: ThingModel.Thing) : string =>  {
		if (!thing.Type) {
			return 'Default';
		}

		var type = thing.Type.Name; 

		// It must be a bit slow, but I am too lazy to build an efficient state machine
		if (victim.test(type)) return 'Victim';
		if (multimedia.test(type)) return 'Multimedia';
		if (order.test(type)) return 'Order';
		if (incident.test(type)) return 'Incident';
		if (resource.test(type)) return 'Resource';
		if (beacon.test(type)) return 'Beacon';

		return 'Unknown';
	};
});