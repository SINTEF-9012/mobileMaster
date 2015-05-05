/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

/// <reference path="./../references/app.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.service('evacuationPlansService', function (
	itsa: ThingIdentifierService,
	thingModel: ThingModelService) {
	var evacuationsPlans: { [id: string]: ThingModel.Thing; } = {};

	var registerEvacuationPlan = (thing: ThingModel.Thing) => {
		if (!itsa.evacuationPlan(thing)) {
			return;
		}
		var patientID = thing.String("patientID")
		if (patientID) {
			evacuationsPlans[patientID] = thing;
		}
	};

	angular.forEach(thingModel.warehouse.Things, registerEvacuationPlan);

	thingModel.warehouse.RegisterObserver({
		New: registerEvacuationPlan,
		Updated: registerEvacuationPlan, 
		Deleted: (thing: ThingModel.Thing) => {
			if (itsa.evacuationPlan(thing)) {
				_.forOwn(evacuationsPlans, (value, key) => {
					if (thing.ID === value.ID) {
						delete evacuationsPlans[key];
					}
				});
			}
		},
		Define: () => {}
	});

	this.hasEvacuationPlanByPatient = (patient: ThingModel.Thing) => {
		var p = this.getEvacuationPlanByPatient(patient);
		return !!p;
	};

	this.getEvacuationPlanByPatient = (patient: ThingModel.Thing) => {
		var p = evacuationsPlans[patient.ID];
		if (p && p.String("patientID") === patient.ID) {
			return p;
		}
		return null;
	};

	this.getHospitalLocationByPatient = (patient: ThingModel.Thing) => {
		var p = this.getEvacuationPlanByPatient(patient);
		if (!p) {
			return null;
		}
		var hospital = thingModel.warehouse.GetThing(p.String("hospitalID"));
		if (!hospital) {
			return null;
		}
		var location = hospital.LocationLatLng();
		if (!location || isNaN(location.Latitude) || isNaN(location.Longitude) ||
			location.Latitude < -90.0 || location.Latitude > 90.0 ||
			location.Longitude < -180.0 || location.Longitude > 180.0) {
			return null;
		}
		return new L.LatLng(location.Latitude, location.Longitude);
	};

});
