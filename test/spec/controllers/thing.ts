'use strict';

describe('Controller: ThingCtrl', function () {

  // load the controller's module
  beforeEach(module('mobileMasterApp'));

  var ThingCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ThingCtrl = $controller('ThingCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
