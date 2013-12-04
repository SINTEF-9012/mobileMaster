'use strict';

describe('Service: Persistentlocalization', function () {

  // load the service's module
  beforeEach(module('mobileMasterApp'));

  // instantiate service
  var Persistentlocalization;
  beforeEach(inject(function (_Persistentlocalization_) {
    Persistentlocalization = _Persistentlocalization_;
  }));

  it('should do something', function () {
    expect(!!Persistentlocalization).toBe(true);
  });

});
