'use strict';

describe('Directive: thing', function () {

  // load the directive's module
  beforeEach(module('mobileMasterApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<thing></thing>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the thing directive');
  }));
});
