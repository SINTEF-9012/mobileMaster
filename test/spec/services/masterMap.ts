/// <reference path="./../../../app/bower_components/DefinitelyTyped/angularjs/angular-mocks.d.ts" />

'use strict';

describe('Service: Mastermap', function () {

  // load the service's module
  beforeEach(module('mobileMasterApp'));

  // instantiate service
  var Mastermap;
  beforeEach(inject(function (_masterMap_) {
    Mastermap = _masterMap_;
  }));

  it('should do something', function () {
    console.log(Mastermap);
    
    expect(Mastermap.someMethod(-1)).toBe(42);
  });

});
