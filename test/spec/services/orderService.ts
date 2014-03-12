'use strict';

describe('Service: Orderservice', function () {

  // load the service's module
  beforeEach(module('mobileMasterApp'));

  // instantiate service
  var Orderservice;
  beforeEach(inject(function (_Orderservice_) {
    Orderservice = _Orderservice_;
  }));

  it('should do something', function () {
    expect(!!Orderservice).toBe(true);
  });

});
