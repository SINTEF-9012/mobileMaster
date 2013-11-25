'use strict';

declare var dcodeIO : any;
interface Window {
	canard: any;
}

angular.module('mobileMasterApp').provider("nodeMaster", function() {


	this.connection = null;
	this.clientID = "mobileMaster";

	this.setConnection = function(connection : string) {
		this.connection = connection;
		return this;
	}

	this.setClientID = function(clientID : string) {
		this.clientID = clientID;
		return this;
	}

	this.$get = function() {

		var connection = this.connection;

		dcodeIO.ProtoBuf.protoFromFile("scripts/references/NodeMaster.proto", function(protoBufBuilder : any) {
			var protoTransaction : NodeMaster.TransactionBuilder = protoBufBuilder.build("NodeMaster.Transaction");

			var service = new WebSocket(connection);
			service.onopen = function() {
				window.canard = service;
			}

			service.onmessage = function(message) {
	            // Convert the Blob protobuf message to an ArrayBuffer object
	            var fileReader = new FileReader();
	            fileReader.readAsArrayBuffer(message.data);

	            // When the Blob to ArrayBuffer conversion is over
	            fileReader.onload = function() {
	                // Decode the protoBuf object
	                var arrayBuffer = this.result,
	                    message = protoTransaction.decode(arrayBuffer);

	                console.log(message);
	            }
			}
		});

	};

});
