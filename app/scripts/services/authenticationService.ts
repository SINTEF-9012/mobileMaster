/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

/// <reference path="./../references/generic.d.ts" />

'use strict';

angular.module('mobileMasterApp').service('authenticationService', function() {

	var username: string = null;

	var defaultFirstNames = ["John", "Roger", "Noel", "Alain", "Bjorn", "Laura", "Marie", "Siri", "Helene"],
		defaultLastNames = ["Flantier", "Doe", "Smith", "Bond", "Dupont"];

	var localStorageKey = 'authenticationNameWIP';

	this.getUserName = () => {
		if (!username) {
			if (window.localStorage[localStorageKey]) {
				username = window.localStorage[localStorageKey];
			} else {
				this.setUserName(
					defaultFirstNames[Math.floor(defaultFirstNames.length * Math.random())] + " " +
					defaultLastNames[Math.floor(defaultLastNames.length * Math.random())] + " (WIP)");
			}
		}
		return username;
	};

	this.setUserName = (newUserName: string) => {
		username = newUserName;
		window.localStorage[localStorageKey] = username;
	};
});
