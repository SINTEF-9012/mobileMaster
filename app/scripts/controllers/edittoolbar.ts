/// <reference path="./../../bower_components/DefinitelyTyped/angularjs/angular.d.ts" />

/// <reference path="./../masterScope.d.ts" />

'use strict';

angular.module('mobileMasterApp')
	.controller('EdittoolbarCtrl', ($scope, $rootScope: MasterScope.Root, $state) => {

		$scope.save = ()=> {
			$rootScope.$emit('main.thing.edit.save');
		};

		$scope.saveAndClose = () => {
			$rootScope.$emit('main.thing.edit.save');
			$state.go('^');
		};
  });
