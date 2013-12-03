'use strict';

describe('Directive: masterIcon', function () {

  // load the directive's module
  beforeEach(module('mobileMasterApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should contain the correct text', inject(function ($compile) {
    element = angular.element('<master-icon category="generic" type="incident"></master-icon>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('0c');
    expect(element.children().attr('class')).toBe('incident');
  }));
});
