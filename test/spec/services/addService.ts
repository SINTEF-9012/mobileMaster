'use strict';

describe('Service: Addservice', function () {

  // load the service's module
  beforeEach(module('mobileMasterApp'));

  // instantiate service
  var Addservice;
  beforeEach(inject(function (_Addservice_) {
    Addservice = _Addservice_;
  }));

  it('should do something', function () {
    expect(!!Addservice).toBe(true);
  });

});
