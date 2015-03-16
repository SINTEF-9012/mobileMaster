/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />
/// <reference path="./../../bower_components/DefinitelyTyped/lodash/lodash.d.ts" />

/// <reference path="./../references/app.d.ts" />

'use strict'
angular.module('mobileMasterApp')
	.config(($sceDelegateProvider: ng.ISCEDelegateProvider) => {
		var mediaServerUrl, rrdServerUrl;

		if (window.localStorage && window.localStorage.hasOwnProperty('mediaServerUrl')) {
			mediaServerUrl = window.localStorage.getItem('mediaServerUrl');
		} else if (window.hasOwnProperty('defaultMediaServerUrl')) {
			mediaServerUrl = window['defaultMediaServerUrl'];
		} else {
			mediaServerUrl = "http://" + window.location.hostname + ":8075/";
		}

		if (mediaServerUrl[mediaServerUrl.length - 1] !== '/') {
			mediaServerUrl += '/**';
		} else {
			mediaServerUrl += '**';
		}

		if (window.localStorage && window.localStorage.hasOwnProperty('rrdServerUrl')) {
			rrdServerUrl = window.localStorage.getItem('rrdServerUrl');
		} else if (window.hasOwnProperty('defaultRrdServerUrl')) {
			rrdServerUrl = window['defaultRrdServerUrl'];
		} else {
			rrdServerUrl = "http://" + window.location.hostname + ":5070/";
		}

		if (rrdServerUrl[rrdServerUrl.length - 1] !== '/') {
			rrdServerUrl += '/**';
		} else {
			rrdServerUrl += '**';
		}

		$sceDelegateProvider.resourceUrlWhitelist([
			'self', /^rstp.*/i, mediaServerUrl,rrdServerUrl
		]);
	})
	.service('settingsService', function() {

		var ls: any = window.localStorage ? window.localStorage : {};

		var thingModelUrl = ls.thingModelUrl ? ls.thingModelUrl : (
			window.hasOwnProperty('defaultThingModelUrl') ?
				window['defaultThingModelUrl'] : 
			"ws://" + window.location.hostname + ":8083/");

		var clientName = ls.clientName ? ls.clientName : (
			window.hasOwnProperty('defaultClientName') ?
				window['defaultClientName'] : "mobileMaster");

		var accessKey = ls.thingModelAccessKey ? ls.thingModelAccessKey : (
			window.hasOwnProperty('defaultThingModelAccessKey') ?
				window['defaultThingModelAccessKey'] : ''); 

		var mediaServerUrl = ls.mediaServerUrl ? ls.mediaServerUrl : (
			window.hasOwnProperty('defaultMediaServerUrl') ?
				window['defaultMediaServerUrl'] : 
			"http://" + window.location.hostname + ":8075/");

		var rrdServerUrl = ls.rrdServerUrl ? ls.rrdServerUrl : (
			window.hasOwnProperty('defaultRrdServerUrl') ?
				window['defaultRrdServerUrl'] : 
			"http://" + window.location.hostname + ":5070/");

		var almendeTimelineUrl = ls.almendeTimelineUrl ? ls.almendeTimelineUrl : (
			window.hasOwnProperty('defaultAlmendeTimelineUrl') ?
				window['defaultAlmendeTimelineUrl'] :
				"http://visjs.org/showcase/projects/bridge/demo");

		var almendeTimelineUsage = ls.almendeTimelineUsage ? ls.almendeTimelineUsage === 'true' : (
			window.hasOwnProperty('defaultAlmendeTimelineUsage') ?
				window['defaultAlmendeTimelineUsage'] === 'true' : false);

		this.setThingModelUrl = (url:string) => {
			thingModelUrl = url;
			ls.thingModelUrl = url;
		}

		this.setClientName =(name:string) => {
			clientName = name;
			ls.clientName = name;
		}

		this.setAccessKey = (key: string) => {
			accessKey = key;
			ls.thingModelAccessKey = key;
		}

		this.setMediaServerUrl = (url: string) => {
			if (url && (typeof(url.length) !== "undefined") && url[url.length - 1] === '/') {
				url = url.slice(0, -1);
			}
			mediaServerUrl = url;
			ls.mediaServerUrl = url;
		}

		this.setRrdServerUrl = (url: string) => {
			if (url && (typeof(url.length) !== "undefined") && url[url.length - 1] === '/') {
				url = url.slice(0, -1);
			}
			rrdServerUrl = url;
			ls.rrdServerUrl = url;
		}

		this.setAlmendeTimelineUrl = (url: string) => {
			almendeTimelineUrl = url;
			ls.almendeTimelineUrl = url;
		}

		this.setAlmendeTimelineUsage = (enable: boolean) => {
			almendeTimelineUsage = enable;
			ls.almendeTimelineUsage = enable ? 'true' : 'false';
		}

		this.getThingModelUrl = () => thingModelUrl;
		this.getClientName = () => clientName;
		this.getAccessKey = () => accessKey;
		this.getMediaServerUrl = () => mediaServerUrl;
		this.getRrdServerUrl = () => rrdServerUrl;
		this.getAlmendeTimelineUrl = () => almendeTimelineUrl;
		this.getAlmendeTimelineUsage = () => almendeTimelineUsage;

		this.getHttpThingModelUrl = () => thingModelUrl.replace(/^ws/i, "http");

		this.hasAccesskey = () => !!accessKey;
});
