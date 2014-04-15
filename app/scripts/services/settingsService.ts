angular.module('mobileMasterApp')
	.service('settingsService', function() {

		var ls : any = window.localStorage ? window.localStorage : {};

		var thingModelUrl = ls.thingModelUrl ? ls.thingModelUrl : "ws://" + window.location.hostname + ":8082/";
		var clientName = ls.clientName ? ls.clientName : "mobileMaster";
		var mediaServerUrl = ls.mediaServerUrl ? ls.mediaServerUrl : "http://" + window.location.hostname + ":8075/";

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