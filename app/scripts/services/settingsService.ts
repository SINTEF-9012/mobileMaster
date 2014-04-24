angular.module('mobileMasterApp')
	.config(($sceDelegateProvider: ng.ISCEDelegateProvider) => {
	  if (window.localStorage && window.localStorage.hasOwnProperty('mediaServerUrl')) {
		  $sceDelegateProvider.resourceUrlWhitelist([
			  'self', window.localStorage.getItem('mediaServerUrl') + '/**']);
	  } else {
		  $sceDelegateProvider.resourceUrlWhitelist([
			  'self', (
			window.hasOwnProperty('defaultMediaServerUrl') ?
				window['defaultMediaServerUrl'] : 
			"http://" + window.location.hostname + ":8075/")]);
	  }
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

		var mediaServerUrl = ls.mediaServerUrl ? ls.mediaServerUrl : (
			window.hasOwnProperty('defaultMediaServerUrl') ?
				window['defaultMediaServerUrl'] : 
			"http://" + window.location.hostname + ":8075/");

		this.setThingModelUrl = (url:string) => {
			thingModelUrl = url;
			ls.thingModelUrl = url;
		}

		this.setClientName =(name:string) => {
			clientName = name;
			ls.clientName = name;
		}

		this.setMediaServerUrl = (url: string) => {
			if (url.length && url[url.length - 1] === '/') {
				url = url.slice(0, -1);
			}
			mediaServerUrl = url;
			ls.mediaServerUrl = url;
		}

		this.getThingModelUrl = () => thingModelUrl;
		this.getClientName = () => clientName;
		this.getMediaServerUrl = () => mediaServerUrl;

});