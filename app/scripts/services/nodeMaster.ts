'use strict';

declare var dcodeIO : any;
interface Window {
	canard: any;
}

angular.module('mobileMasterApp').provider("nodeMaster", function() {

	var scope : MasterScope.Root = null;

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

	var synchronizeScope = function(transaction : any) {
		// console.log(transaction);
		

		angular.forEach(transaction.PublishList.PatientList,
			function(value : any) {
				var patient = scope.patients[value.ID];
				if (!patient) {
					scope.patients[value.ID] = value;
				} else {
					angular.forEach(value, function(property: string, key: any) {
						if (property !== null) {
							// console.log(property);
							patient[key] = property;
						}
					});
				}
			});

		angular.forEach(transaction.PublishList.ResourceStatusList,
			function(value : any) {
				var resource = scope.resources[value.ID];
				if (!resource) {
					scope.resources[value.ID] = value;
				} else {
					angular.forEach(value, function(property: string, key: any) {
						if (property !== null) {
							// console.log(property);
							resource[key] = property;
						}
					});
				}
			});

		scope.$digest();
	}

	var protoTransaction : NodeMaster.TransactionBuilder = null;

	var onMessage = function(message : any) {
		// Convert the Blob protobuf message to an ArrayBuffer object
		var fileReader = new FileReader();
		fileReader.readAsArrayBuffer(message.data);

		// When the Blob to ArrayBuffer conversion is over
		fileReader.onload = function() {
			// Decode the protoBuf object
			var arrayBuffer = this.result,
				message = protoTransaction.decode(arrayBuffer);

			synchronizeScope(message)
			// console.log(message);
		}
	}

	var onClose = function() {
		console.log("Connection lost");
		window.setTimeout(openConnection, 2000);
	}

	var onOpen = function() {
		console.log("Open connection");
		scope.patients = {};
		scope.resources = {};
	}

	var obj = this;

	var openConnection = function() {
		var service = new WebSocket(obj.connection);
		service.onclose = onClose;
		service.onopen = onOpen;
		service.onmessage = onMessage;
	}

	this.$get = function($rootScope : MasterScope.Root) {

		scope = $rootScope;

		dcodeIO.ProtoBuf.protoFromFile("scripts/references/NodeMaster.proto", function(protoBufBuilder : any) {
			protoTransaction = protoBufBuilder.build("NodeMaster.Transaction");

			openConnection();

		});

	};

});
