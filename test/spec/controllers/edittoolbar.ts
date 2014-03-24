'use strict';

describe('Controller: EdittoolbarCtrl', function () {

  // load the controller's module
  beforeEach(module('mobileMasterApp'));

  var EdittoolbarCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EdittoolbarCtrl = $controller('EdittoolbarCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
