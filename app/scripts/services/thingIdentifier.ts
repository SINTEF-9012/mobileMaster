/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

/// <reference path="./../references/app.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.service('itsa', function() {

	// Raw categories
	var patient = /(victim|patient)/i,
		media = /(media|picture|video)/i,
		stream = /(stream)/i,
		tweet = /(tweet)/i,
		resource = /(resource)/i,
		response = /(response)/i,
		incident = /(incident)/i,
		risk = /(risk)/i,
		beacon = /(beacon)/i,
		order = /(order)/i,
		police = /(police)/i,
		medic = /(health|medic)/i,
		fire = /(fire)/i,
		message = /(message)/i,
		imageOverlay = /(imageOverlay)/i,
		uav = /(uav)/i,
		evacuationPlan = /(evacuationPlan)/i,

	// Some more high level categories
		multimedia = /(media|picture|video|tweet|stream)/i;

	var lockup = {
		patients: patient,
		medias: media,
		streams: stream,
		tweets: tweet,
		resources: resource,
		responses: response,
		incidents: incident,
		risks: risk,
		beacons: beacon,
		orders: order,
		multimedias: multimedia,
		messages: message,
		imageoverlays: imageOverlay,
		evacuationPlan: evacuationPlan
	};
	// Compute the oposite of all these regexp

	var other_s = "";
	angular.forEach(lockup, (value: RegExp) => {
		other_s += value.source+"|";
	});

	var other_invert = new RegExp(other_s.slice(0, -1), 'i');

	// This regex is after the other
	lockup['all'] = /.*/;


	this.patient = (thing: ThingModel.Thing) =>			thing.Type && patient.test(thing.Type.Name);
	this.media = (thing: ThingModel.Thing) =>			thing.Type && media.test(thing.Type.Name);
	this.tweet = (thing: ThingModel.Thing) =>			thing.Type && tweet.test(thing.Type.Name);
	this.resource = (thing: ThingModel.Thing) =>		thing.Type && resource.test(thing.Type.Name);
	this.response = (thing: ThingModel.Thing) =>		thing.Type && response.test(thing.Type.Name);
	this.incident = (thing: ThingModel.Thing) =>		thing.Type && incident.test(thing.Type.Name);
	this.risk = (thing: ThingModel.Thing) =>			thing.Type && risk.test(thing.Type.Name);
	this.beacon = (thing: ThingModel.Thing) =>			thing.Type && beacon.test(thing.Type.Name);
	this.order = (thing: ThingModel.Thing) =>			thing.Type && order.test(thing.Type.Name);
	this.multimedia = (thing: ThingModel.Thing) =>		thing.Type && multimedia.test(thing.Type.Name);
	this.message = (thing: ThingModel.Thing) =>			thing.Type && message.test(thing.Type.Name);
	this.imageOverlay = (thing: ThingModel.Thing) =>	thing.Type && imageOverlay.test(thing.Type.Name);
	this.stream = (thing: ThingModel.Thing) =>			thing.Type && stream.test(thing.Type.Name);
	this.uav = (thing: ThingModel.Thing) =>				thing.Type && uav.test(thing.Type.Name);
	this.evacuationPlan = (thing: ThingModel.Thing) =>	thing.Type && evacuationPlan.test(thing.Type.Name);
	this.other = (thing: ThingModel.Thing) =>			!thing.Type || !other_invert.test(thing.Type.Name);

	this.typefrom = (thing: ThingModel.Thing) : string =>  {
		if (!thing.Type) {
			return 'Others';
		}

		var type = thing.Type.Name; 

		// It must be a bit slow, but I am too lazy to build an efficient state machine
		if (patient.test(type)) return 'Patients';
		if (multimedia.test(type)) return 'Multimedias';
		if (message.test(type)) return 'Messages';
		if (order.test(type)) return 'Orders';
		if (incident.test(type)) return 'Incidents';
		if (risk.test(type)) return 'Risks';
		if (resource.test(type)) return 'Resources';
		if (response.test(type)) return 'Responses';
		if (beacon.test(type)) return 'Beacons';
		if (imageOverlay.test(type)) return 'ImageOverlays';
		if (stream.test(type)) return 'Streams';
		if (evacuationPlan.test(type)) return 'EvacuationPlans';

		return 'Others';
	};

	this.testfor = (type: string): RegExp => lockup[type.toLowerCase()];

	var testResource = (thing: ThingModel.Thing, test: RegExp) => {
		if (!this.resource(thing)) {
			return false;
		}

		var type = (thing.Type ? thing.Type.Name : '') + (thing.String('type') || '');

		return test.test(type);
	}

	this.police = (thing: ThingModel.Thing) => testResource(thing, police);
	this.medic = (thing: ThingModel.Thing) => testResource(thing, medic);
	this.fire = (thing: ThingModel.Thing) => testResource(thing, fire);
});
