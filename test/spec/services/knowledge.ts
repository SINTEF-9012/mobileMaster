'use strict';

describe('Service: Knowledge', function () {

  // load the service's module
  beforeEach(module('mobileMasterApp'));

  // instantiate service
  var Knowledge;
  beforeEach(inject(function (_Knowledge_) {
    Knowledge = _Knowledge_;
  }));

  it('should do something', function () {
    expect(!!Knowledge).toBe(true);
  });

});
